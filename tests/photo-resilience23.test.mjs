import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const qa=fs.readFileSync(new URL('../photo-check.html',import.meta.url),'utf8');
const photos=JSON.parse(fs.readFileSync(new URL('../photo_assets_72.json',import.meta.url),'utf8'));
test('72 place references and truthful missing photographs',()=>{assert.equal(photos.length,72);assert.equal(photos.filter(x=>x.type==='볼거리').length,48);assert.equal(photos.filter(x=>x.type!=='볼거리').length,24);assert.ok(photos.filter(x=>!x.url).length>=1);});
test('broken photo has visible fallback instead of silent disappearance',()=>{assert.match(html,/function photoFail23\(img\)/);assert.match(html,/photo-error23/);assert.doesNotMatch(html,/onerror=\"this.style.display='none'\"/);});
test('photo inspection requires explicit start, bounded connections and export',()=>{assert.match(qa,/id=\"run\"/);assert.match(qa,/length:3/);assert.match(qa,/id=\"csv\"/);assert.match(qa,/id=\"json\"/);});
