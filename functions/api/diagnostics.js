/** Upstream sample test, never claims citywide coverage. */
import {SOURCES, wfsUrl, transformGeoJSON} from '../../lib/ogd-core.mjs';
const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequestGet({request}){
 const layer=new URL(request.url).searchParams.get('layer')||'';
 if(!['wc','water','stops'].includes(layer)||!SOURCES[layer])return json({status:'error',message:'Unknown test layer'},400);
 const sampleSize=layer==='water'?150:30;
 const checkedAt=new Date().toISOString();const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const upstream=await fetch(wfsUrl(layer,sampleSize),{headers:{Accept:'application/json'},signal:controller.signal});
  if(!upstream.ok)throw Error(`City WFS HTTP ${upstream.status}`);
  const raw=await upstream.text(); if(raw.length>2*1024*1024)throw Error('WFS sample exceeds 2 MB');
  let data;try{data=JSON.parse(raw)}catch{throw Error('WFS sample not JSON')}
  const sample=transformGeoJSON(data,layer,{limit:sampleSize});
  return json({status:sample.stats.accepted?'ok':'warning',layer,source:'Stadt Wien OGD WFS',checkedAt,sampleSize,
    rawFeatures:sample.stats.received,usableFeatures:sample.stats.accepted,invalidCoordinates:sample.stats.invalidCoordinates,
    swappedAxes:sample.stats.swappedAxes,projected:sample.stats.projected,filteredNonDrinking:sample.stats.filteredNonDrinking,
    partialSample:sample.partial,isSampleOnly:true,coverage:sample.coverage,liveAvailability:false,
    message:sample.stats.accepted?'연결 및 표본 변환 성공 (일부 표본)':'응답은 받았으나 표시 가능한 표본이 없습니다.'});
 }catch(error){return json({status:'error',layer,checkedAt,isSampleOnly:true,message:String(error?.name==='AbortError'?'WFS request timed out':error?.message||error)},502)}
 finally{clearTimeout(timer)}
}
export const onRequestPost=()=>json({status:'error',message:'GET only'},405);
