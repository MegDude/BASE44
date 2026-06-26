# 5173 Product / 3014 Operations Platform Integration Audit

Status: implementation audit with corrective wiring pass  
Targets: `http://localhost:5173`, `http://localhost:3014`

## Executive Finding

`5173` is the resident and partner product surface. `3014` is the operations platform and local source of truth. The two apps already share a product concept and overlapping entity vocabulary, but they are not yet fully integrated through dedicated domain APIs.

The strongest existing bridge is the `3014` JSON-backed operations service:

- `GET /api/health`
- `GET /api/platform`
- `GET /api/tenant-provisioning/status`
- `GET /api/tenants`
- `GET /api/workspace/:slug`
- generic CRUD through `/api/entities/:entity`
- partner/perk/property/insight helpers

The biggest current gap was that product actions in `5173` were routed through local `/api/*` handlers only. In local product mode those routes can be unavailable or handled by the app shell. A corrective mirror was added in `src/lib/backendWorkflows.ts` so product workflow actions create operations audit records in `3014` through `POST /api/entities/TenantAuditLog`.

## What Is Implemented

- `3014` exposes operational entities for tenants, workspaces, partners, offers, events, reports, analytics containers, QR experiences, AI context, notifications, audit logs, and map links.
- `3014` reports `352` tenants, `352` workspaces, `493` map entity links, and all required seeded tenants provisioned in the live local audit.
- `5173` has route coverage for splash, map, resident experiences, marketing, partner routes, partner workspace, pricing, contact, campaigns, reports, and aliases.
- `5173` already emits workflow calls for saves, visits, impressions, search logs, listing interest, survey response completion, and Ask the Map.
- `5173` has Supabase-backed product API handlers for track/save/redeem when deployment/serverless config is present.

## What Is Partial

- `3014` has generic entity CRUD but not all explicit required API contracts such as `/api/map/entities`, `/api/events/:id/rsvp`, `/api/campaigns/:id/publish`, `/api/qr/scan`, or `/api/ai/report-summary`.
- `5173` uses rich local registries and production data files for map entities; not every pin is proven to hydrate directly from `3014` at runtime.
- Analytics are captured in Supabase handlers on the product side and audit logs on `3014`, but a unified analytics event endpoint on `3014` is missing.
- Permission checks are represented in seeded role records, but route/API authorization guards are not consistently enforced across every workflow.

## Corrective Work Completed In This Pass

- Added operations audit mirroring for `fireWorkflow()` product actions.
- Removed banned generic partner recommendation fallback copy.
- Replaced generic partner recommendation labels with more specific partner/campaign language.
- Documented route maps, service inventory, backend contracts, data flow, gap analysis, and mobile/platform QA requirements.

## Remaining Required Build Work

- Replace generic entity CRUD dependency with typed domain routes and validation schemas.
- Add first-class 3014 endpoints for analytics events, QR scans, event RSVP/check-in, campaign publish/pause/archive, AI recommendations, report summary, and automation runs.
- Make `5173` map hydration prefer `3014` map entities where available, using local registries only as seed/fallback data.
- Add tenant-scoped permission guards and audit logs for every mutation.
- Add automated integration tests that assert a 5173 action creates 3014 audit/analytics output.
