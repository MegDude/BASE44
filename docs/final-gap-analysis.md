# Final Gap Analysis

## Executive Summary

The platform is architecturally aligned but not fully reconciled. The product and operations layers are connected, and 3014 now has meaningful domain APIs. However, 5173 still contains duplicate runtime data access, workflow decisions, and UI-owned business logic.

The largest remaining gap is not visual polish. It is the coexistence of Base44, local product registries, product API handlers, and 3014 domain services.

## Confirmed Progress

- 5173 and 3014 are both reachable locally.
- 3014 exposes operational APIs for map, events, campaigns, residents, partners, reports, analytics, automations, QR, perks, integrations, and AI.
- Ask the Map now routes through the backend Agent Gateway.
- Frontend OpenAI code and frontend OpenAI environment keys were removed.
- 5173 includes workflow mirroring to 3014 audit logs through `backendWorkflows.ts`.
- 3014 writes audit and analytics records for key backend mutations.

## High-Severity Gaps

### 1. Multiple Sources Of Truth

Runtime data still comes from:

- Base44 SDK
- local map/content registries
- 5173 local API handlers
- 3014 operational endpoints
- static imported content

Required action: define 3014 as runtime source of truth and demote local/static data to seed/import fixtures.

### 2. Product-Owned Business Logic

`src/pages/Map.jsx` still owns large amounts of search, filter, entity, recommendation, workflow, and drawer logic.

Required action: extract decision logic into domain services and keep `Map.jsx` as orchestration/presentation only.

### 3. Workflow Fragmentation

Some actions use:

- direct Base44 entities
- local `/api/*` handlers
- `postWorkflow`
- `fireWorkflow`
- direct third-party calls
- 3014 typed APIs

Required action: route mutations through typed 3014 workflow endpoints.

### 4. Billing/Checkout Incomplete

Partner lifecycle calls `/api/stripe/create-checkout-session`, while 3014 exposes `/api/checkout/session`.

Required action: normalize all partner checkout into 3014 billing/subscription services.

### 5. Component Duplication

There are still duplicate button, card, drawer, map, and analytics card patterns across:

- `src/components/ui`
- `src/components/map`
- `src/components/partner`
- page-level JSX
- late CSS override files

Required action: consolidate UI primitives only after data/workflow ownership is clear.

### 6. Testing Gap

The current app has lint/typecheck/build scripts but no complete integration test path proving:

- save writes audit
- RSVP writes event record
- perk redemption updates analytics
- QR scan updates report streams
- Ask the Map persists conversation
- partner checkout provisions workspace

Required action: add API integration tests and browser smoke tests around these workflows.

## Medium-Severity Gaps

- Some marketing and partner routes are aliases or redirects, which is acceptable but should be documented as intentional.
- 3014 currently centralizes many service responsibilities in `server.ts`.
- Security enforcement is present conceptually but not yet proven through tenant-isolation tests.
- Frontend typography/design now has a final governance CSS layer, but the app still has many legacy heavy utility classes underneath.
- Image generation endpoint exists but cannot pass until backend `OPENAI_API_KEY` is configured.

## Immediate Remediation Backlog

1. Create `src/services/platform` for typed 3014 clients.
2. Replace direct Base44 map/entity reads with platform clients.
3. Replace `/api/stripe/create-checkout-session` with 3014 `/api/checkout/session`.
4. Move map entity filtering and recommendations to backend query endpoints.
5. Add one integration test for each mutation category: save, visit, RSVP, redeem, QR scan, campaign publish, agent query.
6. Split 3014 `server.ts` route groups into domain route modules.
7. Document ownership for every route in `docs/route-map-5173.md` and `docs/route-map-3014.md`.

## Current Production Risk

The platform can demonstrate the desired product experience, but enterprise production readiness is blocked until every mutation, report, and AI action is backed by one operational source of truth with audit and analytics attached.
