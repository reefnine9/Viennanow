# ViennaNow — DEVELOPMENT_STATUS

Last updated: 2026-11-05
Canonical repository: https://github.com/reefnine9/Viennanow
Canonical source branch: main
Purpose: project handoff between short ChatGPT conversations. Check GitHub HEAD before editing.

## 1. Current verified repository facts
- Cloudflare Pages-oriented static/mobile web app, with Pages Functions under `functions/api/`; deployment success is not implied by GitHub commits.
- `package.json`: version 0.24.1; scripts `npm test`, `npm run check`, and `npm run dev`.
- Main application includes `index.html`, `app.js`; `public/` is identified as the deployed output in README.
- IMPORTANT SOURCE DIVERGENCE: GitHub reports root `index.html` at ~495 KB and `public/index.html` at ~756 KB (2026-11-05). These are not identical. Inspect `public/index.html` first for UI changes and confirm whether root sources generate the public file; never copy root `index.html` blindly over the deployed version.
- `public/qa-smoke.html` exists in the published output; its presence is not proof of a successful live execution.
- GitHub HEAD observed at the start of this document: `9c196ab4949cb9dce13ec416c09d71d13a238f98` ("Phase 4: add reproducible QA smoke-check page for release checks"). This hash becomes historical after the next commit.
- `QA_RELEASE_AUDIT_2026-11-05.md` reports 48 sightseeing records and 82 restaurant records, but this is an audit snapshot, not a live venue validation.

## 2. Product decisions recorded from project discussions (verify in running code)
- Name: ViennaNow. Brand treatment emphasizes the V mark with Vienna / NOW typography; use the approved reference asset rather than recreating from memory.
- Mobile-first UI. Main sections discussed: Home, Sights, Restaurants, Plan, Nearby. Trust the current source for actual implemented navigation.
- Korean and English are selected globally; British flag denotes English. Selection should apply to all visible UI, details, popups, and empty states.
- Sights and restaurants offer photo-led cards / tile view, favourites, detail navigation by horizontal swiping, and Google Maps linking.
- Saved favourites should be accessible from the planning flow. Story-led "비엔나 이야기" home content and curated shopping content are desired.
- Uniform app-wide visual language: header V position, select chevrons, control heights, corner radii, type sizes, active states, favourite ♥ colour (red), image placeholders, and mobile safe areas.

## 3. Risks and unresolved validation (from QA audit)
- 32/48 sight entries lack independently specified street addresses; stored coordinates are reference POIs, not verified entrances.
- 22/82 restaurants lack recorded street addresses; 15/82 lack stored coordinates.
- Only 21/82 restaurant covers have recorded permission review; remaining covers should use honest placeholders, not unrelated imagery.
- Translation completeness, device rendering, image licensing, external links, and live venue information have not been independently certified.
- Do not claim a UI feature is implemented merely because it was requested in an earlier conversation.

## 4. Current next phase: Design-system consolidation
Priority A: Audit actual UI selectors and element markup in `index.html`, `public/index.html` (if distinct), and `app.js`; map duplicated button, chip, header, select, icon and favourite styles.
Priority B: Apply shared design tokens and components, without changing interaction semantics or overwriting established branding.
Priority C: Run `npm test`, `npm run check`, verify HTML/static assets, inspect Korean and English, and carry out real mobile checks when a browser/device is available.
Priority D: Re-run smoke tests and update this document with exact commit SHA, tests run, screenshots or remaining limitations.

See `DESIGN_SYSTEM_KR.md` for the working UI specification.

## 5. Change protocol for every new ChatGPT conversation
1. Open this file, `DESIGN_SYSTEM_KR.md`, latest GitHub commit, and any task-specific files.
2. State what is confirmed from source vs merely planned vs not tested.
3. Work on one scoped phase and preserve users' approved structure/content.
4. Commit changes to GitHub; record affected files, commit, validation results and pending work here.
5. Start the next conversation with: "ViennaNow GitHub main 최신 버전과 DEVELOPMENT_STATUS.md를 읽고 미완료 작업부터 이어서 진행해줘."
6. If a new commit was made outside ChatGPT, refresh files before attempting another update.

## 6. Log
- 2026-11-05: Established persistent cross-chat handoff process; documented verified code baseline, known audit risks and proposed design consistency phase. No claim of full visual QA or production deployment.


## 7. Phase 5–8 execution record (2026-11-05)
- Phase 5 source audit: inspected the actual deployed `public/index.html`, not the divergent root `index.html`. Existing chip tokens, card radius, V-icon consistency rules and favourite colours already existed; retained those rather than layering new conflicting defaults.
- Phase 6 visual consistency patch: `public/index.html` adds common favorite-heart minimum visual size, red saved-state colour, focus-visible outline, expanded image-overlay hit region and narrow-screen resilience. GitHub commit `727c0237d7d503e43201ec1f88971025bdf96dd5`.
- Phase 7 test coverage: added `tests/design-system.test.mjs` with 5 source-level regression tests for chip sizing, favourite palette, focus/touch, language toggle/accessible labels and continuity documents. GitHub commit `7c2a1e987ce1cbf391abb4d7413bc07979e85781`.
- Phase 8 static verification: re-fetched the updated deployed HTML and test file from GitHub; all 7 direct static source checks passed (new CSS present, shared tokens present, red-heart overrides present, touch/focus declarations present, language/ARIA symbols present, test file present, HTML structure markers intact).
- Phase 8 CI: added `.github/workflows/source-qa.yml` on `main` to invoke `npm test` and `npm run check` on future pushes, pull requests and manual dispatch (commit `79ac6c70a460e5998b9c709292319ef78688f42c`). Initial GitHub Actions runs query returned zero runs, so CI execution and success are **not confirmed**.
- **Not run:** `npm test` / `npm run check` on a complete local checkout; no available checkout of the repository in this session. Static checks are not equivalent to Node tests.
- **Not run:** actual iPhone/Android rendering, bilingual full-flow interaction, photographic licences and runtime API / Cloudflare Pages checks. No live deployment success claim. Next step is to run CI/local tests with repository files, then real-device smoke checks using `public/qa-smoke.html`.
- Production note: source changes on `main` are committed, but automatic deployment is dependent on the linked Cloudflare Pages configuration and has not been verified.

## 8. Next prioritized tasks
1. Run `npm test` and `npm run check` against a full clone. Fix any failures and log the outputs.
2. Verify mobile widths 320/375/390/430px, favourite tap targets, language-toggle layout, and selected states on a real device.
3. Check live Cloudflare deployment and run `qa-smoke.html` and `deploy-check.html`.
4. After verifying, mark the relevant steps complete and update the GitHub log.

## 9. GitHub Actions failure diagnosis and repair (2026-11-05)
- Initial workflow failures: 104 unit tests, 95 passed / 9 failed. Older Phase 21/22/24 tests asserted obsolete root `index.html` markup and retired map controls instead of the current `public/index.html` UI.
- Updated `tests/phase21-navigation.test.mjs`, `tests/phase22-nearby.test.mjs` and `tests/phase24-map-layout.test.mjs` to assert the currently shipped five bottom tabs, six nearby map categories, current favourites/food filters and map resizing.
- Next preflight failure: `scripts/check-cloudflare.mjs` expected Phase 30 in the public title, root HTML identical to public HTML, legacy four-tab labels, an obsolete `m.openPopup()` expression and old zoom clustering. Replaced stale checks with present public deployment invariants; kept root divergence warning and requirement to deploy `public/`.
- **Confirmed GitHub Actions success:** workflow run [41945707348](https://github.com/reefnine9/Viennanow/actions/runs/41945707348), source commit `a3385b72213d70aecf2f006ecde7451736c1f27b`. Both `npm test` and `npm run check` steps passed. Previous failed runs remain historical and need no deletion.
- This confirms automated source and preflight gates, **not** actual Cloudflare deployment, real-device appearance, business information or photo licensing.


## 10. Phase 9 mobile / bilingual source fix (2026-11-05)
- Verified successful prior GitHub Actions run 41945758160.
- Fixed English translation for native `<select><option>` text by removing `option` from the translation walk's skipped-elements selector in **`public/index.html`**. Inputs/textarea and script/style remain excluded, and the language switch still sets the document's `lang` attribute. Source commit: `819ae3503c159b53986d25cd2a6261652f000984`.
- Added **`tests/phase9-mobile-language.test.mjs`**, covering option translation, accessible labels and attributes, mobile styles, and saved favourites. Commit: `57e828e4a5ed4310dc5f8d664b90d54e903e04ea`.
- GitHub Actions run [41946303819](https://github.com/reefnine9/Viennanow/actions/runs/41946303819) **passed** `npm test` (108 passing) and `npm run check`.
- Manual UI gates still open: mobile 320/375/390/430px, verify translated option names in native dropdowns after switching languages, photo fallback, keyboard/touch, map popup, and actual deployed Cloudflare Pages URL. Static tests cannot prove complete English coverage or visual correctness.


## 11. Phase 10 — automated mobile browser QA (2026-11-05)
- Added `scripts/mobile-browser-qa.mjs` and `.github/workflows/mobile-browser-qa.yml` to launch Chromium in the official Playwright container, run against the locally served `public/` output, and upload screenshots + JSON report as an artifact.
- Checks four mobile viewport widths (320, 375, 390, 430px), both Korean and English, and five main tabs: **40 combinations**; validates tab labels, document language, page content, no document-wide horizontal overflow, bottom navigation within viewport, no uncaught page errors, and switch back to Korean.
- Fixed QA setup: GitHub Ubuntu 26.04 was incompatible with initial Playwright browser install, so workflow now uses `mcr.microsoft.com/playwright:v1.56.1-noble`. Fixed QA driver to return Home before clicking its language toggle. Isolated UI checks from external map/image endpoints to avoid flaky remote failures; external network tests remain separate.
- **Verified success**: GitHub Actions run [41947156886](https://github.com/reefnine9/Viennanow/actions/runs/41947156886) / commit `9e92f25bc4ddbf124ad6e79864a1fea7e16238c0`: 40/40 combinations, **0 issues**; 2D viewport screenshots and report uploaded as workflow artifact. Source QA at same commit also passed.
- Scope limitation: Chromium emulation on GitHub is not physical iPhone Safari or Android Chrome; screenshots were captured but not yet manually visually reviewed. Map/photos external requests intentionally blocked in this test; real deployed site, link availability, map pin interactions, favourite persistence and physical touch gestures are still NOT validated.
- Next: review artifacts and real-device screenshots, add favourite persistence / map popup interaction checks, verify Cloudflare deployed URL separately, and update release readiness.


## 12. Phase 11 — favourite interactions and detail flow (2026-11-05)
- Added `scripts/interaction-qa.mjs` to browser-check sight favourites: initial state, save, localStorage persistence, reload, Plan saved list, remove, persistence of removal, sight detail open/close, Nearby map element and pin-to-detail **source wiring**.
- Browser testing caught a real blocker when a sight photo failed: `.photo-error23` overlay in `.photo-pick` intercepted taps on the favourite heart. Fixed in deployed `public/index.html` with `.photo-pick .heart{z-index:4;isolation:isolate}` and non-interactive error overlay. Commit `7c44ab0d5311af289f5843dccef7a4d65f0d197f`.
- **Verified:** Phase 11 Chromium checks **13/13 passed**, no issues, in GitHub Actions run [41948602867](https://github.com/reefnine9/Viennanow/actions/runs/41948602867).
- Scope: Map element and popup handler wiring were tested, but **real Leaflet marker taps with map tiles were not**. Restaurant favourite interaction also remains a further end-to-end target.

## 13. Phase 12 — local and production HTTP verification (2026-11-05)
- Created `scripts/deploy-qa.mjs`; extended `.github/workflows/mobile-browser-qa.yml` to run local asset checks and production observation separately, upload results and screenshots, and avoid treating transient production failures as source QA failures.
- Exact production URL previously supplied in the project: `https://viennanow.pages.dev/`.
- **Verified:** GitHub Actions run [41948602867](https://github.com/reefnine9/Viennanow/actions/runs/41948602867): 40/40 mobile/tab/language combinations; Phase 11 13/13; Phase 12 local 7/7; Phase 12 production HTTP **11/11** required/noncritical checks without failure. Production passed app HTML, QA/deploy pages, 48-photo manifest, 82-restaurant catalogue, route-status API response/shape, public-toilet sample diagnostics response.
- Production HTML contains the latest Phase 11 heart-overlay CSS marker, so the fix is **confirmed deployed** (this checks the marker's presence, not visual/touch success on a physical phone).
- Local and production HTTP reports are written separately to `artifacts/deploy-qa/local-report.json` and `production-report.json`; test artifacts are attached to the GitHub Actions run.
- Still not a full production release certification: browser QA blocks external images/maps, external photo links and licences are unverified, route-status JSON does not prove route success, HTTP 200 for toilet sample diagnostics does not establish completeness, mobile Safari/Android devices and real live map pin interactions remain untested.


## 14. Phase 13 — actual map popup / restaurant favourite browser QA (2026-11-05)
- Created `scripts/phase13-browser-qa.mjs` using Chromium and the actual Leaflet 1.9.4 library supplied from npm, while remote map tiles and photos are blocked so that interactions are reproducible. The script clicks real Leaflet markers and popup buttons (not merely inspecting handler source), and tests restaurant saved state through localStorage, reload and Plan, as well as detail open/close.
- Discovered that closely overlapping central Vienna map pins can intercept a tap at initial zoom. The test now zooms on a known sight before clicking. This means tap interactions work for a separated pin, **not** that all crowded pins are convenient to select. Consider clustering/spiderfying overlapping markers in a future release.
- **Confirmed** in [run 41967791053](https://github.com/reefnine9/Viennanow/actions/runs/41967791053) at commit `972ea9945dfb985dd968db10ebd87f77f46a25b2`: **12/12 checks passed**.
- True iPhone Safari/Android Chrome map gestures and externally fetched basemap/photo behaviour remain outside this controlled Chromium test.

## 15. Phase 14 — image attribution metadata and readiness audit (2026-11-05)
- Added `scripts/phase14-media-audit.mjs`. Audit: **48/48** sightseeing records include photo credit/creator/license/source metadata and all 82 restaurants are accounted for. **21/82** restaurant cover records are marked commercially reviewed; **61/82 are not**.
- In [run 41967791053](https://github.com/reefnine9/Viennanow/actions/runs/41967791053), metadata audit had zero blocking errors but three initial warnings caused by incorrectly flagging valid `CC0 1.0` licence labels (A09, A11, A12). Corrected the license-recognition rule in subsequent commit `696b65102ed53f293da10161638465f408fb5a05`.
- Source and deployed HTTP checks in that run passed, including production endpoint checks; media **licence text/URL metadata does not constitute legal clearance**, and external image delivery was not live-probed by this audit.
- Manual release gate still open: check original licences/attribution obligations and share-alike conditions, test individual Wikimedia image URLs and failures in a live browser, verify actual venue/photo matching, check hotel/restaurant legal content and current hours, run Safari iPhone + Chrome Android touchscreen tests and inspect screenshot artifacts. Do not claim release-certified status from automated checks alone.


## 16. Phase 15 — external photo availability check (2026-11-05)
- Added `scripts/phase15-photo-url-audit.mjs` to probe the 48 sightseeing photo URLs and 21 restaurant cover URLs marked commercially reviewed; creates `artifacts/phase15/photo-url-report.json` with per-URL status.
- **Observed in GitHub Actions run [41969049053](https://github.com/reefnine9/Viennanow/actions/runs/41969049053):** 69 URLs tested, 51 confirmed returning an image response, 18 unconfirmed. Many unconfirmed were HTTP 429 rate limits on the photo provider, NOT proof that images are broken; do not automatically replace or delete based on these probes.
- To avoid repeated rate limiting, removed 69-link probing from every push in the mobile workflow. Added on-demand `.github/workflows/photo-url-audit.yml` for targeted repeat checks. The last result is a network snapshot from GitHub runners, not a guarantee of image decoding in each user browser.

## 17. Phase 16 — photo failure user experience and regressions (2026-11-05)
- Updated `public/index.html` `photoFail23` to attempt a distinct legacy photo URL at most once, avoid duplicate placeholder elements, and show language-aware unavailable-photo messages while keeping visual cards interactive. CSS makes error overlays non-interactive and preserves save/detail buttons; did not add unrelated or unlicensed substitute photographs.
- Added `scripts/phase16-photo-fallback-qa.mjs`: Chromium intentionally blocks external image hosts and verifies placeholder, Korean and English messages, single retry, saved-heart tap and detail opening.
- **Verified in [run 41969049053](https://github.com/reefnine9/Viennanow/actions/runs/41969049053):** 6/6 photo-failure UI checks passed, 40/40 bilingual/mobile combinations, 12/12 prior restaurant and Leaflet checks, production HTTP connectivity checks passed.
- Unresolved: 18 image URLs unconfirmed due largely to automated request throttling; 61 of 82 restaurant cover photos have no independent commercial-use review, so honest placeholders remain; external photo content/authenticity, legal license clearance and physical iPhone/Android checks remain manual gates.
