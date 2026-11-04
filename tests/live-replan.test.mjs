import test from 'node:test';
import assert from 'node:assert/strict';
import {previewRemaining} from '../lib/live-replan.mjs';
const day=[
 {type:'place',id:'A01',start:'10:00',end:'11:00',duration:60,transfer:12},
 {type:'place',id:'A02',start:'12:00',end:'13:30',duration:90,transfer:16},
 {type:'event',id:'E1',title:'오페라',start:'19:00',end:'21:00',bufferBefore:30,bufferAfter:15},
 {type:'place',id:'A03',start:'15:00',end:'16:00',duration:60,transfer:15}
];
test('reservations remain unchanged even outside available touring window',()=>{
 const result=previewRemaining({timeline:day,now:'14:00',dayEnd:'18:00'});
 assert.deepEqual(result.unchangedEvents.map(e=>[e.id,e.start,e.end]),[['E1','19:00','21:00']]);
 assert.deepEqual(result.entries.filter(e=>e.type==='event').map(e=>e.id),['E1']);
});
test('already visited attractions are never moved into remaining day',()=>{
 const r=previewRemaining({timeline:day,now:'13:00',visited:['A01']});assert(!r.entries.some(e=>e.id==='A01'));assert.equal(r.remaining,2);
});
test('explicitly skipped items are not silently marked visited',()=>{
 const r=previewRemaining({timeline:day,now:'14:00',skipped:['A02']});assert(!r.entries.some(e=>e.id==='A02'));
});
test('fixed event arrival buffer reserves time',()=>{
 const r=previewRemaining({timeline:[{type:'place',id:'P',duration:75},{type:'event',id:'X',title:'쇼',start:'16:00',end:'17:00',bufferBefore:30,bufferAfter:15}],now:'14:30',dayEnd:'18:00'});
 assert.equal(r.unplaced.length,1);assert.equal(r.unchangedEvents[0].start,'16:00');
});
test('closed venue is unplaced and must not be hidden',()=>{
 const r=previewRemaining({timeline:day,now:'11:00',opening:e=>e.id==='A02'?{closed:true}:{open:0,close:1440}});
 assert(r.unplaced.some(e=>e.id==='A02'&&e.reason.includes('휴관')));
});
test('time correction can allow a new visit',()=>{
 const short=previewRemaining({timeline:[{type:'place',id:'P',duration:90}],now:'16:40',dayEnd:'18:00'});
 const long=previewRemaining({timeline:[{type:'place',id:'P',duration:90}],now:'15:00',dayEnd:'18:00'});
 assert.equal(short.unplaced.length,1);assert.equal(long.planned,1);
});
test('invalid time produces errors',()=>assert(previewRemaining({timeline:[],now:'27:13'}).errors.length));
test('confirmed booking start in past produces a caution, not auto removal',()=>{
 const r=previewRemaining({timeline:day,now:'20:00',eventDone:[]});assert(r.warnings.some(x=>x.includes('직접 참석 상태')));assert.equal(r.unchangedEvents.length,1);
});
test('original timeline is not mutated by preview',()=>{
 const orig=JSON.stringify(day);previewRemaining({timeline:day,now:'15:00'});assert.equal(JSON.stringify(day),orig);
});
