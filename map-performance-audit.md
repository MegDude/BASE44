# Downtown Perks Map Performance Audit

Target: `http://localhost:5173`

This audit is source-based. Browser profiling was not completed in this pass, so timings below are governance targets rather than measured runtime results.

## Performance Targets

- Drawer open: less than 100ms perceived response
- Filter update: less than 50ms state response before rendering
- Map interactions: 60fps
- Media: lazy loaded unless immediately visible
- Search: no blocking synchronous work on keypress

## Source Findings

### Map Rendering

Primary map rendering is anchored in `src/pages/Map.jsx` with supporting components in `src/components/map/*`.

Risk:

- `Map.jsx` is very large and includes routing, search, drawers, resident card, partner panels, and entity panels. This increases re-render risk and makes performance regressions harder to isolate.

Recommendation:

- Extract command center, bottom nav, resident card sheet, partner panels, and entity drawers into memoized components after visual governance stabilizes.

### Marker Rendering

Marker rendering flows through:

- `MarkerFactory.jsx`
- `entityPinResolver.ts`
- `pinAssetRegistry.ts`

Strength:

- Pin resolution is centralized enough for memoization and consistency.

Risk:

- Inline HTML strings are generated per marker. If markers are recreated on every filter/search change, that can become expensive.

Recommendation:

- Memoize resolved pin HTML by entity id + selected state.
- Keep selected marker generation separate from normal marker generation.

### Search and Filter Performance

Search intent UI is rendered in `Map.jsx`.

Ask engine:

- `AskMapEngine.js` performs simple intent detection and candidate filtering.
- `rankMapEntities.ts` normalizes and sorts entities.

Risk:

- Ranking/filtering can become expensive if run on every keystroke with a large inventory.

Recommendation:

- Debounce text input.
- Memoize normalized entity haystacks.
- Keep top 6 recommendation return as a default.

### Drawer Rendering

Multiple drawer systems exist:

- `MapDetailDrawer`
- `UnifiedDrawer`
- large drawer sections in `Map.jsx`

Risk:

- Multiple systems duplicate scroll logic and styles.
- Full drawers include nested content and images that may load immediately.

Recommendation:

- Use one universal drawer shell.
- Lazy-load media below the hero.
- Keep only the selected drawer mounted.

### Image Loading

Image resolution is centralized in:

- `entityImageResolver.ts`
- `heroImageRegistry.ts`

Strength:

- Entity-specific image governance exists, including premium property and venue image sets.

Risk:

- Large hero images can affect drawer open if not sized and lazy-loaded carefully.

Recommendation:

- Use fixed hero dimensions.
- Use `loading="lazy"` except for currently selected hero.
- Reserve dimensions to avoid layout shift.

### Store and State Performance

Stores:

- `map-store.js`
- `mapStateStore.ts`
- `unified-map-store.js`

Risk:

- Overlapping stores make it easy for components to subscribe to more state than they need.

Recommendation:

- Use selector hooks for map center, selected entity, filters, drawer state.
- Long-term consolidate around one store.

## Applied Performance Guardrails

- CSS caps command center height and drawer max-height to preserve map interaction.
- Bottom nav uses fixed dimensions to prevent layout jumps.
- Rails stay single-row horizontal scroll instead of wrapping into layout-shifting grids.

## Follow-Up Profiling Checklist

- Record map load and first marker render in Chrome Performance.
- Confirm no console errors on route `/map?mode=resident&tab=map&filter=All`.
- Test filter response on All, Perks, Events, Civic, Parking, Legends, inKind.
- Test drawer open for venue, property, event, perk, civic, hotel, partner.
- Test image waterfall on drawer open.
