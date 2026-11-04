import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeEditDraft,editMove,editReorder,editRemove,editRestore,buildEditedItinerary} from '../lib/edit-core.mjs';
import {clockMinutes} from '../lib/schedule-core.mjs';
const A={id:'A',ko:'A 궁전',lat:48.2,lon:16.3,options:[{mode:'external',label:'외관',mins:35}]};
const B={id:'B',ko:'B 공원',lat:48.2,lon:16.31,options:[{mode:'external',label:'외관',mins:40}]};
const C={id:'C',ko:'C 미술관',lat:48.2,lon:16.32,options:[{mode:'external',label:'외관',mins:50}]};
const opera={id:'OP',ko:'오페라',lat:48.2,lon:16.35,options:[{mode:'external',label:'외관',mins:20}]};
const base={places:[A,B,C],referencePlaces:[A,B,C,opera],firstDate:'2026-11-10',days:2,opening:()=>({open:0,close:1440,verified:true}),estimate:()=>15};
const booking={id:'ev1',title:'19시 공연',date:'2026-11-10',start:'19:00',end:'21:00',placeId:'OP',bufferBefore:30,bufferAfter:15};
const plan=(days,more={})=>buildEditedItinerary({...base,manualPlan:{days,removed:[]},events:[booking],...more});
test('draft starts from an itinerary and is not a live itinerary reference',()=>{
 const itinerary={days:[[{id:'A'},{id:'B'}],[{id:'C'}]]};
 const d=makeEditDraft(itinerary,2);d.days[0].pop();assert.equal(itinerary.days[0].length,2);
});
test('move into another day keeps a single occurrence and source draft unchanged',()=>{
 const d={days:[['A','B'],['C']],removed:[]};const e=editMove(d,'A',1);
 assert.deepEqual(e.days,[['B'],['C','A']]);assert.deepEqual(d.days,[['A','B'],['C']]);
 assert.equal(editMove(d,'A',3),null);
});
test('arrow reorder changes only selected date and cannot cross boundary',()=>{
 const d={days:[['A','B'],['C']],removed:[]};const e=editReorder(d,'B',-1);
 assert.deepEqual(e.days,[['B','A'],['C']]);assert.equal(editReorder(d,'A',-1),null);
});
test('removal is explicit and restoration never duplicates a visit',()=>{
 const d={days:[['A','B'],['C']],removed:[]};const removed=editRemove(d,'B');
 assert.deepEqual(removed.days,[['A'],['C']]);assert.deepEqual(removed.removed,['B']);
 assert.deepEqual(editRestore(removed,'B',1,['A','B','C']).days,[['A'],['C','B']]);
 assert.equal(editRestore(d,'A',1,['A','B','C']),null);
});
test('chosen order and fixed reservation remain intact after date move',()=>{
 const r=plan([['C','A'],['B']]);assert.equal(r.errors.length,0);
 assert.deepEqual(r.days[0].map(x=>x.id),['C','A']);
 assert.deepEqual(r.days[1].map(x=>x.id),['B']);
 const e=r.timelines[0].find(x=>x.type==='event');assert.equal(e.start,'19:00');assert.equal(e.end,'21:00');
});
test('impossible edit yields unplaced rather than silently changing date or overlapping reservation',()=>{
 const r=plan([['A','B','C'],[]],{windows:{'2026-11-10':{start:'17:00',end:'18:00'}}});
 assert.ok(r.unplaced.length>0);
 assert.equal(r.days[0].some(s=>clockMinutes(s.end)>18*60),false);
 assert.ok(r.timelines[0].some(s=>s.type==='event'&&s.start==='19:00'));
 assert.equal(r.days[1].length,0);
});
test('selected but excluded attractions are reported and not silently counted as complete',()=>{
 const r=plan([['A'],[]]);assert.deepEqual(new Set(r.omitted),new Set(['B','C']));
 assert.equal(r.covered,1);assert.equal(r.mustCount,3);
 assert.ok(r.warnings.some(x=>x.includes('필수 장소')));
});
test('manual plan rejects duplicated IDs and dates of wrong length',()=>{
 const dup=plan([['A'],['A']]);assert.ok(dup.errors.length);
 const invalid=buildEditedItinerary({...base,manualPlan:{days:[['A']],removed:[]}});assert.ok(invalid.errors.length);
});
test('user-entered travel time forces infeasible stop while keeping booked event unchanged',()=>{
 const r=plan([['A'],['B','C']],{windows:{'2026-11-10':{start:'17:00',end:'18:00'}},routeOverrides:{'A>OP':{minutes:95,source:'user-entry'}}});
 assert.equal(r.days[0].length,0);assert.equal(r.unplaced[0].id,'A');
 assert.ok(r.timelines[0].some(s=>s.type==='event'&&s.start==='19:00'));
});
test('reservation overlapping available window cannot be scheduled over',()=>{
 const custom={...booking,start:'11:00',end:'13:00'};
 const r=plan([['A','B','C'],[]],{events:[custom],windows:{'2026-11-10':{start:'10:00',end:'14:30'}}});
 for(const s of r.days[0]){const start=clockMinutes(s.start),end=clockMinutes(s.end);assert.ok(end<=10*60+30||start>=13*60+15);}
});
