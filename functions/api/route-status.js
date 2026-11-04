/** Check secret presence only, without consuming routing quota. */
const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function onRequestGet({env}){
 return json({status:'ok',configured:Boolean(env?.ORS_API_KEY),provider:'openrouteservice (HeiGIT)',mode:'walking-only',
  keyExposed:false,liveConnectionTested:false,coordinatesVerified:false,note:'Configured means the secret is present; test an actual route to validate connectivity.'});
}
export const onRequestPost=()=>json({status:'error',message:'GET only'},405);
