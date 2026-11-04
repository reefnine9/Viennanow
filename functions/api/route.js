/** Walking routing proxy; API key remains in Cloudflare secret binding. */
import {PLACES16} from '../../lib/places16.mjs';
import {ORS_ENDPOINT, routeRequest, parseWalkingRoute} from '../../lib/route-core.mjs';
const points=new Map(PLACES16.map(p=>[p.id,p]));
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export async function onRequestGet({request,env,waitUntil}){
 const params=new URL(request.url).searchParams;
 const fromId=params.get('from')||'',toId=params.get('to')||'';
 const from=points.get(fromId),to=points.get(toId);
 if(!from||!to||from===to)return json({status:'error',message:'Use two distinct listed sight IDs (A01-A16)'},400);
 if(!env?.ORS_API_KEY)return json({status:'not-configured',message:'ORS_API_KEY not configured in Cloudflare Pages secrets. Manual route check remains available.'},503);
 let coordinates;try{coordinates=routeRequest(from,to).coordinates}catch(error){return json({status:'invalid-location',message:String(error.message)},422)}
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),11000);
 try{
   // Cache only a successful, publicly shareable route between known venue IDs. Never cache credentials or errors.
   const cache=globalThis.caches?.default;
   const cacheKey=new Request(new URL(`/api/route?from=${fromId}&to=${toId}`,request.url).toString());
   if(cache){const hit=await cache.match(cacheKey);if(hit)return hit;}
   const upstream=await fetch(ORS_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:env.ORS_API_KEY,Accept:'application/json'},body:JSON.stringify({coordinates,instructions:false}),signal:controller.signal});
   if(!upstream.ok)return json({status:'provider-error',message:upstream.status===429?'Routing API quota/rate limit reached':`Routing API returned HTTP ${upstream.status}`},upstream.status===429?429:502);
   const parsed=parseWalkingRoute(await upstream.json());
   const response=json({status:'ok',...parsed,from:fromId,to:toId,checkedAt:new Date().toISOString(),note:'Walking time between approximate, not entrance-verified, sight coordinates. Not transit.'},200,{'Cache-Control':'public, max-age=300, s-maxage=86400'});
   if(cache&&waitUntil)waitUntil(cache.put(cacheKey,response.clone()));
   return response;
 }catch(error){return json({status:'provider-error',message:error?.name==='AbortError'?'Routing request timed out':'Routing service unreachable or invalid response'},502)}
 finally{clearTimeout(timer)}
}
export const onRequestPost=()=>json({status:'error',message:'GET only'},405);
