import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const s=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('nearby page is a map-first full-height flex view',()=>{assert.match(s,/\.main\.near-map-main/);assert.match(s,/\.near-mapframe\{flex:1;min-height:0/);assert.match(s,/class="near-shell"/)});
test('tile layout CSS embedded locally to recover from CDN stylesheet failures',()=>{assert.match(s,/\.leaflet-tile\{visibility:hidden/);assert.match(s,/\.leaflet-tile-loaded\{visibility:inherit/);assert.match(s,/\.leaflet-pane,\.leaflet-tile/)});
test('Map gets invalidated after rendering and window resizes',()=>{assert.match(s,/requestAnimationFrame\(\(\)=>map\?\.invalidateSize/);assert.match(s,/window\.addEventListener\('resize'/)});
test('all five nearby filters retain the map instead of replacing it with cards',()=>{for(const x of ["['map','지도']","['wc','화장실']","['rest','쉴곳']","['dining','주변맛집']","['sights','주변관광']"])assert.ok(s.includes(x)); assert.match(s,/if\(state\.tab==='map'\)\{requestAnimationFrame/)});
