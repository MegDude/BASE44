# Downtown Perks Master Product Constitution

## Volume 12: Data, Content And Entity Governance Constitution

Project: Downtown Perks

Build target: `http://localhost:5173`

Status: Master data architecture

This document governs every piece of content displayed throughout Downtown Perks, including restaurants, coffee shops, bars, hotels, properties, residential buildings, brands, retail, events, perks, campaigns, reports, activity, recommendations, notifications, AI, search, map surfaces, and drawers.

No content may exist outside this architecture.

## Primary Objective

Downtown Perks is not a CMS. It is not a directory.

Downtown Perks is a living representation of Downtown Austin.

Every entity should exist once. Every feature should reference the same entity. No duplication.

## One Entity Principle

Every real-world place exists once.

Example:

```txt
Geraldine's
-> Entity
-> Referenced by map, search, events, perks, campaigns, reports, saved items,
   recommendations, AI, hotels, resident card, and every other surface
```

Never duplicate a real-world place to satisfy a page, panel, drawer, campaign, or report.

## Entity Ownership

Each entity owns its canonical:

- Identity
- Description
- Images
- Location
- Categories
- Tags
- Opening hours
- CTA defaults
- Benefits
- Relationships
- Neighborhood

No downstream feature rewrites these fields as if it owns the entity.

## Context Layers

One entity can appear in many contexts.

Example: Hotel Van Zandt

```txt
Resident view
-> Where to enjoy dinner tonight.

Partner view
-> Guest discovery opportunities.

Campaign view
-> After-work campaign.

Report view
-> Hotel referrals.
```

The entity remains unchanged. The context changes.

## Content Ownership

Every entity owns protected content:

- Hero copy
- Editorial summary
- Neighborhood introduction
- Recommendations
- Supporting imagery
- Partner introduction

This content is protected. Do not overwrite it with generated templates, fallback filler, or page-specific rewrites.

## Relationships

Every entity can connect to:

- District
- Neighborhood
- Events
- Nearby places
- Partner records
- Brand records
- Resident benefits
- Campaigns
- Reports
- Hotels
- Buildings

The map is a relationship engine, not a collection of disconnected pages.

## Master Content Rule

Presentation may change. Context may change. Layout may change.

The underlying entity never changes.

## Implementation Rules

- Features import or reference canonical entities by ID.
- Drawers, panels, campaigns, reports, search results, and AI context use shared entity references.
- Page-specific data may extend context, but must not duplicate the canonical entity.
- Generated or inferred copy must be stored as context, not as a replacement for protected entity content.
- If two records appear to represent the same real-world place, flag them for dedupe review rather than silently deleting either record.

## QA

Before completion, verify:

- Every real-world entity exists once.
- Every feature references shared entities.
- No duplicated content exists for the same entity.
- No duplicated imagery exists for the same entity unless intentionally shared through the image manifest.
- No duplicated editorial copy exists across entity contexts.
- No duplicated descriptions exist because of page-specific hardcoding.
- AI, search, reports, recommendations, and drawers all point back to canonical entity IDs.

## Success State

Downtown Perks becomes a true digital twin of Downtown Austin rather than multiple disconnected datasets.

