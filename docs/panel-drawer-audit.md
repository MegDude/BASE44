# Downtown Perks panel and drawer audit

Date: 2026-07-16
Primary QA route: `/map?mode=resident&tab=map&filter=Events&collection=events-nearby`
Primary QA viewport: iPhone 15, `393 × 852`

## Scope

This audit covers the current resident and partner panel systems before any native-sheet rebuild. The product is not ready for another feature-specific drawer polish pass. The active issue is architectural: several drawer, sheet, modal, and panel systems coexist and each owns part of navigation, scroll, URL state, or map context.

The replacement direction is one shared `NativeSheet` engine with three stable levels:

```text
Map or page
→ Level 1 Peek
→ Level 2 Browse
→ Level 3 Detail or focused task
```

## Source dependency map

```text
Routes
  ↓
src/App.jsx
  ├─ /map → src/pages/Map.jsx
  ├─ /app/map → redirect-only compatibility alias → /map
  ├─ /resident/home → src/pages/ResidentHome.tsx → DashboardPage.tsx
  └─ /resident → no explicit route in current route table

Map page
  ↓
src/pages/Map.jsx
  ├─ SearchIntentConsole and map controls
  ├─ CollectionRoutePanel
  ├─ MapSheet / NativeDrawerHandle / MapSheetToolbar
  ├─ raw dialog panels for pass, results, partner panels, clusters, entities
  ├─ entity-specific drawer components
  ├─ ResidentPerkRedemptionSheet
  └─ About and QR modal surfaces

Prototype / alternate sheet engines
  ↓
src/features/native-map/*
src/components/map/unified/UnifiedDrawer.jsx
src/components/map/MobileTabDrawerShell.tsx
src/components/ui/BottomSheet.jsx
```

## Inventory

| Panel | Route/state | Role | Trigger | Current height | Content | Primary action | Problems | Canonical replacement |
| ----- | ----------- | ---- | ------- | -------------- | ------- | -------------- | -------- | --------------------- |
| Search intent console | `/map`, resident and partner modes | Resident/Partner | Map route load, search input, intent filters | Floating top console, variable expanded/collapsed state | Query input, intent chips, role switch, filter context | Search / intent selection | Competes with sheet space and has its own expanded surface; can overlap active map context | Keep as collapsed search control plus expanded intent console. Expanded console must dismiss or reduce Browse sheet and return results into Browse. |
| Collection route panel | `/map?...&collection=*` when route has stops | Resident | Active collection route | Independent bottom/side panel | Route title, stop list, start/view actions | Start or inspect stops | Uses a separate component and state from map sheets; route stops can destroy route context | `NativeSheet` Browse with context `route`, then Detail with context `route-stop`. |
| Resident Card pass panel | `/map?mode=resident&tab=card` and pass states | Resident | Bottom nav Card or pass tab | `MapSheet` / dialog-like panel | Resident card, QR, identity/account content | Show or use card | Card mixes task content with map drawer mechanics; bottom nav and full panel can compete | Dedicated focused card task surface or `NativeSheet` Detail context `resident-card`; QR must be large and scan-first. |
| Partner pass/scanner panel | `/map?mode=partner&tab=pass` | Partner | Partner pass tab or QR action | `MapSheet` variant | Scan, publish, or operational partner controls | Operational action | Reuses resident map panel style with partner-specific controls appended | Partner focused task sheet with status, action, confirmation, and return to partner Detail. |
| Resident results drawer | `/map?mode=resident&tab=perks/events/saved/info` and no selected entity | Resident | Bottom nav, filter, collection, search result | Raw `role="dialog"` `.dp-panel-shell` | Results, saved lists, events, perk lists, info panels | Open item or primary panel action | One large branch renders many unrelated modes; result browse and tab content share the same shell but not a defined level | `NativeSheet` Browse context `results` or `collection`. |
| Partner workspace panels on map | `/map?mode=partner&tab=campaigns/reports/activity/info` | Partner | Partner bottom tabs / partner actions | Raw `role="dialog"` `.dp-panel-shell` | Campaign, reports, activity, civic/info panels | Edit, inspect, or preview | Resident browse patterns and partner operational controls are mixed in the same panel framework | `NativeSheet` Browse/Detail with partner-specific content priorities: status, performance, action required, edit/publish. |
| Cluster drawer | Map cluster click with no selected entity | Resident/Partner | Marker cluster click | Raw `role="dialog"` `.dp-panel-shell` | Cluster title, subtitle, list of places | Select a place | Separate close/back path and scroll owner from result Browse | `NativeSheet` Browse context `results`, source `cluster`. |
| Selected entity detail drawer | `entityId=*`, selected marker/listing | Resident/Partner | Marker click, row tap, URL deep link | Raw `role="dialog"` `.dp-panel-shell` | Entity-specific detail component, actions, media, related content | Context-dependent: directions, save, RSVP, redeem, edit | Many entity-specific drawer components render inside one shell; back/close behavior depends on local booleans (`selectedDrawerClosed`, `selectedDrawerMinimized`) | `NativeSheet` Detail context `entity`, `event`, `perk`, `property`, `hotel`, or `partner`. |
| Event detail drawer | Selected event-like entity | Resident/Partner preview | Entity selection | Entity detail branch inside selected drawer | Event title, date, venue, RSVP/calendar, related content | RSVP / calendar / directions | Event content competes with full entity story and sometimes duplicates browse facts | `EventDetailSheet` content module inside Detail. |
| Perk redemption sheet | Perk redemption flow | Resident | Redeem / QR action | Independent overlay/dialog | QR or redemption instructions, back/close | Redeem / show QR | Focused task is detached from sheet hierarchy; return context can be fragile | Focused Level 3 task sheet with parent snapshot. |
| About Downtown Perks modal | About/info triggers | Resident/Partner | Info/about controls | Modal dialog | Product explanation | Close | Global explanatory modal; should not become map browse/detail | Keep as global modal only if still needed; not part of map sheet hierarchy. |
| QR modal | QR action surfaces | Resident/Partner | QR-related action | Modal | QR code and action copy | Scan / close | Another independent modal path with separate focus and close behavior | Focused task sheet for resident card/perk/partner QR unless a true global modal is required. |
| Resident home dashboard panel | `/resident/home` | Resident | Direct route | Page panel, not a sheet | Dashboard modules and bottom nav | Open map / panels | Home duplicates too many map, perks, events, saved, and card responsibilities | Concise launch surface. Do not embed complete map/perks/events applications. |
| Resident home saved/card panels | `/resident/home?panel=perks`, `/resident/home?panel=card` | Resident | Resident bottom nav or in-page action | Page-level panel | Saved perks or card/profile details | Open saved perk / card action | Home panel acts like a second app while map tabs also exist | Keep only concise saved/card summaries or move full task to native app surface. |
| MobileTabDrawerShell | Component-level drawer | Mixed/legacy | Component import | Collapsed/medium/expanded/full states | Generic drawer | Close / state change | Alternate sheet engine with independent state semantics | Archive or migrate call sites to `NativeSheet`. |
| UnifiedDrawer | Explore rebuilt prototype | Mixed/prototype | ExploreRebuilt page | Collapsed/mid/full | Unified prototype drawer | Select / close | Not used by canonical map route but creates competing architecture | Treat as reference only or archive after migration. |
| `features/native-map/NativeBottomSheet` | Native-map prototype | Mixed/prototype | NativeMapShell only | Open/closed | Prototype sheet renderer | Back / close | Useful concept but too narrow: `activeSheet` is only `"entity" | "search" | "qr" | "reward" | "tab"` and not the requested Peek/Browse/Detail model | Either replace with new shared `NativeSheet` or evolve it before adopting. |

## Current state sources that must be retired or consolidated

- `clusterDrawer`
- `selectedDrawerClosed`
- `selectedDrawerMinimized`
- `nativeDrawerState`
- `activePartnerPanel`
- independent query-driven tabs used as sheet substitutes
- modal booleans for focused tasks that should return to a parent sheet snapshot

## Immediate risks

1. Back and close are not governed by a single hierarchy.
2. Browse, detail, focused task, and modal states can overlap.
3. More than one component calculates mobile panel geometry.
4. Several CSS files override `[role="dialog"]` and `.dp-panel-shell` globally.
5. URL state is meaningful for entity/filter/tab, but not yet for stable sheet levels.
6. `/resident/home` duplicates map/perk/event/card capabilities rather than launching into them.

## First safe implementation seam

Start with `Events Nearby`:

```text
/map?mode=resident&tab=map&filter=Events&collection=events-nearby
```

This path exercises collection Browse, event Detail, save/calendar/directions actions, marker selection, and browser-back restoration without requiring every entity type to be migrated in one pass.
