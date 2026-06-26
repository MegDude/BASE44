# Frontend Audit

## Scope

Target: `localhost:5173`

The frontend is the customer-facing experience layer for:

- Marketing
- Resident product
- Partner product
- Map
- Ask the Map
- Partner lifecycle
- Partner workspace

## Verified Strengths

- Rich route coverage across resident, partner, workspace, and marketing surfaces.
- Map-first resident and partner experience exists.
- Ask the Map now uses the shared agent client and product proxy.
- Final typography governance stylesheet has been added to reduce heavy font drift.
- Partner lifecycle route skeleton exists for start, register, checkout, and provision.
- Workflow mirroring exists through `src/lib/backendWorkflows.ts`.

## Current Data Paths

The frontend still reads/writes through multiple systems:

1. Base44 SDK:
   - `src/api/base44Client.js`
   - `src/lib/repositories/index.ts`
   - `src/pages/PartnerWorkspace.jsx`
   - `src/pages/PartnerDashboard.jsx`
   - resident card/perks modules

2. 5173 local API handlers:
   - `/api/contact`
   - `/api/campaign-requests`
   - `/api/ask-map`
   - `/api/agent/query`
   - `/api/agent/stream`

3. 3014 workflow/audit mirroring:
   - `src/lib/backendWorkflows.ts`
   - `src/lib/analytics/track.ts`

4. Static/local product data:
   - map entity registries
   - supplemental entity data
   - partner workspace registry
   - content decks and destination specs

## High-Risk Files

- `src/pages/Map.jsx`: too much business logic, filtering, recommendation assembly, workflow dispatch, and drawer orchestration in one component.
- `src/pages/PartnerWorkspace.jsx`: mixes presentation, Base44 persistence, workspace operations, and local module state.
- `src/lib/repositories/index.ts`: still maps product repositories to Base44 functions/entities.
- `src/lib/backendWorkflows.ts`: useful bridge, but not a final domain client.
- `src/config/stripeProducts.ts` and partner pricing registries: billing configuration remains product-visible.

## Required Frontend Remediation

1. Create typed `src/services/platform/*` clients for 3014 domains.
2. Replace direct Base44 runtime reads with platform clients where 3014 endpoints exist.
3. Keep Base44 only for legacy compatibility until migrated.
4. Split `Map.jsx` into presentation components plus domain/query hooks.
5. Replace checkout route usage with 3014 `/api/checkout/session`.
6. Keep `/api/ask-map` as compatibility only; all new AI calls use `/api/agent/query`.
7. Consolidate shared primitives after domain migration: Button, Card, Drawer, Search, Table, Timeline, Chart.

## Current Frontend Score

| Area | Score | Notes |
| --- | ---: | --- |
| Route coverage | 8 | broad route tree |
| Backend alignment | 6 | mixed Base44, local handlers, 3014 |
| AI alignment | 8 | agent gateway path now correct |
| Map architecture | 7 | rich UX, still product-owned data logic |
| Workspace architecture | 6 | useful UI, persistence split |
| Design system | 8 | final governance layer added, legacy classes remain |
| Testing | 4 | missing end-to-end workflow proof |

## Frontend Rule Going Forward

No new business logic should be added to pages. Pages should render and orchestrate; domain decisions should live in shared services and 3014 APIs.
