import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addDate,tripDates,clockMinutes,validateTrip,buildItinerary} from '../lib/schedule-core.mjs';
const alpha={id:'A',ko:'명소 A',lat:48.2,lon:16.36,options:[{mode:'external',label:'외관',mins:40}]};
const beta={id:'B',ko:'명소 B',lat:48.201,lon:16.367,options:[{mode:'external',label:'외관',mins:60}]};
const opera={id:'OP',ko:'오페라극장',lat:48.202,lon:16.369,options:[{mode:'external',label:'외관',mins:20}]};
const opening=()=>({open:0,close:1440,verified:true});
const estimate=()=>30;
const base={places:[alpha,beta],referencePlaces:[alpha,beta,opera],firstDate:'2026-11-10',days:1,pace:'balanced',opening,estimate};
function event({id='e1',title='저녁 공연',date='2026-11-10',start='19:00',end='21:00',placeId='OP',bufferBefore=30,bufferAfter=15}={}){return {id,title,date,start,end,placeId,bufferBefore,bufferAfter};}
test('Europe/Vienna civil dates through month end and DST without UTC day drift',()=>{
 assert.deepEqual(tripDates('2026-10-31',3),['2026-10-31','2026-11-01','2026-11-02']);
 assert.equal(addDate('2026-12-31',1),'2027-01-01');
 assert.equal(clockMinutes('19:35'),1175);
 assert.ok(Number.isNaN(clockMinutes('25:99')));
});
test('first day afternoon arrival restricts tourism to after arrival',()=>{
 const it=buildItinerary({...base,windows:{'2026-11-10':{start:'14:00',end:'18:00'}}});
 assert.equal(it.errors.length,0);assert.ok(it.days[0].every(x=>clockMinutes(x.start)>=840));
 assert.ok(it.days[0].every(x=>clockMinutes(x.end)<=1080));
});
test('last day early departure blocks late sightseeing',()=>{
 const it=buildItinerary({...base,days:2,windows:{'2026-11-11':{start:'08:00',end:'10:30'}}});
 assert.ok(it.days[1].every(x=>clockMinutes(x.end)<=630));
});
test('an evening booking outside tour window remains on timeline',()=>{
 const it=buildItinerary({...base,events:[event()]});
 assert.equal(it.errors.length,0);
 assert.ok(it.timelines[0].some(x=>x.type==='event'&&x.start==='19:00'));
 assert.ok(it.warnings.some(x=>x.includes('관광 가능 시간 밖')));
});
test('booking in tour window blocks overlap and reserves travel to venue',()=>{
 const it=buildItinerary({...base,windows:{'2026-11-10':{start:'09:00',end:'18:30'}},events:[event({start:'13:00',end:'15:00'})]});
 assert.equal(it.errors.length,0);
 assert.ok(it.timelines[0].some(x=>x.type==='event'&&x.start==='13:00'));
 for(const stop of it.days[0]){
   const a=clockMinutes(stop.start), b=clockMinutes(stop.end);
   assert.ok(b<=12*60||a>=15*60+15+20, `${stop.id}: ${stop.start}–${stop.end} overlaps reservation`);
 }
});
test('known route to event uses the saved travel time, not a straight line',()=>{
 const it=buildItinerary({...base,events:[event({start:'11:00',end:'12:00'})],windows:{'2026-11-10':{start:'09:00',end:'16:00'}},routeOverrides:{'A>OP':{minutes:90,source:'user-entry'},'B>OP':{minutes:90,source:'user-entry'}}});
 assert.equal(it.errors.length,0);
 assert.ok(it.days[0].filter(s=>clockMinutes(s.end)<660).every(s=>clockMinutes(s.end)<=540),'no pre-event stop fits with 90m travel');
});
test('two reservations with overlapping arrival and departure buffers are rejected',()=>{
 const e2=event({id:'e2',title:'예약 2',start:'20:45',end:'22:00'});
 const checked=validateTrip('2026-11-10',1,{},[event(),e2]);
 assert.ok(checked.errors.some(x=>x.includes('겹칩니다')));
 const it=buildItinerary({...base,events:[event(),e2]});
 assert.ok(it.errors.length>0);assert.equal(it.days,undefined);
});
test('invalid window and out of trip booking are rejected instead of silently ignored',()=>{
 const it=buildItinerary({...base,windows:{'2026-11-10':{start:'17:00',end:'11:00'}},events:[event({date:'2026-11-12'})]});
 assert.equal(it.errors.length,2);
});
test('a venue not selected as must is still used for a fixed event',()=>{
 const it=buildItinerary({...base,places:[alpha],events:[event({start:'12:00',end:'14:00'})]});
 assert.equal(it.errors.length,0);
 assert.equal(it.timelines[0].filter(x=>x.type==='event').length,1);
});
test('tour/performance option is not silently scheduled as regular self-guided visit',()=>{
 const p={...alpha,options:[{mode:'performance',label:'공연',mins:150}]};
 const it=buildItinerary({...base,places:[p]});
 assert.equal(it.covered,0);assert.ok(it.warnings.some(x=>x.includes('미배치')));
});
