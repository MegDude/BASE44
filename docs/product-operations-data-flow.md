# Product / Operations Data Flow

## Resident Map Action

5173 resident action:

1. user selects pin, saves, searches, asks, gets directions, redeems, or RSVPs.
2. `fireWorkflow()` sends the existing product workflow request.
3. `fireWorkflow()` mirrors an operations audit event to `3014` through `TenantAuditLog`.
4. future typed endpoints should also write analytics and report events.

## Partner Map Action

Partner action:

1. partner opens reports/activity/campaign/info tab.
2. UI should read workspace bundle from `GET /api/workspace/:slug`.
3. partner workflow mutation should write to the relevant 3014 entity.
4. mutation should create tenant audit log and analytics event.
5. partner reports should read aggregated operational records.

## Perk Redemption

Required flow:

1. resolve perk from 3014.
2. validate active status and eligibility rules.
3. prevent duplicates when rule requires.
4. create redemption record.
5. increment analytics.
6. update partner report.
7. create audit event.
8. trigger notification or automation if configured.

Current state:

- product has `/api/redeem` Supabase handler.
- operations has `/api/redemptions`.
- a unified source-of-truth route is still needed.

## Event RSVP

Required flow:

1. resolve event from 3014.
2. validate event status/capacity.
3. create RSVP.
4. update resident saved/activity.
5. trigger reminder/follow-up.
6. write report and audit output.

Current state:

- operations has `Event` and `EventRSVP` entities.
- explicit `POST /api/events/:id/rsvp` is missing.
