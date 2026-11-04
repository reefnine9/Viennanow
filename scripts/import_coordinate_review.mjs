#!/usr/bin/env node
/** Inspect a manually exported CSV, NEVER auto-approve machine-generated GIS matches. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export function parseCsv(s){
 const rows=[];let row=[],v='',quoted=false;
 s=String(s||'').replace(/^\uFEFF/,'');
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(quoted){if(c==='"'&&s[i+1]==='"'){v+='"';i++}else if(c==='"')quoted=false;else v+=c;}
  else if(c==='"'&&v==='')quoted=true;
  else if(c===','){row.push(v);v='';}
  else if(c==='\n'){row.push(v.replace(/\r$/,''));rows.push(row);row=[];v='';}
  else v+=c;
 }
 if(quoted)throw Error('CSV quote not closed');
 if(v!==''||row.length){row.push(v.replace(/\r$/,''));rows.push(row)}
 return rows;
}
export function validateReview(csv,places){
 const rows=parseCsv(csv);
 const header=rows.shift()||[];
 const expected=['place_id','entrance_lat','entrance_lon','source_url','manual_review_status'];
 const missing=expected.filter(k=>!header.includes(k));if(missing.length)throw Error('Required CSV columns missing: '+missing.join(', '));
 const errors=[],accepted=[],unreviewed=[];
 const known=new Map(places.map(p=>[p.id,p]));const seen=new Set();
 for(let i=0;i<rows.length;i++){
  const r=Object.fromEntries(header.map((h,j)=>[h,rows[i][j]??'']));
  if(!rows[i].some(x=>String(x).trim()))continue;
  const id=r.place_id;
  if(!known.has(id)){errors.push(`row ${i+2}: unknown ID ${id}`);continue;}
  if(seen.has(id)){errors.push(`row ${i+2}: duplicate ID ${id}`);continue;}
  seen.add(id);
  if(r.manual_review_status!=='MANUALLY_REVIEWED'){unreviewed.push(id);continue;}
  const lat=Number(r.entrance_lat),lon=Number(r.entrance_lon);
  if(!String(r.entrance_lat).trim()||!String(r.entrance_lon).trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<48.10||lat>48.35||lon<16.15||lon>16.65){errors.push(`${id}: invalid Vienna coordinates`);continue;}
  let evidence;try{evidence=new URL(r.source_url)}catch{errors.push(`${id}: missing/invalid evidence URL`);continue;}
  if(evidence.protocol!=='https:' || !evidence.hostname.includes('.')){errors.push(`${id}: HTTPS evidence URL required`);continue;}
  const p=known.get(id);
  if(r.name_de && r.name_de!==p.de){errors.push(`${id}: German place name mismatch`);continue;}
  const distKm=Math.sqrt(((lat-p.lat)*111)**2+((lon-p.lon)*74)**2);
  if(distKm>2){errors.push(`${id}: >2 km away from original approximate position, review manually`);continue;}
  accepted.push({id,lat,lon,evidence:evidence.toString(),note:r.note||''});
 }
 for(const id of known.keys())if(!seen.has(id))unreviewed.push(id);
 return {accepted,errors,unreviewed,allApproved:accepted.length===places.length&&errors.length===0&&unreviewed.length===0};
}

async function main(){
 const path=process.argv[2];if(!path){console.error('Usage: node scripts/import_coordinate_review.mjs path/to/viennanow_coordinate_review.csv [--apply]');process.exitCode=2;return;}
 const base=new URL('../',import.meta.url);const places=JSON.parse(await readFile(new URL('places_16.json',base),'utf8'));
 const report=validateReview(await readFile(resolve(path),'utf8'),places);
 const output={generatedAt:new Date().toISOString(),total:places.length,approved:report.accepted.length,pending:report.unreviewed,errors:report.errors,allApproved:report.allApproved};
 await writeFile(new URL('coordinate_review_report.json',base),JSON.stringify(output,null,2));
 console.log(`Manually reviewed: ${report.accepted.length}/${places.length}, errors: ${report.errors.length}, pending: ${report.unreviewed.length}`);
 if(report.errors.length)console.error(report.errors.join('\n'));
 if(process.argv.includes('--apply')){
  if(!report.allApproved){console.error('REFUSED: all 16 approved coordinates are required before apply.');process.exitCode=1;return;}
  const m=new Map(report.accepted.map(p=>[p.id,p]));
  const result=places.map(p=>{const q=m.get(p.id);return {...p,lat:q.lat,lon:q.lon,entranceReview:{status:'manually-reviewed',evidence:q.evidence,note:q.note,checkedAt:output.generatedAt}}});
  await writeFile(new URL('places_16_reviewed.json',base),JSON.stringify(result,null,2));
  console.log('Created places_16_reviewed.json. App source is NOT overwritten; review before promoting.');
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
