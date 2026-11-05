import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const origin=(process.env.VIENNANOW_API_ORIGIN||'').trim().replace(/\/$/,'');
assert.ok(/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(origin),'Set VIENNANOW_API_ORIGIN to a trusted HTTPS origin without a path, e.g. https://YOUR-PRODUCTION-HOST');
const source=path.resolve('public'),target=path.resolve('dist-native');
assert.ok(fs.existsSync(path.join(source,'index.html')),'Missing public/index.html');
assert.notEqual(source,target);
fs.rmSync(target,{recursive:true,force:true});
fs.cpSync(source,target,{recursive:true});
const entry=path.join(target,'index.html');
let html=fs.readFileSync(entry,'utf8');
const routes=['/api/ogd?','/api/diagnostics?','/api/route?'];
for(const route of routes){
 const count=html.split(route).length-1;
 assert.ok(count>0,'Native API rewrite target not found: '+route);
 html=html.split(route).join(origin+route);
 console.log('Native API:',route,'rewritten',count,'time(s)');
}
assert.ok(!html.includes("const proxyUrl='/api/ogd?"),'Unresolved native OGD endpoint');
fs.writeFileSync(entry,html);
console.log('Native assets staged in dist-native with Cloudflare API origin '+origin);
console.log('NOTE: verify API CORS from capacitor://localhost and http://localhost, server permissions and on-device network behavior before release.');
