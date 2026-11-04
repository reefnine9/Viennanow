/** ViennaNow Phase 14 — local-time trip schedule builder (Europe/Vienna civil dates).
 * This module does not verify ticket availability or public transport. Coordinates remain approximate.
 */
export const DEFAULT_WINDOW = Object.freeze({start:'09:30',end:'18:00'});
export function clockMinutes(value){
  if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return NaN;
  const [h,m]=value.split(':').map(Number);return h*60+m;
}
export function timeText(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function addDate(date,n){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('유효한 날짜가 아닙니다.');
  const d=new Date(`${date}T12:00:00Z`);
  if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date)throw Error('유효한 날짜가 아닙니다.');
  d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);
}
export function tripDates(start,days){
  if(!Number.isInteger(days)||days<1||days>5)throw Error('여행 기간은 1~5일이어야 합니다.');
  return Array.from({length:days},(_,i)=>addDate(start,i));
}
export function windowsFor(start,days,windows={}){
  return tripDates(start,days).map(date=>({date,...DEFAULT_WINDOW,...(windows[date]||{})}));
}
export function validateTrip(start,days,windows={},fixedEvents=[]){
  const errors=[],warnings=[],dates=tripDates(start,days),byDay={};
  for(const date of dates){
    const win={...DEFAULT_WINDOW,...(windows[date]||{})};
    const a=clockMinutes(win.start),b=clockMinutes(win.end);
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a)errors.push(`${date}: 관광 시작·종료 시각을 다시 확인하세요.`);
    byDay[date]={start:a,end:b,events:[]};
  }
  const seen=new Set();
  for(const ev of fixedEvents){
    if(!ev||typeof ev.id!=='string'||!ev.id||seen.has(ev.id)){errors.push('예약 식별자가 올바르지 않습니다.');continue;}
    seen.add(ev.id);
    if(!dates.includes(ev.date)){errors.push(`${ev.title||'예약'}: 여행 기간 밖의 날짜입니다.`);continue;}
    const a=clockMinutes(ev.start),b=clockMinutes(ev.end),before=Number(ev.bufferBefore??30),after=Number(ev.bufferAfter??15);
    if(!ev.title?.trim()||ev.title.length>90||!Number.isFinite(a)||!Number.isFinite(b)||b<=a||!Number.isInteger(before)||!Number.isInteger(after)||before<0||before>120||after<0||after>120){errors.push(`${ev.title||'예약'}: 시간 또는 여유시간이 올바르지 않습니다.`);continue;}
    byDay[ev.date].events.push({...ev,_start:a,_end:b,_before:before,_after:after});
    if(b<=byDay[ev.date].start||a>=byDay[ev.date].end)warnings.push(`${ev.title}: 관광 가능 시간 밖의 예약입니다. 일정표에는 그대로 표시합니다.`);
  }
  for(const date of dates){
    const events=byDay[date].events.sort((x,y)=>x._start-y._start);
    for(let i=1;i<events.length;i++){
      if(events[i]._start-events[i]._before < events[i-1]._end+events[i-1]._after){
        errors.push(`${date}: '${events[i-1].title}'와 '${events[i].title}'의 예약·여유시간이 겹칩니다.`);
      }
    }
  }
  return {errors,warnings,dates,byDay};
}
function segments(day){
  const out=[];let cursor=day.start,previous=null;
  for(const event of day.events){
    const blockStart=event._start-event._before,blockEnd=event._end+event._after;
    if(blockStart>cursor){out.push({start:cursor,end:Math.min(day.end,blockStart),afterEvent:previous,beforeEvent:event});}
    cursor=Math.max(cursor,blockEnd);previous=event;
  }
  if(cursor<day.end)out.push({start:cursor,end:day.end,afterEvent:previous,beforeEvent:null});
  return out.filter(s=>s.end>s.start);
}
/** Returns draft, or {errors} on invalid user inputs. */
export function buildItinerary({places,referencePlaces=places,firstDate,days,windows={},events=[],pace='balanced',options={},routeOverrides={},opening,estimate}){
  const checked=validateTrip(firstDate,days,windows,events);
  if(checked.errors.length)return {errors:checked.errors,warnings:checked.warnings};
  const placeById=new Map(referencePlaces.map(p=>[p.id,p]));
  const valid=places.filter(p=>p&&p.id&&Array.isArray(p.options)&&p.options.length);
  let remaining=[...valid],allDays=[],dayTimelines=[],warnings=[...checked.warnings],covered=0;
  const paceFactor={packed:.83,balanced:1,relaxed:1.25}[pace]||1;
  const restGap={packed:7,balanced:15,relaxed:25}[pace]||15;
  for(const date of checked.dates){
    const day=checked.byDay[date],stops=[];
    for(const seg of segments(day)){
      let current=seg.start,prior=null,n=0;
      while(remaining.length&&n++<25){
        const possible=remaining.map(p=>{
          let mode=options[p.id]||p.options.find(o=>['museum','interior'].includes(o.mode))?.mode||p.options[0].mode;
          let opt=p.options.find(o=>o.mode===mode)||p.options[0];
          if(['performance','tour'].includes(mode))return null; // only via fixed reservations
          const hours=opening(p,date,opt);
          if(hours.closed)return null;
          const priorPlace=prior||((seg.afterEvent&&placeById.get(seg.afterEvent.placeId))||null);
          const override=priorPlace?routeOverrides[priorPlace.id+'>'+p.id]:null;
          const move=priorPlace?(override?.minutes??estimate(priorPlace,p)):(seg.afterEvent?20:12);
          const duration=Math.max(10,Math.round(opt.mins*paceFactor/5)*5);
          let begin=Math.max(current+move,hours.open,seg.start);
          if(hours.breakStart!=null&&begin<hours.breakEnd&&begin+duration>hours.breakStart)begin=hours.breakEnd;
          const end=begin+duration;
          const toEvent=seg.beforeEvent;
          const eventPlace=toEvent?placeById.get(toEvent.placeId):null;
          const routeToEvent=eventPlace?routeOverrides[p.id+'>'+eventPlace.id]:null;
          const moveToEvent=toEvent?(eventPlace?(routeToEvent?.minutes??estimate(p,eventPlace)):20):0;
          if(end>hours.close||end+moveToEvent>seg.end)return null;
          const score=(priorPlace?estimate(priorPlace,p):8)+(hours.verified?0:7)+(begin-current>70?22:0)+(!priorPlace&&seg.afterEvent?5:0);
          return {p,opt,hours,move,duration,begin,end,score,routeMethod:override?(override.source==='ors-walking'?'ors-walking':'user-entry'):'model'};
        }).filter(Boolean).sort((a,b)=>a.score-b.score||a.begin-b.begin);
        if(!possible.length)break;
        const best=possible[0];
        stops.push({id:best.p.id,date,start:timeText(best.begin),end:timeText(best.end),transfer:best.move,routeMethod:best.routeMethod,duration:best.duration,optionLabel:best.opt.label,status:best.hours.verified?'기본 운영규칙 적용':'운영 확인 필요'});
        if(!best.hours.verified)warnings.push(`${best.p.ko}: ${date} 운영시간은 검증되지 않았습니다.`);
        if(best.p.id==='A04'&&['museum','interior'].includes(best.opt.mode))warnings.push('상벨베데레: 실제 시간대별 입장권 예약이 필요합니다.');
        current=best.end+restGap;prior=best.p;
        remaining=remaining.filter(p=>p.id!==best.p.id);covered++;
        // Meal breaks only if they are entirely before the segment end.
        if(current>710&&current<830&&current+40<seg.end)current+=pace==='packed'?35:60;
      }
    }
    allDays.push(stops);
    const entries=[...stops.map(s=>({...s,type:'place'})),...day.events.map(e=>({type:'event',id:e.id,date,title:e.title,start:e.start,end:e.end,placeId:e.placeId||'',bufferBefore:e._before,bufferAfter:e._after}))]
      .sort((a,b)=>clockMinutes(a.start)-clockMinutes(b.start)|| (a.type==='event'?-1:1));
    dayTimelines.push(entries);
  }
  if(remaining.length)warnings.unshift(`필수 관광지 ${remaining.length}곳 미배치: ${remaining.map(p=>p.ko).join(', ')}`);
  if(events.length)warnings.push('고정 일정은 사용자가 입력한 예약으로, 예약 유효성·입장권 보유 여부는 별도로 확인해야 합니다.');
  warnings.push('이동시간은 일부 근사치입니다. 출입구·도보·대중교통 경로는 별도로 검증해야 합니다.');
  return {days:allDays,timelines:dayTimelines,dayWindows:checked.dates.map(d=>({date:d,...DEFAULT_WINDOW,...(windows[d]||{})})),fixedEvents:events.map(e=>({...e})),covered,mustCount:valid.length,warnings:[...new Set(warnings)],errors:[],generatedAt:new Date().toISOString(),message:covered===valid.length?'필수 명소를 일정 초안에 배치했습니다. 실제 예약·운영 가능 여부 확인이 필요합니다.':'선택한 필수 명소 일부를 배치하지 못했습니다. 관광 가능시간이나 관람 옵션을 조정해 보세요.'};
}
