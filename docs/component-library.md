# Component Library Audit

## Component Rule

Downtown Perks should have one shared component language. Resident, partner, marketing, workspace, map, report, campaign, and admin surfaces may change content and hierarchy, but they should not invent new buttons, cards, drawers, filters, tables, charts, or typography systems.

## Current Shared Primitives

Primary primitives exist under `src/components/ui`:

- button
- card
- dialog
- drawer
- sheet
- tabs
- table
- input
- textarea
- select
- badge
- tooltip
- toast
- skeleton
- progress

Additional product primitives exist outside the UI folder:

- `AppButton`
- `AppButtonGroup`
- `BottomSheet`
- `PremiumCard`
- `SectionHeader`
- `UniversalSearch`
- map/drawer-specific panel components
- partner workspace cards and action rows
- pricing/contact page-specific controls

## Component Drift Inventory

| Component category | Current duplicate locations | Risk |
| --- | --- | --- |
| Buttons | UI button, app buttons, map panel buttons, pricing buttons, contact buttons, partner workspace actions | inconsistent sizing/weight/chrome |
| Cards | UI card, premium card, report cards, saved cards, campaign cards, workspace cards | nested-card and border drift |
| Drawers/sheets | UI drawer/sheet, map drawer shell, bottom sheet, entity drawer, saved drawer, partner panels | mobile height/scroll regressions |
| Search | universal search, map search console, global nav search, Ask the Map prompts | duplicated behavior/context |
| Filters/chips | search rails, report filters, map filters, pricing toggles | inconsistent control states |
| Tables | UI table, reports tables, activity rows | mobile overflow risk |
| KPI/metrics | report metrics, workspace snapshot cards, campaign cards | dashboard-like drift |
| Timeline/activity | partner activity, reports activity, workspace activity | copy/layout inconsistency |
| Charts | reports, analytics, campaign performance | inconsistent visual grammar |
| Dialogs/popups | UI dialog, page-specific modals, drawer popups | accessibility and focus risk |

## Target Primitive Registry

| Target primitive | Purpose | Migration owner |
| --- | --- | --- |
| `DPButton` | one action system for primary, secondary, text, icon, danger, loading | design system |
| `DPActionBar` | sticky/non-sticky CTA groups with safe-area handling | drawers/workspace |
| `DPCard` | single white editorial card with optional media and metric variants | all surfaces |
| `DPDrawer` | full-width mobile bottom drawer and desktop side drawer | map/entity/workspace |
| `DPSheet` | modal sheet for non-map workflows | platform UI |
| `DPSearchConsole` | Ask the Map/search input, rails, context, streaming status | map/search/AI |
| `DPFilterRail` | icon/text filter rail, secondary rail, active state | map/reports |
| `DPEntityRow` | shared row hierarchy for properties, perks, events, venues, hotels | map/drawers |
| `DPMetric` | editorial KPI with metric, trend, insight sentence | reports/workspace |
| `DPTable` | thin-separator responsive table | reports/admin |
| `DPTimeline` | chronological activity feed | partner/activity/admin |
| `DPChart` | navy/gold chart grammar and accessible labels | analytics/reports |
| `DPLoadingState` | skeleton/loading layouts | all routes |
| `DPEmptyState` | recovery-based empty state | all routes |
| `DPErrorState` | actionable errors | all routes |

## Migration Sequence

1. Freeze current final CSS governance so the product stays visually stable.
2. Build primitives in `src/components/platform/`.
3. Migrate map drawers/search first because they affect the most routes.
4. Migrate partner reports/activity/campaign/info panels.
5. Migrate workspace home/modules.
6. Migrate pricing/contact/partner lifecycle controls.
7. Remove page-specific selectors after the component is migrated.

## Non-Negotiable Component Requirements

- Inter for all app UI except the scoped opening/story animation headline exception.
- White surfaces, soft borders, minimal shadow, no grey/beige slabs.
- Mobile-safe height and scroll behavior.
- WCAG-visible focus states.
- Loading, empty, error, and disabled states.
- No nested cards unless a modal or repeated item truly requires a card.
- No business logic inside visual primitives.

## Current Score

Component library score: **6/10**

The raw primitives exist, but too many production surfaces still use page-specific buttons, cards, drawers, and filters. The next platform milestone should migrate high-traffic surfaces to the target registry and then delete the duplicate CSS.
