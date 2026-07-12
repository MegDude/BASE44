# Map data-source audit

Audit date: 2026-07-11

| Source | Classification | Decision |
| --- | --- | --- |
| `src/data/map/mapRegistry.production.json` | Canonical production registry | Keep as the production inventory input. |
| `src/data/map/mapEntityRegistry.ts` and schema/validation modules | Canonical adapter layer | Keep; require IDs, entity type, coordinates, and active-state validation. |
| `src/data/production/*Registry.ts` | Canonical content registries | Keep for copy, media, search intent, drawer, campaign, and district metadata. |
| `src/data/hospitalityContentLibrary.js` | Canonical migrated content | Keep; parent/child hospitality entities were reconciled in the preserved commit. |
| `src/data/residentialMixedUseContentLibrary.js` | Canonical migrated content | Keep; residential/mixed-use content and media were reconciled in the preserved commit. |
| `src/data/imports/launchMapPins*` | Imported source | Normalize through adapters; do not render raw records directly. |
| `src/data/imports/*.csv` | Source evidence | Keep as migration provenance, not runtime UI objects. |
| `src/data/map/mapRegistry.raw.json` | Outdated/raw | Audit-only; never select directly for production rendering. |
| `src/data/map/mapRegistry.classified.json` | Intermediate | Audit/build input only. |
| `src/data/map/mapRegistry.curated.json` | Intermediate | Audit/build input only. |
| `src/data/map/mapEntityRegistry.browserExtract.json` | Reference extract | Validation reference only. |
| `src/data/map/mapEntityRegistry.manualReview.json` | Incomplete/manual review | Must not be promoted without review. |
| `src/data/map/mapEntityRegistry.seed.json` | Demo/seed | Exclude from production rendering unless normalized and approved. |
| `/Users/megdude/Downloads/LAUNCHPERKS/src/data/mapEntities.ts` | Legacy reference | Do not merge; compare only for missing verified features/content. |

## Validation rules

- Runtime pins, lists, search results, and drawers must receive normalized canonical entities.
- Duplicate IDs, missing active coordinates, expired active perks, and past active events are release blockers.
- Raw, seed, browser-extracted, and manual-review files are never direct production render sources.
- Resident and partner copy are selected through mode-aware content adapters.
- Counts are derived from the active filtered normalized dataset.

## Known convergence work

The repository contains `map-store.js`, `mapStateStore.ts`, `unified-map-store.js`, and event/action persistence stores. Their responsibilities must be reduced deliberately behind tests; preservation work must not delete them speculatively.
