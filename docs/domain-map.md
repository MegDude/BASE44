# Domain Map

## Platform Rule

Every real-world object exists once in the shared domain model. The product app on `5173` renders domain data. The operations platform on `3014` owns domain services, workflows, analytics, audit, AI, billing, and persistence.

## Canonical Domains

| Domain | System of record target | Product surfaces | Operations surfaces | Current state |
| --- | --- | --- | --- | --- |
| Organization | 3014 | partner lifecycle, workspace, map partner mode | tenant/admin/workspace APIs | route surface exists |
| Workspace | 3014 | partner workspace, dashboard aliases | workspace provisioning/status | route surface exists |
| Partner | 3014 | partner pins, campaigns, reports, info | partner endpoints, workspace provisioning | mixed with Base44 |
| Property | 3014 | map, resident discovery, partner profile | property/building entities | mixed with static registries |
| Building | 3014 | resident card, saved, nearby, reports | building/entity APIs | mixed with static registries |
| Resident | 3014 | card, saved, RSVP, redemption, recommendations | residents, segments, analytics | partially mirrored |
| Map Entity | 3014 map service | pins, drawers, search, nearby | map entities/pins/import | route surface exists |
| Perk | 3014 perk service | perks drawer, resident card, map details | perks/redemptions/reports | route surface exists |
| Event | 3014 event service | events drawer, map details, RSVP | RSVP/check-in/follow-up | route surface exists |
| Campaign | 3014 campaign service | partner campaigns, map overlays | publish/pause/archive/reporting | route surface exists |
| QR | 3014 QR service | resident entry, scans, redemptions | QR scan/analytics/audit | route surface exists |
| Report | 3014 reporting service | partner reports, workspace insights | reports/export/analytics | route surface exists |
| Analytics | 3014 analytics service | invisible action tracking | analytics, reports, audit | partially universal |
| Automation | 3014 automation service | notifications, follow-up, reminders | automation triggers/actions | route surface exists |
| AI | 3014 agent platform | Ask the Map, partner assistant, reports | agent query/stream/tools/memory | strongest current alignment |
| Billing | 3014 billing service | pricing, checkout, workspace plan | products/prices/checkout/subscription | endpoint mismatch remains |

## Current Duplication

- 5173 still contains static map/entity registries.
- 5173 still uses Base44 repositories for several product and workspace reads/writes.
- 5173 still contains some workflow decisions inside page components.
- 3014 exposes generic entity routes that are useful during migration but should not be the final production contract for critical workflows.

## Required Domain Ownership Rule

No new domain behavior should be added to React pages or local product registries. New behavior must be added to the corresponding 3014 domain service, then consumed by 5173 through a typed platform client.
