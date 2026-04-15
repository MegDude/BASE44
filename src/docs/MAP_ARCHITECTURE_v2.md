# Downtown Perks Map Architecture v2

**Unified, validated, production-ready map system**

## Overview

The Downtown Perks map is now built on a stable, centralized architecture that serves as the single source of truth for all map entities, state, and interactions across the product.

This eliminates:
- NaN coordinate errors
- Fragmented data sources
- Inconsistent marker behavior
- Duplicate entity definitions
- State synchronization bugs

## Core Components

### 1. Centralized Data Layer (`/src/data/mapEntities.ts`)

**Single source of truth** for all plotted entities.

Every entity in the Downtown Perks ecosystem is defined once, validated once, and used everywhere.

```typescript
// Entity types supported
type MapEntityType = 
  | 'venue'
  | 'event'
  | 'perk'
  | 'building'
  | 'property'
  | 'hotel'
  | 'brand'
  | 'civic';

// All entities conform to MapEntity interface
interface MapEntity {
  id: string;
  name: string;
  type: MapEntityType;
  location: CoordinateLocation;  // Validated coordinates
  // ... additional fields ...
}

// Access functions
getValidPlottedEntities()      // All valid entities ready to render
getEntitiesByType()            // Filter by type
getEntitiesByDistrict()        // Filter by district
searchEntities()               // Full-text search
```

### 2. Coordinate Validation (`/src/lib/mapValidation.ts`)

**Strict validation** prevents NaN errors before they reach the map.

```typescript
// Core validation
isValidCoordinate(lat, lng)           // Returns boolean
validateCoordinateLocation(location)  // Validates location object
sanitizeCoordinates(lat, lng)         // Returns valid coords or fallback
filterValidEntities(entities)         // Filters array to valid only
getValidMapCenter(center, fallback)   // Ensures safe map center
```

**Result:** No invalid coordinates ever reach Leaflet or any map component.

### 3. Marker Factory (`/src/components/map/markers/MarkerFactory.tsx`)

**Unified marker rendering** with consistent visual language.

Every entity type has a branded marker style:

- **Standard venues**: Compact circular markers (color by category)
- **Buildings/properties**: Navy pill markers with building icon
- **Events**: Blue circular markers with calendar icon
- **Perks**: Green circular markers with tag icon
- **Brands**: Orange circular markers with star icon
- **Civic**: Red circular markers with landmark icon

```typescript
// Create markers based on state
createCompactMarker(entity)      // Standard unselected state
createSelectedMarker(entity)     // Highlighted/selected state
createPillMarker(entity)         // Expanded/detail state
createMarker(entity, options)    // Smart factory function
```

**Result:** Users instantly recognize entity types and interaction states.

### 4. Unified Map State Store (`/src/store/mapStateStore.ts`)

**Single source of truth** for all map-related state.

```typescript
// State managed by store
mapCenter: [lat, lng]
mapZoom: number
selectedEntityId: string | null
selectedEntity: MapEntity | null
drawerState: 'closed' | 'preview' | 'expanded' | 'fullscreen'

// Filters
activeFilters: {
  entityTypes: Set<string>
  categories: Set<VenueCategory>
  districts: Set<District>
  walkMinutes: number | null
  isOpenNow: boolean
  isLive: boolean
  isSaved: boolean
  isTrending: boolean
}

// Results
filteredResults: MapEntity[]
viewMode: 'explore' | 'places' | 'events' | 'perks' | 'buildings' | 'partners' | 'resident' | 'list'

// Actions
selectEntity(entity)          // Select a pin
setMapCenter(center)          // Pan map (validated)
setMapZoom(zoom)             // Zoom map
updateFilter(key, value)     // Update any filter
setViewMode(mode)            // Change view
toggleSaved(entityId)        // Save/unsave
clearFilters()               // Reset all filters
```

**Result:** All UI components stay synchronized with a single, predictable state.

## Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│  Centralized Data Layer                     │
│  /src/data/mapEntities.ts                   │
│  - All entities defined once                │
│  - Coordinate validation enforced           │
│  - Export helpers for filtering/search      │
└─────────────────┬───────────────────────────┘
                  │
                  ├─→ Map State Store
                  │   /src/store/mapStateStore.ts
                  │   - Manages all UI state
                  │   - Filters applied here
                  │   - Selection/drawer state
                  │
                  ├─→ Marker Factory
                  │   /src/components/map/markers/MarkerFactory.tsx
                  │   - Renders markers by type
                  │   - Handles selected/hovered states
                  │
                  └─→ Map Components
                      /src/components/map/unified/*
                      - UnifiedMapShell
                      - UnifiedSearchBar
                      - UnifiedFilterChips
                      - UnifiedDrawer
                      - etc.
```

## Usage Examples

### In a map component

```typescript
import { useMapStateStore } from '@/store/mapStateStore';
import { getValidPlottedEntities } from '@/data/mapEntities';
import { createMarker } from '@/components/map/markers/MarkerFactory';

export default function MyMapComponent() {
  const store = useMapStateStore();
  const allEntities = getValidPlottedEntities();

  // All coordinates are guaranteed valid
  const markers = allEntities.map(entity => ({
    id: entity.id,
    position: [entity.location.latitude, entity.location.longitude],
    icon: createMarker(entity, { isSelected: store.selectedEntityId === entity.id }),
  }));

  return (
    // Render markers...
  );
}
```

### Filtering entities

```typescript
// By type
const venues = getEntitiesByType('venue');

// By district
const raineyEntities = getEntitiesByDistrict('rainey');

// By search
const results = searchEntities('coffee');

// Custom filter
const openNow = getValidPlottedEntities()
  .filter(e => e.isOpenNow)
  .filter(e => e.metadata?.walkMinutes && e.metadata.walkMinutes <= 5);
```

### Updating state

```typescript
const store = useMapStateStore();

// Select an entity
store.selectEntity(venueEntity);

// Update filters
store.updateFilter('entityTypes', new Set(['venue', 'event']));
store.updateFilter('walkMinutes', 10);

// Change view
store.setViewMode('partners');

// Save entity
store.toggleSaved('venue-merit-coffee');

// Pan map
store.setMapCenter([30.267, -97.743]);
```

## Key Principles

### 1. Validation First

Every coordinate is validated **immediately** when data is loaded:
- Must be a valid number
- Must not be NaN
- Must not be Infinity
- Must fall within Austin geographic bounds

No unvalidated data ever reaches rendering.

### 2. Single Source of Truth

- **Data**: `/src/data/mapEntities.ts` (not scattered in components)
- **State**: `/src/store/mapStateStore.ts` (not multiple Redux stores or context)
- **Markers**: `/src/components/map/markers/MarkerFactory.tsx` (not inline icon logic)

### 3. Type Safety

All entity types are defined in TypeScript:
- `MapEntity` interface ensures consistent structure
- `MapEntityType` union ensures valid types
- Store state is fully typed

### 4. Immutability

State updates use Zustand's immutable patterns:
- `set()` always creates new state objects
- Filters use `new Set()` for immutable collection updates
- No direct mutation of stored data

## Extensibility

### Adding a new entity type

1. Add type to `MapEntityType` union in `/src/data/mapEntities.ts`
2. Add entity to `MAP_ENTITIES` array
3. Add marker config to `MARKER_CONFIG` in `/src/components/map/markers/MarkerFactory.tsx`
4. Add filter logic in map components as needed

### Adding a new filter

1. Add field to `ActiveFilters` interface in `/src/store/mapStateStore.ts`
2. Add toggle action in store
3. Add filter logic in ExploreRebuilt or consuming component

### Adding a new view mode

1. Add mode to `ViewMode` type in `/src/store/mapStateStore.ts`
2. Add view logic in map components
3. Update marker factory if visual changes needed

## Migration Path

Existing map components now use this architecture:

- ✅ `/pages/downtown-perks/ExploreRebuilt.jsx` → uses new store + data layer
- ✅ `/components/map/unified/UnifiedMapShell.jsx` → uses validated coordinates
- ✅ Marker rendering → uses MarkerFactory

### Components still to migrate

- `/pages/resident-app/index` (should use same data + store)
- Other map surfaces as they are rebuilt

## Testing & QA

### Data validation

```typescript
// Test coordinate validation
import { isValidCoordinate, validateCoordinateBatch } from '@/lib/mapValidation';

expect(isValidCoordinate(30.267, -97.743)).toBe(true);
expect(isValidCoordinate(NaN, -97.743)).toBe(false);
expect(isValidCoordinate(null, -97.743)).toBe(false);
```

### Entity loading

```typescript
// Test all entities are valid
import { getValidPlottedEntities } from '@/data/mapEntities';

const entities = getValidPlottedEntities();
entities.forEach(e => {
  expect(e.location.valid).toBe(true);
  expect(e.location.latitude).toBeDefined();
  expect(e.location.longitude).toBeDefined();
});
```

### State management

```typescript
// Test store actions
const store = useMapStateStore.getState();
store.selectEntity(someEntity);
expect(store.selectedEntity).toEqual(someEntity);
```

## Performance Considerations

### Data loading

- All entities loaded once at app start
- Validation happens in-memory, not on every render
- Search uses simple string matching (can be indexed if needed)

### State updates

- Zustand uses atomic updates (no re-renders on unrelated state)
- Use selectors to optimize subscriptions
- Filter operations are synchronous and fast for reasonable entity counts

### Marker rendering

- Leaflet efficiently re-renders only changed markers
- Marker factory is pure function (can be memoized)
- Icons are pre-generated, not computed on each render

## Future Improvements

1. **Database integration**: Replace `MAP_ENTITIES` array with real-time entity API
2. **Advanced search**: Add full-text search index for faster queries
3. **Popularity scoring**: Pre-compute trending/popular scores in data
4. **Caching**: Cache filtered results, invalidate on data changes
5. **Analytics**: Track entity interactions to inform sorting
6. **Clustering**: Implement marker clustering for dense maps
7. **Accessibility**: Add ARIA labels and keyboard navigation

## Documentation Files

- This file: Overall architecture and principles
- `/src/data/mapEntities.ts`: Data layer types and entity definitions
- `/src/lib/mapValidation.ts`: Validation functions and rules
- `/src/components/map/markers/MarkerFactory.tsx`: Marker system and styling
- `/src/store/mapStateStore.ts`: State management and actions