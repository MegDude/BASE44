# Backend Service Inventory

Target: `localhost:3014`

## Persistence

The operations platform uses a local JSON database at:

`/Users/megdude/Downloads/BACKEND/downtown-perks-backend/data/downtown-perks-db.json`

`GET /api/health` returned active records for the major platform domains, including:

- `Partner`: 347
- `Campaign`: 345
- `PlatformTenant`: 352
- `TenantWorkspace`: 352
- `PartnerProfile`: 352
- `PartnerLocation`: 481
- `PartnerOffer`: 328
- `PartnerEvent`: 68
- `PartnerReport`: 352
- `PartnerAnalytics`: 352
- `PartnerQrExperience`: 345
- `TenantAuditLog`: 834
- `MapEntityLink`: 493

## Implemented Service Shape

The current backend service is centralized in `server.ts` and includes:

- Express app setup
- JSON database bootstrap
- seed/provisioning helpers
- generic entity CRUD
- tenant/workspace bundle readers
- property/perk/redemption helpers
- report file generation through `/api/functions/:name`
- AI recommendation creation through `/api/agent-recommendations`

## Missing Service Shape

Requested domain boundaries are not yet implemented as separate controller/service/repository modules:

- `src/server/map`
- `src/server/perks`
- `src/server/events`
- `src/server/campaigns`
- `src/server/analytics`
- `src/server/audit`
- `src/server/qr`
- `src/server/ai`
- `src/server/automations`
- `src/server/billing`

## Required Next Step

Extract the current generic endpoints behind typed domain services while keeping `/api/entities/:entity` as an internal/admin compatibility layer.
