import { chromium, webkit } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const checks=[],issues=[],gaps=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail:String(detail)});if(!ok)issues.push(name+': '+detail)};
await mkdir('artifacts/release-qa',{recursive:true});
for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:780},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>issues.push(engineName+' '+width+' JS: '+e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  try{
   await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
   const links=page.locator('footer.vn-release-links a');
   check(engineName+' '+width+' release info links',await links.count()===3);
   const destinations=await links.evaluateAll(nodes=>nodes.map(n=>new URL(n.href).pathname));
   check(engineName+' '+width+' legal routes',JSON.stringify(destinations)===JSON.stringify(['/privacy.html','/legal.html','/photo-credits.html']));
   const footer=await page.locator('footer.vn-release-links').boundingBox();
   check(engineName+' '+width+' footer within screen',!!footer&&footer.x>=0&&footer.x+footer.width<=width+1,JSON.stringify(footer));
   await page.locator('.vn-language-toggle').click();
   check(engineName+' '+width+' english footer',await page.locator('footer.vn-release-links').innerText().then(x=>x.includes('Privacy & location')&&x.includes('Legal & operator information')));
   await page.locator('#bottom button.tab[data-value="itinerary"]').click();
   await page.locator('#main button[data-act="vn-course-detail"]').first().click();
   const detail=page.locator('#main .vn36-detail');
   check(engineName+' '+width+' route map button',await detail.locator('button[data-act="vn-course-near-map"]').count()===1);
   const stats=await page.evaluate(()=>{const c=VN_COURSES36;return {routes:c.length,missing:c.map(p=>({id:p.id,title:p.enTitle||p.title,total:p.stops.length,mapped:vnCoursePoints41(p).length,unmapped:p.stops.filter(stop=>!vnCoursePoint41(stop))})).filter(p=>p.mapped<p.total)}});
   gaps.push({engineName,width,stats});
   await detail.locator('button[data-act="vn-course-near-map"]').click();
   const routeSelect=page.locator('#near-plan-choice');
   check(engineName+' '+width+' nearby selected route',await routeSelect.inputValue()==='B01');
   check(engineName+' '+width+' nearby select english labels',!(await routeSelect.locator('option:checked').innerText()).includes('비엔나'));
   await page.screenshot({path:'artifacts/release-qa/'+engineName+'-'+width+'-route.png',animations:'disabled'});
   for(const path of ['/privacy.html','/legal.html','/photo-credits.html']){
    const p=await context.newPage();const response=await p.goto(base+path,{waitUntil:'domcontentloaded'});
    check(engineName+' '+width+' '+path+' available',response?.status()===200);
    if(path==='/legal.html')check(engineName+' '+width+' legal page pending disclaimer',(await p.locator('main').innerText()).includes('Impressum 미완성'));
    if(path==='/privacy.html')check(engineName+' '+width+' local storage disclosed',(await p.locator('main').innerText()).includes('viennanow_p9'));
    if(path==='/photo-credits.html'){await p.locator('#credits article').first().waitFor({timeout:10000});check(engineName+' '+width+' photo attribution populated',(await p.locator('#credits article').count())>=48);}
    await p.close();
   }
  }catch(e){issues.push(engineName+' '+width+' flow: '+String(e.stack||e).slice(0,1000));}
  finally{await context.close();}
 }
 await browser.close();
}
await writeFile('artifacts/release-qa/report.json',JSON.stringify({checks,issues,routeGaps:gaps[0]?.stats,scope:'Chromium/WebKit emulated devices; legal pages are drafts, original image licence and production deploy require independent review.'},null,2));
console.log('Phases 24-29 browser release QA '+checks.filter(x=>x.ok).length+'/'+checks.length+' checks; '+issues.length+' issues; routes='+gaps[0]?.stats.routes+', incomplete route maps='+gaps[0]?.stats.missing.length);
issues.forEach(x=>console.error('FAIL '+x));
if(issues.length)process.exitCode=1;
