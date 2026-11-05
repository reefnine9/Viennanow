import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync('public/photo_manifest.json','utf8'));
const restaurants=JSON.parse(readFileSync('public/data/restaurants.json','utf8')).restaurants;
const entries=[...manifest.map(p=>({kind:'sight',id:p.placeId,title:p.title,url:p.url,backup:p.legacyUrl||null})),...restaurants.filter(r=>r.media?.cover?.commercial_use_verified&&r.media.cover.url).map(r=>({kind:'restaurant',id:r.id,title:r.name?.de||r.name?.ko,url:r.media.cover.url,backup:null}))];
const timeout=Number(process.env.PHOTO_AUDIT_TIMEOUT_MS||9000);
const results=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function probe(url){
 if(!url)return {status:'missing'};
 let finalStatus=null,kind='',reason='';
 for(const method of ['HEAD','GET']){
  const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);
  try{
   const r=await fetch(url,{method,redirect:'follow',signal:c.signal,headers:{'User-Agent':'ViennaNow-Photo-QA/1.0 (metadata-only, no bulk downloads)',...(method==='GET'?{'Range':'bytes=0-2047'}:{})}});
   finalStatus=r.status;kind=r.headers.get('content-type')||'';
   if(r.body)await r.body.cancel().catch(()=>{});
   if(r.ok&&kind.toLowerCase().startsWith('image/'))return {status:'ok',http:r.status,method,contentType:kind};
   if(method==='HEAD'&&(r.status===403||r.status===405||r.status===501||r.ok))continue;
   if(r.status===429||r.status===503)return {status:'rate-limited',http:r.status,method,contentType:kind};
   reason='Unexpected HTTP or content type';
  }catch(e){reason=String(e?.name||e);if(method==='HEAD')continue;}
  finally{clearTimeout(timer);}
 }
 return {status:'unconfirmed',http:finalStatus,contentType:kind,reason};
}
let next=0;async function worker(){
 while(next<entries.length){
  const i=next++,entry=entries[i];
  const primary=await probe(entry.url);
  let fallback=null;
  if(primary.status!=='ok'&&entry.backup)fallback=await probe(entry.backup);
  results[i]={...entry,primary,fallback,usable:primary.status==='ok'||fallback?.status==='ok'};
  await pause(80);
 }
}
await Promise.all(Array.from({length:3},()=>worker()));
const summary={checkedAt:new Date().toISOString(),tested:results.length,primaryOk:results.filter(x=>x.primary.status==='ok').length,fallbackOnly:results.filter(x=>x.primary.status!=='ok'&&x.fallback?.status==='ok').length,unconfirmed:results.filter(x=>!x.usable).length,byKind:{sights:results.filter(x=>x.kind==='sight').length,restaurants:results.filter(x=>x.kind==='restaurant').length}};
mkdirSync('artifacts/phase15',{recursive:true});
writeFileSync('artifacts/phase15/photo-url-report.json',JSON.stringify({summary,results,scope:'Network probe from GitHub runner, not proof of successful browser image decoding or copyright permission. Remote hosts may rate-limit automated requests.'},null,2));
console.log('Phase 15 photos: '+JSON.stringify(summary));
for(const r of results.filter(x=>!x.usable).slice(0,12))console.log('UNCONFIRMED '+r.kind+' '+r.id+' primary='+r.primary.status+'/'+r.primary.http+' fallback='+r.fallback?.status);
