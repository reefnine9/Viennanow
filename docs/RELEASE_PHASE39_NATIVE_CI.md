# Phase 39 — Cloud native build workflows

The repository now includes manually triggered GitHub Actions:
- `Native Android build check`: builds a **debug APK** (not a signed Play Store AAB).
- `Native iOS simulator build check`: compiles an **iOS Simulator build** (not a signed App Store IPA).

Both require `api_origin` (the real HTTPS Cloudflare production hostname). Neither workflow has been executed as part of this commit. Never enter an API key in the input; it is a public HTTPS origin only.

## Run
1. Open GitHub → Actions.
2. Select one of the two native build workflows.
3. Choose **Run workflow** and enter the verified production HTTPS origin.
4. Inspect build logs; Android successful runs publish a temporary debug APK artifact.
5. Test maps, route API, OGD proxy, GPS permissions, icons and network errors on physical devices before store release.

## Release gaps
- The existing `public/index.html` contains a `noindex` tag and the legal/privacy documents are drafts.
- Location permissions, native splash/adaptive icons and iOS/Android release signing require final review.
- The icon generator currently produces PWA/touch/store PNG artwork but not a complete native asset catalog.
- The workflow has not produced or verified any installable artifact yet.
- App identifier `app.viennanow.travel` remains provisional.
