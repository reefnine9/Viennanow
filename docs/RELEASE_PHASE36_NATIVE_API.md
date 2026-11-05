# Phase 36 — native Cloudflare API staging

The normal Cloudflare website continues to serve `public/` and uses relative `/api/*` routes. Native builds now use a **separate copy** `dist-native/` and rewrite three first-party API paths in the copied `index.html` to an explicitly supplied HTTPS production origin. The source `public/index.html` is not modified by staging.

## Usage
```sh
npm install
npm test
npm run check
VIENNANOW_API_ORIGIN=https://YOUR-REAL-PRODUCTION-DOMAIN npm run native:sync
```

On Windows PowerShell, use `$env:VIENNANOW_API_ORIGIN="https://YOUR-REAL-PRODUCTION-DOMAIN"` before `npm run native:sync`.

The environment variable is **required**; no fake production hostname is embedded. `capacitor.config.ts` points to `dist-native`. Do not run `cap sync` directly with stale assets.

## Outstanding release blockers
- Cloudflare Pages Functions may reject cross-origin requests from iOS `capacitor://localhost` and Android `http://localhost`. Inspect and implement narrow, safe CORS handling (including OPTIONS if needed) before treating route, diagnostics and OGD requests as operational.
- The OGD proxy currently checks `location.protocol` and `location.hostname` to determine availability; confirm this branch on both platforms.
- Third-party Overpass endpoints, Leaflet tiles, remote photographs and GPS permissions must be tested on real devices.
- Static native bundles do not contain Pages Functions. The HTTPS API origin must be live and verified.
- iOS/Android project directories and signed binaries have not been generated in GitHub by this phase.
- `dist-native/` is generated output and should not be committed. Add to ignore rules when setting up CI.
