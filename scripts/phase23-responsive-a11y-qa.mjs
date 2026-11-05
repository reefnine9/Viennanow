import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';

const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
const results=[],issues=[];
const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail:String(detail)});if(!ok)issues.push(name+': '+detail);};
await mkdir('artifacts/phase23',{recursive:true});
for(const [width,scale] of [[320,1.0],[375,1.25],[390,1.5]]){
 const context=await browser.newContext({viewport:{width,height:780},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 try{
  page.on('pageerror',e=>issues.push(width+'px JS: '+e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:`#main,#layer{font-size:${scale}em!important}`});
  for(const section of ['sights','food','courses']){
   if(section==='sights'){
    await page.locator('#bottom button.tab[data-value="sights"]').click();
    await page.locator('.photo-pick button.cardclick').first().click();
   }else if(section==='food'){
    await page.locator('#bottom button.tab[data-value="food"]').click();
    await page.locator('.vn64-food-grid .vn64-food-open').first().click();
   }else{
    await page.locator('#bottom button.tab[data-value="itinerary"]').click();
    await page.locator('#main button[data-act="vn-course-detail"]').first().click();
   }
   const root=page.locator(section==='courses'?'#main .vn-course-swipe:not(.vn-swipe-preview)':'#layer .vn-page-swipe:not(.vn-swipe-preview)').first();
   const dimensions=await root.evaluate(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {width:r.width,left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right};});
   check(width+' '+section+' panel within viewport',dimensions.left>=-1&&dimensions.right<=width+1,JSON.stringify(dimensions));
   const closeOrBack=section==='sights'?'button[data-act="close-detail"]':section==='food'?'button[data-act="vn64-food-close"]':'button[data-act="vn-course-back"]';
   const action=root.locator(closeOrBack).first();
   const box=await action.boundingBox();
   check(width+' '+section+' exit remains visible',!!box&&box.width>=24&&box.height>=24&&box.x>=0&&box.x+box.width<=width+1,JSON.stringify(box));
   check(width+' '+section+' detail accessible dialog',section==='courses'||await root.getAttribute('role')==='dialog');
   const ui=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
   check(width+' '+section+' no page horizontal overflow',ui.docWidth<=width+2&&ui.bodyWidth<=width+2,JSON.stringify(ui));
   await page.screenshot({path:'artifacts/phase23/'+width+'-'+section+'.png',animations:'disabled'});
   await action.click();
  }
 }catch(e){issues.push(width+'px flow '+String(e.stack||e).slice(0,1200));}
 finally{await context.close();}
}
await browser.close();
await writeFile('artifacts/phase23/report.json',JSON.stringify({results,issues,note:'Mobile Chromium emulation, enlarged content text; images and map tiles blocked.'},null,2));
console.log('Phase 23 responsive/accessibility '+results.filter(x=>x.ok).length+'/'+results.length+' passing; '+issues.length+' issues');
for(const x of issues)console.error('FAIL '+x);
if(issues.length)process.exitCode=1;
