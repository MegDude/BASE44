# Downtown Perks Discovery Render Tree

Target: `http://localhost:5173`

Purpose: expose every search, Ask the Map, filter, brand rail, toolbar, and map-control render path before any further UI changes. This file is the source of truth for removing duplication instead of hiding it with CSS.

## Summary

The 5173 map route currently has one primary in-map discovery system:

```txt
Map page
└── SearchIntentConsole / collapsed Ask the Map rollup
```

There are also separate global/product search modals and legacy map search components in the repository. Some are not mounted on `/map`, but they remain duplication risks because they share similar names and overlapping responsibilities.

## Canonical Map Discovery Tree

```txt
src/pages/Map.jsx
└── Map page root .dp-map-page
    ├── Leaflet MapContainer
    │   ├── TileLayer
    │   ├── MapFocus
    │   ├── MapViewPersistence
    │   ├── MapResultBoundsFitter
    │   ├── MapZoomTracker
    │   ├── MapInteractionCollapse
    │   ├── ClusterMarker
    │   └── PlaceMarker
    ├── .dp-map-search-anchor
    │   ├── .dp-map-global-search-button
    │   ├── SearchIntentConsole when expanded
    │   │   ├── audience switch
    │   │   ├── Ask the Map input
    │   │   ├── suggested search rail
    │   │   ├── brand/context filter rail
    │   │   └── answer surface
    │   └── .dp-search-rollup-button when collapsed
    ├── Context drawers / sheets
    ├── Bottom navigation
    └── QuickSearchModal
```

## Render Inventory

| Component | Parent | Route | Render Condition | Visible State | Legacy/New | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `SearchIntentConsole` | `src/pages/Map.jsx` inside `.dp-map-search-anchor` | `/map` | `urlState.tab === "map"` and `consoleCollapsed === false` | Expanded Ask the Map command console | New/canonical for 5173 map | Keep. This is the only in-map expanded search console. |
| `.dp-search-rollup-button` | `src/pages/Map.jsx` inside `.dp-map-search-anchor` | `/map` | `urlState.tab === "map"` and `consoleCollapsed === true` | Collapsed Ask the Map entry point | New/canonical for 5173 map | Keep. This should be top-centered and fixed relative to map canvas. |
| `.dp-map-global-search-button` | `src/pages/Map.jsx` inside `.dp-map-search-anchor` | `/map` | Always when `urlState.tab === "map"` | Separate Search button next to/near Ask the Map | Duplicate | Remove or merge into Ask the Map. It creates a second search entry point on the map route. |
| `QuickSearchModal` | `src/pages/Map.jsx` near map root | `/map` | `quickSearchOpen === true` | Full search modal | Duplicate on map route | Remove from `/map` after `.dp-map-global-search-button` is removed. Keep global modal only outside map if needed. |
| `QuickSearchModal` | `src/components/Layout.jsx` | Non-map product routes | `showProductSearchButton` opens it; `showProductSearchButton` is false for `/map` | Product shell search modal | Separate global search | Keep outside `/map` only if it does not mount visible controls on map. |
| `QuickSearchModal` | `src/components/Navbar.jsx` | Routes with `Navbar` | Navbar search state opens it | Navbar search modal | Separate global search | Keep for marketing/nav routes only. Do not mount Navbar on `/map`. |
| `MapTopControls` | `src/components/map/MapTopControls.jsx` | Not mounted by `src/pages/Map.jsx` | Used only if a legacy `MapShell` path imports it | Legacy search/filter toolbar | Legacy | Do not mount on 5173 map. Deprecate after confirming no active product route depends on it. |
| `UnifiedSearchBar` | `src/components/map/unified/UnifiedSearchBar.jsx` | Not mounted by `src/pages/Map.jsx` | Used only by unified map shell paths | Legacy unified search | Legacy | Do not mount on 5173 map. Consolidate into `SearchIntentConsole` only if needed. |
| `UnifiedFilterChips` | `src/components/map/unified/UnifiedFilterChips.jsx` | Not mounted by `src/pages/Map.jsx` | Used only by unified map shell paths | Legacy unified filters | Legacy | Do not mount on 5173 map. Consolidate filters into `SearchIntentConsole`. |
| `UniversalSearch` | `src/components/shared/UniversalSearch.jsx` | Shared/unknown | Rendered only by imports outside current map route | Generic search | Legacy/shared | Do not mount on 5173 map. |
| `.dp-search-context-row` / `.dp-search-filter-rail` | CSS-only legacy classes in `src/index.css` and `src/styles/map-glass-final.css` | Applies if old markup is mounted | No current canonical map JSX owner found in `src/pages/Map.jsx` | Legacy styling | Legacy | Remove after verifying old `MapTopControls` and `UnifiedSearchBar` are not used in active routes. |

## Search Console Rule Enforcement

Required final state on `/map`:

```txt
Map page
└── .dp-map-search-anchor
    └── SearchIntentConsole
        ├── collapsed: Ask the Map only
        └── expanded: Search, suggested prompts, intent filters, brand filters
```

Forbidden on `/map`:

- `.dp-map-global-search-button`
- map-mounted `QuickSearchModal`
- `MapTopControls`
- `UnifiedSearchBar`
- `UnifiedFilterChips`
- `.dp-search-context-row`
- `.dp-search-filter-rail`
- any second toolbar or second search input

## Brand Filter Placement

Current canonical placement:

```txt
SearchIntentConsole
└── .dp-search-intent-filter-rail
```

This is the only allowed location for brand filters on the map route.

Forbidden locations:

- floating brand rail
- drawer header
- map overlay outside the console
- bottom navigation
- secondary filter tray

## Intent Filter Placement

Current canonical placement:

```txt
SearchIntentConsole
└── .dp-search-intent-prompt-rail
```

Allowed Level 1 intent set should be normalized to:

- All
- Perks
- Events
- Food
- Drinks
- Coffee
- Fitness
- Hotels
- Properties

Current implementation still includes additional labels in the console config, including `Explore`, `Art Walk`, `Parking`, and `Rentals`. These may be useful product intents, but they violate the requested strict Level 1 set and should move behind More Filters or the brand/context rail.

## Drawer Collision Audit

Current mount:

```txt
.dp-map-search-anchor
Context drawers/sheets
Bottom navigation
```

Because the search anchor is a sibling of drawers, not a child of the drawer, it should not move when drawers open. The risk is CSS collision, not JSX hierarchy.

Test states to verify after remediation:

- drawer closed
- drawer open at roughly `45vh`
- drawer tall at roughly `85vh`
- resident pass sheet
- partner campaign/report panels
- Legends directory sheet

## Root Causes Found

1. `SearchIntentConsole` and `QuickSearchModal` both mount inside `src/pages/Map.jsx`, creating two search systems on the map route.
2. `.dp-map-global-search-button` creates a second visible search entry point outside the Ask the Map rollup.
3. Legacy components (`MapTopControls`, `UnifiedSearchBar`, `UnifiedFilterChips`) still exist with overlapping responsibilities.
4. Legacy CSS classes (`.dp-search-context-row`, `.dp-search-filter-rail`, `.dp-search-segment`) remain in global styles and can affect old markup if mounted.
5. Brand filter styling has been repeatedly patched at the CSS tail, which increases cascade drift.

## Recommended Removal Order

1. Remove `.dp-map-global-search-button` from `src/pages/Map.jsx`.
2. Remove the `QuickSearchModal` state/import/render from `src/pages/Map.jsx`.
3. Keep `QuickSearchModal` only in `Layout.jsx` and `Navbar.jsx` for non-map routes.
4. Mark `MapTopControls`, `UnifiedSearchBar`, and `UnifiedFilterChips` as legacy and prevent imports from active 5173 routes.
5. Move non-Level-1 filters out of the primary prompt rail.
6. Consolidate all brand rail styling into one final block instead of multiple competing overrides.

## Acceptance Snapshot

Current state before removal:

- Search System count on `/map`: 2 visible entry points plus one modal path.
- Filter System count on `/map`: 1 canonical prompt rail, 1 canonical brand/context rail, legacy CSS still present.
- Drawer System count on `/map`: multiple drawer/sheet render paths.
- Navigation System count on `/map`: one bottom nav render path in `src/pages/Map.jsx`.

Target state:

- Search System: 1
- Filter System: 1
- Drawer System: 1
- Button System: 1
- Card System: 1
- Navigation System: 1
