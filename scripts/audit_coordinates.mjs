/**
 * Online audit assistant. Writes SUGGESTED official OGD candidates, never overwrites seeds.
 * Run from Mac after deployment testing: node scripts/audit_coordinates.mjs
 * Every candidate must be reviewed manually. This does not establish precise entrances.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {transformGeoJSON,wfsUrl,metersBetween} from '../lib/ogd-core.mjs';
const input=JSON.parse(await readFile(new URL('../places_16.json',import.meta.url),'utf8'));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\b(wien|vienna|der|die|das|museum|schloss|stadt|kirche)\b/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>new Set(normalize(s).split(' ').filter(x=>x.length>=3));
function matchScore(name,candidate){
 let n=normalize(name),c=normalize(candidate);if(n&&n===c)return 1;
 if(n&&c&&(c.includes(n)||n.includes(c)))return .78;
 const a=tokens(name),b=tokens(candidate);const intersection=[...a].filter(x=>b.has(x)).length;
 return a.size&&b.size?2*intersection/(a.size+b.size):0;
}
const csvEsc=x=>'"'+String(x??'').replaceAll('"','""')+'"';
let geo;
try{const ctl=AbortSignal.timeout(16000);const response=await fetch(wfsUrl('sights',6000),{signal:ctl});if(!response.ok)throw Error('HTTP '+response.status);geo=await response.json()}
catch(e){console.error('Official tourism WFS unavailable:',e.message);process.exitCode=2;}
if(geo){
 let normalized=transformGeoJSON(geo,'sights',{limit:6000});
 let rows=[['place_id','name_de','current_lat_unverified','current_lon_unverified','ogd_candidate','candidate_lat','candidate_lon','candidate_distance_m','name_similarity_0to1','human_review_status']];
 for(const p of input){
  const candidates=normalized.points.map(x=>({p:x,score:matchScore(p.de,x.name),meters:Math.round(metersBetween({lat:p.lat,lon:p.lon},x))}))
      .filter(x=>x.score>=.3&&x.meters<3000).sort((a,b)=>(b.score-.00008*b.meters)-(a.score-.00008*a.meters)).slice(0,3);
  if(!candidates.length){rows.push([p.id,p.de,p.lat,p.lon,'','','','','','NO_MATCH_NEEDS_MANUAL_REVIEW']);continue;}
  for(const item of candidates)rows.push([p.id,p.de,p.lat,p.lon,item.p.name,item.p.lat,item.p.lon,item.meters,item.score.toFixed(3),'CANDIDATE_NEEDS_MANUAL_REVIEW']);
 }
 let csv=rows.map(r=>r.map(csvEsc).join(',')).join('\n')+'\n';
 await writeFile(new URL('../coordinate_candidates.csv',import.meta.url),csv,'utf8');
 console.log('WFS candidates downloaded:',normalized.stats.received,'candidate CSV written. No coordinates were automatically marked verified.');
}
