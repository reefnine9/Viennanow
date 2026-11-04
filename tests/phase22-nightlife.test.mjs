import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const venues=JSON.parse(fs.readFileSync(new URL('../experiences_24.json',import.meta.url),'utf8'));
const bars=venues.filter(v=>v.kind==='nightlife');
test('24 experiences have six new bars and clubs and preserve all 18 old items',()=>{
 assert.equal(venues.length,24);assert.equal(bars.length,6);
 for(let i=19;i<=24;i++)assert.ok(bars.some(v=>v.id===`E${i}`));
 for(const [type,num] of [['cafe',9],['restaurant',6],['performance',3]])assert.equal(venues.filter(v=>v.kind===type).length,num);
});
test('All new nightlife venues have official websites, addresses and caution notes',()=>{
 for(const v of bars){assert.match(v.official,/^https:\/\//);assert.ok(v.address.includes('Wien'));assert.ok(v.hoursNote);assert.ok(v.entryNote);assert.ok(v.defaultMinutes>0);}
});
test('Photo source is licensed and otherwise a truthful placeholder',()=>{
 for(const v of bars){if(v.photo){assert.match(v.photo[2],/CC |Public domain/);assert.match(v.photo[3],/^https:\/\/commons.wikimedia.org/);}else assert.equal(v.photo,null);}
});
test('Nightlife is connected to photo deck, detail, saved list and fixed-time planner',()=>{
 assert.match(src,/EXP19\.filter\(x=>x\.kind===state\.foodSection\)/);
 assert.match(src,/function deck21\(/);
 assert.match(src,/case 'experience-save'/);
 assert.match(src,/case 'experience-add-event'/);
 assert.match(src,/v\.hoursNote\?/);
 assert.match(src,/nightlife'\?'20:00'/);
});
