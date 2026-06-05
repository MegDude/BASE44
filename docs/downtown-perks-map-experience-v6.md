# Downtown Perks Map Experience Rebuild V6

This specification governs the production UX, content, and inventory system for the map experience.

It supersedes prior panel, drawer, inventory, property, campaign, image, navigation, and search instructions.

## Product Principle

Downtown Perks is a neighborhood discovery system.

Every entity exists to answer:

- What is this?
- Where is it?
- Why should I care?
- What can I do next?

The image should answer most of those questions before the copy begins.

## Map Principle

The map is the product. Everything else supports the map.

Do not let panels, controls, multiple overlays, dashboard widgets, nested cards, or heavy intelligence modules compete with the map.

## Design System

Approved colors:

- `#0B1F33`
- `#132238`
- `#1A2C44`
- `#C8A96A`
- `#D9BE7A`
- `#B8963E`
- `#FFFFFF`
- `#F7F8FB`
- `#F1F3F7`

Maximum radius: `12px`.

Maximum shadow: `0 8px 24px rgba(11,31,51,.06)`.

Headlines: `20px`, `600`, `#0B1F33`.

Metadata: `10px`, `600`, uppercase, `#C8A96A`.

Body: `13px`, `line-height: 1.7`, `rgba(11,31,51,.72)`.

## Search Console

Resident mode:

- Coffee
- Happy Hour
- Dinner
- Events
- Fitness
- Rooftops
- Nearby
- Tonight
- Perks
- Events
- Places
- Filters

Partner mode:

- Activity
- Campaigns
- Events
- Perks
- Properties
- Trends

Partner mode must not show resident discovery categories such as Coffee, Dinner, Happy Hour, or Rooftops.

Search intent is generated in `src/data/production/searchIntentRegistry.ts`.

## Bottom Navigation

Resident:

- Map
- Perks
- Events
- Saved
- Card

Partner:

- Map
- Campaigns
- Activity
- Reports
- Profile

Bottom navigation should use 11px, 500 weight, no uppercase, no underlines, no capsules, and no gold active state.

## Drawer System

Resident drawer:

- Image
- District
- Entity name
- Narrative
- Actions
- Nearby

Partner drawer:

- Image
- District
- Entity name
- Opportunity narrative
- Resident narrative
- Actions
- Nearby activity

Hero image rules:

- `width: 100%`
- `height: 220px`
- `object-fit: cover`
- no radius
- no border
- no shadow
- no card frame

Remove tabs, details tabs, map tabs, cards inside cards, statistic grids, perk grids, active perk badges, pill buttons, nested panels, and dashboard layouts.

## Production Registries

Required generated registries:

- `production-map-inventory.json`
- `heroImageRegistry.ts`
- `entityCopyRegistry.ts`
- `partnerCopyRegistry.ts`
- `drawerContentRegistry.ts`
- `buildingNarrativeRegistry.ts`
- `districtNarrativeRegistry.ts`
- `districtHeroRegistry.ts`
- `categoryFallbackRegistry.ts`
- `searchIntentRegistry.ts`
- `legendsMLSRegistry.ts`
- `campaignAssetRegistry.ts`

All search responses should resolve against `production-map-inventory.json` before generating recommendations.

## Source Integrity

MLS wins for price, beds, baths, MLS number, availability, and square footage.

Do not generate MLS facts. If the production feed is missing the requested target record count, import the feed instead of fabricating data.

## Legends MLS Content System V3

Legends Real Estate is a residential discovery system.

The listing is the entry point. The neighborhood is the product.

Every Legends listing should combine verified MLS data, building narrative, district narrative, nearby places, the Downtown Perks discovery layer, and resident utility.

Universal header:

`Legends Real Estate · Residential Property · Downtown Austin`

Resident headline:

`Want to live here?`

Resident narrative:

`This Downtown Austin residence is currently available through Legends Real Estate.`

`Explore the neighborhood, discover nearby restaurants, coffee shops, parks, fitness studios, grocery options, events, and everyday essentials before scheduling a private tour.`

`Because where you live should connect to how you live.`

Facts must appear immediately when source data exists:

- Price
- Bedrooms
- Bathrooms
- Square feet
- MLS number
- Status
- Days on market, if available
- Available through Legends Real Estate

Nearby sections must be inventory-backed:

- Coffee Nearby
- Dining Nearby
- Fitness Nearby
- Grocery Nearby
- Parks & Trails Nearby
- Events Nearby

The current committed local source does not contain 942 Legends records. The generator records the 942 target in `legendsMLSRegistry.ts` but only normalizes available committed source data. Import the production Legends feed to reach the full target.
