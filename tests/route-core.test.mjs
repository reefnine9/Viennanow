import test from 'node:test';
import assert from 'node:assert/strict';
import {PLACES16} from '../lib/places16.mjs';
import {ORS_ENDPOINT,routeRequest,parseWalkingRoute,validatePair} from '../lib/route-core.mjs';
test('new HeiGIT routing endpoint (not deprecated hostname)',()=>assert.equal(ORS_ENDPOINT,'https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson'));
test('walking requests use [longitude,latitude] for two listed locations',()=>{
 let x=routeRequest(PLACES16[0],PLACES16[1]); assert.deepEqual(x.coordinates[0],[PLACES16[0].lon,PLACES16[0].lat]);assert.equal(x.instructions,false);
});
test('unknown or identical/out of bounds places rejected',()=>{
 assert.throws(()=>validatePair(PLACES16[0],PLACES16[0]));assert.throws(()=>validatePair({...PLACES16[0],lat:0},PLACES16[1]));
});
test('parses geojson walking duration and rejects invalid data',()=>{
 const result=parseWalkingRoute({features:[{properties:{summary:{duration:1240,distance:1897.4}}}]});
 assert.equal(result.durationMinutes,21);assert.equal(result.distanceMeters,1897);assert.equal(result.transit,false);assert.equal(result.locationStatus,'approximate-venue-coordinates');
 assert.throws(()=>parseWalkingRoute({features:[]}));
});
