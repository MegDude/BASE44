# Service Map

## Current 5173 Services

| Service area | Files | Status |
| --- | --- | --- |
| Agent client | `src/services/agent/*` | active shared frontend client |
| Ask the Map compatibility | `api/ask-map.js` | proxies to agent gateway |
| Agent API proxy | `api/agent/query.js`, `api/agent/stream.js` | active 5173 gateway to 3014 |
| Workflow bridge | `src/lib/backendWorkflows.ts` | mirrors product actions to 3014 audit/workflows |
| Analytics bridge | `src/lib/analytics/track.ts` | partially aligned |
| Base44 runtime | `src/api/base44Client.js`, `src/lib/repositories/index.ts` | legacy dependency |
| Map data | `src/data/*`, `src/pages/Map.jsx` | mixed static and operational context |
| Pricing/checkout | `src/pages/PartnerLifecycle.jsx`, pricing config | partially mismatched with 3014 checkout |

## Current 3014 Services

The backend exposes a broad route surface from `/Users/megdude/Downloads/BACKEND/downtown-perks-backend/server.ts` and AI modules under `backend/modules/ai`.

| Service area | API evidence | Status |
| --- | --- | --- |
| Platform/tenant | `/api/platform`, `/api/tenants`, `/api/workspace/:slug` | present |
| Generic entities | `/api/entities/:entity` | present, migration bridge |
| Map | `/api/map/entities`, `/api/map/pins`, `/api/map/events` | present |
| Events | `/api/events`, RSVP/check-in/follow-up | present |
| Campaigns | `/api/campaigns`, publish/pause/archive | present |
| Residents | `/api/residents`, `/api/residents/segments` | present |
| Partners | `/api/partners`, workspace provisioning | present |
| Reports/analytics | `/api/reports`, `/api/analytics/*` | present |
| Automations | `/api/automations/*` | present |
| QR | `/api/qr/scan` | present |
| AI | `/api/agent/*` | present |
| Billing | `/api/products`, `/api/prices`, `/api/checkout/session` | present |

## Missing Shared Service Layer

Create `src/services/platform/` clients for:

- `mapClient`
- `partnerClient`
- `residentClient`
- `perkClient`
- `eventClient`
- `campaignClient`
- `reportClient`
- `analyticsClient`
- `billingClient`
- `workspaceClient`

Each client should map to a typed 3014 route and should replace direct page-level fetches, Base44 reads, and static workflow logic.
