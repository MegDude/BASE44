# Perks Backend Wiring

## Required Source Of Truth

Perks shown in 5173 should map to 3014 `/admin/perks` and operations entities:

- `PerkLocation`
- `PartnerOffer`
- `PerkRedemption`
- `PartnerQrExperience`
- `Campaign`
- `PartnerReport`
- `PartnerAnalytics`
- `TenantAuditLog`

## Existing Endpoints

- `GET /api/perks`
- `POST /api/perks`
- `PATCH /api/perks/:id`
- `DELETE /api/perks/:id`
- `POST /api/redemptions`
- generic `/api/entities/PerkLocation`
- generic `/api/entities/PartnerOffer`
- generic `/api/entities/PerkRedemption`

## Missing Typed Endpoints

- `POST /api/perks/:id/activate`
- `POST /api/perks/:id/pause`
- `POST /api/perks/:id/archive`
- `POST /api/perks/:id/redeem`

## Conditional Logic

- draft perks: admin only.
- active perks: resident map and partner reporting.
- paused perks: visible in admin, redemption disabled.
- expired perks: admin/report only.
- redeemed perks: validate eligibility, prevent duplicates where configured, write redemption, analytics, report, audit.
