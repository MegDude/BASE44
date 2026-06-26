# Backend Audit

## Scope

Target: `localhost:3014`

The backend is the operational control system. It should own domain logic, persistence, workflow, analytics, audit, AI, QR, reporting, billing, automation, and integrations.

## Verified Strengths

- Backend is reachable on port `3014`.
- `/api/health` responds.
- Broad domain route surface exists.
- Audit and analytics write helpers are used in important mutation paths.
- Agent Platform module exists under `backend/modules/ai`.
- Agent routes expose query, stream, tools, conversations, feedback, images, campaigns, and reports.
- Perk redemption and QR scan endpoints write analytics/audit events.
- Partner workspace provisioning endpoint exists.

## Current Backend Structure

Most API behavior is still concentrated in `server.ts`.

This is the main backend architecture risk. A single file currently owns:

- seed/provisioning logic
- entity CRUD
- import logic
- route definitions
- audit and analytics writes
- domain mutations
- report/export routing
- agent gateway route wiring

## Backend Domain APIs Present

- Platform and tenant provisioning
- Workspace lookup
- Generic entity CRUD
- Map entities and pins
- Events and RSVP/check-in/follow-up
- Campaign publish/pause/archive
- Residents and segmentation
- Partners and workspace provisioning
- Reports and analytics
- Automations and integrations
- QR scan handling
- AI Agent Gateway
- Perks and redemptions
- Products, prices, promotions, checkout

## Backend Gaps

### 1. Domain Modules

Routes should be split by domain:

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

### 2. Service Ownership

Each route group should call a service that owns:

- validation
- permissions
- mutation
- analytics event
- audit event
- report update
- automation trigger

### 3. Persistence

The JSON-backed store is adequate for local platform simulation, but enterprise production requires durable database backing, indexes, constraints, and migration discipline.

### 4. Security

Routes need explicit, tested:

- authentication
- tenant isolation
- role permissions
- rate limits
- CSRF/XSS safeguards where relevant
- secret handling

### 5. Tests

Backend needs integration tests for:

- partner provisioning
- checkout session
- map entity lookup
- event RSVP
- perk redemption
- QR scan
- campaign publish
- agent query
- report generation

## Backend Score

| Area | Score | Notes |
| --- | ---: | --- |
| API coverage | 8 | broad and useful |
| Domain modularity | 5 | too much in `server.ts` |
| Audit/analytics | 7 | present, not universal |
| AI platform | 8 | strong module shape |
| Billing | 6 | endpoint exists, lifecycle not fully proven |
| Automation | 6 | route surface exists, engine needs maturity |
| Security | 5 | needs testable guard layer |
| Persistence | 6 | local JSON store, not final DB |

## Backend Rule Going Forward

3014 should expose typed domain services. 5173 should not call generic entity routes for production workflows when a typed endpoint exists.
