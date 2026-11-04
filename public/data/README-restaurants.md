# ViennaNow Restaurants — Phase 42

This folder contains the editable restaurant research catalogue for the **먹거리** tab.

- `restaurants.json` has **94 candidate venues** with 9 owner-selected **필수 맛집** tags.
- The interface displays editorial candidates with a clearly visible verification caveat; this does not imply that all venues have been checked or approved.
- `categories`: `featured`, `local_recommended`, `hidden_gem`, `personal`, `asian`, `new`. Multi-tagging is supported.
- `tags: ["visit_warning"]` is for closures or other cautions (two records). It is separate from cuisines/recommendations.
- `editorial.must_visit` is true only for the nine restaurants selected by the project owner.
- `personal_review.visited` is false until a real personal visit is confirmed.
- Café, dessert, alcohol-focused bar and Heuriger catalogues are deferred.
- Unknown details (coordinates, prices, opening hours) remain null, rather than fabricated.

## UI

The **V 먹거리** header sits in the same row as horizontally scrollable category filters. The page displays searchable restaurant cards, category badges, and an expandable panel linking to Google Maps search, without claiming exact verified address. Filter and search are client-side and fetched from `/data/restaurants.json`.

## Editorial process

Update JSON in GitHub, check names and branch identities, add reviewed sources and coordinates, and set verified publication fields as confidence improves. Changes to the JSON appear in the UI after deployment, without editing HTML again.
