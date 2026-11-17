import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const workflow = fs.readFileSync(new URL('../.github/workflows/google-play-aab.yml', import.meta.url), 'utf8');

test('Nearby GPS keeps user-selected zoom and renders a blue position dot', () => {
  const gps = source.slice(source.indexOf('function useGps(){'), source.indexOf('async function apiWalkingLeg('));
  const focus = source.slice(source.indexOf('function vnGpsFocus('), source.indexOf('function initMap(){'));
  const overlay = source.slice(source.indexOf('function vnGpsOverlay('), source.indexOf('function vnGpsFocus('));
  assert.match(gps, /vnGpsFocus\(loc\)/);
  assert.doesNotMatch(gps.replace(/\/\/[^\n]*/g, ''), /\brender\(\)/);
  assert.match(focus, /map\.panTo\(\[loc\.lat,loc\.lon\]/);
  assert.doesNotMatch(focus, /setView|fitBounds|flyTo/);
  assert.match(overlay, /L\.circleMarker/);
  assert.match(overlay, /#1684ed/);
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
