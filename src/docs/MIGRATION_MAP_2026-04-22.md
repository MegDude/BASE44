# Downtown Perks Migration Map

Date: 2026-04-22
Repo: `/Users/megdude/Downloads/BASE44-working`

## Goal

Map every currently relevant route and subsystem to a canonical target so the rebuild can proceed without accidental feature loss.

## Canonical surface decisions

### Resident product

| Current surface | Status | Canonical target | Notes |
| --- | --- | --- | --- |
| `/` + homepage map | Keep | Public product entry | Hero now includes live map module |
| `/downtown-perks/explore` via `ExploreRebuilt.jsx` | Keep | Canonical resident discovery map | Best current live map route |
| `src/pages/downtown-perks/Explore.jsx` | Retire later | Fold into canonical map route | Legacy duplicate |
| `/resident-app` shell | Keep and refactor | Resident app container | Should evolve into route-aware app shell with progressive access |
| Resident tabs Now / Map / Saved / Card | Keep | Resident sub-surfaces | Need full normalization to include Events / Perks as first-class tabs |
| `/downtown-perks/events` | Keep | Resident events layer | Should share map/entity contracts |
| `/downtown-perks/perks` | Keep | Resident perks layer | Should share unlock/redeem/card contracts |
| `/downtown-perks/card` | Keep | Perks Card surface | Needs real issuance + QR token lifecycle |

### Partner product

| Current surface | Status | Canonical target | Notes |
| --- | --- | --- | --- |
| `/partners` | Keep | Public partner landing | Already aligned to five-role model |
| `/partners/residential` | Keep | Residential partner page | Canonical role route |
| `/partners/properties` | Alias | Redirect-compatible alias | Preserve, but taxonomy should stay Residential |
| `/partners/hospitality` | Keep | Hospitality partner page | Canonical role route |
| `/partners/hotels` | Alias | Redirect-compatible alias | Preserve, but taxonomy should stay Hospitality |
| `/partners/venues` | Keep | Venue partner page | Canonical |
| `/partners/brands` | Keep | Brand/CMA partner page | Canonical |
| `/partners/civic` | Keep | Civic partner page | Canonical |
| `/partner-workspace` | Keep and deepen | Partner onboarding + content manager | Should become staged partner setup + workspace |

### Dashboard / intelligence

| Current surface | Status | Canonical target | Notes |
| --- | --- | --- | --- |
| `/dashboard` via `Dashboard.jsx` | Keep | Canonical dashboard shell | Current best shell |
| `/partners/dashboard` | Keep | Dashboard shell defaulting to partner overview | Added route now exists |
| `/partner-dashboard` | Fold later | Alias or role preset into canonical dashboard | Currently a separate simpler dashboard |
| `DashboardHub.jsx` | Re-evaluate | Potential entry/launcher only | Not currently routed |
| `BuildingIntelligence.jsx` | Re-evaluate | Building role module inside canonical dashboard | Not currently routed |

## Canonical map architecture target

### Keep

- `src/lib/contracts/entities.ts`
- `src/lib/mappers/sharedMapMappers.ts`
- `src/lib/mapCoordinates.js`
- `src/lib/repositories/mapRepository.ts`
- `src/lib/logic/rankingEngine.ts`
- `src/lib/logic/liveEngine.ts`
- `src/components/map/markers/MarkerFactory.jsx`
- `src/components/map/unified/*`

### Refactor

- Decide whether `UnifiedMapShell.jsx` is renamed into canonical `MapShell.jsx`, or whether `MapShell.jsx` absorbs the unified behavior.
- Bring `PartnerInsightMap` and dashboard map usage onto the same shared map contracts.
- Replace any remaining direct raw entity plotting with adapted mapped entities only.

### Retire later

- `src/pages/Map.jsx`
- legacy `Explore.jsx`
- legacy map adapters once all consumers are moved to shared mappers

## Canonical data path target

### Read path target

Short term:

- Shared feed reads continue through `mapRepository -> base44Api -> getSharedMapFeed`
- fallback normalization stays in repo

Medium term:

- migrate read models to Supabase-backed repositories with compatibility adapters for Base44-origin data

### Mutation path target

Current canonical mutation bridge:

- `residentMutationsRepository`
  - `toggleSavedItem`
  - `upsertResidentRsvp`
  - `createResidentPerkRedemption`
  - `logResidentInteraction`

Future target:

- local typed service layer with stable server routes / RPC backed by Supabase
- Base44 mutations retired only after functional parity is verified

## Canonical analytics target

### Current

- semantics exist in `src/lib/analytics/track.ts`
- sink is not production-grade

### Target

- one durable analytics event service
- one event schema
- one storage layer
- all surfaces use the same `track()` service

Event families to preserve:

- map_opened
- search_used
- filter_applied
- place_viewed
- event_viewed
- offer_viewed
- save_clicked
- signup_started
- signup_completed
- otp_verified
- card_created
- perk_redeemed
- rsvp_completed
- repeat_visit

## Backend migration target

### Preserve during migration

- Base44 entities and functions that currently hold real logic
- local API routes used by deployed frontend

### Build toward

- typed repository layer under `src/server` or `src/lib/repositories`
- stable Vercel API / RPC handlers
- Supabase as long-term durable store
- clear auth and public-session identity model

## Keep / Refactor / Retire decisions

### Keep now

- `Home.jsx`
- `ExploreRebuilt.jsx`
- `ResidentApp`
- `PartnerWorkspace`
- `partners/*`
- `Dashboard.jsx`
- `mapRepository.ts`
- resident mutation bridge

### Refactor next

- dashboard modules into role-aware system
- partner onboarding into staged setup flow
- resident shell into full route-aware mobile app model
- Ask-the-Map into grounded hybrid retrieval
- analytics into durable event pipeline

### Retire after parity

- `Explore.jsx`
- `Map.jsx`
- `PartnerDashboard.jsx` as separate product
- `DashboardHub.jsx` / `BuildingIntelligence.jsx` as separate competing shells

## Next implementation sequence

1. Freeze canonical routes and aliases in one route map.
2. Freeze canonical map contracts and shared pin/render pipeline.
3. Move all resident and partner reads onto shared repositories.
4. Replace placeholder analytics sink.
5. Consolidate dashboard shells.
6. Expand onboarding and QR/card flows onto one attributed model.
