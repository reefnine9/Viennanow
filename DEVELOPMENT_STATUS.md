# ViennaNow — DEVELOPMENT_STATUS

Last updated: 2026-11-05
Canonical repository: https://github.com/reefnine9/Viennanow
Canonical source branch: main
Purpose: project handoff between short ChatGPT conversations. Check GitHub HEAD before editing.

## 1. Current verified repository facts
- Cloudflare Pages-oriented static/mobile web app, with Pages Functions under `functions/api/`; deployment success is not implied by GitHub commits.
- `package.json`: version 0.24.1; scripts `npm test`, `npm run check`, and `npm run dev`.
- Main application includes `index.html`, `app.js`; `public/` is identified as the deployed output in README.
- IMPORTANT SOURCE DIVERGENCE: GitHub reports archived root `index_old.html` at ~495 KB and `public/index.html` at ~756 KB (2026-11-05). These are not identical. Inspect `public/index.html` first for UI changes and confirm whether root sources generate the public file; never copy root `index_old.html` blindly over the deployed version.
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
- Phase 5 source audit: inspected the actual deployed `public/index.html`, not the divergent root `index_old.html`. Existing chip tokens, card radius, V-icon consistency rules and favourite colours already existed; retained those rather than layering new conflicting defaults.
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
- Initial workflow failures: 104 unit tests, 95 passed / 9 failed. Older Phase 21/22/24 tests asserted obsolete root `index_old.html` markup and retired map controls instead of the current `public/index.html` UI.
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


## 18. Recommended route detail navigation (2026-11-05)
- User requested left/right swiping between recommended course detail pages, replacing the Google start/finish link with the selected course in Nearby > Plan map, and removing the "여행 전 확인" pre-trip confirmation text.
- Implemented in deployed `public/index.html`: course-detail touch swipes and visible previous/next controls; navigation respects current course filter; accessible swipe hint/route counter; route-specific `vn-course-near-map` handler sets `state.nearPlanChoice`, `state.nearSection='plan'`, `state.tab='map'` and renders the selected map.
- Removed the "여행 전 확인" block (including its old external directions link) from the recommendation detail screen. The map overview and ordered stops remain.
- Added `scripts/course-detail-qa.mjs` to GitHub Actions browser QA. **Verified** [run 41970849614](https://github.com/reefnine9/Viennanow/actions/runs/41970849614): course detail tests **13/13 passed**, overall 40 mobile/language layouts and other pre-existing browser checks also passed. Production HTTP checks passed, but the remote site was not specifically browser-tested for this new interaction.
- Follow-up: check actual iPhone/Android swiping and provide UI feedback. Do not change map pin overlap handling unless later requested.


## 19. Finger-following page swipe UX across detail screens (2026-11-05)
- Replaced release-only snap between pages with continuously tracked horizontal touch dragging for Sights, Dining and Recommended Route detail views in deployed `public/index.html`.
- Incoming adjacent page is rendered as a noninteractive preview beside the current page and both panels translate together at the touch displacement; releasing past a distance or quick-gesture threshold animates to the next/previous page, while short drags spring back. Vertical scrolling remains enabled (`touch-action:pan-y`); the older Home story/full-photo interactions remain separate.
- Sight and restaurant `drawer` details now support full-page horizontal swiping rather than only a photo swipe; route detail swipe works through its scrollable content. Preview is removed after navigation/cancel and existing save/map actions remain intact.
- Modified `scripts/course-detail-qa.mjs` to emit touchmove events; added `scripts/finger-swipe-qa.mjs` and its GitHub Actions step, verifying intermediate `translate3d` position, preview presence, next-page settling and short-drag snap-back for all three screens.
- **Verified:** [GitHub Actions run 41972668421](https://github.com/reefnine9/Viennanow/actions/runs/41972668421) at commit `28a03f33c94a4356edc9de9ce32079dea1d6282d`: **21/21** finger-follow tests passed; existing **13/13** route detail, **40/40** responsive/bilingual combinations, restaurant/map/failed-image tests and production HTTP checks all passed.
- Remaining manual review: swipe feel and timing on a physical iPhone Safari and Android Chrome, transitions with very long detail content, and accessibility/reduced-motion observations.


## 20. Swipe gesture stability and long-page resilience (2026-11-05)
- Implemented stable swipe settling in `public/index.html`, preventing a second drag while a prior page is finishing its settle animation; cleans pending timers, preview elements and overridden parent styling after completed/cancelled gestures.
- Two-finger or detached-target gestures now abort safely, text-input editing is excluded from swipe start, and unavailable adjacent previews no longer leave scrolling locked. Maintains native vertical reading/scrolling and reduced-motion behaviour.
- **Verified** in [run 41973528803](https://github.com/reefnine9/Viennanow/actions/runs/41973528803): new 12/12 stability/accessibility browser checks and prior 21/21 finger-tracking checks pass.

## 21. Detail navigation accessibility (2026-11-05)
- Added keyboard `ArrowLeft`/`ArrowRight` navigation for active Sights, Dining and Recommended Route detail screens, excluding editable controls and modifier-key shortcuts.
- Added one visually hidden `aria-live=polite` announcement region to inform assistive technologies of the new detail title after keyboard or swipe navigation; adjacent swipe previews remain `aria-hidden` and inert.
- Added `scripts/swipe-stability-qa.mjs` to GitHub Actions to test vertical gesture, multi-touch recovery, keyboard next/previous, announcement, long-page drag and scroll recovery. **Verified [run 41973528803](https://github.com/reefnine9/Viennanow/actions/runs/41973528803): 12/12 new tests passed, 40/40 mobile/language combinations, 13/13 course-detail tests, 21/21 finger-follow tests and live site HTTP preflight passed**.
- These are automated Chromium emulation tests, not a certification of real iOS Safari gestures or complete screen-reader UX. Manual VoiceOver/TalkBack and physical phone checks remain open.


## 22. Browser-engine compatibility of detail swipes (2026-11-05)
- Introduced `scripts/phase22-cross-browser-qa.mjs` to run the same touchstart/touchmove/touchend sequence across Chromium (Android-like emulation) and WebKit (iPhone Safari-like emulation), checking Sights, Dining and Recommended Route detail views.
- Verifies that the current page follows finger displacement, adjacent non-interactive preview exists during drag, navigation updates the page, and previews clean up after the gesture. Captures six screenshots in the workflow artifact.
- **Confirmed:** [GitHub Actions run 41977907888](https://github.com/reefnine9/Viennanow/actions/runs/41977907888), **24/24 passed**, zero issues. WebKit is the Safari browser engine but this is still **headless Playwright emulation**, not a physical iPhone Safari session.

## 23. Small-screen and enlarged-text detail accessibility QA (2026-11-05)
- Introduced `scripts/phase23-responsive-a11y-qa.mjs` to validate Sights/Dining/Recommended Route detail pages across widths 320, 375 and 390 px and respective increased content font-size scales 1.0, 1.25, 1.5.
- Verifies displayed panel boundaries, visibility of close/back controls, dialog semantics for modal details and absence of document-wide horizontal overflow, preserving screenshots and JSON results.
- **Confirmed:** [GitHub Actions run 41977907888](https://github.com/reefnine9/Viennanow/actions/runs/41977907888), **36/36 passed**, zero issues. Existing 40/40 mobile/language, 21/21 live drag, 12/12 stability and production HTTP checks also passed.
- No visual redesign or change to map pins performed. Automated checks cannot certify every text truncation, full WCAG accessibility compliance, native iOS VoiceOver/TalkBack or physical smartphone behaviour; those remain follow-up manual QA items.


## 24. Phase 24 — image quality and attribution access (2026-11-05)
- Preserved honest missing-photo fallback for restaurant entries without verified commercial-use imagery; enhanced verified restaurant cover delivery with asynchronous decoding and no-referrer image requests.
- Added `public/photo-credits.html` with bilingual, source-linked attribution rows for existing 48 sightseeing images and 21 restaurant covers marked reviewed; links appear in Home service footer.
- **Not complete as licensing certification:** 61 of 82 restaurant covers are still not verified, some external URL checks previously returned 429; original work/author, adaptations, places and licences require independent manual review.

## 25. Phase 25 — bilingual UI and content audit (2026-11-05)
- Updated `nearPlanLayer31` to translate suggested route stop titles and marker popups through `VN_EN_STOPS` when English is selected.
- Added `scripts/phase25-language-audit.mjs`: creates per-screen English-mode screenshots and advisory lists of remaining Korean-bearing text on Home, Sights, Dining, Plan, detail screens and Nearby route map. Place names may be legitimate un-translated proper nouns; audit requires editorial review.
- **Not claiming complete professional translation:** the app includes numerous long-form Korean cultural descriptions; editorial verification of every English screen is outstanding.

## 26. Phase 26 — visual control system consolidation (2026-11-05)
- Aligned selected course arrows, menu links and dining controls to a 44 px minimum tap height and consistent 12 px radius, with visible keyboard focus.
- Existing source and Chromium/WebKit 320–430 px regression checks retained. Overall designer visual review and physical-device pixel QA remain open.

## 27. Phase 27 — route map precision (2026-11-05)
- Explicitly show a bilingual warning in recommended course details when some stops lack a confirmed coordinate. The existing real-route map selection is retained; no fabricated geolocation or route metrics.
- `scripts/phase24-29-release-qa.mjs` reports original stop names missing coordinates per route to guide future editorial/geo enrichment. Observed on first run: **17 of 28 curated routes** have at least one unmapped/unsupported stop. Some are generic lunch/rest breaks; assess each case individually.

## 28. Phase 28 — mobile and bilingual release simulation (2026-11-05)
- Added automated bilingual release QA to GitHub Actions for Chromium and WebKit, 320/390/430 px, Home service information links, route detail, selected map route and public legal/attribution pages; screenshots and JSON artifacts are uploaded.
- Initial run [41979127955](https://github.com/reefnine9/Viennanow/actions/runs/41979127955) passed **78/78** checks; prior mobile and swipe suites also passed.
- This is **emulation, not physical iPhone Safari or Android Chrome signoff**.

## 29. Phase 29 — public disclosure draft and release gates (2026-11-05)
- Created `public/privacy.html` and `public/legal.html` with Korean/English informational drafts; Home provides access and includes the photo credit page. Privacy explains `localStorage.viennanow_p9`, opt-in device GPS, Cloudflare hosting and possible third-party photo/map requests. Legal page **clearly marks missing operator identification**.
- Added `RELEASE_READINESS_KR.md` with identified blockers, actual Austrian WKO/USP/Creative Commons reference links, and independent review tasks. The drafts intentionally do NOT claim GDPR/Impressum legal compliance, nor identify an unverified operator.
- **Release NOT legally certified:** accountable publisher/contact/address/company details, exact third-party processing and consent arrangements, photo reuse clearance, actual-device acceptance tests and operating-hours freshness must be resolved before public launch.


### Final regression after Phase 25 localization fixes (2026-11-05)
- English-mode candidate audit initially found 38 Korean-bearing text nodes across eight primary screens, mostly route list excerpts and Nearby route options. Fixed mixed-word route translations and timing/season terms, then re-ran.
- **Verified final source commit `73139d5bb835b68b24e0b35871317683f42ac002`** in [GitHub Actions run 41979977929](https://github.com/reefnine9/Viennanow/actions/runs/41979977929): **0 Korean-bearing text nodes** on the eight audited English screens (Home, Sights, sight detail, Dining, food detail, Plan, route detail, Nearby route), **78/78** release QA checks, **40/40** mobile/language checks, **17/17** local-to-production HTTP diagnostics all passed. This does not certify English fluency or all hidden/alternate editorial sections; native speaker review remains open.
- Production diagnostics now verify availability and presence of the draft privacy, legal and photo credits pages. Operator disclosure and third-party consent are still NOT approved for public launch.


## 2026-11-06: root entrypoint archive/rename
- Legacy root `index.html` was renamed to `index_old.html` without changing its contents; production uses `public/index.html` exclusively.
- The two tests intentionally asserting historical root content now reference `index_old.html`; they do **not** validate modern production app behavior.
- `scripts/sync_html.py` disabled because it could overwrite current production HTML using outdated `app.js`.
- `scripts/check-cloudflare.mjs` now fails if an accidental root `index.html` reappears.
- For all future UI changes, edit `public/index.html` (and related data/functions), not `index_old.html`.
