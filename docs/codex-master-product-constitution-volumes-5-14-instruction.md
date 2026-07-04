# Codex Master Instruction: Downtown Perks Product Constitution Volumes 5-14

Project: Downtown Perks  
Primary build target: `http://localhost:5173`  
Status: Codex execution instruction  
Purpose: Create the missing product constitution volumes and use them to govern future implementation.

## Operating Rules

Work as a documentation and implementation-governance pass first. Do not redesign or rewrite runtime code unless a specific batch explicitly requires it.

Before editing app code, create or update the governing document for that subsystem, then implement only the smallest matching code batch.

Preserve the Downtown Perks design system:

- Background: `#F7F8FB`
- Surface: `#FFFFFF`
- Navy: `#0B1F33`
- Emerald map/pin system: `#0B3E31`
- Gold: `#C8A96A`
- Primary app font: Inter
- Instrument Serif only for approved display/hero moments
- Bright white panels
- Full-width mobile-first drawers
- Premium rectangular controls
- No beige/cream systems, dark dashboard panels, duplicate visual languages, or generic admin copy on partner-facing pages

## Required Execution Order

1. Audit existing docs before creating new ones:
   - `docs/component-library.md`
   - `docs/design-system.md`
   - `docs/downtown-perks-map-experience-v6.md`
   - `docs/downtown-perks-platform-architecture-v5.md`
   - `docs/downtown-perks-experience-governance.md`
   - `docs/downtown-perks-master-product-constitution-volume-12-data-content-entity-governance.md`
   - `docs/downtown-perks-master-product-constitution-volume-13-future-product-evolution.md`
2. Identify duplicated, outdated, or conflicting rules.
3. Create canonical volumes as separate Markdown files.
4. Add an index file linking every volume and status.
5. Only after docs exist, use them to guide app cleanup in small batches.
6. For every batch, report files changed and verification only.

## Required Document Set

Create these files under `docs/product-constitution/`:

- `volume-05-canonical-component-design-system.md`
- `volume-06-copy-system-ux-writing.md`
- `volume-07-map-platform-specification.md`
- `volume-08-resident-information-architecture.md`
- `volume-09-agentic-ai-architecture.md`
- `volume-10-complete-qa-platform-audit.md`
- `volume-11-motion-interaction-system.md`
- `volume-12-design-token-library.md`
- `volume-13-data-entity-schema.md`
- `volume-14-platform-governance.md`
- `INDEX.md`
- `IMPLEMENTATION_AUDIT.md`

If an older volume exists with overlapping content, do not delete it. Reference it, reconcile it, and mark whether the new file supersedes or extends it.

## Volume 5: Canonical Component Design System

Define the single component library for every surface:

- Marketing
- Resident map
- Explore
- Perks
- Events
- Saved
- Resident card
- Properties
- Hotels
- Venues
- Brands
- Civic
- Partner workspace
- Campaigns
- Reports
- Admin and internal tooling
- AI/Ask the Map

Every component specification must include:

- Purpose
- Usage criteria
- Variants
- Props/data contract
- States: default, hover, focus, active, selected, disabled, loading, empty, error, success, readonly
- Responsive behavior
- Accessibility requirements
- Content rules
- Analytics hooks
- CSS class contract
- Allowed tokens
- Anti-patterns
- Extension rules
- Regression tests

Canonical inventory:

- `DPButton`
- `DPActionBar`
- `DPIconButton`
- `DPInput`
- `DPTextarea`
- `DPSelect`
- `DPSearch`
- `DPFilterRail`
- `DPChip`
- `DPBadge`
- `DPTabs`
- `DPBottomNav`
- `DPDrawer`
- `DPSheet`
- `DPModal`
- `DPToast`
- `DPAlert`
- `DPLoadingState`
- `DPEmptyState`
- `DPErrorState`
- `DPCard`
- `DPEntityCard`
- `DPCollectionCard`
- `DPCampaignCard`
- `DPMetric`
- `DPTable`
- `DPTimeline`
- `DPMapPin`
- `DPMapCluster`
- `DPMapControl`
- `DPRouteOverlay`
- `DPAskMap`
- `DPPromptChip`
- `DPResponseCard`
- `DPQRCode`
- `DPScanner`

Non-negotiable rule:

One component is created once, configured many times, and never duplicated. Context differences must be handled through props, slots, variants, or composition.

## Volume 6: Copy System And UX Writing

Define the product voice and copy rules for:

- Headlines
- Subheads
- Body copy
- CTAs
- Drawer copy
- Panel copy
- Empty states
- Loading states
- Error states
- Success states
- Notifications
- Form labels
- Validation
- Partner-facing copy
- Resident-facing copy
- Legends/property copy
- Campaign copy
- AI answers
- Report summaries

Voice rules:

- Plain, useful, and local.
- Use everyday language.
- Avoid generic SaaS language.
- Avoid internal/admin terms on public or partner-facing pages.
- Do not call commercial buildings residential.
- Do not use "want to live here?" as a universal property fallback.
- Perks, campaigns, and CTAs must match the actual listing, offer, brand, place, or location.

Every copy pattern must define:

- Audience
- Intent
- Allowed wording
- Forbidden wording
- CTA hierarchy
- Fallback copy
- Empty/error/success copy
- Examples for resident and partner modes

## Volume 7: Map Platform Specification

Govern the entire map product:

- Google Maps JavaScript API only
- No iframe/embed maps
- Shared loader only
- `VITE_GOOGLE_MAPS_API_KEY`
- Optional `VITE_GOOGLE_MAP_ID`
- Branded basemap styling
- Circular pin system
- Legends logo pins for Legends listings/properties
- inKind pin rule
- Clustering
- Route overlays
- Collection routes
- Search
- Ask the Map
- Drawers
- Filters
- Layers
- Entity deep links
- Browser back/forward
- Mobile bottom sheet
- Partner map mode
- Performance budgets

Required map acceptance:

- Real Google map loads.
- No blank canvas.
- No default Google app-owned pins.
- Pins are correctly sized, anchored, and clickable.
- Legends listings use the Legends logo.
- Panels open without covering or being covered by the fixed bottom nav.
- Collections can render branded route overlays.
- Search and Ask the Map read from the same entity registry.

## Volume 8: Resident Information Architecture

Define every resident route and screen hierarchy:

- `/`
- `/app`
- `/map`
- Map tab
- Perks tab
- Events tab
- Saved tab
- Card/pass tab
- Info tab
- Entity drawer
- Collection route panel
- Search results drawer
- Filter drawer
- Legends/property drawer
- Event drawer
- Parking drawer
- Civic drawer

For every route define:

- Purpose
- Audience
- Entry points
- URL params
- State hydration
- Back/forward behavior
- Empty/loading/error behavior
- Primary CTA
- Secondary CTAs
- Related routes
- Analytics events

## Volume 9: Agentic AI Architecture

Define Ask the Map and partner intelligence:

- Resident intelligence
- Partner intelligence
- Map intelligence
- Campaign intelligence
- Reports intelligence
- Search and ranking
- Entity relationship context
- Prompt chips
- Drawer context
- Tool calls
- Backend integration boundaries
- Fallback behavior
- Safety and no-fake-data rules

Define contracts:

```ts
type AgentContext = {
  query: string;
  mode: "resident" | "partner";
  activeTab: string;
  activeFilter: string;
  activeLayer?: string;
  activeCollection?: string;
  activeEntity?: string;
  userLocation?: unknown;
  mapBounds?: unknown;
  timeContext?: string;
  selectedDistrict?: string;
  savedEntities: string[];
  visibleEntityIds: string[];
};

type AgentResult = {
  answer: string;
  intent: string;
  confidence: number;
  recommendedEntityIds: string[];
  appliedFilters: Record<string, string>;
  suggestedActions: Array<{ label: string; action: string; payload?: unknown }>;
  route?: string;
  mapFocus?: unknown;
  drawerEntityId?: string;
};
```

AI must use live app data where available and must not return static FAQ answers when registry-backed recommendations exist.

## Volume 10: Complete QA And Platform Audit

Define QA for:

- Build
- Lint
- Type checks where available
- Route smoke tests
- Mobile viewports
- Desktop viewports
- Visual regression
- Accessibility
- Keyboard navigation
- Forms
- Drawers
- Modals
- Map load
- Pins
- Search
- Ask the Map
- Partner workspace
- Campaigns
- Reports
- Backend integration health
- Console errors
- Broken images
- Dead links

Required audit outputs:

- `IMPLEMENTATION_AUDIT.md`
- Route checklist
- Component checklist
- Copy checklist
- Map checklist
- Backend integration checklist
- Known gaps
- Deferred work

## Volume 11: Motion And Interaction System

Define:

- Page transitions
- Drawer transitions
- Bottom sheet snap behavior
- Pin hover/selection
- Route overlay reveal
- Cluster expansion
- Search expansion
- Loading transitions
- Button feedback
- Haptics where applicable
- Reduced motion behavior

Rules:

- No bounce animations.
- Use subtle scale, opacity, and transform.
- Motion must never block interaction.
- Respect `prefers-reduced-motion`.

## Volume 12: Design Token Library

Create semantic tokens for:

- Color
- Typography
- Spacing
- Radius
- Borders
- Shadows
- Z-index
- Motion
- Map colors
- Form states
- Focus states
- Safe-area/bottom-nav spacing

All components must reference semantic tokens, not random hard-coded values.

## Volume 13: Data And Entity Schema

Define canonical schemas for:

- Entity
- Place
- Perk
- Offer
- Event
- Property
- Residential listing
- Hotel
- Venue
- Brand
- Civic asset
- Campaign
- Collection
- Route overlay
- Partner
- Report
- Activity
- AI context

Every real-world object exists once and is referenced everywhere else by ID.

## Volume 14: Platform Governance

Define:

- Change management
- Versioning
- Deprecation
- Feature flags
- Documentation ownership
- Component extension rules
- Copy review
- Data review
- QA gates
- Release readiness
- Git/deploy expectations
- How Codex should handle broad requests

Governance rule:

No broad product rewrite may happen without a batch scope, assumptions, change plan, files changed, and verification.

## Required Implementation Audit

After creating the volumes, audit whether the prior instructions were fully executed. Do not claim completion without evidence.

Audit at minimum:

- Google Maps loader and env behavior
- Real Google map route load
- Branded basemap
- Circular app-owned pins
- Legends listing logo pins
- inKind pin treatment
- Fixed bottom nav
- Drawers above bottom nav
- Saved tab full-width cleanup
- Resident card copy
- Legends panel real-estate focus
- Frost Tower commercial positioning
- Partner campaign page and launch form
- Partner sign-in cleanup
- Partner workspace copy
- Campaign CTAs and backend workflow calls
- No blank/grey map canvas
- No broken images
- No console map API errors

For each item record:

- Status: pass, partial, fail, not inspected
- Evidence: file, route, or test
- Remaining action

## Partner Campaign Page Requirement

When implementing `/partners/campaigns#launch-campaign`, treat it as a partner-facing frontend workflow:

- Hero must match Downtown Perks design system.
- Copy must be commercial, plain, and useful.
- CTAs must be wired.
- Launch form must submit through the existing backend workflow/client if present.
- If the backend endpoint is unavailable, preserve the form data client-side and show a clear non-fake pending state.
- Do not expose admin/audit/back-office language.

Hero copy:

```txt
Campaigns
Show up when people are already making plans.
Campaigns help your organization appear inside nearby decisions — where to go, what to do, what to save, and what to visit next.
```

Primary CTA:

```txt
Launch a Campaign
```

Secondary CTA:

```txt
Open Partner Map
```

## Final Completion Standard

This instruction is complete only when:

- Volumes 5-14 exist as separate docs.
- An index links them.
- Existing docs are reconciled.
- The implementation audit exists.
- The audit identifies what is complete and what remains.
- No runtime app behavior is changed unless explicitly scoped in a follow-up batch.
