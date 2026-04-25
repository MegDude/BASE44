# Downtown Perks Site Systemization Matrix

## Purpose

This is the repo-specific implementation brief for the full systemization pass. It replaces abstract recommendations with a build order tied to the current Vite/Base44 checkout in `/Users/megdude/Downloads/BASE44-working`.

## Non-negotiables

1. One typography pairing:
   - Headings: `Manrope`
   - Body/UI: `Inter`
2. One spacing system:
   - `8 / 12 / 16 / 24 / 32 / 48 / 64`
3. One surface hierarchy:
   - `Surface 0` page canvas
   - `Surface 1` section shell
   - `Surface 2` elevated interactive item
4. One CTA model:
   - one primary CTA per section
   - one secondary CTA max
5. One route grammar:
   - `Hero`
   - `ModeSwitch`
   - `LiveIntelligence`
   - `ProofModule`
   - `Workflow`
   - `FinalCTA`

## Current repo entry points

| Route group | Page file | Shared component dependency |
| --- | --- | --- |
| Home | `src/pages/Home.jsx` | `src/components/home/*` |
| Explore | `src/pages/downtown-perks/ExploreRebuilt.jsx` | `src/components/map/unified/*` |
| Events | `src/pages/downtown-perks/Events.jsx` | `src/components/map/unified/*` |
| Perks Card | `src/pages/downtown-perks/PerksCard.jsx` | CTA/card flows |
| Partner overview | `src/pages/partners/Index.jsx` | `src/components/partner/*` |
| Partner detail pages | `src/pages/partners/*.jsx` | `src/components/partner/PartnerTypeTemplate.jsx` |
| Partner workspace | `src/pages/PartnerWorkspace.jsx` | dashboard/operator surfaces |
| Dashboard | `src/pages/Dashboard.jsx`, `src/pages/DashboardHub.jsx` | analytics + partner map |
| Resident app | `src/pages/resident-app/index.jsx` | resident tabs + shared map state |

## Build order

### Phase 1 — Foundation lock

Files:
- `src/index.css`
- `src/lib/design-system.js`
- `tailwind.config.js`
- `src/components/shared/PremiumCard.jsx`
- `src/components/shared/SectionHeader.jsx`
- `src/components/shared/StatGrid.jsx`
- `src/components/shared/CTA.jsx`

Goals:
- lock typography, spacing, radius, and surface tokens
- remove ad hoc border-heavy defaults
- standardize button, card, chip, and input primitives

Exit criteria:
- every new route-level refactor can use one token layer

### Phase 2 — Navigation and footer normalization

Files:
- `src/components/Navbar.jsx`
- `src/components/Footer.jsx`
- `src/components/Layout.jsx`
- `src/components/HomeFooter.jsx`

Goals:
- reduce top-nav sprawl
- keep resident-facing nav lean
- move dashboard/operator links out of general public nav
- calm the footer information architecture

Exit criteria:
- no duplicate nav labels for the same destination
- no competing card/map/card CTA labels in nav

### Phase 3 — Home rewrite

Files:
- `src/pages/Home.jsx`
- `src/components/home/HeroSection.jsx`
- `src/components/home/WhySection.jsx`
- `src/components/home/PartnerSlides.jsx`
- `src/components/home/PricingSection.jsx`
- `src/components/home/FAQSection.jsx`
- `src/components/home/ContactSection.jsx`

Target structure:
1. Hero
2. Prompt search
3. Live map preview
4. Product tabs: Places / Events / Perks / Properties
5. How it works
6. Partner overview
7. FAQ
8. Final CTA

Delete or merge:
- duplicate explainer blocks
- repeated trust-strip copy
- generic bordered promo stacks

### Phase 4 — Explore and Events alignment

Files:
- `src/pages/downtown-perks/ExploreRebuilt.jsx`
- `src/pages/downtown-perks/Events.jsx`
- `src/components/map/unified/*`
- `src/components/map/markers/MarkerFactory.jsx`

Goals:
- one map interaction language
- one results panel pattern
- one drawer pattern
- one chip/filter system
- event cards look like the same system as places and perks

Critical engineering rule:
- `src/store/mapStateStore.ts` becomes the only canonical map store path
- legacy `src/store/map-store.js` usage must be removed or fully wrapped

### Phase 5 — Partner overview and shared partner template

Files:
- `src/pages/partners/Index.jsx`
- `src/components/partner/PartnerTypeTemplate.jsx`
- `src/components/partner/PartnerInsightMap.jsx`
- `src/components/partner/PartnerCTASection.jsx`
- `src/components/partner/LiveActivityFeed.jsx`
- `src/lib/partnerContent.js`

Goals:
- keep one overview structure
- keep one detail-page structure
- use one proof model per role
- reduce repeated “system/layer/intelligence” copy

Target structure for `/partners`:
1. Hero
2. Partner type selector
3. Operating model
4. Intelligence map
5. Proof/showcase
6. Final CTA

Target structure for each partner type route:
1. Hero
2. Use cases
3. Map/intelligence
4. Workflow
5. Proof/outcomes
6. CTA

### Phase 6 — Partner workspace and dashboard consolidation

Files:
- `src/pages/PartnerWorkspace.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/DashboardHub.jsx`
- `src/components/analytics/*`

Goals:
- same visual language, higher density
- no separate dashboard design dialect
- one metric card logic
- one table logic
- one filter bar logic

### Phase 7 — Resident app pass

Files:
- `src/pages/resident-app/index.jsx`
- `src/components/resident/*`

Goals:
- lighter than partner surfaces, but same system
- faster utility framing
- consistent card/chip/detail UI
- no isolated styling inventions per tab

## Component governance

### Allowed button types
- Primary
- Secondary
- Tertiary

### Allowed card types
- InfoCard
- InteractiveCard
- FeatureCard
- MetricCard

### Allowed section wrappers
- SectionShell
- SurfacePanel
- DrawerPanel

## Cleanup rules

1. No bordered card inside bordered card unless one layer is explicitly interactive.
2. If a section has more than three sibling items, it must become a rail, accordion, or selector system.
3. Remove copy repetition before adding visual polish.
4. Product copy uses one sentence per idea.
5. Gold is an accent, not a structural fill.

## External assets provided by user

Reference bundles available outside the repo:
- `/Users/megdude/Downloads/downtown-perks-icon-pack-and-glass-ui-kit.zip`
- `/Users/megdude/Downloads/downtown-perks-svg-icon-pack.zip`
- `/Users/megdude/Downloads/MAP LOCATIONS.zip`
- `/Users/megdude/Downloads/DAST BASE.zip`
- white paper `.docx` files in `/Users/megdude/Downloads/`

Use them as:
- icon source reference
- glass UI reference
- map/location seed reference
- messaging/reference material

Do not treat them as “implemented” until they are copied into the active repo and wired into live components.
