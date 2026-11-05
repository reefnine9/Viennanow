# ViennaNow — Phase 31–32 release QA register

Generated 2026-11-05 from `public/data/restaurants.json`. This is a static data audit, **not** proof of live map/photo availability or legal clearance.

## Release blockers and follow-up

- **15/82 restaurant entries lack numeric coordinates.** Do not fabricate coordinates. Validate against official venue addresses and reliable geodata before displaying location pins.
- **61/82 entries lack a cover image marked `commercial_use_verified`.** Keep existing fallbacks; use only rights-cleared photos with credits.
- `public/privacy.html` and `public/legal.html` remain pre-release drafts. The operator must confirm identity, contact details, third-party processing, and consent where applicable.
- `public/index.html` currently includes `noindex,nofollow`. Remove only when the public website is ready for search indexing; do not change staging settings prematurely.
- Store distribution is **not yet verified**: native iOS/Android builds, developer accounts, signing, listings, review and actual device testing are outstanding.
- Phase 31 static checks are not a substitute for running `npm test`, `npm run check` and real iPhone/Android browser tests.

## Restaurant verification queue

| # | Restaurant | Coordinates | Commercially verified cover | Operation flag |
|---:|---|---|---|---|
| 1 | Figlmüller | present | verified | unknown |
| 2 | Plachutta Wollzeile | present | verified | unknown |
| 3 | Plachuttas Gasthaus zur Oper | present | REVIEW | unknown |
| 4 | Ribs of Vienna | present | REVIEW | unknown |
| 5 | Salm Bräu | present | verified | unknown |
| 6 | Reinthaler’s Beisl | present | REVIEW | unknown |
| 7 | Gasthaus Pöschl | present | REVIEW | unknown |
| 8 | Schnitzelwirt | present | verified | unknown |
| 9 | Schweizerhaus | present | verified | unknown |
| 10 | Meissl & Schadn | present | REVIEW | unknown |
| 11 | Gasthaus Tante Liesl | present | REVIEW | unknown |
| 12 | Glacis Beisl | present | verified | unknown |
| 13 | Wiener Wiazhaus | MISSING | REVIEW | unknown |
| 14 | Sixta | present | REVIEW | unknown |
| 15 | Stöckl im Park | present | REVIEW | unknown |
| 16 | 1516 Brewing Company | present | verified | unknown |
| 17 | Bitzinger bei der Albertina | present | verified | unknown |
| 18 | Trześniewski | present | verified | unknown |
| 19 | Zum Schwarzen Kameel | present | verified | unknown |
| 20 | Schachtelwirt | present | REVIEW | unknown |
| 21 | Lugeck | present | verified | unknown |
| 22 | Chattanooga | present | REVIEW | unknown |
| 23 | Strandcafé an der Alten Donau | present | verified | unknown |
| 24 | Gasthaus Grünauer | present | REVIEW | unknown |
| 25 | Gasthaus Wolf | MISSING | REVIEW | unknown |
| 26 | Reznicek | present | REVIEW | unknown |
| 27 | Am Nordpol 3 | present | REVIEW | unknown |
| 28 | Gasthaus Kopp | present | REVIEW | unknown |
| 29 | Gasthaus Rebhuhn | present | REVIEW | unknown |
| 30 | Gastwirtschaft Heidenkummer | present | REVIEW | unknown |
| 31 | Gasthaus Quell | present | REVIEW | unknown |
| 32 | Meierei im Stadtpark | present | verified | unknown |
| 33 | Steirereck im Stadtpark | present | verified | unknown |
| 34 | Amador | present | REVIEW | unknown |
| 35 | Konstantin Filippou | present | REVIEW | unknown |
| 36 | Mraz & Sohn | present | REVIEW | unknown |
| 37 | Silvio Nickol | present | REVIEW | unknown |
| 38 | Doubek | present | REVIEW | unknown |
| 39 | Tian | present | REVIEW | unknown |
| 40 | JOLA | MISSING | REVIEW | unknown |
| 41 | Apron | MISSING | REVIEW | unknown |
| 42 | Pramerl & the Wolf | present | REVIEW | unknown |
| 43 | Glasswing | present | REVIEW | unknown |
| 44 | MAST Weinbistro | present | REVIEW | unknown |
| 45 | Disco Volante | present | REVIEW | unknown |
| 46 | Via Toledo Enopizzeria | MISSING | REVIEW | unknown |
| 47 | Da Ferdinando | present | REVIEW | unknown |
| 48 | L’autentico | MISSING | REVIEW | unknown |
| 49 | Ristorante Rossini | MISSING | REVIEW | unknown |
| 50 | Fabios | present | REVIEW | unknown |
| 51 | LOLA | present | REVIEW | unknown |
| 52 | Wrenkh | present | REVIEW | unknown |
| 53 | Wiener Würstelstand Pfeilgasse | MISSING | REVIEW | unknown |
| 54 | Alles Wurscht | present | REVIEW | unknown |
| 55 | Würstelstand Leo | present | verified | unknown |
| 56 | Speisekammer | MISSING | REVIEW | unknown |
| 57 | eh scho wuascht | MISSING | REVIEW | unknown |
| 58 | Würstelstand Christian Lange | MISSING | REVIEW | unknown |
| 59 | Leberkas-Pepi | present | verified | unknown |
| 60 | Zur Alten Kaisermühle | present | verified | unknown |
| 61 | Mochi | present | REVIEW | unknown |
| 62 | NENI am Naschmarkt | present | verified | unknown |
| 63 | SHIKI Japanese Cuisine | present | REVIEW | unknown |
| 64 | Mochi Ramen Bar | present | REVIEW | unknown |
| 65 | Red Bowl | MISSING | REVIEW | unknown |
| 66 | Bibim | present | REVIEW | unknown |
| 67 | Sura | present | REVIEW | unknown |
| 68 | Yori | present | REVIEW | unknown |
| 69 | Kim Kocht | MISSING | REVIEW | unknown |
| 70 | Kim Shop | present | REVIEW | unknown |
| 71 | Babida | present | REVIEW | unknown |
| 72 | Koinonia | present | REVIEW | unknown |
| 73 | Akakiko | MISSING | REVIEW | unknown |
| 74 | Addiert | present | REVIEW | unknown |
| 75 | Art Corner Restaurant | present | REVIEW | unknown |
| 76 | Café Central | present | verified | temporarily_closed |
| 77 | Hinterholz | MISSING | REVIEW | reported_closed |
| 78 | Melker Stiftskeller | present | verified | unknown |
| 79 | Griechenbeisl | present | verified | unknown |
| 80 | Chez Bernard | present | REVIEW | unknown |
| 81 | Rosi | present | REVIEW | unknown |
| 82 | TIAN Bistro am Spittelberg | present | REVIEW | unknown |

## Suggested acceptance criteria

1. Each public restaurant map pin is sourced from verified coordinates, or omitted with a clear map-search fallback.
2. Images displayed commercially have documented licenses or explicit permission, attribution and a functional fallback.
3. The 82 restaurant entries display Korean and English descriptions, and closure warnings in both languages.
4. Core flows are tested on real iPhone Safari, Android Chrome, and desktop browsers: language, saves, swipes, route map, GPS permissions and offline/error cases.
5. Privacy and legal pages are approved by the responsible operator before release; advertising/analytics permissions are reviewed.
6. Store-specific requirements and native packaging are evaluated separately, without claiming PWA alone guarantees App Store acceptance.
