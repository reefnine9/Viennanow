# ViennaNow — DEVELOPMENT_STATUS

Last updated: 2026-11-05
Canonical repository: https://github.com/reefnine9/Viennanow
Canonical source branch: main
Purpose: project handoff between short ChatGPT conversations. Check GitHub HEAD before editing.

## 1. Current verified repository facts
- Cloudflare Pages-oriented static/mobile web app, with Pages Functions under `functions/api/`; deployment success is not implied by GitHub commits.
- `package.json`: version 0.24.1; scripts `npm test`, `npm run check`, and `npm run dev`.
- Main application includes `index.html`, `app.js`; `public/` is identified as the deployed output in README.
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
