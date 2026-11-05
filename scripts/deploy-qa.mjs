import { writeFile, mkdir } from 'node:fs/promises';

const urlArg=process.argv.find(x=>x.startsWith('--url='));
const base=(urlArg?.slice(6)||process.env.VIENNANOW_DEPLOY_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const parsed=new URL(base);
if(!['http:','https:'].includes(parsed.protocol))throw Error('HTTP(S) URL required');
if(parsed.protocol==='http:'&&!['localhost','127.0.0.1'].includes(parsed.hostname))throw Error('Remote verification requires HTTPS');
const live=!['localhost','127.0.0.1'].includes(parsed.hostname);
const results=[];
async function check(name,path,{type='text',required=true}={}){
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),12000);
 try{
  const response=await fetch(base+path,{signal:ctl.signal,redirect:'follow',headers:{'Accept':'*/*'},cache:'no-store'});
  const body=type==='json'&&response.ok?await response.json():await response.text();
  const ok=response.ok && (type==='html'?String(body).includes('<html'):type==='json'?body&&typeof body==='object':true);
  results.push({name,path,ok,required,status:response.status,detail:ok?'HTTP OK':'Unexpected HTTP or body'});
  return {ok,body};
 }catch(e){results.push({name,path,ok:false,required,detail:String(e.message||e)});return {ok:false};}
 finally{clearTimeout(timer);}
}
const app=await check('ViennaNow entrypoint','/index.html',{type:'html'});
if(app.ok&&!app.body.includes('ViennaNow')){results.push({name:'App identity',ok:false,required:true,detail:'Unexpected app content'});}
const test=await check('Deployed QA page','/qa-smoke.html',{type:'html'});
const health=await check('Deployment diagnostics page','/deploy-check.html',{type:'html'});
const manifest=await check('Photo manifest','/photo_manifest.json',{type:'json'});
if(manifest.ok){
 const count=Array.isArray(manifest.body)?manifest.body.length:null;
 results.push({name:'Photo manifest count',ok:count===48,required:true,detail:count+' records'});
}
const dining=await check('Restaurant catalogue','/data/restaurants.json',{type:'json'});
if(dining.ok){
 const count=Array.isArray(dining.body?.restaurants)?dining.body.restaurants.length:null;
 results.push({name:'Restaurant record count',ok:count===82,required:true,detail:count+' records'});
}
if(live){
 const status=await check('Cloudflare route-status API','/api/route-status',{type:'json'});
 if(status.ok)results.push({name:'Route API structure',ok:typeof status.body.configured==='boolean',required:true,detail:'Configured flag present; does not test route generation'});
 await check('Cloudflare toilet sample diagnostics','/api/diagnostics?layer=wc',{type:'json',required:false});
}
await mkdir('artifacts/deploy-qa',{recursive:true});
await writeFile('artifacts/deploy-qa/report.json',JSON.stringify({base,mode:live?'remote':'local',checkedAt:new Date().toISOString(),results},null,2));
for(const r of results)console.log((r.ok?'PASS ':'FAIL ')+r.name+' '+(r.status??'')+' '+r.detail);
const failures=results.filter(x=>x.required&&!x.ok);
console.log('Phase 12 '+(live?'remote':'local')+' verification: '+(results.length-failures.length)+'/'+results.length+' checks without required failure; '+failures.length+' required failures');
if(failures.length)process.exitCode=1;
