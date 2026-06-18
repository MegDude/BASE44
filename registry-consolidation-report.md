# Downtown Perks Registry Consolidation Report

Target: `http://localhost:5173`

## Current Registry Landscape

### Entity Inventory

Primary:

- `src/data/mapRegistry.ts`
- `src/data/production/production-map-inventory.json`

Supporting:

- `src/data/happyHourInventory`
- `src/data/waterlooParkInventory`
- `src/data/waterlooParkCampaignPins`

### Image Registry

Primary:

- `src/lib/map/entityImageResolver.ts`
- `src/data/production/heroImageRegistry.ts`

Supporting:

- `src/data/downtownPerksEntityImages`
- `src/data/production/categoryFallbackRegistry.ts`
- `src/data/production/districtHeroRegistry.ts`

### Pin Registry

Primary:

- `src/lib/map/pinAssetRegistry.ts`
- `src/lib/map/entityPinResolver.ts`

Legacy/secondary:

- `src/components/map/mapUtils/markerIcons.jsx`

### Copy and Drawer Registry

Primary:

- `src/data/production/entityCopyRegistry.ts`
- `src/data/production/drawerContentRegistry.ts`
- `src/data/production/partnerCopyRegistry.ts`
- `src/data/production/buildingNarrativeRegistry.ts`
- `src/data/production/districtNarrativeRegistry.ts`

### Search and Intent Registry

Primary:

- `src/data/production/searchIntentRegistry.ts`
- `src/core/ask-map/AskMapEngine.js`
- `src/core/ask-map/AskMapPrompts.js`

### Action Registry

Primary:

- `src/lib/map/mapActionRegistry.ts`

## Consolidation Findings

### Strong Sources of Truth

These should be kept and elevated:

- `production-map-inventory.json` for production entity records.
- `entityImageResolver.ts` for image governance.
- `pinAssetRegistry.ts` for pin assets.
- `entityPinResolver.ts` for entity-to-pin logic.
- `mapActionRegistry.ts` for route/action wiring.
- `AskMapEngine.js` for intent-to-recommendation flow.

### Duplication Risks

1. Map state is split across three stores.
2. Navigation is rendered in at least two ways in `Map.jsx`.
3. Pin color/icon logic exists in both registry and legacy map utility code.
4. Search intent appears in both the command console config and production search registry.
5. Drawer content exists in both registries and large inline panel sections.

## Recommended Target Architecture

### Single Entity Registry

Source:

- `production-map-inventory.json`

Adapter:

- `normalizeEntity.ts`

Consumers:

- map markers
- drawers
- search
- Ask the Map
- quick search
- related content

### Single Image Registry

Source:

- `entityImageResolver.ts`

Inputs:

- entity id
- entity type
- context: pin, card, drawerHeader, nearbyRail, relatedRail

### Single Pin Registry

Source:

- `pinAssetRegistry.ts`

Resolver:

- `entityPinResolver.ts`

Rule:

- No component should import category color maps directly.

### Single Action Registry

Source:

- `mapActionRegistry.ts`

Rule:

- Buttons should route through this registry unless they call local UI-only actions like close/collapse.

### Single Search Intent Registry

Source:

- `searchIntentRegistry.ts`

Adapter:

- `AskMapEngine.js`

Rule:

- UI rails read from the same intent model used by the engine.

## Migration Order

1. Keep existing registries.
2. Add adapters that expose a unified interface.
3. Move read-only consumers first: result cards, drawer headers, quick search.
4. Move mutation/actions second: save, RSVP, directions, campaign launch.
5. Remove legacy utility maps only after all imports are gone.

## Current Pass Scope

This pass does not remove registries. It documents ownership and applies presentation-layer guardrails so consolidation can happen safely later.
