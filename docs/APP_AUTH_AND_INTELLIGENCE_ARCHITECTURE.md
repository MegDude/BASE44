# App auth, account, and Partner Intelligence architecture

## Canonical datastore decision

BASE44 does not use Firebase as its approved authority. No Firebase SDK dependency, configuration, or canonical collections named `Users`, `PerksCards`, `Offers`, `Redemptions`, `Partners`, `Properties`, `MapSignals`, `Events`, or `SavedItems` exist. Introducing Firestore would duplicate persistence and violate the app/backend boundary.

The canonical mapping is:

| Requested concept | Approved authority |
| --- | --- |
| Users | Supabase Auth plus `platform_profiles`, `resident_profiles`, and partner membership tables |
| PerksCards | Resident profile/card issue and QR-session contracts owned by the Backend Platform |
| Offers | `perks` and partner campaign/offer contracts |
| Redemptions | `perk_redemptions` plus issue/verify/complete transactions |
| Partners | `partner_organizations`, `partner_users`, memberships |
| Properties | `partner_listings` plus `map_inventory` canonical entity IDs |
| MapSignals | `analytics_signals` / first-party activity events |
| Events | `events` and `event_rsvps` |
| SavedItems | `resident_saved_entities` through `dp_set_resident_saved_entity` |

## Auth and account flow

- Guest browsing is intentional for public map and discovery routes.
- Resident sign-up/sign-in/password reset/OAuth/magic-link UI delegates to Supabase Auth.
- Callback routing re-reads the trusted user and live access context; browser metadata is not authoritative for platform roles.
- Saved items require a Supabase access token and server-resolved resident profile. Optimistic state rolls back on failure.
- Resident card/QR and redemption endpoints require authenticated resident identity and Backend Platform transactions.
- Member activity reads saved items, upcoming RSVPs, and active perks from server-scoped tables. Historical completed redemption reporting is a backend dependency; the current member hub intentionally returns active perks, not a fabricated full history.
- Partner and admin routes require live membership/profile authority; missing membership and expired session return to sign-in or an explicit access error.
- Account-management UI exists, but durable profile mutation and complete account lifecycle remain Backend Platform-owned.

## Partner Intelligence audit

The existing product has two different surfaces:

1. `Ask the Map` / agent query: natural-language map recommendations through the separately configured agent backend.
2. Partner analytics endpoints: server-authorized, organization-scoped operational metrics.

The legacy `api/partner/ask-map.js` is not production-ready: it trusts a client `partnerId`, parses only simple keywords, and returns static recommendation copy. The TypeScript `src/api/partner/ask-map.ts` also lacks explicit server authorization and forwards map context to the agent, not canonical analytics aggregates. Neither may be presented as answer-focused operational intelligence.

`api/partner/analytics/overview.js` currently provides server-scoped redemption metrics for approved windows (`7d`, `30d`, `90d`), including completed redemptions, unique residents, repeat rate, conversion rate, top perks, and privacy-thresholded audience timing. Other requested metrics—map opens, saves, RSVPs, card scans, partner visits, nearby lift, and repeat activity across event types—need a Backend Platform aggregation contract over `analytics_signals` and related transaction tables.

## Follow-up contract

This dynamic Q&A should be a separate Backend Platform implementation followed by a small BASE44 UI integration:

| Layer | Required work |
| --- | --- |
| Endpoint | `POST /api/partner/intelligence/query`, bearer-authenticated; resolve organization from membership/server scope, never request body |
| Input | Question, approved range (`7d`, `30d`, `90d`), optional listing/portfolio scope |
| Metrics | Defined event taxonomy for opens, saves, RSVPs, scans, completed redemptions, visits, nearby-control lift, and repeat users |
| Privacy | No resident identifiers; minimum cohort thresholds; no cross-organization metrics |
| Answer | Metric-backed statement, comparison window, evidence rows, definitions, freshness, and unavailable metrics |
| States | Loading, explicit authorization/error, no-data, partial-data, and successful evidence states |
| Tests | Membership/scope isolation, time boundaries, metric definitions, privacy thresholds, empty/partial data, and no fabricated success |

Implementing that aggregation inside BASE44 would duplicate backend business logic and persistence, so PR #223 documents the contract but does not create placeholder metrics.
