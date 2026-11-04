import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('Rest area supports all/cafe/park filters',()=>{
 assert.match(src,/case 'near-rest-filter'/);
 assert.match(src,/state.nearRestFilter==='park'/);
 assert.match(src,/state.nearRestFilter==='cafe'/);
 assert.match(src,/function nearPage21/);
});
test('Dining area supports saved restaurants without promising distance sorting',()=>{
 assert.match(src,/case 'near-dining-filter'/);
 assert.match(src,/저장한 식당/);
 assert.match(src,/정확한 거리 미제공/);
});
