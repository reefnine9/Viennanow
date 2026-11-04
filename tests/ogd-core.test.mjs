import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coordinate,transformGeoJSON,nearest,wfsUrl,metersBetween} from '../lib/ogd-core.mjs';
const mock=JSON.parse(readFileSync(new URL('../fixtures/wfs_mock.json',import.meta.url)));

test('WFS coordinate normalization handles lon/lat and lat/lon, rejects out-of-city',()=>{
  assert.equal(coordinate([16.3738,48.2085]).axis,'longitude-latitude');
  assert.equal(coordinate([48.2088,16.3741]).axis,'latitude-longitude-swapped');
  assert.equal(coordinate([7,54]),null);
});
test('WFS GeoJSON creates only valid nearby points with documented source',()=>{
  const o=transformGeoJSON(mock,'wc',{limit:6000});
  assert.equal(o.stats.received,5);
  assert.equal(o.stats.accepted,3);
  assert.equal(o.stats.notPoint,1);
  assert.equal(o.stats.invalidCoordinates,1);
  assert.equal(o.stats.swappedAxes,1);
  assert.equal(o.stats.projected,1);
  assert.equal(o.liveAvailability,false);
  assert.equal(nearest(o.points,{lat:48.2085,lon:16.3731},{max:3,radius:2000}).length>=2,true);
});
test('drinking water filtering never treats misting facility as potable',()=>{
  const j={type:'FeatureCollection',features:[
    {id:'yes',geometry:{type:'Point',coordinates:[16.37,48.20]},properties:{TYP_NUM:4}},
    {id:'mister',geometry:{type:'Point',coordinates:[16.371,48.201]},properties:{TYP_NUM:1}},
    {id:'unknown',geometry:{type:'Point',coordinates:[16.372,48.202]},properties:{}}
  ]};
  const o=transformGeoJSON(j,'water');assert.equal(o.points.length,1);assert.equal(o.stats.filteredNonDrinking,2);
});
test('safe layer allowlist and distance estimate',()=>{
  assert.throws(()=>wfsUrl('https://evil.example'));
  assert.match(wfsUrl('wc'),/WCANLAGE2OGD/);
  assert.ok(metersBetween({lat:48.2,lon:16.37},{lat:48.21,lon:16.37})>1000);
});
