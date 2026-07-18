# Current BASE44 map audit

Date: 2026-07-16
Active implementation source: `/Users/megdude/Downloads/BASE44 2`
Safety branch: `codex/native-map-sheet-consolidation-20260716`

## Controlling decision

`/Users/megdude/Downloads/BASE44 2` is the only active implementation source for the resident map rebuild. Other local workspaces and deployments are references only.

## Pre-existing worktree state

Before this pass:

- branch: `main`
- HEAD: `4d6f759aefc7e53368700bfbff52a1bfdb8b61b8`
- worktree: dirty, with many modified and untracked files
- running app: `127.0.0.1:5173`
- running process cwd: `/Users/megdude/Downloads/BASE44 2`

This pass preserved existing dirty files and created a safety branch before edits.

## Audit table

| Area | Component/file | State source | Working | Problem | Decision |
| ---- | -------------- | ------------ | ------: | ------- | -------- |
| Route entry | `src/App.jsx` | React Router | Yes | `/resident/home` can still be confused with the map experience | Keep `/map` as the only map owner; keep `/app/map` redirect-only and document `/resident` separately. |
| Map page | `src/pages/Map.jsx` | URL + local component state | Yes | Very large component owns search, map, panels, entity detail, partner panels, QR, and bottom nav | Migrate gradually to shared sheet and content modules. |
| Google loader | `src/lib/googleMapsLoader.ts` | `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` | Local works when env is present | Deployed preview falls into map error state when env/config missing or invalid | Keep loader; fix deployment env/referrer config. |
| Map ID | `src/pages/Map.jsx`, `src/features/native-map/NativeMapShell.tsx`, `vite.config.js` | `VITE_GOOGLE_MAP_ID` / `VITE_GOOGLE_MAPS_MAP_ID` | Supported | Multiple names exist but are normalized in Vite config | Document both names; prefer one canonical public var later. |
| Map error state | `src/pages/Map.jsx` | loader error/config error | Yes | Deployed preview shows generic map unavailable state | Keep graceful fallback, but repair env so valid deployment loads map. |
| Marker renderer | `src/pages/Map.jsx`, `src/lib/map/entityPinResolver.ts`, `src/lib/maps/*` | entity type/filter/selected state | Partially | Multiple pin/logo paths and fallback systems exist | Do not replace until sheet state is stable; preserve current canvas. |
| Collection resolver | `src/data/mapCollections.ts`, `src/pages/Map.jsx` | `collection` URL param + `matchesCollection` | Partially | `events-nearby` was missing from alias and matcher logic | Fixed in this pass. |
| Filter resolver | `src/pages/Map.jsx`, search intent registry | active filter URL/state | Mostly | Filter and collection can conflict when collection has no explicit matcher | Keep filter aliases aligned with collection IDs. |
| Search resolver | `src/hooks/useSearchDrivenMapEntities.js` | scoped search state | Works | Search and collection hydration can double-filter | Audit during NativeSheet migration. |
| Ask the Map | `src/pages/Map.jsx`, search console components/config | `consoleCollapsed`, search/filter state | Works visually | Collapsed and expanded states can leak interactive DOM | Require two-state console: collapsed or expanded, never both interactive. |
| Resident/partner mode | `src/pages/Map.jsx` | `mode` URL param | Works | Partner panels append operational logic into resident map shell | Same mechanics, separate partner content priorities. |
| Selected entity | `src/pages/Map.jsx` | `selectedId`, `entityId`, overrides | Works | Multiple booleans control close/minimized/detail behavior | Replace with sheet reducer. |
| Panels/drawers | `src/pages/Map.jsx`, `CollectionRoutePanel`, QR modals, native-map prototype | many booleans and URL tabs | Works but fragile | Multiple sheet engines coexist | Build one NativeSheet engine. |
| Resident Home | `src/components/resident/dashboard/DashboardPage.tsx` | `panel` query param + local storage | Works | Too many dashboard modules; duplicates Map/Perks/Events/Card | Reduce to concise launch surface. |
| Auth return | `src/lib/authReturnPath.ts`, onboarding state, auth pages | URL/session state | Partially | Must preserve initiating perk/event/card context | Include in sheet state model. |
| Bottom navigation | `src/components/resident/ResidentMobileTabBar.tsx`, `Map.jsx` | route/tab state | Works | Builds have alternated between Saved and Home tab models | Lock to Home / Map / Perks / Events / Card for this milestone. |
| Card route | `Map.jsx`, Resident Home card panel, card storage | local resident card utilities | Works locally | QR/card split across multiple surfaces | Treat card as focused task. |
| Event actions | `Map.jsx`, event detail drawer, RSVP store | event data + saved/RVSP state | Partially | Events Nearby returned 0 because collection mismatch | Fixed collection mismatch; sheet migration remains. |
| Perk actions | `Map.jsx`, QR/redemption sheet | selected entity + auth state | Works but separate | Redeem/auth return not in one sheet hierarchy | Move to focused Detail task later. |
| Save actions | local storage/store | saved IDs | Works | Needs no-close update semantics in Detail | Preserve during migration. |
| Directions actions | map action registry / Google directions URL | entity coordinates | Works | Must remain available in Detail | Preserve. |

## Separate state booleans/patterns to consolidate

Known current panel and sheet controls include:

- `clusterDrawer`
- `selectedDrawerClosed`
- `selectedDrawerMinimized`
- `nativeDrawerState`
- `activePartnerPanel`
- `filtersOpen`
- `neighborhoodsOpen`
- `intelOpen`
- `aboutOpen`
- `perkRedemption`
- URL tab/panel states used as drawer substitutes

These should be replaced or wrapped by:

```text
SheetLevel = "peek" | "browse" | "detail"
SheetContext = "results" | "collection" | "entity" | "event" | "perk" | "route" | "property" | "hotel" | "partner-entity" | "campaign" | "filter" | "auth"
```

## Immediate implementation decision

The first code fix is the Events Nearby collection/data mismatch. Do not begin sheet migration until this route can show correct event results or a truthful event-specific empty state.
