/** City Vienna WFS proxy. Public points are not live opening/availability data. */
import { SOURCES, transformGeoJSON, wfsUrl } from '../../lib/ogd-core.mjs';

const LIMIT = 6000;
const CACHE_SECONDS = 6 * 60 * 60;
const MAX_RESPONSE_BYTES = 12 * 1024 * 1024;
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: {'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers}
});
const ALLOWED = new Set(['wc', 'water', 'stops']);
export async function onRequestGet({ request, waitUntil }) {
  const layer = new URL(request.url).searchParams.get('layer') || '';
  if (!ALLOWED.has(layer) || !SOURCES[layer]) return json({status:'error',message:'Allowed layers: wc, water, stops'},400,{'Cache-Control':'no-store'});
  // Cloudflare edge cache key is layer-specific and excludes arbitrary user query params.
  const cacheKey = new Request(new URL(`/api/ogd?layer=${layer}`, request.url).toString(), {method:'GET'});
  const cache = globalThis.caches?.default;
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const upstream = await fetch(wfsUrl(layer, LIMIT), {headers:{Accept:'application/json'}, signal:controller.signal});
    if (!upstream.ok) throw Error(`WFS HTTP ${upstream.status}`);
    const contentLength = Number(upstream.headers.get('content-length'));
    if (contentLength > MAX_RESPONSE_BYTES) throw Error('WFS response exceeds size limit');
    const raw = await upstream.text();
    if (raw.length > MAX_RESPONSE_BYTES) throw Error('WFS response exceeds size limit');
    let source;
    try {source = JSON.parse(raw)} catch {throw Error('WFS returned non-JSON response')}
    const data = transformGeoJSON(source, layer, {limit:LIMIT});
    data.delivery = 'cloudflare-pages-function';
    data.serviceNote = '공식 GIS 시설 목록이며 실제 개방·가동 상태가 아닙니다. coverage를 확인하세요.';
    const response = json(data, 200, {'Cache-Control':`public, max-age=300, s-maxage=${CACHE_SECONDS}`});
    if (cache && waitUntil) waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    return json({status:'error',layer,message:String(error?.name === 'AbortError' ? 'City WFS request timed out' : error?.message || error),retrySuggested:true},502,{'Cache-Control':'no-store'});
  } finally {clearTimeout(timer)}
}
export const onRequestPost = () => json({status:'error',message:'GET only'},405,{'Allow':'GET','Cache-Control':'no-store'});
