import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet as ogd, onRequestPost as ogdPost} from '../functions/api/ogd.js';
import {onRequestGet as diagnostics} from '../functions/api/diagnostics.js';
import {onRequestGet as route, onRequestPost as routePost} from '../functions/api/route.js';
import {onRequestGet as routeStatus} from '../functions/api/route-status.js';
const ctx=(path,env={})=>({request:new Request('https://viennanow.pages.dev'+path),env,waitUntil:()=>{}});
const fixture={type:'FeatureCollection',features:[{type:'Feature',id:1,properties:{NAME:'Test WC'},geometry:{type:'Point',coordinates:[16.37,48.2]}}]};

test('Cloudflare endpoint guards allowlist and HTTP method',async()=>{
 assert.equal((await ogd(ctx('/api/ogd?layer=bad'))).status,400);
 assert.equal((await route(ctx('/api/route?from=A01&to=evil'))).status,400);
 assert.equal((await ogdPost()).status,405);
 assert.equal((await routePost()).status,405);
});
test('City OGD is parsed, marks coverage, returns Cache-Control',async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async u=>{assert.match(String(u),/data\.wien\.gv\.at/);return new Response(JSON.stringify(fixture),{status:200,headers:{'Content-Type':'application/json'}})};
 try{let r=await ogd(ctx('/api/ogd?layer=wc'));assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/s-maxage/);
 let body=await r.json();assert.equal(body.stats.accepted,1);assert.equal(body.liveAvailability,false);assert.equal(body.delivery,'cloudflare-pages-function');}
 finally{globalThis.fetch=old}
});
test('City diagnostics claims only sampled features',async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify(fixture));
 try{const r=await diagnostics(ctx('/api/diagnostics?layer=wc'));const b=await r.json();assert.equal(r.status,200);assert.equal(b.isSampleOnly,true);assert.equal(b.usableFeatures,1);}
 finally{globalThis.fetch=old}
});
test('route status has no secret and unconfigured routing is honest',async()=>{
 const r=await routeStatus(ctx('/api/route-status'));const b=await r.json();assert.equal(b.configured,false);assert.equal(b.liveConnectionTested,false);
 const missing=await route(ctx('/api/route?from=A01&to=A02'));assert.equal(missing.status,503);
});
test('routing uses server secret and parses only walking output',async()=>{
 const old=globalThis.fetch,secret='FAKE_ONLY_TEST_KEY';
 globalThis.fetch=async (url,options)=>{assert.match(String(url),/api\.heigit\.org/);assert.equal(options.headers.Authorization,secret);return new Response(JSON.stringify({features:[{properties:{summary:{distance:1030,duration:900}}}]}))};
 try{const r=await route(ctx('/api/route?from=A01&to=A02',{ORS_API_KEY:secret}));const b=await r.json();assert.equal(b.status,'ok');assert.equal(b.durationMinutes,15);assert.equal(b.transit,false);assert.ok(!JSON.stringify(b).includes(secret));}
 finally{globalThis.fetch=old}
});
test('upstream errors are not represented as success',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>new Response('rate limited',{status:429});
 try{const r=await route(ctx('/api/route?from=A01&to=A02',{ORS_API_KEY:'FAKE'}));assert.equal(r.status,429);assert.equal((await r.json()).status,'provider-error')}
 finally{globalThis.fetch=old}
});
