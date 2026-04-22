# Preservation Rebuild Audit — 2026-04-22

Source references audited for parity:

- `/Users/megdude/harmony-homes-copy-02f82b0c (3).zip`
  - `src/ROUTES.md`
  - `src/COMPONENT_INVENTORY.md`
  - `src/pages/Buildings.jsx`
  - `src/pages/BuildingEngagement.jsx`
  - `src/pages/PartnerDashboard.jsx`
  - `src/components/dashboard/DynamicBuildingOverview.jsx`
- `/Users/megdude/downtown-perks-platform 2.zip`
- `/Users/megdude/BASE44 2.zip`

Active deployable repo:

- `/Users/megdude/Downloads/BASE44-working`
- Vercel-linked project: `base-44`

## Current live shell already present

- Public map/discovery routes
- Downtown Perks resident app
- Partner landing and partner type pages
- Partner workspace
- Dashboard / intelligence hub
- Unified map shell
- Public auth-free browse behavior

## Main parity gap identified

The largest missing source layer was the Harmony-style building intelligence system:

- canonical building routes
- building-specific overview
- resident roster context
- amenities + reservation flow
- maintenance status
- reports / attribution
- partner network attached to a building

## Integration completed in this pass

Added canonical building route family in the live app:

- `/buildings/:buildingId`
- `/buildings/:buildingId/residents`
- `/buildings/:buildingId/amenities`
- `/buildings/:buildingId/maintenance`
- `/buildings/:buildingId/reports`
- `/buildings/:buildingId/partners`

Added property aliases:

- `/properties/:buildingId`
- matching subroutes for residents / amenities / maintenance / reports / partners

Added shared building intelligence shell:

- `src/pages/BuildingIntelligence.jsx`
- `src/data/buildingIntelligence.js`

Updated live entry points:

- resident buildings tab now links into the canonical building routes
- `ForBuildings` now links into a real building intelligence page instead of a generic explore route

## Preservation rule applied

This pass preserved the existing Downtown Perks route structure and live shell, and only layered in the missing operational building system from the source archives. It did not reinterpret the existing resident, map, partner, or dashboard product direction.
