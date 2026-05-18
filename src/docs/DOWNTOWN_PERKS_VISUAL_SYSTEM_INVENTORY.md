# Downtown Perks Visual System Inventory

## Direction

Downtown Perks uses a modern, minimal Material-style product system with a transparent glass layer, sharp cool outline icons, and restrained motion.

The map remains the primary interface. Icons, cards, QR states, chips, dashboards, and signup surfaces should all support fast spatial decision-making rather than decorative marketing.

## Typography System

| Role | Font | Usage |
| --- | --- | --- |
| Display / headlines | Inter Tight | Hero, section titles, major product statements |
| Body / UI | Inter | Body copy, navigation, forms, buttons, chips, map drawers, dashboards |
| Accent script | Allura | One short emotional phrase only |

Script usage is intentionally narrow. It can appear in phrases such as `downtown living`, `surface for you`, `choose next`, or `you are`, but never in controls, forms, body text, pricing, dashboard tables, map cards, or filters.

## Icon Style Rules

- Base grid: 24px
- Stroke: 1.75px preferred
- Shape: crisp geometry with slightly rounded corners
- Default state: outline
- Active state: navy fill with light text or gold micro-accent
- Disabled state: 40% opacity
- Gold usage: accent only, never the dominant fill system

## Core Navigation Icons

| Icon | Use |
| --- | --- |
| Home | Main entry |
| Map / Compass | Explore and live map |
| Search | Ask the map and discovery |
| Calendar | Events |
| Ticket / Spark | Perks and offers |
| Wallet / Card | Perks Card |
| Building | Properties and residential flows |
| Layout Dashboard | Intelligence hub |
| Network / Users | Partner ecosystem |
| Tag | Pricing and offer state |
| User | Resident profile |
| Menu / Close | Mobile navigation |
| Chevron Left / Right / Down | Navigation, drawers, dropdowns |

## Map And Exploration Icons

| Icon | Required State |
| --- | --- |
| Pin default | Base venue/event/property marker |
| Pin active | Selected marker, navy fill, gold ring |
| Cluster marker | Dense map groups |
| Current location | Pulsing location dot |
| Radius | Walkability overlay |
| Walking | Walk-time metadata |
| Route arrow | Go now action |
| Layers | Places/events/perks/buildings toggle |
| Filter sliders | Search refinement |
| Recenter target | Reset map position |
| Bookmark | Saved / unsaved |
| Clock | Open now, tonight, live timing |
| Activity pulse | Live events and now moments |

## Category Icons

| Category | Icon Direction |
| --- | --- |
| Coffee | Minimal cup |
| Dining | Plate or fork/knife |
| Bars | Glass |
| Nightlife | Moon or music mark |
| Wellness | Leaf/circle hybrid |
| Fitness | Abstract movement or dumbbell |
| Shopping | Bag |
| Arts / Culture | Ticket or gallery frame |
| Music | Single note |
| Social | Two-person mark |
| Work spot | Laptop/search mark |
| Outdoor | Tree or sun |
| Hotel | Bed |
| Property | Stacked tower |
| Civic | Landmark |
| Transit | Bus/train |
| Pet-friendly | Paw |
| Late night | Moon |
| Brunch | Plate + sun |

## Perks And QR Icons

| Icon | Use |
| --- | --- |
| QR code | Card and redemption |
| Scan | Venue scan action |
| Check badge | Verified, redeemed, complete |
| Offer tag | Discount or perk |
| Unlock | Resident-only access |
| Gift | Special access |
| SMS / Message | Text access flow |
| Phone | OTP or mobile link |
| Shield check | Verified resident / trusted partner |
| Starburst | Featured perk |

## Resident Journey Icons

| Icon | Use |
| --- | --- |
| QR entry | Building, venue, poster, lobby entry |
| Text message | SMS access link |
| Card issue | Perks Card created |
| Explore | Open the map |
| Save | Save for later |
| RSVP | Event intent |
| Redeem | Perk unlock |
| Building access | Resident-linked source |
| Bell | Reminder and alerts |
| Share | Referral and handoff |

## Partner And Intelligence Hub Icons

| Icon | Use |
| --- | --- |
| Chart / Analytics | Dashboard overview |
| Trend up | Performance lift |
| Eye | Visibility |
| QR / Scan count | Scan attribution |
| Bookmark count | Saves |
| Calendar count | RSVPs |
| Redemption | Perk usage |
| Megaphone | Campaigns |
| Target | Decision-moment targeting |
| Storefront | Venue partner |
| Hotel | Hospitality partner |
| Badge | Brand sponsor |
| Landmark | Civic partner |
| Settings | Workspace controls |
| Upload / Import | Content ingestion |
| Link | Integrations |
| Download | Reporting |
| Clipboard | Lead forms |

## Property Management Capability Layer

The partner dashboard should preserve the operational scope visible in the Harmony Homes backend dashboard while using Downtown Perks styling.

Required surfaces:

- Resident CRM: profiles, building source, membership/card status, saved behavior, segments
- Campaigns: announcements, reminders, open rate, click rate, conversion, segment performance
- Amenities: amenity modules, reservations, QR entry points, resident usage
- Maintenance: requests, priority, status, response time, resolution rate
- Reports: redemptions, engagement trends, venue status, category mix, actionable recommendations
- Partner network: venues, hotels, properties, brands, civic partners, offer/event health

These should read as one intelligence hub, not separate admin pages.

## Required UI Elements

| Element | Required States |
| --- | --- |
| Header / nav | default, scrolled, mobile open |
| Hero search | idle, focused, loading, suggestions |
| Interest picker chips | default, selected, hover |
| Filter chips | default, active, disabled |
| Primary button | navy, hover, disabled |
| Secondary button | transparent glass, hover |
| Icon button | idle, active, disabled |
| Venue card | default, selected, saved |
| Event card | upcoming, live, RSVP state |
| Perk card | public, resident-only, unlocked, redeemed |
| Property card | standard, selected, building-source |
| Bottom sheet | collapsed, expanded, loading |
| Drawer | closed, open, sticky CTA |
| Signup sheet | soft prompt, verifying, issued |
| QR card | preview, active, expired/error fallback |
| Toast | success, warning, error, neutral |
| Empty state | no results, no perks, no events |
| Loading state | skeleton, shimmer, spinner |

## Badges And Chips

| Badge | Use |
| --- | --- |
| Nearby | Proximity |
| 5 min walk | Walkability |
| Open now | Venue utility |
| Happening now | Event urgency |
| Tonight | Time filter |
| Free | Cost/value |
| RSVP | Event state |
| Perk live | Active offer |
| Resident only | Access layer |
| Featured | Editorial highlight |
| New | Fresh content |
| Limited | Scarcity |
| Building partner | Property source |
| Hotel partner | Hospitality source |
| Civic partner | District source |
| Verified | Trust |

## Motion Rules

- Search focus: 160ms expansion or border shift
- Chip selection: 120ms snap transition
- Marker selection: lift + gold ring
- Drawer: spring slide with no bounce excess
- Card hover: small lift only on desktop
- QR issued: soft confirmation pulse
- Loading: quiet skeleton or spinner, no noisy shimmer loops

## Priority Build Order

1. Core icon family
2. Map pins, clusters, badges, chips
3. Search, cards, drawers, buttons
4. Perks Card and QR states
5. Partner/dashboard metric icons
6. Motion and loading rules
7. Editorial diagrams and proof mockups
