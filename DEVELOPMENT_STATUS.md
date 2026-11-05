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
