import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {reviewPhotoManifest,interpretLayer,summarizeGate} from '../lib/deploy-audit.mjs';
const manifest=JSON.parse(await readFile(new URL('../photo_manifest.json',import.meta.url),'utf8'));
test('all 48 photo records have a unique ID and provenance metadata',()=>{
 const r=reviewPhotoManifest(manifest);assert.equal(r.count,48);assert.equal(r.unique,48);assert.equal(r.complete,true,r.problems.join('; '));
});
test('photo manifest detects duplicates',()=>{const r=reviewPhotoManifest([...manifest.slice(0,47),manifest[0]]);assert.equal(r.complete,false);assert.ok(r.problems.some(x=>x.includes('duplicate')))});
test('photo audit cannot claim live image loading',()=>{const r=reviewPhotoManifest(manifest);assert.equal(r.liveNetworkVerified,undefined)});
test('sample WFS success is labelled sample, not citywide coverage',()=>{
 const r=interpretLayer({status:'ok',layer:'water',isSampleOnly:true,usableFeatures:12},'water');assert.equal(r.state,'pass');assert.match(r.message,/NOT proven/);
});
test('WFS zero usable records needs review',()=>assert.equal(interpretLayer({status:'warning',layer:'wc',isSampleOnly:true,usableFeatures:0},'wc').state,'warning'));
test('WFS mismatch is error',()=>assert.equal(interpretLayer({status:'ok',layer:'stops',isSampleOnly:true,usableFeatures:1},'wc').state,'error'));
test('release is never certified based only on green network checks',()=>assert.equal(summarizeGate({photos:{state:'pass'},wc:{state:'pass'}}).releaseCertified,false));
test('empty report does not become certified',()=>assert.equal(summarizeGate({}).releaseCertified,false));
test('API error blocks network checks',()=>assert.equal(summarizeGate({wc:{state:'error'},photos:{state:'pass'}}).overall,'blocked'));
