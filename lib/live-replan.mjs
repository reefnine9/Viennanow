/** Phase 16 — local-only preview of remaining visits; never moves booked events.
 * Values are display estimates unless a validated route/hours provider is supplied.
 */
export function toMinutes(s){if(typeof s!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))return NaN;const [h,m]=s.split(':').map(Number);return h*60+m;}
export function toClock(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function previewRemaining({timeline,now,dayStart='09:30',dayEnd='18:00',visited=[],skipped=[],eventDone=[],opening=()=>({open:0,close:1440,closed:false}),transferBuffer=15,restBuffer=10}={}){
 const errors=[],warnings=[];
 if(!Array.isArray(timeline))return {errors:['일정 목록이 없습니다.'],warnings:[],entries:[],unplaced:[],unchangedEvents:[]};
 const current=toMinutes(now),start=toMinutes(dayStart),end=toMinutes(dayEnd);
 if(!Number.isFinite(current)||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return {errors:['시간 값 또는 관광 가능 시간이 잘못되었습니다.'],warnings:[],entries:[],unplaced:[],unchangedEvents:[]};
 const visitedSet=new Set(visited),skippedSet=new Set(skipped),eventDoneSet=new Set(eventDone);
 const events=timeline.filter(e=>e.type==='event').map(e=>({...e})).sort((a,b)=>toMinutes(a.start)-toMinutes(b.start));
 const places=timeline.filter(e=>e.type!=='event'&&!visitedSet.has(e.id)&&!skippedSet.has(e.id));
 const unchangedEvents=events.map(e=>({...e}));
 let cursor=Math.max(current,start),segment=0,prev=null;
 const slots=[];
 for(const e of events){
  const a=toMinutes(e.start),b=toMinutes(e.end),before=Number(e.bufferBefore??30),after=Number(e.bufferAfter??15);
  if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a||before<0||after<0){errors.push(`${e.title||'예약'}: 예약 시간이 올바르지 않습니다.`);continue;}
  if(a<current&&!eventDoneSet.has(e.id))warnings.push(`${e.title}: 예약 시작 시간이 이미 지났습니다. 직접 참석 상태를 확인하세요.`);
  const blockA=a-before,blockB=b+after;
  if(blockA>cursor&&cursor<end)slots.push({start:cursor,end:Math.min(end,blockA),nextEvent:e});
  cursor=Math.max(cursor,blockB);prev=e;segment++;
 }
 if(cursor<end)slots.push({start:cursor,end, nextEvent:null});
 const scheduled=[],unplaced=[];
 let minIndex=0;
 for(const p of places){
  const duration=Number.isFinite(p.duration)?Math.max(10,Math.min(480,Math.round(p.duration))):60;
  const hours=opening(p)||{open:0,close:1440};
  if(hours.closed){unplaced.push({id:p.id,reason:'선택한 날짜에 휴관 또는 관람 불가'});continue;}
  let placed=false;
  for(let i=minIndex;i<slots.length;i++){
   const slot=slots[i];
   const previous=scheduled.length&&scheduled[scheduled.length-1]._slot===i?scheduled[scheduled.length-1]:null;
   const minStart=Math.max(slot.start,Number(hours.open??0),previous?toMinutes(previous.end)+restBuffer:slot.start);
   const travel=Number.isFinite(p.transfer)?Math.max(8,Math.min(120,p.transfer)):transferBuffer;
   const candidateStart=minStart+(previous?travel:transferBuffer);
   const candidateEnd=candidateStart+duration;
   const deadline=Math.min(slot.end,Number(hours.close??1440))-(slot.nextEvent?transferBuffer:0);
   if(candidateEnd<=deadline){
    scheduled.push({...p,start:toClock(candidateStart),end:toClock(candidateEnd),transfer:travel,routeMethod:'live-preview-estimate',_slot:i});
    slots[i].start=candidateEnd+restBuffer;minIndex=i;placed=true;break;
   }
  }
  if(!placed)unplaced.push({id:p.id,reason:'남은 관광시간·예약 도착 여유·운영시간 안에 배치할 수 없음'});
 }
 const entries=[...scheduled.map(({_slot,...rest})=>rest),...unchangedEvents].sort((a,b)=>toMinutes(a.start)-toMinutes(b.start)||(a.type==='event'?-1:1));
 if(unplaced.length)warnings.push(`${unplaced.length}곳은 오늘 남은 일정에 배치하지 못했습니다. 삭제되거나 방문 완료 처리되지는 않습니다.`);
 warnings.push('이동·관람시간은 추정치입니다. 현지 교통과 운영시간은 별도로 확인하세요.');
 return {errors,warnings,entries,unplaced,unchangedEvents,planned:scheduled.length,remaining:places.length,now,dayStart,dayEnd};
}
