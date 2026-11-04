import {coverageOf} from './release-quality.mjs';
/** ViennaNow public-data parsing. Data from city WFS is NOT live open/closed state. */
export const SOURCES = Object.freeze({
  wc: {typeName:'ogdwien:WCANLAGE2OGD',label:'공공화장실',icon:'🚻'},
  water: {typeName:'ogdwien:TRINKBRUNNENOGD',label:'음용 식수대',icon:'💧'},
  stops: {typeName:'ogdwien:HALTESTELLEWLOGD',label:'대중교통 정류장',icon:'🚆'},
  sights: {typeName:'ogdwien:SEHENSWUERDIGOGD',label:'공공 관광명소 좌표',icon:'🏛️'}
});
const CITY={minLat:48.10,maxLat:48.35,minLon:16.15,maxLon:16.65};
const inVienna=(lat,lon)=>Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=CITY.minLat&&lat<=CITY.maxLat&&lon>=CITY.minLon&&lon<=CITY.maxLon;
export function coordinate(pair){
  if(!Array.isArray(pair)||pair.length<2)return null;
  const [a,b]=pair.map(Number);
  if(inVienna(b,a))return {lat:b,lon:a,axis:'longitude-latitude'};
  if(inVienna(a,b))return {lat:a,lon:b,axis:'latitude-longitude-swapped'};
  // Web Mercator (EPSG:3857), should not appear with requested EPSG:4326.
  if(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)>100000&&Math.abs(b)>100000){
    let lon=a/20037508.34*180;
    let lat=(2*Math.atan(Math.exp(b/6378137))-Math.PI/2)*180/Math.PI;
    if(inVienna(lat,lon))return {lat,lon,axis:'EPSG:3857-transformed'};
  }
  return null;
}
export function pointForGeometry(geo){
  if(!geo)return null;
  if(geo.type==='Point')return coordinate(geo.coordinates);
  if(geo.type==='MultiPoint'&&Array.isArray(geo.coordinates)){
    for(const entry of geo.coordinates){const item=coordinate(entry);if(item)return item;}
  }
  return null;
}
function get(props,names){
  const entries=Object.entries(props||{});
  for(const key of names){const got=entries.find(([k])=>k.toLowerCase()===key.toLowerCase());if(got&&got[1]!=null&&String(got[1]).trim()!=='')return got[1];}
  return null;
}
export function transformGeoJSON(input,kind,{limit=6000}={}){
  if(!SOURCES[kind])throw Error('Unsupported data layer');
  if(!input||!Array.isArray(input.features))throw Error('GeoJSON features not present');
  const unique=new Set(),points=[];
  const stats={received:input.features.length,accepted:0,invalidCoordinates:0,filteredNonDrinking:0,duplicate:0,swappedAxes:0,projected:0,notPoint:0};
  for(const [idx,f] of input.features.entries()){
    const props=f?.properties||{};
    // According to City of Vienna dataset metadata, TYP_NUM=4 is the known drinking-fountain category.
    // Unknown types are deliberately excluded, rather than asserting drinkability.
    if(kind==='water'&&String(get(props,['TYP_NUM','typ_num'])??'')!=='4'){
      stats.filteredNonDrinking++;continue;
    }
    const geo=f?.geometry;
    if(!geo||!['Point','MultiPoint'].includes(geo.type)){stats.notPoint++;continue;}
    const position=pointForGeometry(geo);
    if(!position){stats.invalidCoordinates++;continue;}
    if(position.axis==='latitude-longitude-swapped')stats.swappedAxes++;
    if(position.axis==='EPSG:3857-transformed')stats.projected++;
    let id=String(f.id??get(props,['OBJECTID','FID','WC_ID','ID','HALTESTELLEN_ID'])??idx);
    let key=`${id}|${position.lat.toFixed(5)}|${position.lon.toFixed(5)}`;
    if(unique.has(key)){stats.duplicate++;continue;}
    unique.add(key);
    let label=get(props,kind==='stops'?['NAME','HALTESTELLE','HALTESTELLENNAME','BEZEICHNUNG']:['NAME','ADRESSE','STRASSE','STANDORT','BEZEICHNUNG']);
    let name=String(label||SOURCES[kind].label).slice(0,110);
    let details=kind==='wc'?String(get(props,['Oeffnungszeit','OEFFNUNGSZEIT','Einschraenkungen'])||'운영시간 미확인').slice(0,160):
      kind==='water'?'음용 가능 유형 코드 4 · 현장/계절 상태 미확인':'실시간 출발정보 별도 확인';
    points.push({id,name,lat:position.lat,lon:position.lon,details,axis:position.axis});
  }
  stats.accepted=points.length;
  const coverage=coverageOf(input,input.features.length,limit);
  return {status:'ok',layer:kind,source:'Stadt Wien OGD WFS',points,stats,partial:['partial','limit-reached'].includes(coverage.status),coverage,updatedAt:new Date().toISOString(),liveAvailability:false};
}
export function metersBetween(a,b){
  if(!a||!b)return Infinity;
  let r=Math.PI/180,lat=(b.lat-a.lat)*r,lon=(b.lon-a.lon)*r;
  let x=Math.sin(lat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(lon/2)**2;
  return 6371000*2*Math.asin(Math.min(1,Math.sqrt(x)));
}
export function nearest(points,anchor,{max=8,radius=3000}={}){
 return points.map(p=>({...p,meters:Math.round(metersBetween(p,anchor))})).filter(p=>p.meters<=radius).sort((a,b)=>a.meters-b.meters).slice(0,max);
}
export function wfsUrl(kind,limit=6000){
 if(!SOURCES[kind])throw Error('Unsupported layer');
 const p=new URLSearchParams({service:'WFS',request:'GetFeature',version:'1.1.0',typeName:SOURCES[kind].typeName,srsName:'EPSG:4326',outputFormat:'json',maxFeatures:String(Math.min(6000,Math.max(1,limit)))});
 return 'https://data.wien.gv.at/daten/geo?'+p.toString();
}
