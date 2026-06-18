# Downtown Perks Map UI Inventory

Target: `http://localhost:5173`

## Route Inventory

Primary app routes are defined in `src/App.jsx`.

Core resident/product routes:

- `/`
- `/map`
- `/ask-map`
- `/residents`
- `/explore`
- `/events`
- `/perks`
- `/card`

Partner routes:

- `/partners`
- `/partners/apply`
- `/partners/pricing`
- `/partners/properties`
- `/partners/hotels`
- `/partners/venues`
- `/partners/brands`
- `/partners/directory`
- `/partners/civic`
- `/partners/real-estate`
- `/partners/legends`
- `/partners/dashboard`
- `/partners/dashboard/map`
- `/partners/campaigns`
- `/partners/happy-hours`
- `/partners/reports`
- `/partners/reporting`
- `/partners/analytics`
- `/partners/map`

Partner workspace routes:

- `/partner-workspace/overview`
- `/partner-workspace/map`
- `/partner-workspace/offers`
- `/partner-workspace/perks`
- `/partner-workspace/parking`
- `/partner-workspace/events`
- `/partner-workspace/sources`
- `/partner-workspace/profile`
- `/partner-workspace/campaigns`
- `/partner-workspace/residents`
- `/partner-workspace/buildings`
- `/partner-workspace/messages`
- `/partner-workspace/surveys`
- `/partner-workspace/team`
- `/partner-workspace/billing`
- `/partner-workspace/reports`
- `/partner-workspace/analytics`

Marketing routes are present under `/marketing/*`, but the map product governance scope treats them as secondary unless they share map components.

## Map Components

Map runtime:

- `src/pages/Map.jsx`
- `src/components/map/MapShell.jsx`
- `src/components/map/MapView.jsx`
- `src/components/map/MapTopControls.jsx`
- `src/components/map/MapResultsPanel.jsx`
- `src/components/map/MapDetailDrawer.jsx`
- `src/components/map/HeatmapLayer.jsx`
- `src/components/map/HeatmapControls.jsx`
- `src/components/map/WhyThisChip.jsx`

Unified map components:

- `src/components/map/unified/UnifiedMapShell.jsx`
- `src/components/map/unified/UnifiedDrawer.jsx`
- `src/components/map/unified/UnifiedResultsPanel.jsx`
- `src/components/map/unified/UnifiedSearchBar.jsx`
- `src/components/map/unified/UnifiedFilterChips.jsx`
- `src/components/map/unified/DrawerActions.jsx`
- `src/components/map/unified/TimeFilter.jsx`
- `src/components/map/unified/EntityIdentityPanel.tsx`

Entity-specific drawer components:

- `src/components/map/drawers/LegendsPropertyDrawer.tsx`
- `src/components/map/drawers/LegendsPropertyPanel.tsx`

Adapters:

- `src/components/map/mapAdapters/EventMapAdapter.jsx`
- `src/components/map/mapAdapters/VenueMapAdapter.jsx`

Utilities:

- `src/components/map/mapUtils/filterLogic.jsx`
- `src/components/map/mapUtils/markerIcons.jsx`
- `src/components/map/markers/MarkerFactory.jsx`

## Pins, Markers, and Clusters

Current marker factory:

- `src/components/map/markers/MarkerFactory.jsx`

Pin resolution:

- `src/lib/map/entityPinResolver.ts`
- `src/lib/map/pinAssetRegistry.ts`

Current pin variants include:

- coffee
- dining
- nightlife
- wellness
- property
- residential
- hotel
- event
- happy-hour
- civic
- retail
- parking
- mobility
- park
- culture
- brand
- campaign
- analytics
- offer
- inKind
- DANA
- Legends
- service
- guide
- journal

Notes:

- `MarkerFactory.jsx` currently renders direct SVG/logo pins without circular backplates.
- `pinAssetRegistry.ts` centralizes most pin glyphs and brand logo assets.
- `entityPinResolver.ts` provides the strongest single rule layer for mapping entity text/type/source to pin variants.
- Legacy `mapUtils/markerIcons.jsx` still contains separate category color maps and should be treated as a consolidation candidate.

## Search and Ask System

Ask/data engine:

- `src/core/ask-map/AskMapEngine.js`
- `src/core/ask-map/AskMapProvider.jsx`
- `src/core/ask-map/AskMapContext.jsx`
- `src/core/ask-map/AskMapActions.js`
- `src/core/ask-map/AskMapPrompts.js`
- `src/core/ask-map/AskMapAnalytics.js`
- `src/api/ask-map.ts`
- `src/api/partner/ask-map.ts`
- `src/lib/intelligence/askMapService.ts`
- `src/lib/intelligence/pulseEngine.ts`
- `src/lib/intelligence/agentMemory.ts`
- `src/pages/AskMapAgent.jsx`

In-map command console:

- Implemented in `src/pages/Map.jsx` as `SearchIntentConsole`.
- Styled via `src/styles/dp-recovery-final.css`.
- Uses resident and partner mode configs from `SEARCH_CONSOLE_MODE_CONFIG`.
- Prompt rail is Level 1 intent.
- Featured pin rail is currently brand/entity shortcut rail.

## Navigation

Bottom navigation paths:

- `MapBottomNav` component around `src/pages/Map.jsx`.
- A second direct fixed bottom navigation render path around the resident/partner tab panels.

Resident tabs:

- Map
- Perks
- Events
- Saved
- Card

Partner tabs:

- Map
- Campaigns
- Activity
- Reports
- Info

Governance note:

- Two bottom navigation render paths create a design drift risk. Both must be normalized by shared classes or consolidated into one component.

## Drawers, Panels, and Sheets

Map drawers and sheets are primarily in `src/pages/Map.jsx`, with legacy and unified drawers still present:

- `MapDetailDrawer`
- `UnifiedDrawer`
- `dp-map-drawer-shell`
- `dp-panel-shell`
- `dp-map-directory-sheet`
- `dp-resident-card-sheet`
- `dp-map-sheet`
- partner campaign/report/info drawer panels
- Legends directory drawer

Drawer governance target:

1. Header image or hero
2. Title
3. Meta row
4. Primary actions
5. Story/content
6. Related content
7. Footer action

## Cards and Entity Surfaces

Property/listing surfaces:

- Legends drawer/panel components
- entity image resolver premium property image sets
- in-map residential and listing panels in `Map.jsx`

Venue/event/perk surfaces:

- `VenueMapAdapter`
- `EventMapAdapter`
- map panel sections in `Map.jsx`
- production drawer content and entity copy registries

Resident card:

- `/card`
- `/map?mode=resident&tab=pass`
- resident card sheet in `Map.jsx`

Partner surfaces:

- `/partners/dashboard`
- `/partners/campaigns`
- `/partners/reports`
- `/partner-workspace/*`
- partner mode map panels in `Map.jsx`

## Stores and State

Map state stores:

- `src/store/map-store.js`
- `src/store/mapStateStore.ts`
- `src/store/unified-map-store.js`

Other product stores:

- `src/store/resident-store.js`
- `src/store/event-rsvp-store.js`

Governance note:

- Multiple map stores exist. Short term, do not remove them. Long term, consolidate command/search/selection/drawer state around one map store and use adapters for old components.

## Registries

Top-level inventory:

- `src/data/mapRegistry.ts`

Production registries:

- `src/data/production/production-map-inventory.json`
- `src/data/production/heroImageRegistry.ts`
- `src/data/production/entityCopyRegistry.ts`
- `src/data/production/partnerCopyRegistry.ts`
- `src/data/production/drawerContentRegistry.ts`
- `src/data/production/districtHeroRegistry.ts`
- `src/data/production/categoryFallbackRegistry.ts`
- `src/data/production/buildingNarrativeRegistry.ts`
- `src/data/production/districtNarrativeRegistry.ts`
- `src/data/production/legendsMLSRegistry.ts`
- `src/data/production/searchIntentRegistry.ts`
- `src/data/production/campaignAssetRegistry.ts`

Map library registries/resolvers:

- `src/lib/map/entityImageResolver.ts`
- `src/lib/map/entityPinResolver.ts`
- `src/lib/map/pinAssetRegistry.ts`
- `src/lib/map/mapActionRegistry.ts`
- `src/lib/map/rankMapEntities.ts`
- `src/lib/map/normalizeEntity.ts`

## Shared UI

Relevant shared UI lives across:

- `src/components/ui/*`
- `src/components/layout/*`
- `src/components/system/*`
- `src/styles/dp-recovery-final.css`

The strongest current design-system enforcement point is `src/styles/dp-recovery-final.css`.
