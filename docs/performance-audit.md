# Performance Audit

## Performance Rule

The platform should become simpler as it grows: fewer duplicated components, fewer duplicate data paths, fewer page-level listeners, fewer static registries in runtime bundles, and fewer late CSS overrides.

## Current Risks

- Large `src/pages/Map.jsx` owns many concerns and can increase render cost.
- Multiple late CSS files increase cascade complexity.
- Static entity/data registries may inflate frontend bundle size.
- Map surfaces combine drawers, search, filters, entities, recommendation logic, workflow dispatch, and AI context in one page.
- Partner workspace and dashboard still mix data loading and presentation.
- Backend concentrates many routes in one server file, making query/performance ownership harder to isolate.

## Required Performance Work

1. Split map page into data hooks, drawer components, search console, and map renderer.
2. Lazy-load heavy partner workspace/report/campaign modules.
3. Replace local registries with paginated/filtered backend map APIs.
4. Cache map entity responses by viewport, filter, and mode.
5. Add request timing and error metrics for agent, map, report, checkout, and search APIs.
6. Consolidate CSS layers into shared primitives to reduce style recalculation risk.

## Current Score

Performance score: **6/10**. The app is functional, but production performance depends on domain/data consolidation and route-level lazy loading.
