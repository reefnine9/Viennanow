import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const base=process.env.VIENNANOW_TEST_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:780},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const page=await ctx.newPage(),checks=[],issues=[];
const check=(name,ok,details='')=>{checks.push({name,ok:!!ok,details:String(details)});if(!ok)issues.push(name+': '+details)};
const point=(x,y)=>({identifier:1,clientX:x,clientY:y}),point2=(x,y)=>({identifier:2,clientX:x,clientY:y});
const dispatch=async(loc,event,x,y)=>loc.dispatchEvent(event,{[event==='touchend'?'changedTouches':'touches']:[point(x,y)]});
page.on('pageerror',e=>issues.push('JS '+e.message));
await mkdir('artifacts/swipe-stability',{recursive:true});
await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
try{
 await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#bottom button.tab[data-value="itinerary"]').click();
 await page.locator('#main button[data-act="vn-course-detail"]').first().click();
 const target=page.locator('#main .vn-course-swipe:not(.vn-swipe-preview) .pro-plan').first();
 const title=page.locator('#main .vn-course-swipe:not(.vn-swipe-preview) .h1').first();
 const first=await title.innerText();
 // Predominantly vertical gestures must not create a horizontal preview or navigate.
 await dispatch(target,'touchstart',180,250);await dispatch(target,'touchmove',188,350);
 check('Vertical scroll leaves detail unmoved',await page.locator('.vn-swipe-preview').count()===0);
 await dispatch(target,'touchend',188,350);
 check('Vertical scroll keeps current course',await title.innerText()===first);
 // True multi-touch cancels safely without permanently locking parent overflow.
 await dispatch(target,'touchstart',270,240);
 await target.dispatchEvent('touchmove',{touches:[point(220,240),point2(260,250)]});
 await target.dispatchEvent('touchend',{changedTouches:[point(220,240)]});
 check('Multitouch does not leave preview',await page.locator('.vn-swipe-preview').count()===0);
 check('Multitouch restores overflow',await page.locator('#main').evaluate(n=>n.style.overflow===''));
 await page.keyboard.press('ArrowLeft');
 const next=await title.innerText();
 check('Keyboard left goes to next route',next!==first);
 check('Accessible live status describes current route',(await page.locator('#vn-swipe-announcer').innerText()).includes(next));
 await page.keyboard.press('ArrowRight');
 check('Keyboard right returns to prior route',await title.innerText()===first);
 // Long detail page at scroll bottom remains swipeable; scroll need not reset during drag.
 await page.locator('#main').evaluate(n=>{n.scrollTop=n.scrollHeight});
 const before=await page.locator('#main').evaluate(n=>n.scrollTop);
 const fresh=page.locator('#main .vn-course-swipe:not(.vn-swipe-preview) .pro-plan').first();
 await dispatch(fresh,'touchstart',300,260);await dispatch(fresh,'touchmove',185,260);
 check('Swipe can begin after long detail scroll',await page.locator('.vn-swipe-preview').count()===1);
 await dispatch(fresh,'touchend',300,260);
 check('Interrupted short swipe restores current page',await title.innerText()===first);
 check('Long-page swipe restores scroll container',await page.locator('#main').evaluate(n=>n.style.overflow===''));
 check('Scroll stays usable after aborted swipe',await page.locator('#main').evaluate(n=>n.scrollHeight>n.clientHeight&&n.scrollTop<=n.scrollHeight),String(before));
 // Keyboard input should not hijack focused editable controls.
 await page.locator('#main button[data-act="vn-course-near-map"]').first().focus();
 await page.keyboard.press('ArrowLeft');
 check('Focused non-input controls still support keyboard navigation',await title.innerText()!==first);
 await page.screenshot({path:'artifacts/swipe-stability/route-accessible.png',animations:'disabled'});
}catch(e){issues.push('Flow '+String(e.stack||e).slice(0,1600))}
await writeFile('artifacts/swipe-stability/report.json',JSON.stringify({checks,issues},null,2));
await browser.close();
console.log('Swipe stability/accessibility: '+checks.filter(x=>x.ok).length+'/'+checks.length+' passed; '+issues.length+' issues');
issues.forEach(x=>console.error('FAIL '+x));
if(issues.length)process.exitCode=1;
