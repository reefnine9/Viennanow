#!/usr/bin/env node
/** Offline preflight: checks repository structure, NOT internet connectivity. */
import {access,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const required=['netlify.toml','public/index.html','public/health.html','public/coordinate_review.html','netlify/functions/ogd.mjs','netlify/functions/diagnostics.mjs','lib/ogd-core.mjs','lib/release-quality.mjs','places_16.json','public/route_qa.html','netlify/functions/route.mjs','netlify/functions/route-status.mjs','lib/route-core.mjs','lib/places16.mjs','lib/edit-core.mjs','EDITOR_SPEC_KR.md','photo_manifest.json','lib/live-replan.mjs'];
let failures=[];
for(const rel of required){try{await access(join(root,rel));}catch{failures.push('Missing file: '+rel)}}
try{const arr=JSON.parse(await readFile(join(root,'places_16.json'),'utf8'));if(arr.length!==16)failures.push('Expected exactly 16 representative sights');if(arr.some(p=>!p.source||!p.options?.length))failures.push('Some place has missing source/options');}catch{failures.push('Invalid places_16.json')}
try{
 const places=JSON.parse(await readFile(join(root,'places_16.json'),'utf8'));
 const app=await readFile(join(root,'app.js'),'utf8');
 const mod=await readFile(join(root,'lib/places16.mjs'),'utf8');
 const appJson=app.match(/^const PLACES=(\[[^\n]+\]);/m);
 const serverJson=mod.match(/export const PLACES16 = (\[[^\n]+\]);/m);
 if(!appJson||!serverJson)failures.push('Could not compare app/server coordinates');
 else{
  const frontend=JSON.parse(appJson[1]),backend=JSON.parse(serverJson[1]);
  for(const p of places){const a=frontend.find(x=>x.id===p.id),b=backend.find(x=>x.id===p.id);if(!a||!b||a.lat!==p.lat||a.lon!==p.lon||b.lat!==p.lat||b.lon!==p.lon)failures.push('Coordinate sync mismatch: '+p.id);}
 }
}catch(e){failures.push('Place coordinate cross-check failed: '+String(e.message||e))}
const netlify=await readFile(join(root,'netlify.toml'),'utf8');
if(!netlify.includes('publish = "public"')||!netlify.includes('directory = "netlify/functions"'))failures.push('Netlify publish/functions paths mismatch');
console.log('ViennaNow Phase 18 OFFLINE preflight');
console.log(failures.length?'BLOCKED:\n- '+failures.join('\n- '):'PASS: expected project files and static configuration present');
console.log('NOTICE: This does not validate deployed Netlify, City of Vienna WFS, actual entrance positions, routes or operating hours.');
process.exitCode=failures.length?1:0;
