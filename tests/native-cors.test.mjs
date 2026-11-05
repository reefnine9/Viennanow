import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/_middleware.js';

function context(origin, method='GET') {
  return {
    request:new Request('https://example.test/api/route',{method,headers:origin?{Origin:origin}:{}}),
    next:async()=>new Response('ok',{headers:{'Cache-Control':'public, max-age=300'}})
  };
}
test('native iOS origin gets scoped CORS header',async()=>{
 const r=await onRequest(context('capacitor://localhost'));
 assert.equal(r.headers.get('access-control-allow-origin'),'capacitor://localhost');
 assert.equal(await r.text(),'ok');
});
test('native Android origin can preflight',async()=>{
 const r=await onRequest(context('http://localhost','OPTIONS'));
 assert.equal(r.status,204);
 assert.equal(r.headers.get('access-control-allow-origin'),'http://localhost');
 assert.match(r.headers.get('access-control-allow-methods'),/GET/);
});
test('unknown origins do not get CORS access',async()=>{
 const r=await onRequest(context('https://untrusted.example'));
 assert.equal(r.headers.get('access-control-allow-origin'),null);
 const preflight=await onRequest(context('https://untrusted.example','OPTIONS'));
 assert.equal(preflight.status,403);
});
test('ordinary same-origin web requests are unchanged',async()=>{
 const r=await onRequest(context(null));
 assert.equal(r.headers.get('access-control-allow-origin'),null);
 assert.equal(await r.text(),'ok');
});
