import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:780},reducedMotion:'reduce',locale:'en-GB'});
const page=await context.newPage(),screens=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
await mkdir('artifacts/language-audit',{recursive:true});
await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
try{
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('.vn-language-toggle').click();
 const capture=async(screen)=>{
  const data=await page.evaluate(()=>{
   const main=document.querySelector('#main'),layer=document.querySelector('#layer');
   const scope=layer&&layer.innerText.trim()?layer:main;
   const walk=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
   const items=[];let n;
   while((n=walk.nextNode())){
    const p=n.parentElement;
    if(!p||p.closest('script,style,textarea')||getComputedStyle(p).display==='none')continue;
    const text=n.textContent?.trim();
    if(text&&/[가-힣]/.test(text))items.push(text.slice(0,180));
   }
   return {lang:document.documentElement.lang,untranslated:[...new Set(items)].slice(0,80),totalNodes:items.length};
  });
  screens.push({screen,...data});
  await page.screenshot({path:'artifacts/language-audit/'+screen+'.png',animations:'disabled'});
 };
 await capture('home');
 await page.locator('#bottom button.tab[data-value="sights"]').click();await capture('sights');
 await page.locator('.photo-pick button.cardclick').first().click();await capture('sight-detail');
 await page.locator('#layer button[data-act="close-detail"]').first().click();
 await page.locator('#bottom button.tab[data-value="food"]').click();
 await page.locator('.vn64-food-grid .vn64-food-open').first().waitFor({timeout:12000});await capture('dining');
 await page.locator('.vn64-food-grid .vn64-food-open').first().click();await capture('food-detail');
 await page.locator('#layer button[data-act="vn64-food-close"]').first().click();
 await page.locator('#bottom button.tab[data-value="itinerary"]').click();await capture('plan');
 await page.locator('#main button[data-act="vn-course-detail"]').first().click();await capture('route-detail');
 await page.locator('#main button[data-act="vn-course-near-map"]').first().click();await capture('nearby-route');
}catch(e){errors.push(String(e.stack||e).slice(0,1300))}
await writeFile('artifacts/language-audit/report.json',JSON.stringify({screens,errors,scope:'Advisory audit: place names may intentionally remain Korean; detected Korean text is not always an error. Editorial review required.'},null,2));
console.log('Phase 25 language audit: '+screens.length+' screens; '+screens.reduce((n,s)=>n+s.totalNodes,0)+' Korean-bearing text nodes; '+errors.length+' runtime errors');
for(const s of screens)console.log('SCREEN '+s.screen+': '+s.totalNodes+' candidate nodes '+JSON.stringify(s.untranslated.slice(0,5)));
await browser.close();
if(errors.length)process.exitCode=1;
