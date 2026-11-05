# ViennaNow — Release QA audit (2026-11-05)

This is a source-data and code audit, **not** a live verification of businesses, licensing rights, opening hours, or device rendering.

## Phase 1: Places, IDs and location links

- Sight records: **48**, unique IDs: **48**, all 48 have stored latitude/longitude.
- **32/48** sightseeing records have no separately specified street address; map searches rely on named venues. Coordinates are reference POIs, **not verified entrances**.
- Restaurant records: **82**, unique IDs: **82**.
- **22/82** restaurants have no recorded street address; Google Maps queries fall back to a venue name plus Vienna rather than guessing an address.
- **15/82** restaurants have no stored coordinates. Their records remain in restaurant lists, but may be absent from map pins unless an unambiguous OpenStreetMap name match is returned.
- Current location and public facilities data are not live-verified in this audit.

## Phase 2: Image records, source attribution

- Sight photo metadata records: **48**, one for each sightseeing place, with source, creator and licence labels.
- Restaurant cover images with recorded permission review: **21/82**; missing photo covers: **61/82**. Missing images should display a neutral placeholder, **not** an unrelated photograph.
- A recorded 'commercial_use_verified' property is an internal source review flag, not an independent legal guarantee. Review each original file, attribution, derivative conditions, and permission to publish before launch.
- The fact that a URL is stored does **not** confirm that the remote image currently loads.

## Phase 3: Language coverage

- Sight extended English narratives: 48 records; some Korean-only editorial fields, dynamically generated notices and route descriptions remain candidates for manual translation review.
- Restaurant English description entries: 82/82, but wording, depth and accuracy need editorial review.
- Test language switching on every tab and on open drawers and maps, not only from the Home screen.

## Phase 4: Functional smoke test matrix

1. Korean: open a sight, save ♥, open Plan → My Favorites, map the saved sight, open the pin detail, close it and verify the previous tab is intact.
2. English: repeat; confirm all functional labels and key detail content are English.
3. Restaurant: save ♥, check saved list after data fetch, open the detail without losing the originating tab, open map and pin.
4. Empty-state test: no saved places, failed restaurant data load, no photo, no geocoordinates.
5. Device test: small Android and iPhone widths, drawer close and safe-area padding, map marker taps and the full-photo scroll/swipe.
6. External links: open the official/map/source destinations and review target and licensing notes.

## Exit criteria / open risk

**Not launch-certified:** no complete end-to-end device run, remote link response test, live venue confirmation or independent licence review has been performed here. Prioritize accessibility and translation inspections, visual mobile QA, and legal review of image use.
