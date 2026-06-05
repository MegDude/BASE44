# Downtown Perks Platform Architecture V5

Downtown Perks is a map-first decision platform.

Every screen should help someone answer:

- What is this?
- Why should I care?
- What should I do next?

The map is the product. The panel is the interface. The inventory powers everything.

## Source Of Truth

The latest implementation from `http://localhost:3001` is the canonical source for routes, inventory, panels, design, map behavior, navigation, pricing, resident experiences, partner experiences, and content systems.

No legacy system should remain active when a canonical implementation exists.

## Unified Inventory

Every entity belongs to one inventory model.

Supported types:

- Residential Building
- Residential Listing
- Venue
- Hotel
- Event
- Brand
- Civic
- Service
- Retail
- Perk
- Campaign

Every inventory record contains:

- `id`
- `type`
- `category`
- `district`
- `name`
- `address`
- `lat`
- `lng`
- `primaryImage`
- `galleryImages`
- `description`
- `actions[]`
- `status`
- `source`
- `updatedAt`

## Categories

Use only:

Coffee, Dining, Drinks, Hotel, Retail, Grocery, Wellness, Fitness, Services, Residential, Property, Events, Brands, Civic, Music, Entertainment, Perks, Campaigns.

## Universal Panel

All entity panels use the same hierarchy:

1. Hero image
2. Category
3. Name
4. Context sentence
5. Primary actions

Nothing else is required to understand the entity.

Descriptions should be 80 to 100 characters when possible and never exceed 120 characters in the panel.

## Real Estate

Buildings are map entities. Listings are building inventory. Individual MLS units should not create map pins.

MLS data wins for price, MLS number, beds, baths, square footage, status, and availability.

Building panels show:

- Hero image
- Building name
- District
- Building narrative
- Available listing count
- Starting price
- View Listings
- Schedule Tour
- Explore Nearby

Listing panels appear inside buildings and show price, beds, baths, square feet, MLS, status, and listing actions.

## Actions

Panels show no more than three actions.

Residential buildings: View Listings, Schedule Tour, Explore Nearby.

Residential listings: View Property, Schedule Tour, Save Property.

Venues: Save, Directions, Website.

Restaurants: Save, Reserve, Directions.

Hotels: Save, Website, Directions.

Events: RSVP, Save, Directions.

Brands: Save, Website, Directions.

## Image Priority

Real imagery wins.

Priority:

1. MLS hero image
2. MLS gallery
3. Official venue photography
4. Building exterior
5. Building interior
6. Building amenities
7. Neighborhood imagery
8. District imagery

Never use AI architecture, AI interiors, stock condos, generic skylines, or placeholder photography.

## Removed Placeholder Copy

Do not use:

Dining Perk, Coffee Stop, Night Out Nearby, Property Discovery, Resident Access, Create Map Plan, Nearby Downtown Option, Learn More, Read More, Discover More.

## Canonical Routes

- `/`
- `/map`
- `/map?mode=resident`
- `/map?mode=partner`
- `/residents`
- `/partners`
- `/pricing`
- `/card`
- `/brands`

## Design System

Background: `#F7F8FB`

Surface: `#FFFFFF`

Surface alt: `#F1F3F7`

Primary navy: `#0B1F33`

Secondary navy: `#132238`

Modern gold: `#C8A96A`

Use Inter for UI and Instrument Serif only for editorial headings.

Do not reintroduce warm gold, orange, amber, neon gold, skyline hero imagery, stacked cards, heavy borders, or pill-heavy interfaces.
