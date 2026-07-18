# Downtown Perks Product Operating System Specification

Version: 1.0
Status: implementation specification
Primary principle: the map is the operating system; everything else is a contextual layer.

## Objective

Rebuild Downtown Perks as a map-first product operating system while keeping the application working through every phase. This is not a visual redesign. It is a repository-first architecture program that joins product philosophy, data model, navigation, design system, motion, state, backend contracts, QA, and rollout into one implementation path.

The resident should not feel like they are moving between disconnected pages. They should feel like the map remains alive while sheets, overlays, passes, cards, lists, perks, and partner actions appear as layers over that map.

## Current Repository Assessment

### Working foundation

- The canonical resident map surface is `/map`; `/app` remains the launch/guest entry and the retired `/app/map` alias redirects into `/map` without owning UI or data.
- The app has a working Vite/React build, lazy route loading, Vercel deployment, API routes under `api/`, database/schema modules under `src/db` and `src/lib/database`, and map-specific domain code under `src/lib/map`.
- There are useful primitives already present: Radix UI, Vaul, Framer Motion, Zustand, TanStack Query, Leaflet, shared button components, query client, Supabase clients, and map registry build/QA scripts.
- The product direction is already partly documented in existing map and platform architecture docs.

### Main architectural debt

- `src/pages/Map.jsx` is the core product surface and currently carries too much responsibility: routing state, entity classification, panel rendering, QR flows, saved state, partner panels, copy synthesis, recommendations, map pin logic, drawer orchestration, and many entity-specific exceptions.
- `src/styles/typography-governance.css` has become a late-cascade override system. It is effective for urgent fixes but is not a scalable design system.
- Entity data is spread across `src/data/map/*`, `src/data/production/*`, `src/data/supplementalMapEntities.js`, `src/data/mapNativeCampaigns.js`, `src/lib/useLocations.js`, and additional feature-specific registries.
- Entity rendering still depends on many bespoke branches for hotels, properties, events, brands, parking, civic, inKind, happy hour, campaigns, listings, and local services.
- State management is split across URL params, local component state, localStorage, multiple map stores, resident stores, RSVP stores, Ask Map contexts, and query state.
- Navigation still contains route-era concepts even though the target product model is persistent map plus layers.
- Backend/API routes exist, but the front-end entity/touchpoint/analytics model is not yet normalized around one canonical event and entity contract.

## Product Philosophy

The map is the persistent product surface.

Pages become layers:

- Bottom sheet
- Side sheet
- Modal sheet
- Overlay
- Floating card
- Context menu
- Popover
- Pass/card presentation

Avoid full route transitions for resident exploration unless the user is entering a separate workspace, auth flow, or external action. The resident IA becomes:

- Map
- Explore
- Saved
- Activity
- Profile

Events, perks, brands, hotels, buildings, listings, civic places, campaigns, and restaurants are entity filters and sheet states, not separate page systems.

## Target Architecture

### Repository domains

Use clear ownership boundaries:

| Domain | Responsibility | Target home |
| --- | --- | --- |
| App shell | Routes, layout, providers, protected routes | `src/App.jsx`, `src/components/Layout.jsx` |
| Map OS | Persistent map, camera, filters, selected entity, layers | `src/features/map-os/` |
| Entity system | Normalized entity schema, adapters, renderer, sheet | `src/features/entities/` |
| Resident system | saved, pass, QR, touchpoints, profile, activity | `src/features/resident/` |
| Partner workspace | campaigns, reporting, lifecycle, billing handoff | `src/features/partner/` |
| Design system | tokens, primitives, sheet/list/button/motion contracts | `src/design-system/` |
| Data adapters | registry ingestion, normalization, validation | `src/data/`, `src/lib/map/` |
| Backend/API | tracking, save, redeem, ask-map, verification, contact | `api/`, `src/api/`, `src/lib/database/` |

### Unified entity model

All map records must normalize into one `Entity` contract before rendering.

Required fields:

```ts
type EntityKind =
  | "venue"
  | "restaurant"
  | "coffee"
  | "bar"
  | "hotel"
  | "property"
  | "listing"
  | "event"
  | "brand"
  | "civic"
  | "service"
  | "parking"
  | "perk"
  | "campaign";

type Entity = {
  id: string;
  kind: EntityKind;
  title: string;
  subtitle?: string;
  summary: string;
  hero: EntityImage;
  gallery?: EntityImage[];
  coordinates?: { lat: number; lng: number };
  address?: string;
  district?: string;
  status?: EntityStatus;
  tags: string[];
  highlights: EntityHighlight[];
  offers: EntityOffer[];
  actions: EntityAction[];
  contentBlocks: EntityContentBlock[];
  relatedEntityIds: string[];
  analytics: EntityAnalyticsContract;
  source: EntitySource;
  updatedAt: string;
};
```

No drawer, panel, card, pin, recommendation, or QR action should read raw registry records directly once the migration starts. Raw records flow through adapters into this shape.

### Universal renderer

Replace bespoke entity drawers with:

- `EntityRenderer`
- `EntitySheet`
- `EntityHero`
- `EntityActionBar`
- `EntityContentBlocks`
- `EntityRelatedList`
- `EntityNearbyList`

Each entity kind supplies configuration, not a custom drawer:

```ts
type EntityPresentation = {
  sheetVariant: "place" | "offer" | "event" | "property" | "campaign";
  primaryAction: EntityActionType;
  secondaryActions: EntityActionType[];
  blockOrder: EntityContentBlockType[];
  relatedStrategy: RelatedEntityStrategy;
};
```

## Information Architecture

### Resident IA

Keep the map mounted and persistent:

- `Map`: default camera, filters, pins, selected entity, route overlays
- `Explore`: contextual filters and curated collections over the map
- `Saved`: saved places, resident pass, perks, upcoming events, saved routes
- `Activity`: scans, saves, redemptions, RSVPs, searches, partner touchpoints
- `Profile`: resident UID, verification, preferences, privacy, notifications

### Partner IA

Partner workspace remains separate from the resident map, but it should reuse the same entity, campaign, reporting, and design contracts.

- Overview
- Map
- Campaigns
- Offers
- Events
- Surveys
- Reporting
- Billing
- Settings

### Admin/studio IA

Admin surfaces should govern inventory, approvals, content, campaigns, distribution, and performance. They should not invent a second entity model.

## Design System Refactor

### Token model

Move hard-coded values into semantic tokens:

| Token | Purpose |
| --- | --- |
| `surface/base` | app background |
| `surface/map` | persistent map canvas |
| `surface/elevated` | sheets and cards |
| `surface/material` | translucent native material |
| `surface/dialog` | modal sheets |
| `text/primary` | primary navy text |
| `text/secondary` | supporting copy |
| `text/inverse` | text over dark overlays |
| `action/primary` | navy primary actions |
| `action/accent` | gold accent actions |
| `border/subtle` | quiet dividers |
| `spacing/content` | sheet/card content rhythm |
| `motion/standard` | default spring |
| `motion/exit` | dismiss spring |

### Component rules

- One primary CTA per panel.
- Secondary actions are visibly secondary.
- Use grouped native lists instead of repeated boxed content.
- Use one shared sheet shell with handle, header, body, and footer slots.
- Use editorial hero media with gradient overlays for entity sheets.
- Use cards only for repeated item previews, not page-section framing.
- Never use horizontal rails where the user needs to read or close content safely.
- Never add a map rail.

### CSS migration

The current override file stays as a safety net during migration, but new work should move toward:

- `src/design-system/tokens.css`
- `src/design-system/surfaces.css`
- `src/design-system/components.css`
- component-scoped class contracts
- no new arbitrary final-lock blocks unless fixing production regressions

## Motion System

Motion should be a product contract, not one-off animation.

| Interaction | Contract |
| --- | --- |
| Open sheet | 320ms spring, opacity + translate, respect reduced motion |
| Dismiss sheet | 280ms spring, no layout jump |
| Hero collapse | parallax + scale + opacity |
| Save | fill + scale confirmation |
| QR/pass modal | modal sheet, focus trap, escape close |
| Filter change | pins transition without losing map state |
| Route/collection minimize | panel collapses without exiting route |

All motion must support `prefers-reduced-motion`.

## Navigation Architecture

URL params remain shareable, but state belongs to the Map OS store.

Canonical URL fields:

- `mode`
- `tab`
- `filter`
- `query`
- `entityId`
- `collection`
- `listingId`
- `campaignId`

Rules:

- URL updates are serialization of app state, not the only source of truth.
- Opening an entity should select it in store and serialize `entityId`.
- Closing a sheet should preserve map camera, filters, and collection state.
- Resident tabs should change layers, not unmount the map.
- External routes may redirect into map state when resident context is requested.

## State Management

Create one `map-os-store` as the orchestration layer:

- map camera
- active filter
- active query
- selected entity
- active sheet
- active collection/route
- saved ids
- resident UID
- QR/pass modal state
- pending touchpoint events
- partner mode panel state

Use TanStack Query for server state and Zustand for local UI/application state. LocalStorage should become a persistence adapter, not business logic inside components.

## Backend And Data Model Normalization

### Entity backend contract

Normalize these collections into one entity index:

- venues/restaurants/bars/coffee
- hotels
- residential buildings
- listings
- events
- civic assets
- brands
- services/parking
- perks/offers
- campaigns

### Touchpoint event contract

All user interactions should write one event contract:

```ts
type TouchpointEvent = {
  id: string;
  residentUid?: string;
  sessionId: string;
  entityId?: string;
  campaignId?: string;
  eventType:
    | "view"
    | "save"
    | "direction_tap"
    | "website_tap"
    | "qr_presented"
    | "redeem"
    | "rsvp"
    | "share"
    | "ask_map"
    | "filter_change";
  source: "resident_map" | "resident_pass" | "partner_workspace" | "admin_studio";
  path: string;
  timestamp: string;
  metadata: Record<string, unknown>;
};
```

The resident QR flow, perks, cards, pins, partner analytics, and saved activity must all use this single contract.

### Campaign model

Campaigns become the shared object for perks, events, surveys, paid placements, broadcasts, and brand activations. Campaign data should connect to entity ids, action ids, audience rules, distribution rules, and reporting.

## Component Consolidation Plan

### Consolidate first

Before redesigning screens, extract these from `Map.jsx`:

1. Entity classification and kind resolution
2. URL/state synchronization
3. QR/pass payload builder and touchpoint recorder
4. Saved resident panel
5. Collection route panel orchestration
6. Pin renderer
7. Entity sheet renderer
8. Partner panel renderer

### Target components

- `MapOSProvider`
- `MapOSViewport`
- `MapOSControls`
- `MapLayerManager`
- `EntitySheet`
- `EntityRenderer`
- `EntityPin`
- `EntityListRow`
- `ResidentPassSheet`
- `ResidentSavedSheet`
- `ResidentActivitySheet`
- `CollectionRouteSheet`
- `PartnerWorkspaceShell`

## Progressive Implementation Plan

### Phase 0: Audit lock

Deliverables:

- Route inventory
- Component inventory
- Data source inventory
- Store/state inventory
- API inventory
- CSS/design debt inventory
- Regression surface list

Acceptance:

- No production behavior changes
- Docs name current canonical routes and owners
- Risks and duplicate systems are listed

### Phase 1: Foundation

Deliverables:

- Semantic token files
- Sheet shell contract
- Action/button contract
- Motion presets
- Reduced-motion behavior
- Accessibility baseline for sheets/modals

Acceptance:

- Existing map continues to render
- New primitives can wrap old panel content
- No map rail added
- Lint/build pass

### Phase 2: Entity model

Deliverables:

- `Entity` type/schema
- adapters for current map registries
- entity validation script
- image/action/content normalization
- first `EntityRenderer` behind a feature flag

Acceptance:

- Existing entities normalize without losing pins
- Unknown fields are preserved under `source/raw`
- Broken image/action ids fail QA before deploy

### Phase 3: Navigation and state

Deliverables:

- `map-os-store`
- URL serialization adapter
- persistent map state
- layer state for Explore/Saved/Activity/Profile
- localStorage persistence adapters

Acceptance:

- URL share links still work
- Closing/opening sheets does not reset map camera
- Resident tabs do not unmount the map

### Phase 4: Universal sheet

Deliverables:

- `EntitySheet`
- `EntityHero`
- grouped content blocks
- one primary action + secondary actions
- related and nearby blocks
- Ask the Map block

Acceptance:

- Migrate one low-risk entity kind first
- Mobile and desktop screenshots pass
- Close and back controls always reachable

### Phase 5: Entity migration

Migration order:

1. Civic/service/parking
2. Brands
3. Events
4. Dining/coffee/drinks
5. Hotels
6. Properties/buildings
7. Listings
8. Campaigns/perks/inKind/happy hour

Acceptance per kind:

- Pins render
- Sheet renders
- Save works
- QR/redeem/pass flow works when applicable
- Related/nearby content is relevant
- No duplicate custom drawer remains for that kind

### Phase 6: Resident OS

Deliverables:

- Saved layer
- Activity layer
- Profile/pass layer
- QR modal/sheet standardization
- unique resident UID event stitching

Acceptance:

- Use/Show Card always opens resident QR/pass presentation
- All resident touchpoints capture to one UID contract
- Saved/Activity/Profile are layers over the persistent map

### Phase 7: Partner and admin alignment

Deliverables:

- Partner workspace consumes normalized entities/campaigns
- Reporting consumes touchpoint events
- Admin studio governs the same entity/campaign model
- Pricing/checkout activation flow connects to workspace state

Acceptance:

- Partner and resident surfaces do not fork data definitions
- Reports use the same event contract
- Billing setup remains separate and secure

### Phase 8: Performance and accessibility

Deliverables:

- Route-level chunk review
- `Map.jsx` size reduction targets
- CSS size reduction targets
- image lazy-loading and hero priority rules
- keyboard/focus review
- screen-reader sheet titles and close labels
- reduced-motion QA

Acceptance:

- Build passes
- No critical accessibility failures on map sheets/modals
- Initial map route remains within agreed performance budget

### Phase 9: Production rollout

Deliverables:

- Feature flags or phased route gates
- QA checklist per migrated entity kind
- rollback plan
- release notes
- post-deploy checks

Acceptance:

- Main branch remains deployable after every phase
- Canonical production route returns HTTP 200
- Live map has no rail regressions
- Git is clean and synced after each shipped phase

## Quality Gates

Every phase must include:

- `npm run lint`
- `npm run build`
- route smoke test for `/map?mode=resident&tab=map&filter=All`
- targeted route smoke tests for changed filters or panels
- mobile viewport check around `390x844`
- desktop viewport check around `1440x1000`
- no horizontal overflow on changed sheets
- close and back controls reachable
- no map rail added
- no broken static image URLs introduced
- accessibility review for focus, labels, escape/close behavior, and reduced motion

## Immediate Next Steps

1. Freeze this document as the controlling rebuild specification.
2. Create Phase 0 inventory outputs from the current repo.
3. Extract the smallest shared contracts first: tokens, sheet shell, entity schema, action schema.
4. Migrate one entity kind behind the shared renderer before touching the broader UI.
5. Continue shipping small, verifiable commits to `main` only when lint/build and route checks pass.
