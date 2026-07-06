# Downtown Perks OS Rebuild Blueprint

Canonical rebuild specification: [Downtown Perks Product Operating System Specification](./product-operating-system-specification.md).

This file remains a historical blueprint and product-area summary. New rebuild work should follow the Product Operating System Specification first, then use this file only for supporting context.

Downtown Perks should behave like a premium native-feeling operating system for downtown discovery, not a dashboard.

## Product Areas

| Surface | Primary job |
| --- | --- |
| Resident App | Decide where to go, what to unlock, and what is nearby |
| Partner Workspace | Launch offers, events, campaigns, surveys, reports, and billing |
| Admin Marketing Studio | Govern content, campaigns, partners, approvals, distribution, and reporting |
| Public Site | Sell the system clearly and elegantly |

## Shared Campaign Object

Campaign is the central object. Perks, events, surveys, sponsored placements, broadcasts, and partner activations are campaign types.

Required fields:

`id`, `type`, `objective`, `partnerId`, `locations`, `audience`, `content`, `media`, `placement`, `budget`, `status`, `preview`, `test`, `approval`, `report`.

## Creation Flow

Objective -> Campaign Type -> Audience -> Content -> Placement -> Preview -> Test -> Launch -> Report.

Rules:

- Draft mode is always available.
- Preview is required before launch.
- Test send is required before live deployment.
- Approval is required for paid or public placements.
- Reporting is generated after launch.

## UI Direction

- Bright white canvas.
- Navy typography.
- Restrained gold accents.
- Thin dividers.
- Rectangular cards with 8px or smaller radii.
- Mobile bottom navigation for app surfaces.
- Desktop left rail for workspace and admin surfaces.
- No dark dashboard panels.
- No bento UI.
- No dense mobile admin tables.

## Implemented Wireframe Route Set

The Admin Marketing Studio now has a wireframe-level route surface:

- `/admin-studio/command-center`
- `/admin-studio/campaign-builder`
- `/admin-studio/audience-builder`
- `/admin-studio/content-library`
- `/admin-studio/approval-queue`
- `/admin-studio/distribution`
- `/admin-studio/performance`
- `/admin-studio/partner-intelligence`

The shared source of truth is `src/content/downtown-perks/downtownPerksOSBlueprint.ts`.
