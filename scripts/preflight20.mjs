#!/usr/bin/env node
/** Offline configuration/metadata audit. NEVER claims the live site is working. */
import {readFile,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import {join,dirname} from 'node:path';
import {reviewPhotoManifest} from '../lib/deploy-audit.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=async p=>await readFile(join(root,p),'utf8');
const required=['netlify.toml','public/index.html','public/deploy-check.html','public/photo_manifest.json','public/content_48.json','public/experiences_18.json','public/health.html','public/route_qa.html','netlify/functions/diagnostics.mjs','netlify/functions/ogd.mjs','netlify/functions/route.mjs','netlify/functions/route-status.mjs','lib/ogd-core.mjs','lib/route-core.mjs','lib/deploy-audit.mjs','PHOTO_LICENSES_19.md'];
const checks={};
for(const path of required){try{const s=await stat(join(root,path));checks['file:'+path]={state:s.size?'pass':'error',note:s.size+' bytes'}}catch{checks['file:'+path]={state:'error',note:'file missing'}}}
let manifest,places,experiences;try{manifest=JSON.parse(await read('photo_manifest.json'));const report=reviewPhotoManifest(manifest);checks.photoMetadata={state:report.complete?'pass':'error',count:report.count,issues:report.problems}}catch(e){checks.photoMetadata={state:'error',note:String(e)}}
try{places=JSON.parse(await read('catalog_48.json'));checks.places48={state:places.length===48?'pass':'error',count:places.length}}catch(e){checks.places48={state:'error',note:String(e)}}
try{experiences=JSON.parse(await read('experiences_18.json'));checks.experiences18={state:experiences.length===18?'pass':'error',count:experiences.length}}catch(e){checks.experiences18={state:'error',note:String(e)}}
try{const c=await read('netlify.toml');checks.netlifyConfig={state:c.includes('publish = "public"')&&c.includes('directory = "netlify/functions"')?'pass':'error'}}catch{checks.netlifyConfig={state:'error'}}
const forbidden=['.env','.env.local','public/.env','public/ORS_API_KEY'];for(const p of forbidden){try{await stat(join(root,p));checks['secret:'+p]={state:'error',note:'Potential secret file must not be in deploy package'}}catch{checks['secret:'+p]={state:'pass'}}}
let route=await read('lib/route-core.mjs');checks.routingEndpoint={state:route.includes('https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson')?'pass':'error',note:'HeiGIT routing endpoint checked as source code (not a live request)'};
const failures=Object.entries(checks).filter(([k,v])=>v.state==='error').map(([k])=>k);
const report={phase:20,mode:'offline-file-and-metadata-only',checkedAt:new Date().toISOString(),passed:Object.values(checks).filter(c=>c.state==='pass').length,failed:failures.length,failures,checks,releaseCertified:false,liveSiteValidated:false,issuesRequiringLiveCheck:['Deployed HTTPS domain','Live WFS sample and coverage','Live 48 photo URLs','Map library and tile rendering','ORS route response with optional API key','16 sight entrance coordinates','Real mobile devices','Privacy, licensing and per-date opening hours']};
await writeFile(join(root,'PHASE20_OFFLINE_AUDIT.json'),JSON.stringify(report,null,2));
console.log(`Phase 20 local preflight: ${report.passed} passed, ${report.failed} failed`);
console.log('Public release NOT certified; online and manual checks pending.');
if(failures.length)console.log('Failures: '+failures.join(', '));
process.exitCode=failures.length?1:0;
