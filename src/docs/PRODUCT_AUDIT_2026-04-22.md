# Downtown Perks Product Audit

Date: 2026-04-22
Repo: `/Users/megdude/Downloads/BASE44-working`
Target deployment: `https://base-44.vercel.app`

## Scope

This audit inventories the current Downtown Perks codebase as it exists in the Vite/Base44 checkout. It identifies the active surfaces, duplicated systems, current data contracts, and the main risks that must be resolved before the product can be treated as a coherent production-ready Vercel deployment.

This is an internal migration baseline, not a marketing summary.

## Current stack

- Frontend shell: Vite + React Router
- UI: React + Tailwind + Framer Motion
- Map runtime: Leaflet / React Leaflet
- Data access:
  - Base44 entity/functions SDK
  - local API routes under `api/`
  - partial Supabase migrations and utilities
- Search / AI:
  - Base44 function `searchMapIntent`
  - local API `api/ask-map.js` using OpenAI chat completion
- State:
  - local component state
  - shared feed hooks under `src/lib/map`
- Deployment:
  - Vercel
  - app currently protected by deployment auth

## Surface inventory

### 1. Resident-facing product

Active or intended routes:

- `/`
- `/downtown-perks`
- `/downtown-perks/explore`
- `/downtown-perks/events`
- `/downtown-perks/perks`
- `/downtown-perks/card`
- `/resident-app`
- `/resident-app/map`
- `/resident-app/saved`
- `/resident-app/card`
- `/resident-app/access`
- `/resident-app/building/:slug`
- `/resident-app/place/:slug`
- `/resident-app/event/:slug`
- `/resident-app/perk/:slug`

Primary files:

- `src/pages/Home.jsx`
- `src/pages/downtown-perks/Landing.jsx`
- `src/pages/downtown-perks/ExploreRebuilt.jsx`
- `src/pages/downtown-perks/Events.jsx`
- `src/pages/downtown-perks/PerksPage.jsx`
- `src/pages/downtown-perks/PerksCard.jsx`
- `src/pages/resident-app/index.jsx`

Assessment:

- Browse-first behavior exists in spirit and has already been patched to avoid hard login walls on public/product routes.
- Resident tabs are still a lightweight shell over a shared map/product surface, not yet a fully normalized app-router or domain-routed product.
- The public map experience is anchored in `ExploreRebuilt.jsx`, not the legacy `Explore.jsx`.

### 2. Partner-facing product

Active or intended routes:

- `/partners`
- `/partners/residential`
- `/partners/properties` (legacy alias)
- `/partners/hospitality`
- `/partners/hotels` (legacy alias)
- `/partners/venues`
- `/partners/brands`
- `/partners/civic`
- `/partner-workspace`
- `/partners/dashboard`
- `/partner-dashboard`

Primary files:

- `src/pages/partners/Index.jsx`
- `src/pages/partners/Residential.jsx`
- `src/pages/partners/Hotels.jsx`
- `src/pages/partners/Venues.jsx`
- `src/pages/partners/Brands.jsx`
- `src/pages/partners/Civic.jsx`
- `src/pages/PartnerWorkspace.jsx`
- `src/pages/PartnerDashboard.jsx`
- `src/pages/Dashboard.jsx`
- `src/lib/partnerContent.js`

Assessment:

- Shared partner taxonomy is now consistent around five roles: Residential, Hospitality, Venues, Brands, Civic.
- A substantial amount of partner meaning lives in `src/lib/partnerContent.js`, which is currently acting as both content model and behavioral routing config.
- The main dashboard has been patched so `/partners/dashboard` opens on the partner overview tab, but the surrounding dashboard is still a mixed property/operator shell rather than a unified role-aware intelligence app.

### 3. Dashboard / intelligence layer

Active routes:

- `/dashboard`
- `/partners/dashboard`
- `/partner-dashboard`
- `src/pages/BuildingIntelligence.jsx` exists but is not currently routed from `src/App.jsx`
- `src/pages/DashboardHub.jsx` exists but is not currently routed from `src/App.jsx`

Primary files:

- `src/pages/Dashboard.jsx`
- `src/pages/PartnerDashboard.jsx`
- `src/pages/BuildingIntelligence.jsx`
- `src/pages/DashboardHub.jsx`
- `src/components/partner/PartnerInsightMap.jsx` (referenced from dashboard)

Assessment:

- The codebase contains at least three dashboard concepts:
  1. `Dashboard.jsx` as the current operator shell
  2. `PartnerDashboard.jsx` as a simpler live-activity/venue dashboard
  3. `DashboardHub.jsx` / `BuildingIntelligence.jsx` as older or alternate entry surfaces
- These should be consolidated into one role-aware dashboard shell with pluggable modules.

## Map system audit

### Active map stack

Most coherent current stack:

- `src/components/map/unified/UnifiedMapShell.jsx`
- `src/components/map/unified/UnifiedSearchBar.jsx`
- `src/components/map/unified/UnifiedFilterChips.jsx`
- `src/components/map/unified/UnifiedDrawer.jsx`
- `src/components/map/unified/UnifiedResultsPanel.jsx`
- `src/components/map/markers/MarkerFactory.jsx`
- `src/lib/map/useSharedMapFeed.js`
- `src/lib/repositories/mapRepository.ts`
- `src/lib/mappers/sharedMapMappers.ts`
- `src/lib/contracts/entities.ts`
- `src/lib/mapCoordinates.js`

### Duplicate / competing map surfaces

Still present:

- `src/pages/downtown-perks/Explore.jsx`
- `src/pages/Map.jsx`
- `src/components/map/MapShell.jsx`
- `src/components/map/MapView.jsx`
- legacy adapters under `src/components/map/mapAdapters/`

Assessment:

- The repo still contains multiple generations of map UI and data plumbing.
- `ExploreRebuilt.jsx` plus the unified map components are the best candidate for the canonical resident map system.
- `src/components/map/MapShell.jsx` exists and is named like the intended shared shell, but the actually active home/explore experience currently uses `UnifiedMapShell`.
- A production rebuild needs a deliberate decision:
  - either make `MapShell.jsx` the canonical implementation and fold unified behavior into it
  - or rename the unified stack into the canonical `MapShell` path and retire the legacy shell

### Intelligence layer status

Present:

- `src/lib/logic/rankingEngine.ts`
- `src/lib/logic/liveEngine.ts`
- `mapRepository.getIntelligenceFeed()`
- `LiveNearbyCard`

Assessment:

- Ranking/live logic exists, but it is still a relatively thin weighting layer over the current shared feed.
- It is not yet a full intent + retrieval + attribution engine.

## Data model audit

### Explicit typed contracts

Current typed shared map contract:

- `src/lib/contracts/entities.ts`
  - `SharedMapItemContract`
  - `PartnerInsightContract`
  - `MapMode`

Observed active entity families in code or schema:

- Venue
- Event
- Perk
- Building
- SharedMapItem
- UserAction
- AnalyticsSignal
- Campaign
- Brand
- Booking
- resident interactions
- resident saved items
- resident RSVPs
- resident perk redemptions

Implied but not yet fully normalized:

- residents / members / profiles
- resident cards
- sessions
- qr locations / entry sources
- building memberships
- map search documents / embeddings
- analytics events with consistent taxonomy
- dashboard rollups

### Current persistence modes

1. Base44 entities/functions
2. Local Vercel API endpoints
3. Supabase SQL migrations

Assessment:

- Persistence is fragmented.
- Base44 remains the active operational backend for several core user actions.
- Supabase schema work exists but is not yet the single source of truth.
- This repo is not yet a clean “one backend” system.

## Backend / API audit

### Local API routes

Current Vercel `api/` routes:

- `api/ask-map.js`
- `api/impression.js`
- `api/places.js`
- `api/redeem.js`
- `api/save.js`
- `api/search-log.js`
- `api/visit.js`

Assessment:

- These cover a thin public interaction layer.
- `api/ask-map.js` is a standalone concierge-style OpenAI endpoint and is not yet a grounded hybrid retrieval system.

### Base44 functions

Current Base44 functions:

- `getSharedMapFeed`
- `searchMapIntent`
- `logResidentInteraction`
- `toggleSavedItem`
- `upsertResidentRsvp`
- `createResidentPerkRedemption`

Assessment:

- Resident mutations and shared map feed are currently more real in Base44 than in the local API layer.
- A real migration needs a compatibility plan for each of these functions before anything is deleted.

### Supabase status

Present:

- `supabase/migrations/20260415_phase1a_foundation.sql`
- `supabase/migrations/20260415_phase1a_resident_mutations.sql`
- `src/lib/supabaseServer.js`
- `api/_utils/publicActor.js`

Assessment:

- Supabase groundwork exists, especially for resident interaction persistence.
- It is not yet wired as the canonical storage and read layer for the whole product.

## Analytics audit

Current analytics surface:

- `src/lib/analytics/track.ts`

Assessment:

- Event naming exists, but the implementation is not production-grade.
- In production it currently attempts analytics via `base44.integrations.Core.InvokeLLM`, which is not acceptable as the long-term analytics sink.
- Analytics meaning exists, but the logging path must be rebuilt onto a stable event service and durable storage.

## Auth / progressive access audit

Current auth behavior:

- `src/lib/AuthContext.jsx`
- `src/App.jsx`
- public/product routes have already been patched to avoid forcing auth at page render time
- demo/guest fallback is still used in resident and partner areas

Assessment:

- Product direction is correct: browse-first with soft-gated actions.
- Account, session merge, OTP, resident card issuance, and role-aware access control are not yet fully normalized.

## Route drift and duplication risks

High-risk duplicated or ambiguous surfaces:

- `Explore.jsx` vs `ExploreRebuilt.jsx`
- `Dashboard.jsx` vs `PartnerDashboard.jsx` vs `DashboardHub.jsx` vs `BuildingIntelligence.jsx`
- `MapShell.jsx` vs `UnifiedMapShell.jsx`
- Base44 analytics vs local API analytics vs Supabase interaction tables
- `partners/properties` alias vs `partners/residential`
- `partners/hotels` alias vs `partners/hospitality`

These must be resolved explicitly during consolidation. They should not be left as parallel systems.

## Immediate conclusions

1. The repo already contains the major product surfaces, but they are not yet unified into one backend, one map system, and one dashboard shell.
2. The live product meaning is mostly recoverable and should be preserved.
3. The highest-value canonical surfaces today are:
   - `Home.jsx`
   - `ExploreRebuilt.jsx`
   - `ResidentApp`
   - `partners/*`
   - `Dashboard.jsx`
   - `PartnerWorkspace.jsx`
   - `mapRepository.ts`
   - Base44 resident mutation functions
4. The biggest risks are silent drift across duplicate map/dashboard systems and pretending Supabase migration is complete when Base44 is still handling real mutations.

## Required next implementation move

Before deeper rebuild work, the repo needs a route/dependency migration map that assigns:

- canonical surface owner
- legacy aliases
- canonical data source
- canonical mutation path
- keep / refactor / retire decision

That map is documented in `src/docs/MIGRATION_MAP_2026-04-22.md`.
