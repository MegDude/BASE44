# Mobile panel regression matrix

Date: 2026-07-16

Use this as the required checklist for the native sheet migration. The first implementation target is `Events Nearby`.

| Journey | Route/state | Expected behavior | Current baseline risk | Status |
| ------- | ----------- | ----------------- | --------------------- | ------ |
| Open Events collection | `/map?mode=resident&tab=map&filter=Events&collection=events-nearby` | Peek shows correct context and count; Browse can expand without map jump | Multiple panel branches decide whether results drawer, route panel, or selected drawer is visible | Pending implementation |
| Expand Events | Same route, `sheet=browse` | Browse opens at stable 42–55dvh height; map gets bottom padding | Current native drawer state is independent from URL and other drawers | Pending |
| Select event | `entityId=*`, `sheet=detail` | Detail opens, selected marker remains visible, Browse snapshot saved | Selected entity drawer and browse drawer are separate render branches | Pending |
| Back from event | Detail → Browse | Same Browse scroll position and map camera restore | `selectedDrawerClosed` can close detail without restoring Browse intent | Pending |
| Save event | Event Detail | Saved state updates without closing Detail | Save state may route through generic entity detail logic | Pending |
| Add to Calendar / RSVP | Event Detail | One canonical primary conversion action completes or routes safely | Multiple event action labels can compete | Pending |
| Close Browse | Browse → Peek | Returns to map Peek with collection context preserved | Close behavior currently varies by panel branch | Pending |
| Select perk | Perks Browse → Perk Detail | Correct eligibility and redemption action appears | Perk detail and QR redemption are separate sheet/modal systems | Pending |
| Authenticate from perk | Perk Detail → Auth task → same Perk Detail | Return target preserves perk and redemption intent | Auth return and panel hierarchy not unified | Pending |
| Open route | Route collection | Route and stop list remain aligned | `CollectionRoutePanel` owns independent state | Pending |
| Select route stop | Route Browse → Stop Detail | Stop Detail preserves route parent | Generic entity selection can lose route parent | Pending |
| Back from stop | Stop Detail → same route | Same route scroll position restores | No shared snapshot model yet | Pending |
| Open Resident Card | `/map?mode=resident&tab=card` or Home Card | QR fully visible and scannable | Card is split between map tab and home panel | Pending |
| Switch resident/partner | `mode=resident` ↔ `mode=partner` | Correct navigation model and content priorities load | Partner controls can share resident drawer shell | Pending |
| Partner opens campaign | Partner campaign tab/entity | Operational Detail opens with status and action | Partner panels are separate branches | Pending |
| Partner edits campaign | Partner task sheet | Returns with updated state | No shared focused-task sheet | Pending |
| Browser Back | Any sheet state | Detail → Browse → Peek → previous route | Browser Back currently mirrors URL route more than panel hierarchy | Pending |
| Keyboard open | Search/filter/auth fields | Active input remains visible above keyboard | Viewport and sheet geometry not centralized | Pending |
| Screen rotation | Any active sheet | Restores valid snap point | Several CSS files manage panel geometry | Pending |
| Reduced motion | Any transition | Hierarchy remains understandable without motion | Motion values are scattered | Pending |
| Map failure | Map provider error | Lists and panels remain usable | Map error handling is not sheet-first | Pending |

## Validation commands

Run after the first implementation patch:

```bash
npm run typecheck --if-present
npm run lint --if-present
npm run build
```

Then verify manually at:

```text
393 × 852
375 × 812
390 × 844
430 × 932
768 × 1024
1024 × 768
1440 × 900
```
