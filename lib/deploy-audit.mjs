/** Pure local audit rules; status of upstream servers must come from live requests. */
export const REQUIRED_LAYERS=Object.freeze(['wc','water','stops']);
export function reviewPhotoManifest(items,expected=48){
 const problems=[];
 if(!Array.isArray(items)) return {count:0,expected,unique:0,problems:['Manifest is not an array'],complete:false};
 const ids=new Set(),urls=new Set();
 for(const [i,p] of items.entries()){
  const name=`${p?.placeId||'entry'+i}`;
  if(!p?.placeId||ids.has(p.placeId))problems.push(`${name}: missing/duplicate placeId`);
  if(p?.placeId)ids.add(p.placeId);
  for(const field of ['title','creator','license','licenseUrl','source','url']) if(!p?.[field])problems.push(`${name}: missing ${field}`);
  for(const field of ['source','url','licenseUrl']){
   try{const u=new URL(p[field]);if(u.protocol!=='https:')throw Error('Not HTTPS');}catch{problems.push(`${name}: invalid ${field}`)}
  }
  if(p?.url){if(urls.has(p.url))problems.push(`${name}: duplicate image URL`);urls.add(p.url)}
  if(/all rights reserved|noncommercial|\bNC\b|not licensed/i.test(p?.license||''))problems.push(`${name}: usage needs review`);
 }
 if(items.length!==expected)problems.push(`Expected ${expected} items; got ${items.length}`);
 return {count:items.length,expected,unique:ids.size,problems,complete:problems.length===0};
}
export function interpretLayer(reply,kind){
 if(!REQUIRED_LAYERS.includes(kind))return {state:'error',message:'Unknown layer'};
 if(!reply||reply.layer!==kind)return {state:'error',message:'Unexpected layer response'};
 if(reply.status==='error')return {state:'error',message:String(reply.message||'API error')};
 if(reply.isSampleOnly!==true)return {state:'warning',message:'Sample proof not identified'};
 if(reply.status!=='ok'||!(Number(reply.usableFeatures)>0))return {state:'warning',message:'API responded but zero usable features'};
 return {state:'pass',message:'Usable WFS sample received — citywide coverage NOT proven',usableFeatures:reply.usableFeatures};
}
export function summarizeGate(checks){
 const entries=Object.values(checks||{});
 const fail=entries.filter(v=>v?.state==='error').length;
 const warning=entries.filter(v=>v?.state==='warning').length;
 const pass=entries.filter(v=>v?.state==='pass').length;
 return {fail,warning,pass,releaseCertified:false,overall:fail?'blocked':warning?'partial':'network-checks-only',reason:'Network checks never certify entrance accuracy, live availability, photo rights, device testing or store readiness'};
}
