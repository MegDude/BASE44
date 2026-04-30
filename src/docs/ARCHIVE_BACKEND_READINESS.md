# Archive Backend Readiness

This repo now carries a backend-ready import layer built from the accessible archive packages.

## Imported Sources

- `src/data/archive-imports/raw/downtown_austin_locations_1775185538585.csv`
- `src/data/archive-imports/raw/downtown_austin_drawn_map_listings_1775518617289.csv`
- `src/docs/archive-contracts/perks-dashboard-openapi.yaml`

## Runtime Endpoints

- `GET /api/archive-manifest`
  - returns imported source metadata and summary counts
- `GET /api/archive-search?query=...`
  - searches imported location and listing records
- `GET /api/dashboard-snapshot`
  - returns a dashboard-oriented summary from the imported archive data
- `GET /api/partner-insights`
  - now exposed through the local app server route map

## Existing Endpoints Improved

- `GET /api/places`
  - now checks archive-backed downtown results first, then falls back to Google Places
- `POST /api/ask-map`
  - now returns archive-backed place suggestions when OpenAI is unavailable or returns no place list

## Current Scope

This pass stages the imported archive data into the live Node API surface that serves the app.
It does not replace the existing Supabase analytics layer or the shared map repository.
It gives the product a callable local catalog, searchable listings, and a backend summary surface
that can be pulled into future UI work without re-unpacking the source archives.
