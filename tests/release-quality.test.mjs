import test from 'node:test';
import assert from 'node:assert/strict';
import {coverageOf,evaluateRelease} from '../lib/release-quality.mjs';
import {validateReview} from '../scripts/import_coordinate_review.mjs';
const places=[{id:'A01',de:'Stephansdom',lat:48.2085,lon:16.3731}];
test('coverage is unknown rather than falsely complete without service total',()=>{
 assert.equal(coverageOf({},30,6000).status,'unknown');
 assert.equal(coverageOf({},6000,6000).status,'limit-reached');
 assert.equal(coverageOf({numberMatched:90},30,6000).status,'partial');
 assert.equal(coverageOf({totalFeatures:'30'},30,6000).status,'service-count-complete');
});
test('release gate never marks sample checks alone production-ready',()=>{
 const mock=Object.fromEntries(['wc','water','stops'].map(k=>[k,{status:'ok',isSampleOnly:true,usableFeatures:10}]));
 assert.equal(evaluateRelease({apiChecks:mock}).status,'not-ready');
 assert.equal(evaluateRelease({apiChecks:mock,coordinateCount:16,routeChecked:true,deviceChecked:true,permissionsChecked:true}).status,'manual-review-required');
});
test('coordinate import accepts only reviewed, evidenced, plausible entrances',()=>{
 const csv='place_id,name_de,entrance_lat,entrance_lon,source_url,note,manual_review_status\nA01,Stephansdom,48.2085,16.3731,https://example.org/evidence,,MANUALLY_REVIEWED\n';
 assert.equal(validateReview(csv,places).allApproved,true);
 assert.equal(validateReview(csv.replace('https://','http://'),places).allApproved,false);
 assert.equal(validateReview(csv.replace('48.2085','49.2085'),places).allApproved,false);
 assert.equal(validateReview(csv.replace('MANUALLY_REVIEWED','PENDING'),places).allApproved,false);
});
test('CSV reader handles quoted commas and escaped quotes',()=>{
 const csv='place_id,name_de,entrance_lat,entrance_lon,source_url,note,manual_review_status\nA01,Stephansdom,48.2085,16.3731,https://example.org/a,"door, north ""left""",MANUALLY_REVIEWED\n';
 const r=validateReview(csv,places);assert.equal(r.accepted[0].note,'door, north "left"');
});
