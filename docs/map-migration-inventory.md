# Map migration inventory

Audit date: 2026-07-11

## Sources inspected

- Canonical localhost source: `/Users/megdude/Downloads/BASE44 2`, verified as the process working directory serving port `5173`.
- Clean integration checkout: `/Users/megdude/Documents/CLEAN MAP BUILD` on `codex/session-019f4f10-map-integration`.
- Deployed reference: `app.downtownperks.com/map` (content-validation reference; no presentation markup copied).

## Component inventory

| Area | Build source | Keep | Rebuild | Remove | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| Map shell | BASE44 `src/pages/Map.jsx` | Yes | Yes | No | Current verified behavior stays; split the monolith in a later architecture phase. |
| Google Maps loader | BASE44 `src/lib/googleMapsLoader` and `src/map/MapProvider` | Yes | No | Duplicate loaders | One active loader/provider path is imported by the map page. |
| Search console | BASE44 `SearchIntentConsole` | Yes | Partial | Old variants | Single-active-intent and clear behavior are included in this branch. |
| Resident navigation | BASE44 mobile tab registry and map page | Yes | No | Duplicate tab logic | Five-tab contract is covered by tests. |
| Partner navigation | BASE44 mobile tab registry and map page | Yes | Partial | Duplicate tab logic | Uses the shared tab shell; partner content remains mode-specific. |
| Filters | BASE44 search-intent registry/config | Yes | Partial | Stacked result behavior | Filter-before-marker rendering is retained. |
| Pins | BASE44 `GoogleMapCanvas` | Yes | Partial | Legacy custom variants | Preserve verified marker behavior; converge remaining exceptions later. |
| Clusters | BASE44 `GoogleMapCanvas` | Yes | Partial | Duplicate cluster helpers | Active renderer remains in the canonical page. |
| Drawers | BASE44 selected-entity panel | Yes | Yes | Parallel legacy panels | Current cadence is preserved; component extraction remains follow-up work. |
| Perks | BASE44 normalized/imported data and drawer | Yes | Partial | Expired/demo offers | Resident and partner copy must remain separated. |
| Events | BASE44 entity registry | Yes | Partial | Past active events | RSVP and calendar behavior require route QA. |
| Properties | BASE44 residential content library | Yes | No | Duplicates | Media reconciliation commit supplies verified content. |
| Hotels | BASE44 hospitality content library | Yes | No | Duplicates | Parent/child records use canonical adapters. |
| Venues | BASE44 map registries | Yes | Partial | Duplicate records | Continue dedupe by canonical ID. |
| Brands | BASE44 production registries | Yes | Partial | Demo-only entries | Approved logo exceptions only. |
| Civic | BASE44 civic discovery data | Yes | Partial | Stale collections | DAA and Waterloo collections remain governed data. |
| Services | BASE44 map registries | Yes | Partial | Misclassified records | Intent taxonomy tests cover service filters. |
| Saved | BASE44 unified map/action stores | Yes | Partial | Competing local state | Authentication boundary must remain explicit. |
| Resident card | BASE44 resident pass route | Yes | Partial | Generic QR behavior | No fabricated resident QR is permitted. |
| Partner tools | BASE44 partner workspace | Yes | No | Resident benefit copy | Map tabs link to partner-owned surfaces. |
| Authentication | BASE44 auth return path and resident sign-in | Yes | No | Deprecated redirects | New route files are included in this integration. |
| Analytics | BASE44 map events | Yes | Partial | Duplicate event names | Preserve existing events while state architecture converges. |
| Data source | BASE44 production registry plus adapters | Yes | Yes | Parallel raw registries | See `map-data-source-audit.md`. |

## Architecture gate

This integration does not claim the final clean-map completion definition. `src/pages/Map.jsx` and multiple historical store modules still exist. They must not be deleted during preservation work without replacement tests and route proof.
