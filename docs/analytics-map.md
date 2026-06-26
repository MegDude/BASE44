# Analytics Map

## Analytics Rule

No meaningful action should be silent. Views, searches, drawer opens, saves, directions, RSVPs, redemptions, QR scans, campaign actions, checkout actions, and AI tool calls should create analytics and audit events where appropriate.

## Current Analytics Evidence

- 3014 exposes analytics routes.
- `src/lib/backendWorkflows.ts` mirrors workflow attempts/completions/failures to 3014 audit logs.
- `src/pages/Map.jsx` dispatches several workflow events for impression, save, visit, search, and survey completion.
- AI agent calls are routed through backend gateway and can be logged centrally.

## Event Coverage Matrix

| Event | Required destination | Current status |
| --- | --- | --- |
| Page viewed | analytics | partial |
| Map pin viewed | analytics + report stream | partial |
| Drawer opened | analytics | partial |
| Search submitted | analytics + AI context | partial |
| Filter changed | analytics + AI context | partial |
| Place saved | analytics + audit + recommendations | partial |
| Directions clicked | analytics + report stream | partial |
| Perk redeemed | analytics + audit + report | present backend, product migration needed |
| Event RSVP | analytics + audit + reminder | present backend, product migration needed |
| QR scanned | analytics + audit + routing | present backend |
| Campaign published | analytics + audit + automation | present backend |
| Checkout started | analytics + billing audit | route mismatch remains |
| AI query | telemetry + audit + conversation memory | aligned route, env dependent |

## Required Remediation

1. Introduce a shared analytics event taxonomy.
2. Make all product actions call typed analytics/workflow clients.
3. Add test coverage for silent-action regressions.
4. Feed reports from analytics streams, not static UI state.
