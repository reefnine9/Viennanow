# ViennaNow Restaurants DB (draft)

This directory is the editable source for restaurant listings, independent of UI changes. GitHub version history tracks every edit.

- `restaurants.json`: 92 **candidate records**; not confirmed operational or personally visited.
- `schema_version`: 1.0.0. Keep `id` stable even if a restaurant is renamed.
- `categories`: featured / local_recommended / hidden_gem / personal / asian / new (multiple tags allowed).
- `visit_warning`: a separate status tag, **not** a recommendation category.
- `operations.status`: unknown / open / temporarily_closed / seasonal / reported_closed / permanently_closed.
- `verification.status`: unverified / verified. Add source URLs and a checked date after validating facts.
- `publication.approved`: **false for every seed record**. Only display approved records in the consumer app.
- `personal_review.visited`: false by default; change only after the app owner confirms an actual visit.
- `location.lat/lng`: null until exact venue/branch is confirmed. Do not pin arbitrary coordinates.
- Café Central and Hinterholz are held as unpublished caution records only; verify status before any release.
- Cafés, dessert spots, bars and Heuriger are excluded from this restaurant database pending separate research.

To consume later in the browser:

```js
const db = await fetch('/data/restaurants.json').then(r => r.json());
const displayable = db.restaurants.filter(r => r.publication.approved && r.operations.status === 'open');
```

Before release: deduplicate branches, check opening status, precise coordinates, sources, menu prices, image rights, and reservation links. Never imply independent real-world verification just because a candidate is in the JSON.
