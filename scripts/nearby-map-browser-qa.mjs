import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const leaflet = new URL('../node_modules/leaflet/dist/', import.meta.url);
const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN49uIpAAVrArTKopPBAAAAAElFTkSuQmCC','base64');
const base = process.env.VIENNANOW_TEST_URL || 'http://127.0.0.1:8765';
(async () => {
 const browser = await chromium.launch({ headless: true });
 try {
  const ctx = await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:3,isMobile:true,hasTouch:true, permissions:['geolocation'],geolocation:{latitude:48.2085,longitude:16.3731,accuracy:15}});
  const page = await ctx.newPage();
  const errors=[];
  let viennaTiles=0, worldTiles=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u = route.request().url();
   if(u.startsWith(base+'/'))return route.continue();
   if(u.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.')){
    const file=u.endsWith('.js')?'leaflet.js':'leaflet.css';
    return route.fulfill({status:200,contentType:file.endsWith('.js')?'text/javascript':'text/css',body:fs.readFileSync(new URL(file,leaflet)),headers:{'access-control-allow-origin':'*'}});
   }
   if(u.startsWith('https://mapsneu.wien.gv.at/basemap/')){viennaTiles++;return route.abort();}
   if(u.startsWith('https://tile.openstreetmap.org/')){worldTiles++;return route.fulfill({status:200,contentType:'image/png',body:tile});}
   return route.abort();
  });
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#bottom button.tab[data-value="map"]').click();
  await page.waitForFunction(()=>map && !!document.querySelector('#map .leaflet-tile-loaded'));
  assert.ok(viennaTiles>0 && worldTiles>0);
  await page.locator('button[data-act="use-gps"]').click();
  await page.waitForFunction(()=>vnGpsDot && Math.abs(vnGpsDot.getLatLng().lat-48.2085)<.00001);
  await ctx.setGeolocation({latitude:48.22,longitude:16.4,accuracy:18});
  await page.waitForFunction(()=>Math.abs(map.getCenter().lat-48.22)<.0003);
  assert.equal(await page.evaluate(()=>map.getZoom()),13);

  const canvas = await page.locator('#map').boundingBox();
  await page.mouse.move(canvas.x+canvas.width/2,canvas.y+canvas.height/2);
  await page.mouse.down();
  await page.mouse.move(canvas.x+canvas.width/2+60,canvas.y+canvas.height/2+36,{steps:5});
  await page.mouse.up();
  await page.waitForFunction(()=>!vnGpsFollowing);
  await page.waitForTimeout(650);
  const browsedCenter = await page.evaluate(()=>map.getCenter());
  await ctx.setGeolocation({latitude:48.228,longitude:16.41,accuracy:16});
  await page.waitForFunction(()=>Math.abs(vnGpsDot.getLatLng().lat-48.228)<.00001);
  assert.deepEqual(await page.evaluate(()=>map.getCenter()),browsedCenter);

  await page.locator('#near-search-input').fill('Stephansdom');
  await page.locator('#near-search-input').press('Enter');
  await page.waitForFunction(()=>vnSearchLayer.getLayers().length===1 && map.getZoom()>=16);
  const searchedCenter = await page.evaluate(()=>map.getCenter());
  await ctx.setGeolocation({latitude:48.232,longitude:16.42,accuracy:16});
  await page.waitForFunction(()=>Math.abs(vnGpsDot.getLatLng().lat-48.232)<.00001);
  assert.deepEqual(await page.evaluate(()=>map.getCenter()),searchedCenter);
  await page.locator('[data-act="section-near"][data-value="stories"]').click();
  await page.waitForFunction(()=>JSON.parse(vnNearbyViewKey)[0]==='stories');
  assert.deepEqual(await page.evaluate(()=>map.getCenter()),searchedCenter);
  assert.equal(await page.evaluate(()=>vnSearchLayer.getLayers().length),1);
  const zoom = await page.evaluate(()=>map.getZoom());
  await ctx.setGeolocation({latitude:48.85,longitude:2.35,accuracy:20});
  await page.waitForFunction(()=>Math.abs(vnGpsDot.getLatLng().lat-48.85)<.00001);
  const priorVienna=viennaTiles, priorWorld=worldTiles;
  await page.locator('button[data-act="use-gps"]').click();
  await page.waitForFunction(()=>Math.abs(map.getCenter().lng-2.35)<.0003 && !!document.querySelector('#map .leaflet-tile-loaded'));
  await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>map.getZoom()),zoom);
  assert.equal(viennaTiles,priorVienna);
  assert.ok(worldTiles>priorWorld);
  await page.locator('button[data-act="reset-anchor"]').click();
  assert.equal(await page.evaluate(()=>vnGpsWatch),null);
  assert.equal(await page.evaluate(()=>vnGpsDot),null);
  assert.deepEqual(errors,[]);
  console.log('Mobile viewport: tile failure fallback, live fixes, drag, search, category switching, worldwide recenter, zoom and reset passed.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
