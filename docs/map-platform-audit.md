# Map Platform Audit

## Current State

The map product has extensive frontend registries and production data:

- `src/data/map/mapEntityRegistry.ts`
- `src/data/map/mapEntityRegistry.generated.json`
- `src/data/production/production-map-inventory.json`
- `src/data/supplementalMapEntities.js`
- `src/lib/useLocations.js`

The operations platform has:

- `MapEntityLink`: 493
- `PartnerLocation`: 481
- `PlatformTenant`: 352
- `PartnerQrExperience`: 345

## Required Runtime Rule

Every visible pin should resolve to an operational record:

`pin -> map_entity_link -> tenant/workspace -> partner/location/perk/event/campaign/report`

## Gap

The frontend data registry is richer than the current operations API contract. The next build step should add:

- `GET /api/map/entities`
- `GET /api/map/pins`
- `GET /api/map/entities/:id`
- `POST /api/map/events`

and update the 5173 map loader to prefer those endpoints before falling back to local seed data.

## No-Fake-Pin Rule

Pins without a backend entity relationship should be classified as seed candidates and kept out of production resident/partner mode until imported into 3014.
