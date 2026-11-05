import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const css=html.split('<style>')[1]?.split('</style>')[0]||'';

test('English mode translates native select option labels',()=>{
 const fn=html.slice(html.indexOf('function vnTranslateDocument(){'),html.indexOf('const vnOriginalRender=render;'));
 assert.ok(fn.startsWith('function vnTranslateDocument(){'));
 assert.match(fn,/createTreeWalker\(root,NodeFilter\.SHOW_TEXT\)/);
 assert.ok(!fn.includes("closest('script,style,textarea,option')"),'Option labels must not be excluded');
 assert.ok(fn.includes("closest('script,style,textarea')"),'Scripts and user-input text must be skipped');
 assert.ok(fn.includes("if(value!==n.nodeValue)n.nodeValue=value"),'Translated text must be applied');
 assert.match(fn,/document\.documentElement\.lang=english\?'en':'ko'/);
});
test('language changes update accessible labels and translated attributes',()=>{
 const fn=html.slice(html.indexOf('function vnTranslateDocument(){'),html.indexOf('const vnOriginalRender=render;'));
 for(const name of ['aria-label','placeholder','title','alt'])assert.ok(fn.includes(name),'Missing translated attribute '+name);
 assert.ok(fn.includes("langToggle.setAttribute('aria-label'"));
 assert.ok(html.includes("render=function(){vnOriginalRender();vnTranslateDocument();}"));
});
test('mobile layout keeps narrow-screen scrollable categories',()=>{
 for(const x of ['@media(max-width:430px)','@media(max-width:360px)','overflow-x:auto!important','--vn-chip-height','env(safe-area-inset-bottom'])assert.ok(css.includes(x),'Missing mobile safeguard '+x);
});
test('favourites and plan retain accessible saved-state controls',()=>{
 for(const x of ['vn59SavedPageEnglish','vn59SavedPage','aria-label="Remove from favorites"','aria-label="찜 해제"','--vn-heart-red'])assert.ok(html.includes(x),'Missing saved-state affordance '+x);
});
