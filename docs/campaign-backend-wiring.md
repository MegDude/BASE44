# Campaign Backend Wiring

## Required Source Of Truth

Campaigns need relationships between:

- partner/workspace
- resident segments
- buildings/properties
- perks
- events
- QR codes
- messages
- analytics
- reports
- automations

## Existing Support

Operations has `Campaign`, `PartnerQrExperience`, `CrmSegment`, `PartnerReport`, `PartnerAnalytics`, `AutomationRun`, and `TenantAuditLog` entities.

## Missing Typed Endpoints

- `GET /api/campaigns`
- `POST /api/campaigns`
- `PATCH /api/campaigns/:id`
- `POST /api/campaigns/:id/publish`
- `POST /api/campaigns/:id/pause`
- `POST /api/campaigns/:id/archive`

## Required States

- draft
- scheduled
- active
- paused
- completed
- archived

## Current Correction

Generic campaign recommendation fallback copy was replaced with entity-specific partner language in `src/utils/recommendCampaigns.ts`.
