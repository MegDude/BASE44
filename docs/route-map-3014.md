# Route Map: 3014 Operations Platform

Verified from `/Users/megdude/Downloads/BACKEND/downtown-perks-backend/server.ts`.

## Route Ownership

3014 is the operational control system. It should own all business logic, workflow mutation, reporting, analytics, audit, AI orchestration, QR handling, partner workspace provisioning, and billing/subscription state.

## Route Groups

### Platform

- `/api/health`
- `/api/platform`
- `/api/tenants`
- `/api/tenant-provisioning/status`
- `/api/tenants/:slug`
- `/api/workspace/:slug`

### Domain Entities

- `/api/entities/:entity`
- `/api/entities/:entity/filter`
- `/api/entities/:entity/:id`

Generic entity routes should remain compatibility/admin tooling, not product-facing domain contracts.

### Product Domains

- Map: `/api/map/entities`, `/api/map/pins`, `/api/map/entities/:id`
- Events: `/api/events`, `/api/events/:id/rsvp`, `/api/events/:id/check-in`, `/api/events/:id/follow-up`
- Campaigns: `/api/campaigns`, `/api/campaigns/:id/publish`, `/api/campaigns/:id/pause`, `/api/campaigns/:id/archive`
- Perks: `/api/perks`, `/api/perks/:id/redeem`, `/api/perks/:id/activate`, `/api/perks/:id/pause`, `/api/perks/:id/archive`
- Residents: `/api/residents`, `/api/residents/:id/segment`, `/api/residents/:id/activity`
- Partners: `/api/partners`, `/api/partners/:id/provision-workspace`
- QR: `/api/qr/:id`, `/api/qr/scan`

### Intelligence And Operations

- Reports: `/api/reports`, `/api/reports/run`, `/api/reports/:id/export`
- Analytics: `/api/analytics/summary`, `/api/analytics/events`
- Automations: `/api/automations`, `/api/automations/runs`, `/api/automations/:id/run`
- Integrations: `/api/integrations/status`, `/api/integrations/:id/test`
- Insights: `/api/insights/overview`, `/api/insights/trends`, `/api/insights/top-perks`

### AI

- `/api/agent/query`
- `/api/agent/stream`
- `/api/agent/conversations`
- `/api/agent/suggestions`
- `/api/agent/feedback`
- `/api/agent/tools`
- `/api/agent/tools/execute`
- `/api/agent/images`
- `/api/agent/campaigns`
- `/api/agent/reports`
- Compatibility AI routes under `/api/ai/*`

## Current Structural Issue

Most routes are currently implemented in one large `server.ts`. This works for a local operational platform, but enterprise readiness requires route modules and service modules by domain:

```text
routes/map
routes/events
routes/campaigns
routes/perks
routes/partners
routes/residents
routes/billing
routes/analytics
routes/automations
routes/agent
```

Each route module should call a domain service, and each service should own audit/analytics side effects.

## Reconciliation Target

5173 should never need to know whether data came from a seed file, JSON store, future database, or imported source. It should call typed 3014 APIs and render the returned contract.
