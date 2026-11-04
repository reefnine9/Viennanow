import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';
const root=process.cwd();const pub=path.join(root,'public');
const required=['index.html','health.html','deploy-check.html','route_qa.html','photo-check.html','_routes.json','_headers','catalog_48.json','experiences_24.json'];
for (const file of required)assert.ok(fs.existsSync(path.join(pub,file)),`missing public/${file}`);
for (const fn of ['ogd','diagnostics','route','route-status'])assert.ok(fs.existsSync(path.join(root,'functions/api',fn+'.js')),`missing function ${fn}`);
const routes=JSON.parse(fs.readFileSync(path.join(pub,'_routes.json'),'utf8'));
assert.deepEqual(routes.include,['/api/*']);
for (const name of required.filter(n=>n.endsWith('.html'))){const html=fs.readFileSync(path.join(pub,name),'utf8');assert.ok(!html.includes('/.netlify/functions/'),`${name} still uses Netlify endpoint`)}
const index=fs.readFileSync(path.join(pub,'index.html'),'utf8');
for(const tab of ['볼거리','먹거리','계획','내주변'])assert.ok(index.includes(tab),`missing ${tab}`);
const catalog=JSON.parse(fs.readFileSync(path.join(pub,'catalog_48.json'),'utf8'));
const experience=JSON.parse(fs.readFileSync(path.join(pub,'experiences_24.json'),'utf8'));
console.log('Cloudflare preflight OK: '+required.length+' static files, four API handlers, five navigation tabs, catalog '+(Array.isArray(catalog)?catalog.length:'data')+', experiences '+(Array.isArray(experience)?experience.length:'data'));
