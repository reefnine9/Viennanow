import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const photos=JSON.parse(readFileSync(new URL('../photo_manifest.json',import.meta.url)));
const catalog=JSON.parse(readFileSync(new URL('../catalog_48.json',import.meta.url)));
test('48 distinct attractions and 48 labeled image references',()=>{assert.equal(catalog.length,48);assert.equal(photos.length,48);assert.equal(new Set(catalog.map(x=>x.id)).size,48);assert.equal(new Set(photos.map(x=>x.placeId)).size,48);assert.deepEqual(new Set(photos.map(x=>x.placeId)),new Set(catalog.map(x=>x.id)));});
test('image source, attribution and usage-license links present',()=>{for(const p of photos){assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.match(p.url,/^https:\/\/upload\.wikimedia\.org\//);assert.ok(p.creator.length>1);assert.ok(p.license.length>1);assert.match(p.licenseUrl,/^https:\/\//);}});
test('unverified secondary places not sent into planner',()=>{assert.equal(catalog.filter(x=>x.is_planner_enabled).length,16);assert.equal(catalog.filter(x=>!x.is_planner_enabled).length,32);});
test('all categories are 16 18 14',()=>{assert.deepEqual(['A','B','C'].map(t=>catalog.filter(x=>x.tier===t).length),[16,18,14]);});
