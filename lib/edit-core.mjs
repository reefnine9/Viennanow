/** ViennaNow Phase 15 — manual stop ordering and date assignment.
 * A fixed reservation is NEVER a movable stop. This is a provisional scheduling
 * tool, not a verified ticket/route/opening-time service.
 */
import {clockMinutes,timeText,validateTrip} from './schedule-core.mjs';

export function makeEditDraft(itinerary, days){
  const count=Math.max(1,Math.min(5,Number(days)||1));
  return {days:Array.from({length:count},(_,i)=>(itinerary?.days?.[i]||[]).map(s=>s.id)),removed:[]};
}
export function editMove(draft,id,toDay){
  const copy=structuredClone(draft);
  if(!Number.isInteger(toDay)||toDay<0||toDay>=copy.days.length)return null;
  const original=copy.days.findIndex(day=>day.includes(id));
  if(original<0)return null;
  if(original===toDay)return copy;
  copy.days[original]=copy.days[original].filter(x=>x!==id);
  copy.days[toDay].push(id);
  copy.removed=copy.removed.filter(x=>x!==id);
  return copy;
}
export function editReorder(draft,id,delta){
  const copy=structuredClone(draft);
  const d=copy.days.findIndex(day=>day.includes(id));
  if(d<0||![1,-1].includes(delta))return null;
  const i=copy.days[d].indexOf(id),j=i+delta;
  if(j<0||j>=copy.days[d].length)return null;
  [copy.days[d][i],copy.days[d][j]]=[copy.days[d][j],copy.days[d][i]];
  return copy;
}
export function editRemove(draft,id){
  const copy=structuredClone(draft);
  if(!copy.days.some(day=>day.includes(id)))return null;
  copy.days=copy.days.map(day=>day.filter(x=>x!==id));
  copy.removed=[...new Set([...copy.removed,id])];
  return copy;
}
export function editRestore(draft,id,toDay,selectedIds){
  const copy=structuredClone(draft);
  if(!Number.isInteger(toDay)||toDay<0||toDay>=copy.days.length)return null;
  if(!selectedIds.includes(id)||copy.days.some(day=>day.includes(id)))return null;
  copy.days[toDay].push(id);
  copy.removed=copy.removed.filter(x=>x!==id);
  return copy;
}
function editableSegments(day){
  const out=[];let cursor=day.start,previous=null;
  for(const event of day.events){
    const a=event._start-event._before,b=event._end+event._after;
    if(a>cursor)out.push({start:cursor,end:Math.min(day.end,a),afterEvent:previous,beforeEvent:event});
    cursor=Math.max(cursor,b);previous=event;
  }
  if(cursor<day.end)out.push({start:cursor,end:day.end,afterEvent:previous,beforeEvent:null});
  return out.filter(s=>s.end>s.start);
}
function routeDuration(from,to,routeOverrides,estimate){
  const item=routeOverrides[`${from.id}>${to.id}`];
  if(item&&Number.isFinite(item.minutes)&&item.minutes>0)return {minutes:item.minutes,method:item.source==='ors-walking'?'ors-walking':'user-entry'};
  return {minutes:estimate(from,to),method:'model'};
}
/**
 * Conservatively schedules user-pinned visits in their exact day and relative
 * order. Impossible visits go to unplaced[], NEVER moved to a different date
 * or overlapped with a fixed booking behind the user's back.
 */
export function buildEditedItinerary({places,referencePlaces=places,firstDate,days,windows={},events=[],pace='balanced',options={},routeOverrides={},opening,estimate,manualPlan}){
  const checked=validateTrip(firstDate,days,windows,events);
  if(checked.errors.length)return {errors:checked.errors,warnings:checked.warnings};
  const errors=[];
  if(!manualPlan||!Array.isArray(manualPlan.days)||manualPlan.days.length!==days||manualPlan.days.some(a=>!Array.isArray(a))){
    return {errors:['일정 편집에 저장된 날짜 수가 여행 기간과 다릅니다. 편집을 초기화하고 다시 생성하세요.'],warnings:[]};
  }
  const unique=new Set(),chosen=new Map(places.map(p=>[p.id,p]));
  for(const day of manualPlan.days)for(const id of day){
    if(unique.has(id))errors.push(`${id}: 중복으로 편집된 명소입니다.`);
    if(!chosen.has(id))errors.push(`${id}: 현재 필수 명소에 포함되지 않았습니다.`);
    unique.add(id);
  }
  if(errors.length)return {errors,warnings:[]};
  const lookup=new Map(referencePlaces.map(p=>[p.id,p]));
  const paceFactor={packed:.83,balanced:1,relaxed:1.25}[pace]||1;
  const restGap={packed:7,balanced:15,relaxed:25}[pace]||15;
  const allDays=[],timelines=[],unplaced=[],warnings=[...checked.warnings];
  for(let di=0;di<days;di++){
    const date=checked.dates[di],day=checked.byDay[date],segments=editableSegments(day),stops=[];
    let segmentIndex=0,current=segments[0]?.start||day.end,prior=null;
    for(const id of manualPlan.days[di]){
      const p=chosen.get(id);
      const mode=options[id]||p.options.find(o=>['museum','interior'].includes(o.mode))?.mode||p.options[0].mode;
      const opt=p.options.find(o=>o.mode===mode)||p.options[0];
      if(['performance','tour'].includes(opt.mode)){unplaced.push({id,date,reason:'공연·투어는 시간지정 예약으로 등록해야 합니다.'});continue;}
      const hours=opening(p,date,opt);
      if(hours.closed){unplaced.push({id,date,reason:'선택 날짜가 운영규칙상 휴관일입니다.'});continue;}
      const duration=Math.max(10,Math.round(opt.mins*paceFactor/5)*5);
      let found=null;
      for(let s=segmentIndex;s<segments.length;s++){
        const seg=segments[s];
        const prev=s===segmentIndex?prior:null;
        const from=prev||(seg.afterEvent&&lookup.get(seg.afterEvent.placeId));
        const route=from?routeDuration(from,p,routeOverrides,estimate):{minutes:seg.afterEvent?20:12,method:'model'};
        const travel=route.minutes;
        let begin=Math.max(seg.start,hours.open,(s===segmentIndex?current:seg.start)+travel);
        if(hours.breakStart!=null&&hours.breakEnd!=null&&begin<hours.breakEnd&&begin+duration>hours.breakStart)begin=hours.breakEnd;
        const end=begin+duration;
        const target=seg.beforeEvent&&lookup.get(seg.beforeEvent.placeId);
        const toEvent=seg.beforeEvent?(target?routeDuration(p,target,routeOverrides,estimate).minutes:20):0;
        if(end>hours.close||end+toEvent>seg.end)continue;
        found={s,seg,begin,end,travel,route};break;
      }
      if(!found){
        unplaced.push({id,date,reason:'선택한 순서·관람시간·고정 예약의 여유시간 안에 배치할 수 없습니다.'});
        continue;
      }
      segmentIndex=found.s;
      current=found.end+restGap;prior=p;
      stops.push({id,date,start:timeText(found.begin),end:timeText(found.end),transfer:found.travel,routeMethod:found.route.method,duration,optionLabel:opt.label,status:hours.verified?'기본 운영규칙 적용':'운영 확인 필요'});
      if(!hours.verified)warnings.push(`${p.ko}: ${date} 운영시간은 검증되지 않았습니다.`);
      if(p.id==='A04'&&['museum','interior'].includes(opt.mode))warnings.push('상벨베데레: 실제 시간대별 입장권 예약이 필요합니다.');
    }
    allDays.push(stops);
    timelines.push([...stops.map(s=>({...s,type:'place'})),...day.events.map(e=>({type:'event',id:e.id,date,title:e.title,start:e.start,end:e.end,placeId:e.placeId||'',bufferBefore:e._before,bufferAfter:e._after}))].sort((a,b)=>clockMinutes(a.start)-clockMinutes(b.start)||(a.type==='event'?-1:1)));
  }
  const planned=new Set(manualPlan.days.flat());
  const omitted=places.filter(p=>!planned.has(p.id)).map(p=>p.id);
  for(const x of unplaced)warnings.push(`${lookup.get(x.id)?.ko||x.id} (${x.date}): ${x.reason}`);
  if(omitted.length)warnings.unshift(`일정에서 제외/미배치한 필수 장소 ${omitted.length}곳: ${omitted.map(id=>lookup.get(id)?.ko||id).join(', ')}. '필수' 지정 자체는 유지됩니다.`);
  warnings.push('일정은 사용자가 지정한 순서에 맞춰 계산한 초안입니다. 실제 휴관·예약·경로와 출입구는 방문 전에 확인해야 합니다.');
  return {days:allDays,timelines,dayWindows:checked.dates.map(d=>({date:d,start:(windows[d]||{}).start||'09:30',end:(windows[d]||{}).end||'18:00'})),fixedEvents:events.map(e=>({...e})),covered:allDays.reduce((n,d)=>n+d.length,0),mustCount:places.length,warnings:[...new Set(warnings)],errors:[],generatedAt:new Date().toISOString(),unplaced,omitted,edited:true,message:unplaced.length?`${unplaced.length}곳을 요청한 날짜·순서에 배치하지 못했습니다. 편집 화면에서 수정해야 합니다.`:'직접 선택한 방문 날짜와 순서대로 일정을 다시 계산했습니다.'};
}
