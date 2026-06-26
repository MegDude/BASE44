# Frontend Service Inventory

Target: `localhost:5173`

## Product API Handlers

The product app contains serverless-style handlers under `api/`, including:

- `ask-map`
- `partner/ask-map`
- `track`
- `save`
- `redeem`
- `visit`
- `interaction`
- `impression`
- `search-log`
- `campaign-requests`
- `contact`
- `listing-interest`
- `now-signal`
- `stripe/create-checkout-session`
- survey response endpoints

## Client Utilities

- `src/lib/backendWorkflows.ts`: shared workflow POST/fire-and-forget utility.
- `src/lib/analytics/track.ts`: typed map analytics actions.
- `src/api/ask-map.ts`: Ask the Map client.
- `src/api/partner/ask-map.ts`: partner Ask the Map client.
- `src/lib/supabase/*`: Supabase client/server helpers.
- `src/data/map/*`: map entity registry.
- `src/data/production/*`: production content/data registries.

## Corrective Integration Added

`src/lib/backendWorkflows.ts` now mirrors `fireWorkflow()` actions into the 3014 operations platform by creating `TenantAuditLog` records through:

`POST http://localhost:3014/api/entities/TenantAuditLog`

This gives 5173 actions an operational audit trail even when the local product API route is unavailable.

## Remaining Gap

The frontend still needs a dedicated operations API client for first-class reads:

- map entities
- workspace bundles
- partner reports
- partner campaigns
- perks
- events
- QR status
- AI context
