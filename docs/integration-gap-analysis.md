# Integration Gap Analysis

## Critical

1. `5173` map hydration is not proven to use `3014` as the primary runtime source for every pin.
2. `3014` does not expose all requested typed endpoints for map entities, event RSVP, campaign publish, QR scans, AI report summaries, and analytics events.
3. Product analytics currently split between product-side Supabase handlers and 3014 audit records.
4. Authorization/permission enforcement is not consistently visible across every 3014 mutation endpoint.

## High

1. Partner lifecycle screens exist, but registration → checkout → provisioning needs explicit backend writes and resumable state.
2. Perk redemption exists in both product and operations concepts, but duplicate protection and eligibility rules need a single source of truth.
3. Event RSVP/follow-up/reporting workflows are not fully exposed as typed APIs.
4. AI features use structured context in the product Ask the Map handler, but not every AI surface is backed by 3014 context endpoints.

## Medium

1. Automation records exist, but run/retry/log UI and typed run endpoints need completion.
2. Integration status records exist, but provider test buttons and credential-state contracts need completion.
3. Mobile QA is mostly styling-driven and still needs automated regression coverage for bottom drawers, map panels, and partner tabs.

## Completed In This Pass

- 3014 live service restarted and verified.
- 3014 health and provisioning status inspected.
- 5173 route map inspected.
- 3014 route map inspected.
- 5173 workflow actions mirrored into 3014 audit logs.
- Generic fallback copy regression repaired in recommendation helpers.
