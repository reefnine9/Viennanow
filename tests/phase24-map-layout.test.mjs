import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const s=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('nearby page is a map-first full-height flex view',()=>{assert.match(s,/\.main\.near-map-main/);assert.match(s,/\.near-mapframe\{flex:1;min-height:0/);assert.match(s,/class="near-shell near31-shell"/);});
test('tile layout CSS embedded locally to recover from CDN stylesheet failures',()=>{assert.match(s,/\.leaflet-tile\{visibility:hidden/);assert.match(s,/\.leaflet-tile-loaded\{visibility:inherit/);assert.match(s,/\.leaflet-pane,\.leaflet-tile/);});
test('Map invalidates after initial rendering and asynchronous layer changes',()=>{assert.match(s,/requestAnimationFrame\(\(\)=>map\?\.invalidateSize/);assert.match(s,/requestAnimationFrame\(\(\)=>requestAnimationFrame\(initMap\)/);assert.match(s,/setTimeout\(\(\)=>map\?\.invalidateSize/);});
test('all six current nearby categories retain the same map instead of cards',()=>{for(const x of ["['sights','볼거리']","['food','맛집']","['saved','♥ 찜한 곳']","['stories','비엔나 이야기']","['wc','화장실']","['plan','계획']"])assert.ok(s.includes(x),'Missing map category '+x);assert.match(s,/if\(state\.tab==='map'\)\{requestAnimationFrame/);assert.match(s,/id="map" role="application"/);});
