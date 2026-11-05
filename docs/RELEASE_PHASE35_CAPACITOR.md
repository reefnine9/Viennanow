# ViennaNow Phase 35 — Capacitor native packaging (scaffold)

**Status:** source configuration committed; iOS/Android projects, binaries, icons and device testing NOT completed.

## Current setup
- Capacitor 7 dependencies and scripts are declared in `package.json`.
- `capacitor.config.ts` bundles `public/` as app content. It intentionally does not set a remote `server.url`.
- `app.viennanow.travel` is a **provisional app identifier**, not a registered identifier. Confirm ownership and final naming before creating store records.
- Cloudflare Pages Functions under `/api/*` are **not** included in Capacitor's static bundle. Existing relative API calls will not work natively until routed to a verified HTTPS production origin. Do not submit a native build until this is resolved.
- Third-party images and maps also require a real-device network test, and location permissions must be configured per native platform.

## Next build steps (on a compatible machine or CI)
1. Choose the production HTTPS hostname and configure an explicit allowlisted API base URL for native builds; test CORS, error handling and privacy impact.
2. Run `npm install`, `npm test`, `npm run check`, `npm run check:stores`.
3. Run `npm run native:add:android` and `npm run native:add:ios`, then `npm run native:sync`.
4. Review generated Android manifest and iOS Info.plist for location permission descriptions and ATS/network rules; do not grant unnecessary permissions.
5. Export the approved SVG icon as 1024px store artwork, Android adaptive icon and iOS app icon PNG; validate appearance on both systems.
6. Build and sign with Android Studio/Gradle and Xcode or trusted CI, test on real devices, then prepare the store submissions.
7. Complete legal notices, media rights, privacy disclosures and app-review readiness.

## Operational warning
This commit **does not** create signed AAB/IPA packages. Capacitor 7 requires a compatible Node, Android and Xcode toolchain. Avoid claiming store readiness until the real builds and tests pass.
