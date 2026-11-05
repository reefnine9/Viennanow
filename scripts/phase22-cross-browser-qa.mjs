import { chromium, webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const checks=[],issues=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail:String(detail)});if(!ok)issues.push(name+': '+detail);};
const touch=(x,y=240)=>({identifier:1,clientX:x,clientY:y});
await mkdir('artifacts/phase22',{recursive:true});
for(const [name,engine] of [['chromium-android',chromium],['webkit-ios',webkit]]){
 let browser,context;
 try{
  browser=await engine.launch({headless:true});
  context=await browser.newContext({
   viewport:{width:390,height:780},deviceScaleFactor:2,hasTouch:true,isMobile:true,
   locale:'ko-KR',reducedMotion:'reduce',
   ...(name==='webkit-ios'?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})
  });
  const page=await context.newPage();
  page.on('pageerror',e=>issues.push(name+' JS: '+e.message));
  await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  for(const group of ['sights','food','courses']){
   if(group==='sights'){
    await page.locator('#bottom button.tab[data-value="sights"]').click();
    await page.locator('.photo-pick button.cardclick').first().click();
   }else if(group==='food'){
    await page.locator('#bottom button.tab[data-value="food"]').click();
    await page.locator('.vn64-food-grid .vn64-food-open').first().click();
   }else{
    await page.locator('#bottom button.tab[data-value="itinerary"]').click();
    await page.locator('#main button[data-act="vn-course-detail"]').first().click();
   }
   const element=page.locator(group==='courses'?'#main .vn-course-swipe:not(.vn-swipe-preview)':'#layer .vn-page-swipe:not(.vn-swipe-preview)').first();
   const titleSelector=group==='courses'?'#main .vn-course-swipe:not(.vn-swipe-preview) .h1':group==='food'?'#layer .vn-page-swipe:not(.vn-swipe-preview) h2':'#layer .vn-page-swipe:not(.vn-swipe-preview) .h1';
   const titleBefore=await page.locator(titleSelector).first().innerText();
   await element.dispatchEvent('touchstart',{touches:[touch(300)]});
   await element.dispatchEvent('touchmove',{touches:[touch(180)]});
   check(name+' '+group+' finger moves page',await element.evaluate(e=>e.style.transform.includes('-120px')));
   check(name+' '+group+' incoming preview exists',await page.locator('.vn-swipe-preview').count()===1);
   await element.dispatchEvent('touchend',{changedTouches:[touch(70)]});
   await page.waitForTimeout(30);
   const titleAfter=await page.locator(titleSelector).first().innerText();
   check(name+' '+group+' navigates correctly',titleAfter!==titleBefore);
   check(name+' '+group+' no stale preview',await page.locator('.vn-swipe-preview').count()===0);
   await page.screenshot({path:'artifacts/phase22/'+name+'-'+group+'.png',animations:'disabled'});
   if(group==='sights')await page.locator('#layer button[data-act="close-detail"]').first().click();
   if(group==='food')await page.locator('#layer button[data-act="vn64-food-close"]').first().click();
   if(group==='courses')await page.locator('#main button[data-act="vn-course-back"]').first().click();
  }
 }catch(e){issues.push(name+' flow: '+String(e.stack||e).slice(0,1600));}
 finally{await context?.close();await browser?.close();}
}
await writeFile('artifacts/phase22/report.json',JSON.stringify({checks,issues,scope:'Headless Chromium and Playwright WebKit emulation only, not physical iPhone/Android hardware.'},null,2));
console.log('Phase 22 cross-engine gestures '+checks.filter(x=>x.ok).length+'/'+checks.length+' passing; '+issues.length+' issues');
for(const issue of issues)console.error('FAIL '+issue);
if(issues.length)process.exitCode=1;
