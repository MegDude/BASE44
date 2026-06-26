# API Map

## 5173 Product API Surface

The product checkout exposes a small local API layer through Vite middleware and serverless-compatible handlers:

| Endpoint | Owner | Purpose | Reconciliation Status |
| --- | --- | --- | --- |
| `/api/ask-map` | 5173 compatibility proxy | Legacy Ask the Map endpoint | Should remain only as a compatibility wrapper |
| `/api/agent/query` | 5173 thin proxy | Forwards agent requests to 3014 | Correct direction |
| `/api/agent/stream` | 5173 thin proxy | Streams agent responses from 3014-compatible flow | Correct direction |
| `/api/contact` | 5173 handler | Marketing/partner contact submission | Should map to 3014 lead/workflow service |
| `/api/campaign-requests` | 5173 handler | Campaign request capture | Should map to 3014 campaign/lead service |
| `/api/stripe/create-checkout-session` | referenced by PartnerLifecycle | Checkout flow | Must be reconciled with 3014 `/api/checkout/session` |

## 3014 Operations API Surface

Verified from `/Users/megdude/Downloads/BACKEND/downtown-perks-backend/server.ts`.

### Platform And Provisioning

- `GET /api/health`
- `GET /api/platform`
- `GET /api/tenants`
- `GET /api/tenant-provisioning/status`
- `GET /api/tenants/:slug`
- `GET /api/workspace/:slug`
- `POST /api/tenant-provisioning/sync`

### Generic Entity Layer

- `GET /api/entities/:entity`
- `POST /api/entities/:entity/filter`
- `POST /api/entities/:entity`
- `PATCH /api/entities/:entity/:id`
- `DELETE /api/entities/:entity/:id`
- `POST /api/functions/:name`

This is useful for compatibility but should not become the primary domain contract.

### Map

- `GET /api/map/entities`
- `GET /api/map/pins`
- `GET /api/map/entities/:id`
- `POST /api/map/events`
- `POST /api/map-data/import`

Required next step: make 5173 map hydration use these endpoints as the runtime source of truth.

### Events

- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`
- `POST /api/events/:id/rsvp`
- `POST /api/events/:id/check-in`
- `POST /api/events/:id/follow-up`

### Campaigns

- `GET /api/campaigns`
- `POST /api/campaigns`
- `PATCH /api/campaigns/:id`
- `POST /api/campaigns/:id/publish`
- `POST /api/campaigns/:id/pause`
- `POST /api/campaigns/:id/archive`

### Perks And Redemptions

- `GET /api/perks`
- `POST /api/perks`
- `PATCH /api/perks/:id`
- `DELETE /api/perks/:id`
- `POST /api/perks/:id/activate`
- `POST /api/perks/:id/pause`
- `POST /api/perks/:id/archive`
- `POST /api/perks/:id/redeem`
- `POST /api/redemptions`
- `POST /api/promotions/redeem`

### Residents And Partners

- `GET /api/residents`
- `POST /api/residents`
- `PATCH /api/residents/:id`
- `POST /api/residents/:id/segment`
- `GET /api/residents/:id/activity`
- `GET /api/partners`
- `POST /api/partners`
- `PATCH /api/partners/:id`
- `POST /api/partners/:id/provision-workspace`
- `POST /api/partner-leads`
- `GET /api/partner-leads/export.csv`

### Billing And Commerce

- `GET /api/products`
- `GET /api/prices`
- `GET /api/promotions`
- `POST /api/promotions`
- `PATCH /api/promotions/:id`
- `DELETE /api/promotions/:id`
- `POST /api/promotions/validate`
- `POST /api/checkout/session`

Required next step: 5173 partner lifecycle should use `/api/checkout/session`, not a separate checkout route.

### Reports, Analytics, Automation

- `GET /api/reports`
- `POST /api/reports/run`
- `GET /api/reports/:id/export`
- `GET /api/reports/:file`
- `GET /api/analytics/summary`
- `POST /api/analytics/events`
- `GET /api/automations`
- `GET /api/automations/runs`
- `POST /api/automations/:id/run`
- `GET /api/insights/overview`
- `GET /api/insights/trends`
- `GET /api/insights/top-perks`

### QR

- `GET /api/qr/:id`
- `POST /api/qr/scan`

### AI

- `POST /api/agent/query`
- `POST /api/agent/stream`
- `GET /api/agent/conversations`
- `GET /api/agent/suggestions`
- `POST /api/agent/feedback`
- `GET /api/agent/tools`
- `POST /api/agent/tools/execute`
- `POST /api/agent/images`
- `POST /api/agent/campaigns`
- `POST /api/agent/reports`
- `POST /api/ai/ask-map`
- `POST /api/ai/recommendations`
- `POST /api/ai/report-summary`
- `POST /api/ai/survey-summary`

AI is the most reconciled backend capability. Remaining work is to route every product AI surface through these endpoints and configure backend-only provider credentials.

## API Reconciliation Rule

Every new product feature should choose one of these paths:

1. Typed 3014 domain endpoint.
2. Temporary 5173 proxy that forwards to 3014.
3. Import/seed-only local fixture.

No new business logic should be added to 5173 API handlers.
