import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('Nearby sights include all, attractions, museums and performance categories',()=>{
 assert.match(src,/function vn61SubCategories\(section\)/);
 for(const id of ['all','attractions','museum','performance'])assert.ok(src.includes("['"+id+"',"),id);
 assert.match(src,/function vn61SightRecords\(\)/);
 assert.match(src,/data-act="vn61-near-category"/);
});
test('Nearby dining categories use restaurant records and preserve saved places',()=>{
 assert.match(src,/function vn61FoodRecords\(\)/);
 for(const id of ['must','featured','local_recommended','michelin','asian'])assert.ok(src.includes("['"+id+"',"),id);
 assert.match(src,/function vn59SavedMapLayer\(\)/);
 assert.match(src,/state\.savedRestaurants/);
});
