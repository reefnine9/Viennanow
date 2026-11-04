// Update the Netlify routing whitelist after reviewing places_16.json.
// NOTE: This does not change inline app.js PLACES values; those must be kept in sync.
import fs from 'node:fs';
const file=new URL('../places_16.json',import.meta.url),module=new URL('../lib/places16.mjs',import.meta.url);
const places=JSON.parse(fs.readFileSync(file,'utf8'));
if(!Array.isArray(places)||places.length!==16||new Set(places.map(p=>p.id)).size!==16)throw Error('Expected 16 unique sight IDs');
for(const p of places){if(!(Number.isFinite(p.lat)&&Number.isFinite(p.lon)))throw Error('Missing numeric coords '+p.id)}
fs.writeFileSync(module,'/* Synchronized from places_16.json for Netlify function bundling. Coordinates unverified. */\nexport const PLACES16 = '+JSON.stringify(places)+';\n');
console.log('Updated lib/places16.mjs from places_16.json. Verify same coordinates in app.js PLACES.');
