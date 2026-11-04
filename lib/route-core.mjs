/** Explicit walking-only ORS adapter. Input coordinates are UNVERIFIED venue points. */
export const ORS_ENDPOINT = 'https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson';
export const ORS_PROVIDER = 'HeiGIT openrouteservice / OpenStreetMap';
export const LOCATION_STATUS = 'approximate-venue-coordinates';
export const isVienna = (lat,lon) => Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=48.10&&lat<=48.35&&lon>=16.15&&lon<=16.65;
export function validatePair(from,to) {
  if(!from || !to || from.id===to.id) throw Error('Two different listed sights required');
  if(!isVienna(from.lat,from.lon)||!isVienna(to.lat,to.lon))throw Error('Sight coordinates out of Vienna bounds');
  return [[from.lon,from.lat],[to.lon,to.lat]];
}
export function routeRequest(from,to) {
  return {coordinates:validatePair(from,to),instructions:false,geometry_simplify:true};
}
export function parseWalkingRoute(payload) {
  const feature = payload?.features?.[0];
  const summary = feature?.properties?.summary ?? payload?.routes?.[0]?.summary;
  const seconds = Number(summary?.duration), meters=Number(summary?.distance);
  if(!Number.isFinite(seconds)||!Number.isFinite(meters)||seconds<=0||meters<=0||seconds>24*60*60||meters>100000)throw Error('Routing provider returned invalid summary');
  // The service reports network walking estimates, not an actual departure-time timetable.
  const durationMinutes = Math.max(1,Math.ceil(seconds/60));
  return {durationMinutes,distanceMeters:Math.round(meters),mode:'walking',source:'ors-walking',provider:ORS_PROVIDER,locationStatus:LOCATION_STATUS,transit:false,liveTraffic:false};
}
