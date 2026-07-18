# Panel content inventory

Date: 2026-07-16

This inventory classifies visible content by its proper destination so the native sheet rebuild preserves functionality without continuing to duplicate the same content across Home, Map, Browse, Detail, and Partner workspace states.

## Content classification

| Content | Current location | Proper destination | Keep | Merge | Remove | Redesign notes |
| ------- | ---------------- | ------------------ | ---- | ----- | ------ | -------------- |
| Map search | Map console | Map top controls | Yes | With Ask the Map collapsed state | No | Search should return results into Browse, not open a competing drawer. |
| Intent filters | Map console and result panels | Map controls + filter sheet | Yes | Summarize active filters in Browse | Remove oversized filter rows | Replace pill-like rows with concise summary and focused filter sheet. |
| Events nearby list | Map results drawer, Events tab, Home modules | `NativeSheet` Browse context `collection` | Yes | Merge repeated event lists | Remove duplicate lists on Home | Browse rows show time, event title, venue, district/distance, availability. |
| Event detail | Selected entity drawer | `EventDetailSheet` | Yes | Merge event-specific drawers into one detail module | Remove duplicated metadata above action row | Opening viewport must answer what, why now, and next action. |
| Perks list | Perks tab, saved panel, Home cards | `NativeSheet` Browse and Home summary | Yes | Keep one Browse list and one concise Home summary | Remove repeated perk blocks | Perk Browse rows should not include full terms. |
| Perk redemption / QR | Independent redemption sheet, QR modal, resident card | Focused Level 3 task sheet | Yes | Merge redemption QR and card QR mechanics | Remove decorative QR wrappers | QR must be scan-first, with simple partner-facing instruction. |
| Saved places/perks | Home saved panel, map Saved tab | Map Saved Browse plus Home recent summary | Yes | Merge saved data source | Remove duplicate empty states | Home shows recent or "continue exploring"; Map owns full saved list. |
| Resident card profile | Home card panel, map card tab | Dedicated card task or Detail context `resident-card` | Yes | Merge identity/account and QR states | Remove recommendations around QR | Card is a focused task, not a dense account page. |
| Route summary | CollectionRoutePanel | `RouteDetailSheet` / Browse context `route` | Yes | Merge route browse and route stop detail | Remove generic entity treatment for routes | Route is a sequence: title, duration, distance, stops, start. |
| Route stop details | Entity detail drawer | `RouteStopSheet` with route parent snapshot | Yes | Preserve route parent | No | Back returns to exact route scroll position. |
| Property detail | Selected entity drawer and Home building modules | `PropertyDetailSheet` and concise Home launch card | Yes | Merge property panels by category | Remove long marketing copy above utility | Lead with resident usefulness and benefits. |
| Hotel detail | Selected entity drawer | `HotelDetailSheet` or entity detail variant | Yes | Merge with property/hospitality modules where data matches | No | Lead with guest/resident usefulness, nearby perks, directions. |
| Partner campaign detail | Partner map panels and PartnerWorkspace | `PartnerEntitySheet` / `CampaignDetailSheet` | Yes | Shared data, separate partner IA | Remove resident editorial actions from partner management | Partner priority: status, performance, action required, edit/publish. |
| Partner reports/activity | Partner map panels | Partner Browse/Detail or workspace route | Yes | Merge operational feed and report summary | Remove placeholder/repeated metrics | Map should show spatial/operational context, workspace can handle deeper reports. |
| About/product explanation | About modal | Global modal or onboarding/marketing | Maybe | Do not merge into map sheet | Remove if duplicate | Not part of native map sheet hierarchy. |
| Loading states | Multiple panels | Shared sheet skeleton states | Yes | One skeleton grammar | Remove full-page spinner during map context | Preserve geometry while content loads. |
| Empty states | Multiple panels | Shared contextual empty state | Yes | One copy pattern | Remove "nothing here" generic copy | Explain what happened and give one recovery action. |
| Error states | Multiple panels | Shared contextual error state | Yes | One recovery pattern | No | Map failure should preserve list/sheet access. |

## Content order rules

### Browse rows

Browse is for comparison only. Rows can include:

- title
- one metadata line
- one status line
- saved state
- one disclosure affordance

Browse must not include:

- full descriptions
- multiple primary CTAs
- long addresses
- terms
- partner bios

### Detail opening viewport

Detail must show, before scrolling:

```text
1. Identity
2. Metadata
3. Why this matters now
4. Primary action row
```

Long editorial copy, terms, similar places, social links, and secondary info move below the fold.

## Duplicate content to remove during migration

- repeated entity names in header, card title, and action section
- repeated category labels when the collection already provides context
- repeated address blocks above primary actions
- duplicate event lists across Home and Map
- duplicate saved/perk lists across Home and Map
- marketing-style partner description inside operational partner Detail
- route title repeated in route Browse, route card, and route stop header
