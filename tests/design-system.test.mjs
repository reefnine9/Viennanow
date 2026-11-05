import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const css=html.split('<style>')[1]?.split('</style>')[0]||'';

test('deployed UI has shared chip sizing and radius',()=>{
 for(const token of ['--vn-chip-height','--vn-chip-radius','--vn-chip-font','--vn-radius-control']){
  assert.ok(css.includes(token),'Missing shared UI token '+token);
 }
 for(const selector of ['.vn42-chip','.near31-locations button','.vn65-view-switch button','.vn33-sight-tabs']){
  assert.ok(css.includes(selector),'Missing shared component '+selector);
 }
});

test('saved favorite heart palette is red across views',()=>{
 assert.match(css,/--vn-heart-red:\s*#[a-fA-F0-9]{6}/);
 for(const name of ['gallery-heart','vn58-food-heart','vn64-food-heart','vn65-food-list-heart','vn59-saved-heart','vn63-detail-heart']){
  assert.ok(css.includes('button.'+name),'Missing favorite control '+name);
 }
 assert.ok(css.includes('button.gallery-heart.saved'),'Missing saved-state heart override');
});

test('touch and focus provisions exist for mobile',()=>{
 assert.ok(css.includes('--vn-touch-target:44px'));
 assert.ok(css.includes('button.gallery-heart:focus-visible'));
 assert.ok(css.includes('.header .vn-language-toggle:focus-visible'));
 assert.ok(css.includes('@media(max-width:430px)'));
});

test('app includes language switching and accessible favorite semantics',()=>{
 assert.ok(html.includes('vn-language-toggle'),'Missing global language toggle');
 assert.ok(html.includes('aria-pressed'),'Missing saved toggle accessibility state');
 assert.ok(html.includes('aria-label'),'Missing control labels');
});

test('cross-conversation handoff documents are kept with source',()=>{
 for(const f of ['DEVELOPMENT_STATUS.md','DESIGN_SYSTEM_KR.md']){
  const u=new URL('../'+f,import.meta.url);
  assert.ok(existsSync(u),f+' is missing');
 }
});
