# Platform Reconciliation

## Current Target

Downtown Perks must operate as one platform:

```text
Experience Layer
  -> Application Layer
  -> Shared Domain
  -> Services
  -> Database
```

`localhost:5173` is the customer-facing product. `localhost:3014` is the operational control system. The current implementation is moving in that direction, but it is not fully reconciled yet.

## Verified Runtime State

- `5173` serves the customer product from `/Users/megdude/Downloads/BASE44 2`.
- `3014` serves the operations backend from `/Users/megdude/Downloads/BACKEND/downtown-perks-backend`.
- `3014` exposes typed operational APIs for map entities, campaigns, events, perks, residents, partners, QR, analytics, automations, reports, integrations, and AI.
- `5173` now routes Ask the Map through `/api/agent/query`, which proxies to `3014 /api/agent/query`.
- Frontend OpenAI client logic has been removed from the product surface. Provider credentials belong only in `3014`.

## Major Remaining Split

The platform still has multiple active data and workflow paths:

1. `base44` SDK entity access in resident, partner, card, dashboard, repository, and workspace modules.
2. 5173 local API handlers for contact, campaign requests, Ask the Map compatibility, and agent proxy.
3. 5173 workflow mirroring through `src/lib/backendWorkflows.ts`.
4. 3014 operational domain APIs and audit/analytics writes.
5. Static/local map registries and content files inside the product checkout.

This means the platform is connected, but not yet fully singular.

## Reconciliation Rule

5173 may own presentation, client state, and rendering.

3014 must own:

- Entity identity
- Partner/workspace state
- Pricing and billing workflows
- Map pin source of truth
- Perk/event/campaign mutations
- Resident and partner analytics
- Audit history
- AI context, planning, tools, memory, and provider access
- Workflow orchestration

## Corrected Architecture Path

### Phase 1: Preserve Thin Client Boundary

- Keep `/api/agent/query` and `/api/agent/stream` as thin product proxies.
- Move remaining product-side workflow decisions into 3014 domain endpoints.
- Replace Base44 direct mutations with typed 3014 clients where a 3014 endpoint exists.

### Phase 2: Shared Domain Contracts

Create a shared contract layer for:

- MapEntity
- Organization
- Workspace
- Partner
- Resident
- Campaign
- Event
- Perk
- QR
- AnalyticsEvent
- AuditEvent
- AgentRequest
- AgentResponse

Until these contracts exist, duplicate data shapes will keep reappearing.

### Phase 3: Source-of-Truth Migration

Migrate map hydration from local registries/Base44 to:

```text
5173 Map UI
  -> /api/map/entities or /api/map/pins
  -> 3014 domain records
  -> analytics/audit/report streams
```

Local registries may remain only as seed/import fixtures, not runtime truth.

### Phase 4: Workflow Engine Ownership

Every user mutation must become:

```text
Frontend action
  -> 3014 typed endpoint
  -> domain service
  -> analytics event
  -> audit event
  -> report update
  -> optional automation/notification/AI context update
```

## Concrete Evidence From Current Source

### 5173 Routes

The product currently exposes resident, partner, workspace, portal, and marketing hierarchies from `src/App.jsx`, including:

- `/map`
- `/ask-map`
- `/partners/start`
- `/partners/register`
- `/partners/checkout`
- `/partners/provision`
- `/partner-workspace/*`
- `/workspace/*` aliases
- `/marketing/*`

### 3014 APIs

The backend exposes domain APIs including:

- `/api/map/entities`
- `/api/map/pins`
- `/api/events`
- `/api/campaigns`
- `/api/residents`
- `/api/partners`
- `/api/perks`
- `/api/qr/scan`
- `/api/analytics/events`
- `/api/automations`
- `/api/reports/run`
- `/api/agent/query`
- `/api/agent/stream`
- `/api/agent/images`

### AI Status

AI is the strongest reconciled area after the latest pass:

- Frontend calls shared agent client.
- Product proxy forwards to 3014.
- Backend owns planning, tools, conversation records, provider metadata, analytics, and audit.
- Image generation endpoint exists but requires backend-only `OPENAI_API_KEY`.

## Required Remediation

1. Replace Base44 direct runtime data access with typed 3014 service clients.
2. Promote `/api/checkout/session` and partner lifecycle into one registration/subscription/workspace workflow.
3. Make all map pins load from 3014 map APIs.
4. Make every save, direction, RSVP, redemption, QR scan, search, and campaign action write through 3014.
5. Consolidate duplicate UI primitives after domain paths are stabilized.
6. Add integration tests asserting product actions produce 3014 analytics and audit records.

## Current Judgment

Downtown Perks now has the skeleton of a single operating system, especially around AI and operational APIs. The remaining work is to remove product-owned business logic and Base44/local runtime data paths so 5173 becomes a true experience layer over the 3014 domain platform.

## Documentation Set

The reconciliation pass is now split into focused operating documents:

| Document | Purpose |
| --- | --- |
| `docs/platform-reconciliation.md` | master current-state reconciliation and operating rule |
| `docs/frontend-audit.md` | 5173 route/data/workflow audit |
| `docs/backend-audit.md` | 3014 route/service/persistence audit |
| `docs/domain-map.md` | canonical domain ownership |
| `docs/component-library.md` | shared UI primitive registry and duplicate inventory |
| `docs/design-system.md` | typography, spacing, CSS, and visual system governance |
| `docs/service-map.md` | product and operations service ownership |
| `docs/api-map.md` | 5173 and 3014 API inventory |
| `docs/workflow-map.md` | workflow ownership and mutation path |
| `docs/automation-map.md` | automation triggers and engine gaps |
| `docs/reporting-map.md` | reporting domains and operational data flow |
| `docs/analytics-map.md` | analytics event coverage |
| `docs/database-map.md` | current stores and canonical persistence model |
| `docs/security-audit.md` | authorization, secrets, tenant isolation, and route risk |
| `docs/performance-audit.md` | bundle, map, CSS, and service performance risks |
| `docs/mobile-audit.md` | mobile route/drawer/safe-area QA matrix |
| `docs/final-gap-analysis.md` | prioritized production blockers |
| `docs/final-production-readiness.md` | scorecard and final readiness decision |

These docs intentionally distinguish current verified implementation from target architecture so future agents do not “polish over” platform gaps.
