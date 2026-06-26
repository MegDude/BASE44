# Pin Backend Wiring

## Required Pin Shape

Every map pin should expose:

- `id`
- `entity_type`
- `entity_id`
- `lat`
- `lng`
- `title`
- `category`
- `district`
- `status`
- `visibility`
- `tenant_id`
- `workspace_id`
- `partner_id`
- `property_id`
- `building_id`
- `campaign_id`
- `perk_id`
- `event_id`
- `analytics_summary`
- `last_updated`

## Current Operations Support

`3014` has `MapEntityLink`, tenant/workspace, partner profile, partner locations, partner offers, partner events, campaigns, analytics containers, QR experiences, and audit logs.

## Interaction Wiring

The following 5173 interactions should create 3014 audit events immediately:

- pin viewed
- pin selected
- drawer opened
- directions clicked
- save clicked
- share clicked
- perk redeemed
- event RSVP
- QR scanned
- nearby clicked
- AI recommendation clicked

`fireWorkflow()` now mirrors these workflow events into `TenantAuditLog` when 3014 is available.
