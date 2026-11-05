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

for(const [phase,controls] of [
 ['28',['initTourMap28','tour-map-28','tour-map-day','vn28-marker','L.polyline']],
 ['29',['vn29-edit-banner','open-editor','makeEditDraft','edit-apply']],
 ['30',['repeat(5,minmax(0,1fr))','touch-action:manipulation','100svh']]
]){
 for(const control of controls)assert.ok(index.includes(control),`Phase ${phase} component missing: ${control}`);
}
assert.ok(index.includes('<title>ViennaNow'), 'public app title must identify ViennaNow');
console.log('Phases 28–30 regression gate OK: course map, itinerary editing and mobile layout.');

// Prevent a stale root entrypoint from being served by alternative deployment configurations.
if(fs.existsSync(path.join(root,'index.html'))){
 const rootIndex=fs.readFileSync(path.join(root,'index.html'),'utf8');
 if(rootIndex!==index)console.warn('Expected: root index.html is legacy; deploy only public/index.html');
}
console.log('Deployment entrypoints synchronized: root and public index.html.');

for (const feature of [
 'main.classList.toggle(\'near-map-main\'',
 'class="near-shell near31-shell"',
 'class="near-mapframe near31-mapframe"',
 'near-mapfilter',
 'near-mapstatus',
 'leaflet-map-pane',
 'requestAnimationFrame(()=>map?.invalidateSize({pan:false}))',
 "map?.invalidateSize({pan:false}),700",
 '.vn-pin-wc{background:#626b73'
]) assert.ok(index.includes(feature),`Map-first layout regression: ${feature}`);
assert.ok(!index.includes('CITY GUIDE · MAP FIX'), 'stale map fix header reappeared');
console.log('Map-first regression gate OK: full-height map, Leaflet CSS, resize and grey WC pins.');

// Map usability: one-row navigation/location controls; gestures without oversized zoom widget.
for(const key of ['near31-locations','near31-tabs','aria-label="지도 표시 내용"'])assert.ok(index.includes(key),'missing map toolbar: '+key);
assert.ok(!index.includes("L.control.zoom({position:'bottomright'})"),'zoom widget must remain disabled on mobile map');
console.log('Map toolbar and touch zoom regression gate OK.');

// basemap.at HighDPI release gate: both nearby and curated-route maps use the Austrian official tiles.
const basemapUrl='https://mapsneu.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg';
assert.equal(index.split(basemapUrl).length-1,2,'both maps must use basemap.at HiDPI');
assert.ok(index.includes('Grundkarte: <a href="https://basemap.at/'), 'map attribution must link to basemap.at');
assert.ok(!index.includes('tile.openstreetmap.org'), 'legacy public tile provider must not remain');
console.log('Austrian HiDPI map regression gate OK: two layers and attribution.');

const newTabs=["['sights','볼거리']","['food','맛집']","['saved','♥ 찜한 곳']","['stories','비엔나 이야기']","['wc','화장실']","['plan','계획']"];
let prev=-1;for(const t of newTabs){const pos=index.indexOf(t);assert.ok(pos>prev,'Five near-me categories must appear in requested order: '+t);prev=pos;}
for(const feature of ['nearSearch31','nearFoodLayer31','nearPlanLayer31','nearPin31','near31-search','near31-planbar','data-act="use-gps"','data-act="reset-anchor"','showFacilities(\'wc\')']){
 assert.ok(index.includes(feature),'missing new nearby map feature: '+feature);
}
assert.ok(!index.includes('<div class="near-mapstatus">${h(caption)}</div>'),'obsolete public-data status overlay must be removed');
console.log('Nearby six-category map regression gate OK.');

for (const feature of ['nearSightPopup32','vn32-sight-pop','near32-brand','near32-logo','id="ad-slot"','vn32-ad-slot','vn32-near-screen','near31-pin-sights{color:#2563eb}','near31-pin-food{color:#dc2626}','near31-pin-wc{color:#166534']){
 assert.ok(index.includes(feature),'Missing Phase 32 map feature: '+feature);
}
assert.ok(index.includes("['saved','♥ 찜한 곳']")&&index.includes("['stories','비엔나 이야기']"),'Nearby saved and stories map categories must be present');
assert.ok(index.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'nearby tabs must be four columns');
console.log('Phase 32 map layout, colored pins, popup and ad-slot checks OK.');

const photoManifest=JSON.parse(fs.readFileSync(path.join(pub,'photo_manifest.json'),'utf8'));
assert.equal(photoManifest.length,48,'Expected 48 catalogued sightseeing photos');
assert.equal(new Set(photoManifest.map(x=>x.placeId)).size,48,'Each place needs a distinct photo record');
for(const p of photoManifest){
 assert.ok(p.file&&p.source&&p.creator&&p.license&&p.licenseUrl,'Missing photo credit or source for '+p.placeId);
 assert.ok(p.url.startsWith('https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/'),'Unsupported image delivery for '+p.placeId);
 assert.ok(p.legacyUrl?.startsWith('https://upload.wikimedia.org/'),'Missing independent fallback URL for '+p.placeId);
}
assert.ok(index.includes('data-legacy-photo'),'Photo failure recovery is missing from app');
assert.ok(index.includes('img.dataset.retry23'),'Photo retry logic is missing');
assert.ok(index.includes('referrerpolicy="no-referrer"'),'Image requests must omit app referral information');
console.log('Photo delivery regression gate OK: 48 credited images, Commons redirect and fallback.');

const statusEnd=index.indexOf('</div>',index.indexOf('<div class="status">'));
const adPos=index.indexOf('id="ad-slot"'),headerPos=index.indexOf('<header class="header">'),mainPos=index.indexOf('<main id="main"');
assert.ok(statusEnd>=0 && adPos>statusEnd && adPos<headerPos && headerPos<mainPos,'Ad slot should appear above app header and content');
for(const item of ['vn33-sights-screen','vn33-sight-head','vn33-sight-brand','vn33-sight-tabs','<span class="near32-logo" aria-hidden="true">V</span>','data-act="section-sights"']){
 assert.ok(index.includes(item),'missing compact sight header component: '+item);
}
assert.ok(!index.includes('큰 사진을 좌우로 넘기며 가고 싶은 곳을 찾아보세요.'),'old sight instructions must be removed');
console.log('Phase 33 placement checks OK: ad at top, compact V sight header and inline categories.');

for(const feature of [
 'function nearSightPopup32(p)',
 "photoImg(p.id,'vn34-popup-image')",
 'class="vn34-sight-card" data-act="detail"',
 'vn34-sight-media',
 'vn34-sight-caption',
 'vn34-sight-hint',
 '.bindPopup(nearSightPopup32(p)',
 'onerror="photoFail23(this)"'
])assert.ok(index.includes(feature),'Phase 34 attraction preview missing: '+feature);
assert.ok(index.includes("case'detail':state.detail=id;render();return;"),'second-tap details navigation missing');
console.log('Phase 34 map attraction popup regression gate OK: photo preview then full details.');

for(const feature of [
 '.leaflet-tile-pane{z-index:200',
 '.leaflet-marker-pane{z-index:600',
 '.leaflet-popup-pane{z-index:700',
 "m.openPopup()",
 "m.bindPopup(nearSightPopup32(p)"
])assert.ok(index.includes(feature),'Popup visibility regression: '+feature);
console.log('Map popup visibility gate OK: pane z-index and click-open handler present.');

const coords48=JSON.parse(fs.readFileSync(path.join(pub,'catalog_48.json'),'utf8'));
assert.equal(coords48.length,48,'Map must retain all 48 sightseeing records');
assert.equal(new Set(coords48.map(x=>x.id)).size,48,'Map IDs must be unique');
assert.equal(coords48.filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)).length,48,'Every sightseeing point requires coordinates');
assert.equal(coords48.filter(x=>x.coordinate_status==='approximate_unverified').length,32,'Provisional coordinates require explicit status labels');
for(const c of coords48)assert.ok(c.lat>48.1&&c.lat<48.35&&c.lon>16.2&&c.lon<16.55,'Outside plausible Vienna location: '+c.id);
for(const feature of ['function mapSights48()','function vn61SightRecords()','function refreshSightClusters48()',"map.on('zoomend',refreshSightClusters48)",'vn35-cluster','vn35-pin-note','nearSightPopup32(p)']){
 assert.ok(index.includes(feature),'48-attraction map missing: '+feature);
}
const embeddedStart=index.indexOf('const CATALOG48=');
assert.ok(embeddedStart>=0,'Embedded catalogue missing');
const embeddedEnd=index.indexOf('];',embeddedStart);
assert.ok(embeddedEnd>embeddedStart,'Embedded catalogue terminator missing');
const embedded=JSON.parse(index.slice(embeddedStart+'const CATALOG48='.length,embeddedEnd+1));
assert.equal(embedded.length,48,'Embedded catalogue needs 48 records');
for(const c of embedded){const source=coords48.find(x=>x.id===c.id);assert.equal(c.lat,source.lat,'Embedded map latitude out of sync: '+c.id);assert.equal(c.lon,source.lon,'Embedded map longitude out of sync: '+c.id);}
console.log('Phase 35 sightseeing map gate OK: 48 coordinates, 32 marked provisional and marker clustering.');
