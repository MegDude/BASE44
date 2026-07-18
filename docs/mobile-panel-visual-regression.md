# Mobile panel visual regression plan

Date: 2026-07-16

## Required screenshot states

Capture before and after screenshots for:

| Screenshot ID | Route/state | Viewports |
| ------------- | ----------- | --------- |
| `resident-map-peek` | `/map?mode=resident&tab=map&filter=Events&collection=events-nearby&sheet=peek` | 393×852, 1440×900 |
| `resident-events-browse` | same route, Browse active | 393×852, 1440×900 |
| `resident-event-detail` | selected event entity, Detail active | 393×852, 1440×900 |
| `resident-perk-detail` | selected perk entity | 393×852, 1440×900 |
| `resident-route-browse` | selected route collection | 393×852, 1440×900 |
| `resident-route-stop-detail` | route stop Detail | 393×852, 1440×900 |
| `resident-property-detail` | property or building entity | 393×852, 1440×900 |
| `resident-home` | `/resident/home` | 393×852, 1440×900 |
| `resident-card` | `/map?mode=resident&tab=card` and `/resident/home?panel=card` | 393×852, 1440×900 |
| `partner-map-browse` | `/map?mode=partner&tab=map&filter=All` | 393×852, 1440×900 |
| `partner-entity-detail` | partner selected entity | 393×852, 1440×900 |
| `partner-campaign-detail` | partner campaign Detail | 393×852, 1440×900 |
| `partner-publish-sheet` | focused partner publish task | 393×852, 1440×900 |
| `filter-sheet` | focused filter sheet | 393×852, 1440×900 |
| `authentication-sheet` | auth task opened from perk | 393×852, 1440×900 |
| `empty-state` | no matching results | 393×852, 1440×900 |
| `loading-state` | loading Browse or Detail | 393×852, 1440×900 |
| `error-state` | map/detail data error | 393×852, 1440×900 |

## Visual checks

Flag regressions when any of these occur:

- bottom navigation overlaps sheet content
- sheet hides Google attribution or legal controls
- Detail opens with multiple competing primary buttons
- Browse rows become full marketing cards
- filters return to oversized pill/bubble treatment
- content clips at iPhone 15 height
- media rails create nested vertical scrolling
- route context disappears after opening a stop
- Back and Close appear with identical behavior
- partner edit controls appear in resident mode
- resident redemption actions appear in partner management mode
- grey/dark blocks replace bright white native surfaces

## Design baseline

Use restrained Downtown Perks app styling:

```text
Navy: #0B1F33
Secondary Navy: #132238
Gold: #C8A96A
White: #FFFFFF
Background: #F7F8FB
Border: rgba(11, 31, 51, 0.08)
Inter only
```

Use one frosted sheet surface, not frosted cards inside frosted cards.
