# Phase 33 — Web, iOS App Store and Google Play release preparation

Status: **preparation only; no store packages built or submitted**.

## Web / PWA
- Cloudflare Pages must publish the `public/` directory over HTTPS.
- `public/manifest.webmanifest` is linked from `public/index.html` and reuses the existing V Now SVG artwork.
- Before declaring the PWA production-ready, create and review **192×192 and 512×512 PNG icons** (plus a 180×180 Apple touch icon), check icon cropping, and verify install prompts on actual devices. SVG-only manifest support is not uniform.
- A service worker/offline experience has **not** been introduced in this phase. Do not advertise offline maps or offline navigation.
- Current index meta is `noindex,nofollow`: review before public search discovery.
- Test GPS permission, map tiles, restaurant and sight images, route API, bookmarks, plan persistence, screen readers, safe-area insets and language switching on real devices.

## iPhone App Store
- Choose a maintained native shell or app architecture (e.g. Capacitor) with native value beyond simply displaying a website; **App Store acceptance is not guaranteed for a basic web wrapper**.
- Requires Apple Developer Program enrollment, an Apple-compatible signing/build workflow (typically Xcode/macOS or supported cloud CI), bundle identifier, distribution certificate, privacy disclosures, app icon assets and screenshots.
- Validate Apple App Review guidelines, especially minimum functionality, web content, location permission explanation and data privacy.
- Do not create bundle identifiers, company identity or signing credentials until the operator chooses them.

## Google Play
- Choose Android native packaging (e.g. Capacitor) or assess a Trusted Web Activity only after verifying PWA quality, HTTPS and Digital Asset Links.
- Requires Play Console developer account, application ID, signed Android App Bundle, current target API compliance, Data safety declaration, content rating, privacy-policy URL, listing and screenshots.
- Play account testing/review requirements vary by account type; confirm current requirements before submission.

## Cross-platform release blockers
1. Confirm the app operator's legal name/contact and complete `privacy.html` and `legal.html`.
2. Confirm mapping/photo third-party rights and advertising/consent behavior; do not assume all content is cleared.
3. Resolve or safely omit missing restaurant pins and unlicensed photos (see `docs/RELEASE_QA_PHASE31_32.md`).
4. Run `npm test`, `npm run check`, real-device smoke tests, and check deployed API behavior.
5. Finalize production URL, support contact, store description and release screenshots.
6. Package, sign and submit each store app only with the operator's explicit approval.

## Current outcome
The existing web app has PWA manifest metadata. This does **not** mean that iOS/Android binaries exist, that the web app is fully installable on every browser, or that any store review has passed.
