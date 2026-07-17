# Downtown Perks Entity + Real Estate Platform

## Engineering execution specification

This document converts the Entity Intelligence and Real Estate Intelligence direction into ordered, testable workstreams. Legends Real Estate is the first tenant. Luxury Presence is the first authoritative listing provider. Neither name is part of the canonical UI or storage contract.

## Ownership rules

| Domain | Canonical owner | This repository consumes it through |
| --- | --- | --- |
| Entity identity and relationships | Platform Entity Service | typed entity contracts and Platform API |
| Listings, status, price, media, open houses | Real Estate Service + provider connector | `/api/real-estate/*` |
| Luxury Presence credentials and webhooks | server integration layer | `LuxuryPresenceProvider` |
| Resident, map, collection, route enrichment | Downtown Perks experience layer | entity relationships and map APIs |
| Analytics and attribution | unified event pipeline | existing event/map action APIs |
| SEO reporting | Partner Intelligence reporting service | existing SEO report API |
| CRM leads and tour requests | CRM/automation service | lead workflow API |
| Authentication and authorization | Identity Service | trusted server session and workspace roles |

The browser never receives provider credentials or Supabase service-role credentials. Provider responses are normalized before they enter the canonical store or UI.

## Workstream 0 — canonical contracts

Status: implemented in this repository.

Deliverables:

- `CanonicalEntity` identity, visibility, ownership, coordinates, media, and metadata contract.
- `CanonicalProperty` provider provenance, MLS facts, listing details, building data, and integration IDs.
- deterministic identity: `property:<provider-id>:<provider-listing-id>`.
- provider registry and provider-neutral `RealEstateService`.
- canonical normalization that never invents MLS facts.

Release gate:

- a fake second provider passes the same normalization, read, and sync contract without UI changes.

## Workstream 1 — provider ingestion and recovery

Build in the backend platform repository. BASE44 calls the resulting Platform API.

Services:

1. `RealEstateProviderRegistry`
2. `LuxuryPresenceProvider`
3. `PropertyRepository`
4. `ProviderSyncCoordinator`
5. `ProviderWebhookProcessor`
6. `ProviderHealthService`
7. retry/dead-letter worker

Sync sequence:

```text
Luxury Presence webhook or scheduled sync
  -> authenticate provider request
  -> store immutable raw delivery
  -> normalize to CanonicalProperty
  -> reject records missing provider listing ID
  -> upsert by provider + provider listing ID
  -> relate property to workspace, brokerage, building, and agent
  -> publish property.updated event
  -> refresh search, map cache, SEO, reports, collections, and routes
```

Recovery rules:

- Keep the last successful canonical record when the provider fails.
- Mark freshness separately from listing status.
- Exponential retry with a dead-letter state after the configured threshold.
- Never convert a temporary provider outage into a sold, removed, or unpublished listing.
- Expose `lastSyncedAt`, `lastSuccessfulSyncAt`, `stale`, and provider health.

## Workstream 2 — canonical persistence

Implement through a reviewed Supabase migration in the backend platform repository. New exposed tables require explicit grants and RLS under current Supabase behavior.

Tables:

### `entities`

```text
id uuid primary key
entity_type text
slug text unique
title text
status text
visibility text
workspace_id uuid nullable
owner_id uuid nullable
summary text nullable
description text nullable
coordinates geography nullable
address jsonb
metadata jsonb
created_at timestamptz
updated_at timestamptz
```

### `entity_relationships`

```text
id uuid primary key
source_entity_id uuid references entities
target_entity_id uuid references entities
relationship_type text
metadata jsonb
created_at timestamptz
unique(source_entity_id, target_entity_id, relationship_type)
```

### `real_estate_properties`

```text
entity_id uuid primary key references entities
provider_id text
provider_listing_id text
mls_number text nullable
brokerage_entity_id uuid nullable
agent_entity_id uuid nullable
listing jsonb
building jsonb
media jsonb
canonical_url text nullable
source_updated_at timestamptz nullable
last_synced_at timestamptz
last_successful_sync_at timestamptz
stale boolean default false
unique(provider_id, provider_listing_id)
```

### `provider_sync_deliveries`

```text
id uuid primary key
provider_id text
external_event_id text nullable
payload_hash text
raw_payload jsonb
status text
attempt_count int
error_code text nullable
received_at timestamptz
processed_at timestamptz nullable
unique(provider_id, external_event_id)
```

RLS:

- Public and resident reads require `visibility = 'public'` and active state.
- Workspace reads and writes require trusted workspace membership.
- Provider writes occur server-side only.
- Platform admins are resolved from trusted role tables/app metadata, never user metadata.
- No service-role credential is exposed to the browser.

## Workstream 3 — Platform API

Current BASE44 foundation endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/real-estate/properties` | canonical property list |
| `GET` | `/api/real-estate/properties?id=...` | one canonical property |
| `GET` | `/api/real-estate/health` | provider readiness |
| `POST` | `/api/real-estate/sync` | authenticated provider sync |

Backend target endpoints:

```text
GET    /v1/entities/:id
GET    /v1/entities/:id/relationships
GET    /v1/properties
GET    /v1/properties/:id
POST   /v1/providers/:providerId/sync
POST   /v1/providers/:providerId/webhooks
GET    /v1/providers/:providerId/health
POST   /v1/properties/:id/leads
POST   /v1/properties/:id/tours
GET    /v1/properties/:id/intelligence
GET    /v1/properties/:id/seo
GET    /v1/properties/:id/analytics
```

Responses carry `data`, `relationships`, `freshness`, and `capabilities`. The UI must not branch on `luxury-presence`; it branches only on returned capabilities.

## Workstream 4 — unified event and intelligence pipeline

Every property action uses the existing unified event contract:

```text
actor_id
entity_id
entity_type
action
workspace_id
campaign_id
collection_id
route_id
qr_id
session_id
device
location
timestamp
conversion
metadata
```

Required events:

- `property.viewed`
- `property.saved`
- `property.directions_opened`
- `property.shared`
- `property.lead_submitted`
- `property.tour_requested`
- `property.qr_scanned`
- `property.collection_opened`
- `property.route_opened`

Partner Intelligence, SEO reporting, and property insights query this pipeline. No property-specific analytics store is allowed.

## Workstream 5 — CRM and tour workflow

Lead workflow:

```text
validated resident form
  -> canonical property ID resolution
  -> idempotent CRM upsert
  -> source/campaign/collection/route/QR attribution
  -> agent assignment
  -> workspace notification
  -> approved email/SMS notification
  -> follow-up task
  -> analytics event
```

Tour workflow adds provider or brokerage calendar availability, confirmation, calendar invite, reminder, and cancellation. Unknown provider IDs must never create an un-attributed lead.

## Workstream 6 — map-native presentation

The map remains mounted. The property panel is a presentation layer only.

Panel composition:

1. `PropertyHero`
2. `EntityActions`
3. `PropertySummary`
4. `GalleryCarousel`
5. `MLSCard`
6. `BuildingCard`
7. `OpenHouseRail`
8. `ContactAgentCard`
9. `BookingCard`
10. `MortgageCalculator`
11. resident benefits, nearby, collections, and routes
12. partner-only intelligence and reports

Every value is rendered conditionally from the canonical response. Missing provider data is omitted or labeled unavailable; it is never fabricated from local copy.

## Workstream 7 — verification and operations

Automated verification:

- provider normalization and deduplication
- webhook signature and replay protection
- idempotent sync
- last-successful-version recovery
- RLS and workspace authorization
- search/index refresh event
- analytics attribution
- CRM idempotency
- tour booking and cancellation
- property panel deep link/back/close restoration
- provider outage behavior
- accessibility and responsive layout

Operational dashboards must expose provider health, stale listings, failed deliveries, retry depth, sync latency, missing canonical relationships, and unmapped CRM leads.

## Definition of complete

The platform is complete only when a second brokerage can be onboarded by registering a provider and workspace mapping, with no changes to the property panel, analytics model, search model, CRM workflow, or map navigation.
