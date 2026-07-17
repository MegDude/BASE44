# Resident Map v1 Freeze

Date: 2026-07-14

## Decision

The legacy resident map implementation is frozen as prototype v1. It remains in Git history and in the working tree only to preserve partner-map continuity during the architecture cutover.

New resident-map work should not be added to `src/pages/Map.jsx`.

## Active resident implementation

- Canonical resident route: `/map?mode=resident`; `/app/map` is redirect-only
- Active page: `src/pages/ResidentMap.jsx`
- Active shell: `src/features/native-map/NativeMapShell.tsx`
- Active shell styles: `src/features/native-map/native-map.css`
- Active state machine: `src/features/native-map/map-ui.machine.ts`
- Active UI store: `src/features/native-map/map-ui.store.ts`
- Active sheet renderer: `src/features/native-map/EntitySheetRenderer.tsx`
- Active bottom sheet: `src/features/native-map/NativeBottomSheet.tsx`
- Active search surface: `src/features/native-map/SearchCommandSurface.tsx`
- Active bottom navigation: `src/features/native-map/MapBottomNavigation.tsx`
- App entry styles: `src/main.jsx` must not import legacy map, drawer, sheet, search-console, or map-regression CSS.

## Legacy implementation retained temporarily

- `src/pages/Map.jsx`
- `src/pages/legacyMapStyles.js`

These files are still used for partner-mode map surfaces and should not be merged back into the resident route. The resident route has been disconnected through `AuthenticatedResidentMap` in `src/App.jsx`.

Legacy map-specific CSS has been moved behind `src/pages/legacyMapStyles.js` so it loads with the legacy map page instead of leaking through the whole application.

## Architecture rule

Resident map changes now belong in isolated modules:

```text
ResidentMap
└── NativeMapShell
    ├── map-ui.machine
    ├── map-ui.store
    ├── useMapViewportInsets
    ├── SearchCommandSurface
    ├── NativeBottomSheet
    ├── EntitySheetRenderer
    ├── MapBottomNavigation
    └── analytics-ready actions
```

Do not reintroduce:

- marketing hero sections
- duplicate drawer systems
- floating one-off back buttons
- page-specific z-index fixes
- prototype animation blocks
- broad late-stage CSS locks

## Follow-up cleanup

After partner map behavior is separated from `src/pages/Map.jsx`, delete or archive the remaining legacy resident-map styles and prototype helpers in a separate cleanup commit.
