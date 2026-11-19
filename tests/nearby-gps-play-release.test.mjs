import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/google-play-aab.yml', import.meta.url), 'utf8');

function block(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end));
}

test('Nearby location follows live fixes, keeps tracking while browsing, and recenters on demand', () => {
  const centers = [];
  const dots = [];
  const cleared = [];
  const notices = [];
  const watches = [];
  const context = {
    state: { tab: 'map', contentLang: 'en' },
    map: { panTo: point => centers.push(Array.from(point)) },
    document: { hidden: false, querySelector: () => null, addEventListener() {} },
    window: { addEventListener() {} },
    navigator: { geolocation: {
      watchPosition(success, error) { watches.push({ success, error }); return watches.length - 1; },
      clearWatch(id) { cleared.push(id); }
    } },
    toast: message => notices.push(message),
    L: {
      circleMarker(point, options) {
        assert.equal(options.fillColor, '#1684ed');
        dots.push(Array.from(point));
        return { addTo() { return this; }, setLatLng(next) { dots.push(Array.from(next)); }, remove() {} };
      }
    }
  };
  vm.createContext(context);
  vm.runInContext([
    block('let vnMapLocation=', 'let fetchId='),
    block('let vnGpsDot=', 'function initMap()'),
    block('function vnSuspendGps()', 'async function apiWalkingLeg(')
  ].join('\n'), context);
  const send = (watch, latitude, longitude) => watch.success({ coords: { latitude, longitude } });

  context.useGps();
  send(watches[0], 48.20, 16.37);
  send(watches[0], 48.21, 16.37);
  assert.deepEqual(centers, [[48.20, 16.37], [48.21, 16.37]]);
  context.vnBrowseMap();
  send(watches[0], 48.22, 16.37);
  assert.equal(centers.length, 2);
  assert.deepEqual(dots.at(-1), [48.22, 16.37]);

  context.useGps();
  assert.deepEqual(centers.at(-1), [48.22, 16.37]);
  assert.equal(watches.length, 1);
  context.vnSuspendGps();
  assert.deepEqual(cleared, [0]);
  send(watches[0], 48.23, 16.37);
  assert.deepEqual(dots.at(-1), [48.22, 16.37]);
  context.vnStartGps();
  watches[1].error({ code: 1 });
  assert.deepEqual(cleared, [0, 1]);
  assert.equal(notices.length, 1);
  assert.equal(vm.runInContext('vnMapLocation', context), null);
});

test('Nearby basemap uses world tiles away from Vienna and falls back on local tile errors', () => {
  const timers = new Map();
  let nextTimer = 0;
  const layer = {
    options: { referrerPolicy: 'strict-origin-when-cross-origin' },
    on() {},
    addTo() { return this; },
    getTileUrl: ({ z, x, y }) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    createTile: ({ x }) => ({ worldTile: x })
  };
  const context = {
    L: {
      tileLayer: () => layer,
      latLngBounds: () => ({ contains: value => value === 384 }),
      point: (x, y) => ({ x, y }),
      CRS: { EPSG3857: { pointToLatLng: point => point.x } }
    },
    document: { createElement: () => ({}) },
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(block('function vnAddBasemap(', 'let vnGpsDot='), context);
  context.vnAddBasemap({});
  const done = [];
  assert.equal(layer.createTile({ z: 13, x: 2, y: 2 }).worldTile, 2);
  assert.equal(layer.createTile({ z: 8, x: 1, y: 2 }).worldTile, 1);
  const coord = { z: 13, x: 1, y: 2 };
  const local = layer.createTile(coord, error => done.push(error));
  assert.match(local.src, /basemap\/bmaphidpi/);
  local.onerror(new Error('Map server failed'));
  assert.equal(local.src, 'https://tile.openstreetmap.org/13/1/2.png');
  local.onload();
  assert.deepEqual(done, [null]);
  const slow = layer.createTile(coord, error => done.push(error));
  timers.get(nextTimer)();
  assert.equal(slow.src, local.src);
});

test('Signed Google Play AAB workflow supports a new versionCode', () => {
  assert.match(workflow, /version_code:/);
  const defaultCode = workflow.match(/version_code:\n(?:[^\n]+\n)*? *default: '([1-9][0-9]*)'/)?.[1];
  const pushCode = workflow.match(/inputs\.version_code \|\| '([1-9][0-9]*)'/)?.[1];
  assert.ok(defaultCode, 'Expected a positive default version code');
  assert.equal(pushCode, defaultCode);
  assert.match(workflow, /PLAY_VERSION_CODE/);
  assert.match(workflow, /bundleRelease/);
});
