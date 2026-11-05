import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync('public/photo_manifest.json','utf8'));
const data=JSON.parse(readFileSync('public/data/restaurants.json','utf8'));
const rows=data.restaurants||[],problems=[],warnings=[];
const validUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'}catch{return false}};
const unique=new Set();
for(const p of manifest){
 if(unique.has(p.placeId))problems.push('Duplicate sight ID '+p.placeId);unique.add(p.placeId);
 for(const k of ['placeId','title','source','creator','license','licenseUrl','url'])if(!p[k])problems.push(p.placeId+' missing '+k);
 if(!validUrl(p.url)||!validUrl(p.source)||!validUrl(p.licenseUrl))problems.push(p.placeId+' invalid image/source/license URL');
 if(!/^CC (BY|BY-SA|0)|^Public domain|^PD-/i.test(p.license||''))warnings.push(p.placeId+' license requires manual review: '+p.license);
}
if(manifest.length!==48)problems.push('Expected 48 sightseeing photo records, got '+manifest.length);
const reviewed=rows.filter(r=>r.media?.cover?.commercial_use_verified);
const reviewedComplete=reviewed.filter(r=>r.media?.cover?.url&&r.media?.cover?.source_page&&r.media?.cover?.license);
for(const r of reviewed)if(!r.media?.cover?.url||!r.media?.cover?.source_page||!r.media?.cover?.license)problems.push('Verified cover missing metadata: '+r.id);
for(const r of reviewed)if(!validUrl(r.media?.cover?.url)||!validUrl(r.media?.cover?.source_page))problems.push('Verified cover URL invalid: '+r.id);
if(rows.length!==82)problems.push('Restaurant count differs from release baseline (82): '+rows.length);
const report={date:'2026-11-05',sights:manifest.length,restaurants:rows.length,sightsWithCredit:manifest.filter(p=>p.source&&p.creator&&p.license&&p.licenseUrl).length,restaurantCoversReviewed:reviewed.length,restaurantCoversWithCompleteMetadata:reviewedComplete.length,restaurantCoversNotReviewed:rows.length-reviewed.length,problems,warnings,scope:'Metadata completeness only. License pages, authenticity, expiry, and photo HTTP availability are NOT independently verified.'};
mkdirSync('artifacts/phase14',{recursive:true});
writeFileSync('artifacts/phase14/media-audit.json',JSON.stringify(report,null,2));
console.log('Phase 14 metadata audit: '+report.sightsWithCredit+'/'+report.sights+' sight credits, '+reviewedComplete.length+'/'+rows.length+' restaurant covers reviewed; '+problems.length+' problems, '+warnings.length+' warnings');
if(problems.length){problems.slice(0,20).forEach(x=>console.error('FAIL '+x));process.exitCode=1;}
