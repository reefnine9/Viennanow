import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.VIENNANOW_TEST_URL || 'http://127.0.0.1:8765';
const viewports = [320,375,390,430];
const sections = ['home','sights','food','itinerary','map'];
const issues = [];
const results = [];
const browser = await chromium.launch({ headless:true });
await mkdir('artifacts/mobile-qa',{recursive:true});
for (const width of viewports) {
  const context = await browser.newContext({viewport:{width,height:780},deviceScaleFactor:1,locale:'ko-KR',reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  // Deterministic UI layout pass: external maps/photos are verified separately by deploy-check.
  await page.route('**/*',route=>{
    const url=route.request().url();
    if(url.startsWith(base+'/'))return route.continue();
    return route.abort();
  });
  try {
    await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:35000});
    await page.locator('#bottom button.tab').first().waitFor({timeout:20000});
    for (const [language,expectLang] of [['ko','ko'],['en','en']]) {
      if (language==='en') { await page.locator('#bottom button.tab[data-value="home"]').click(); await page.locator('.vn-language-toggle').click(); }
      await page.waitForTimeout(90);
      const actual = await page.locator('html').getAttribute('lang');
      if(actual!==expectLang) issues.push(width+'px: document lang mismatch, expected '+expectLang+', got '+actual);
      const labels = await page.locator('#bottom button.tab').allTextContents();
      const expected=language==='en'?['Home','Discover','Dining','Plan','Nearby']:['홈','볼거리','맛집','계획','내주변'];
      if(expected.some((label,i)=>!labels[i]?.includes(label))) issues.push(width+'px '+language+': incorrect nav labels '+labels.join(' / '));
      for (const section of sections) {
        await page.locator('#bottom button.tab[data-value="'+section+'"]').click({timeout:12000});
        await page.waitForTimeout(100);
        const layout = await page.evaluate(()=>{
          const phone=document.querySelector('.phone'), nav=document.querySelector('#bottom'), viewport=document.documentElement.clientWidth;
          const rect=nav?.getBoundingClientRect();
          return {viewport,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
            navInBounds:!!rect&&rect.left>=-1&&rect.right<=viewport+1,
            mainText:document.querySelector('#main')?.innerText?.slice(0,120)||''};
        });
        if(layout.documentWidth>width+2||layout.bodyWidth>width+2)issues.push(width+'px '+language+' '+section+': horizontal page overflow '+layout.documentWidth+'/'+layout.bodyWidth);
        if(!layout.navInBounds)issues.push(width+'px '+language+' '+section+': bottom bar exceeds viewport');
        if(!layout.mainText.trim())issues.push(width+'px '+language+' '+section+': empty content');
        results.push({width,language,section,...layout});
        if(section==='home'||(section==='sights'&&width===390)||(section==='food'&&width===390)){
          await page.screenshot({path:'artifacts/mobile-qa/'+width+'-'+language+'-'+section+'.png',animations:'disabled',timeout:15000});
        }
      }
    }
    // Restoring Korean must update the document and navigation.
    await page.locator('#bottom button.tab[data-value="home"]').click();
    await page.locator('.vn-language-toggle').click();
    if(await page.locator('html').getAttribute('lang')!=='ko')issues.push(width+'px: KO language restoration failed');
  }catch(error){issues.push(width+'px: browser flow failed: '+String(error.stack||error).slice(0,700));}
  if(errors.length)issues.push(width+'px: runtime page errors: '+errors.slice(0,3).join(' | '));
  await context.close();
}
await browser.close();
await writeFile('artifacts/mobile-qa/report.json',JSON.stringify({checkedAt:new Date().toISOString(),viewports,sections,results,issues},null,2));
console.log('Checked '+results.length+' language/viewport/tab combinations. Issues: '+issues.length);
for(const issue of issues)console.error('FAIL '+issue);
if(issues.length)process.exitCode=1;
