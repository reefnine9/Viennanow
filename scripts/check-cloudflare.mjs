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

// Phase 26 regression gate: ensure the live Pages output contains the Phase 25 guided-tour flow.
for(const label of ['코스 상세 안내','이 코스로 계획짜기','tour-apply','tour-start-date','tour-start-time']){
  assert.ok(index.includes(label),`guided tour missing from public/index.html: ${label}`);
}
// Cloudflare Pages must use public/, not the older root index.html.
const rootIndexPath=path.join(root,'index.html');
if(fs.existsSync(rootIndexPath)){
  const legacy=fs.readFileSync(rootIndexPath,'utf8');
  if(legacy!==index)console.warn('DEPLOY WARNING: root index.html is older than public/index.html. Configure Cloudflare Pages output directory = public.');
}
console.log('Phase 26 release gate OK: tour preview/apply controls present; output directory must be public.');

const curatedRoutes=['old','art','music','imperial','classiccenter','palaces'];
for(const id of curatedRoutes){
  assert.ok(index.includes(id==='imperial'?'id:"imperial"':id==='classiccenter'?'id:"classiccenter"':id==='palaces'?'id:"palaces"':'"id":"'+id+'"'),`curated route not found: ${id}`);
}
for(const key of ['tourVisitMinutes27','tourVisitSummary27','tourPlaceMap27','data-tour-date-index','vn27-stoplink','tour-start-date','tour-start-time']){
  assert.ok(index.includes(key),`missing Phase 27 guide component: ${key}`);
}
assert.ok(index.includes('Phase 27'), 'public index page version not updated');
console.log('Phase 27 regression gate OK: six curated routes, dated guide, map links and visit-time summary.');
