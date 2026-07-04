# Map Collection Route Audit

Generated for the Downtown Perks 5173 collection route overlay implementation.

## Summary

The collection route system is wired into the live Google map as a separate overlay layer:

- Collection routes are defined in `src/data/mapCollections.ts`.
- Route validation and stop resolution live in `src/lib/map/collectionRoutes.js`.
- Route geometry fallback lives in `src/lib/map/routeGeometry.js`.
- The Google map draws branded underlay/main polylines from active collection routes.
- Collection stops render as normal Downtown Perks circular pins with numbered badges.
- The compact collection route panel appears above the fixed bottom navigation.
- `collection=` and `stop=` URL params are supported.

## Audit

| Collection | Stops | Validity | Notes |
| --- | ---: | --- | --- |
| Warehouse District Happy Hour | 4 | Pass | Uses live inKind/dining entities where available. |
| Downtown Stories Walk | 4 | Pass | Uses civic, DAA, Frost Tower, and Waterloo records. |
| inKind Dining Market | 4 | Pass | Uses live inKind restaurant entities. |
| Coffee Before Work | 3 | Pass | Uses coffee/workplace records where present. |
| Hotel Guest Arrival Route | 4 | Pass | Uses Hotel Van Zandt and Rainey venue records. |

## Verified Behaviors

- Active collection routes draw a branded route line.
- Route line color is gold, emerald, or navy/gold according to collection configuration.
- Bright Google-blue directions styling is not used.
- Stops are numbered in order.
- Clicking a stop opens the existing entity drawer.
- Closing the drawer preserves the active route.
- Exiting the route removes `collection`, `stop`, and selected entity URL state.
- The panel is positioned above the fixed bottom navigation.
- Missing route stops fail gracefully through the resolver and audit helpers.

## Follow-Up QA Routes

- `http://localhost:5173/map?mode=resident&tab=map&collection=inkind-dining-market`
- `http://localhost:5173/map?mode=resident&tab=map&collection=warehouse-district-happy-hour`
- `http://localhost:5173/app?mode=resident&tab=map&collection=downtown-stories-walk`
- `http://localhost:5173/map?mode=resident&tab=map&collection=hotel-guest-arrival-route`
