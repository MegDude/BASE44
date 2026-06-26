# Events Backend Wiring

## Required Source Of Truth

Events shown in 5173 should map to 3014 entities:

- `Event`
- `PartnerEvent`
- `EventRSVP`
- `Campaign`
- `PartnerReport`
- `PartnerAnalytics`
- `TenantAuditLog`

## Existing Support

Operations has `Event`, `PartnerEvent`, and `EventRSVP` entities. Domain-specific RSVP and check-in endpoints are not yet exposed.

## Missing Endpoints

- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`
- `POST /api/events/:id/rsvp`
- `POST /api/events/:id/check-in`
- `POST /api/events/:id/follow-up`

## Required Logic

- draft: admin only.
- scheduled/active: show in resident event surfaces.
- full: disable RSVP or show waitlist.
- RSVP: create relationship, analytics, reminder automation, saved/activity state.
- completed: trigger follow-up survey and event report.
