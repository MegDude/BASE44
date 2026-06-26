# Route Map: 5173 Product

Verified from `src/App.jsx`.

## Product Routes

- `/`
- `/app`
- `/app/map`
- `/map`
- `/ask-map`

## Resident Routes

- `/residents`
- `/explore`
- `/events`
- `/perks`
- `/card`

## Partner Marketing Routes

- `/partners`
- `/partners/apply`
- `/partners/pricing`
- `/partners/properties`
- `/partners/residential` -> redirects to `/partners/properties`
- `/partners/hotels`
- `/partners/hospitality` -> redirects to `/partners/hotels`
- `/partners/venues`
- `/partners/brands`
- `/partners/directory`
- `/partners/civic`
- `/partners/real-estate`
- `/partners/legends`
- `/partners/campaigns`
- `/partners/happy-hours`
- `/partners/:role`

## Partner Dashboard Routes

- `/partners/dashboard`
- `/partners/dashboard/map`
- `/partners/dashboard/properties`
- `/partners/dashboard/residential` -> redirects
- `/partners/dashboard/hotels`
- `/partners/dashboard/hospitality` -> redirects
- `/partners/dashboard/venues`
- `/partners/dashboard/brands`
- `/partners/dashboard/civic`
- `/partners/dashboard/real-estate`
- `/partners/dashboard/redemptions`
- `/partners/reports`
- `/partners/reporting`
- `/partners/analytics`
- `/partners/map`

## Partner Lifecycle Routes

- `/partners/start`
- `/partners/register`
- `/partners/checkout`
- `/partners/provision`
- `/partners/workspace/*` -> redirects to `/partner-workspace/overview`

Issue: `/partners/pricing` appears both as a marketing page route and as a redirect to `/marketing/pricing`. This duplicate route should be reduced to one explicit owner.

## Workspace Routes

Canonical:

- `/partner-workspace`
- `/partner-workspace/overview`
- `/partner-workspace/map`
- `/partner-workspace/offers`
- `/partner-workspace/perks`
- `/partner-workspace/parking`
- `/partner-workspace/events`
- `/partner-workspace/sources`
- `/partner-workspace/profile`
- `/partner-workspace/campaigns`
- `/partner-workspace/residents`
- `/partner-workspace/buildings`
- `/partner-workspace/messages`
- `/partner-workspace/surveys`
- `/partner-workspace/team`
- `/partner-workspace/billing`
- `/partner-workspace/reports`
- `/partner-workspace/analytics`

Aliases:

- `/workspace/*`
- `/partner-portal/*`

Required action: keep aliases for backward compatibility, but document `/partner-workspace/*` as canonical until product naming is finalized.

## Marketing Routes

- `/marketing`
- `/marketing/home`
- `/marketing/pricing`
- `/marketing/contact`
- `/marketing/downtown`
- `/marketing/for-buildings`
- `/marketing/partners`
- `/marketing/partners/venues`
- `/marketing/partners/hotels`
- `/marketing/partners/brands`
- `/marketing/partners/properties`
- `/marketing/partners/residential`
- `/marketing/partners/civic`
- `/marketing/partners/access`

Aliases:

- `/home` -> `/marketing/home`
- `/pricing` -> `/marketing/pricing`
- `/contact` -> `/marketing/contact`
- `/splash` -> `/marketing`

## Reconciliation Notes

- Routes are broad and product-complete, but several aliases obscure ownership.
- Partner lifecycle should become the single registration/subscription/workspace path.
- Dashboard/workspace/portal routes should be reduced to one canonical hierarchy with redirects preserved for compatibility.
- All routes that mutate data should call 3014 domain endpoints.
