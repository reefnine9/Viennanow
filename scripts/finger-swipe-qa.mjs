import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';

const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:780},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const page=await context.newPage();
const checks=[],issues=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail:String(detail)});if(!ok)issues.push(name+': '+detail)};
page.on('pageerror',e=>issues.push('JavaScript '+e.message));
await mkdir('artifacts/gesture-qa',{recursive:true});
await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());

async function swipeFollow(label,targetSelector,titleSelector){
 const el=page.locator(targetSelector).first();
 await el.waitFor();
 const titleBefore=await page.locator(titleSelector).first().innerText();
 const point=(x,y=230)=>({identifier:1,clientX:x,clientY:y});
 await el.dispatchEvent('touchstart',{touches:[point(300)]});
 await el.dispatchEvent('touchmove',{touches:[point(190)]});
 const moved=await page.locator(targetSelector).first().evaluate(n=>n.style.transform);
 const preview=await page.locator('.vn-swipe-preview').count();
 check(label+' moves with finger',moved.includes('-110px'),moved);
 check(label+' renders incoming page',preview===1,'preview='+preview);
 await el.dispatchEvent('touchmove',{touches:[point(85)]});
 await el.dispatchEvent('touchend',{changedTouches:[point(85)]});
 await page.waitForTimeout(45);
 const titleAfter=await page.locator(titleSelector).first().innerText();
 check(label+' changes to next page',titleAfter!==titleBefore,'from '+titleBefore.slice(0,60)+' to '+titleAfter.slice(0,60));
 check(label+' cleans up preview',await page.locator('.vn-swipe-preview').count()===0);
 await page.screenshot({path:'artifacts/gesture-qa/'+label+'.png',animations:'disabled'});
 const next=page.locator(targetSelector).first();
 await next.dispatchEvent('touchstart',{touches:[point(170)]});
 await next.dispatchEvent('touchmove',{touches:[point(145)]});
 const movedShort=await next.evaluate(n=>n.style.transform);
 check(label+' short drag follows finger',movedShort.includes('-25px'),movedShort);
 await next.dispatchEvent('touchend',{changedTouches:[point(145)]});
 await page.waitForTimeout(40);
 check(label+' short drag springs back',await page.locator(titleSelector).first().innerText()===titleAfter);
 check(label+' short drag clears styles',await page.locator(targetSelector).first().evaluate(n=>n.style.transform)==='');
}
try{
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('#bottom button.tab[data-value="sights"]').click();
 await page.locator('.photo-pick button.cardclick').first().click();
 await swipeFollow('sights','#layer .vn-page-swipe','#layer .drawer .h1');
 await page.locator('#layer button[data-act="close-detail"]').first().click();

 await page.locator('#bottom button.tab[data-value="food"]').click();
 await page.locator('.vn64-food-grid .vn64-food-open').first().waitFor({timeout:12000});
 await page.locator('.vn64-food-grid .vn64-food-open').first().click();
 await swipeFollow('food','#layer .vn-page-swipe','#layer .vn64-food-drawer h2');
 await page.locator('#layer button[data-act="vn64-food-close"]').first().click();

 await page.locator('#bottom button.tab[data-value="itinerary"]').click();
 await page.locator('button[data-act="vn-course-detail"]').first().click();
 await swipeFollow('courses','#main .vn-course-swipe','#main .vn36-detail .h1');
}catch(e){issues.push('Flow '+String(e.stack||e).slice(0,1400));}
await writeFile('artifacts/gesture-qa/report.json',JSON.stringify({checks,issues,details:'Simulated touchscreen events, reduced motion; validates intermediate transforms/neighbor previews and settled state'},null,2));
await browser.close();
console.log('Finger-follow detail gestures: '+checks.filter(c=>c.ok).length+'/'+checks.length+' passed, '+issues.length+' issues');
for(const i of issues)console.error('FAIL '+i);
if(issues.length)process.exitCode=1;
