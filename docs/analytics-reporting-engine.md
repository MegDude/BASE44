# Analytics And Reporting Engine

## Current Product Tracking

`src/lib/analytics/track.ts` defines tracked actions:

- marker click
- drawer open/close
- search submit
- mode change
- chip toggle
- save/unsave
- directions
- redeem
- RSVP
- filter apply
- building anchor

## Current Operations Reporting

Operations has:

- `PartnerReport`
- `PartnerAnalytics`
- `TenantAuditLog`
- `SurveyExportLog`
- generated report files through `/api/functions/:name`

## Gap

A typed 3014 analytics event stream is missing. Add:

- `POST /api/analytics/events`
- `GET /api/analytics/summary`
- `POST /api/reports/run`
- `GET /api/reports/:id/export`

## Corrective Work

5173 workflow events now mirror into `TenantAuditLog`, giving operations an auditable trail while the analytics endpoint is formalized.
