# Downtown Perks — Execution-Ready Rebuild Matrix

**Document Type:** Route Inventory + Dependency + Implementation Matrix  
**Date:** 2026-04-15  
**Purpose:** Complete migration map for full Downtown Perks app rebuild  
**Baseline:** App.jsx route configuration + existing page files  
**Priority Route:** `/downtown-perks/explore`, `/downtown-perks/events` (map-primary)

---

## PART 1: ROUTE INVENTORY TABLE

| Route Path | Page File | Route Group | Page Title | Audience | Public | Auth Required | Role Required | Map Level | Priority | Critical |
|---|---|---|---|---|---|---|---|---|---|---|
| / | pages/Home | Public Marketing | Home / Landing | Public | ✓ | No | None | Medium | P1 | ✓ |
| /downtown-perks | pages/downtown-perks/Landing | Public Marketing | Downtown Perks Landing | Public | ✓ | No | None | Light | P1 | ✓ |
| /downtown-perks/explore | pages/downtown-perks/Explore | Public Marketing | Explore Downtown | Public | ✓ | No | None | **PRIMARY** | P1 | ✓ |
| /downtown-perks/events | pages/downtown-perks/Events | Public Marketing | Downtown Events | Public | ✓ | No | None | **PRIMARY** | P1 | ✓ |
| /downtown-perks/perks | pages/downtown-perks/PerksPage | Public Marketing | Downtown Perks | Public | ✓ | No | None | Medium | P2 | ✗ |
| /downtown-perks/card | pages/downtown-perks/PerksCard | Public Marketing | Perks Card | Public | ✓ | No | None | None | P2 | ✗ |
| /downtown-perks/for-buildings | pages/downtown-perks/ForBuildings | Public Marketing | For Buildings | Public | ✓ | No | None | None | P2 | ✗ |
| /downtown-perks/about | pages/downtown-perks/About | Public Marketing | About Downtown Perks | Public | ✓ | No | None | None | P3 | ✗ |
| /brands | pages/downtown-perks/brands/Index | Brand Marketing | All Brands | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/the-paseo | pages/downtown-perks/brands/ThePaseo | Brand Marketing | The Paseo | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/the-waterline | pages/downtown-perks/brands/TheWaterline | Brand Marketing | The Waterline | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/bangers | pages/downtown-perks/brands/Bangers | Brand Marketing | Bangers | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/the-stay-put | pages/downtown-perks/brands/TheStayPut | Brand Marketing | Stay Put | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/yeti | pages/downtown-perks/brands/Yeti | Brand Marketing | YETI | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/rivian | pages/downtown-perks/brands/Rivian | Brand Marketing | Rivian | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/lululemon | pages/downtown-perks/brands/Lululemon | Brand Marketing | lululemon | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/equinox | pages/downtown-perks/brands/Equinox | Brand Marketing | Equinox | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/laz-y-boy-park | pages/downtown-perks/brands/AustinFC | Brand Marketing | Austin FC | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/fabi-and-rosi | pages/downtown-perks/brands/FabiAndRosi | Brand Marketing | Fabi & Rosi | Public | ✓ | No | None | None | P2 | ✗ |
| /brands/hotel-van-zandt | pages/downtown-perks/brands/HotelVanZandt | Brand Marketing | Hotel Van Zandt | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/four-seasons | pages/downtown-perks/brands/FourSeasons | Brand Marketing | Four Seasons | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/four-seasons-residences | pages/downtown-perks/brands/FourSeasonsResidences | Brand Marketing | Four Seasons Residences | Public | ✓ | No | None | Light | P2 | ✗ |
| /brands/the-shore | pages/downtown-perks/brands/TheShore | Brand Marketing | The Shore | Public | ✓ | No | None | Light | P2 | ✗ |
| /partners | pages/partners/Index | Partner Marketing | Partner Types | Public | ✓ | No | None | None | P2 | ✗ |
| /partners/residential | pages/partners/Residential | Partner Marketing | Residential Partners | Public | ✓ | No | None | None | P2 | ✗ |
| /partners/properties | pages/partners/Properties | Partner Marketing | Property Partners | Public | ✓ | No | None | Light | P2 | ✗ |
| /partners/hotels | pages/partners/Hotels | Partner Marketing | Hotel Partners | Public | ✓ | No | None | Light | P2 | ✗ |
| /partners/venues | pages/partners/Venues | Partner Marketing | Venue Partners | Public | ✓ | No | None | Light | P2 | ✗ |
| /partners/civic | pages/partners/Civic | Civic / Admin | Civic Partners | Public | ✓ | No | None | Medium | P2 | ✗ |
| /partners/brands | pages/partners/Brands | Brand / Campaign | Brand Activation | Public | ✓ | No | None | Medium | P2 | ✗ |
| /partner-workspace | pages/PartnerWorkspace | Partner / Operator | Partner Workspace | Authenticated | ✗ | Yes | partner/admin | None | P1 | ✓ |
| /dashboard | pages/Dashboard | Partner / Operator | Partner Dashboard | Authenticated | ✗ | Yes | partner/admin | Medium | P1 | ✓ |

---

## PART 2: DETAILED ROUTE SPECIFICATIONS

### GROUP A: PUBLIC MARKETING PAGES

#### Route: `/`
- **Page File:** `pages/Home`
- **Surface:** Home / Landing
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (hero map + explore CTA)
- **Components:**
  - `HeroSection` - hero with search + map overlay
  - `WhySection` - value prop
  - `MapSection` - highlight explore feature
  - `PartnerSlides` - partner carousel
  - `PricingSection` - pricing tiers
  - `FAQSection` - FAQ accordion
  - `ContactSection` - contact form
- **Entities Used:** None directly (display-only)
- **Key Interactions:**
  - Hero map search → navigate to `/downtown-perks/explore`
  - Partner slides navigation
  - Partner type selection
  - CTA button flows
- **Parity Checklist:**
  - [x] Layout hierarchy (hero, why, map, partners, pricing, faq, contact)
  - [x] Map behavior (hero map visible, flyable, zoomable)
  - [x] Hero search integration
  - [x] Partner carousel tabs and navigation
  - [x] Responsive behavior
  - [x] Footer integration
- **Rebuild Priority:** P1 - Critical
- **Notes:** Foundation page; map dependency is medium but not critical path

---

#### Route: `/downtown-perks`
- **Page File:** `pages/downtown-perks/Landing`
- **Surface:** Downtown Perks Landing
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Hero with intro
  - Problem/Solution section
  - System overview
  - Experience grid
  - How it works
  - CTA section
- **Entities Used:** None
- **Key Interactions:**
  - CTA buttons → navigate to explore, for-buildings
  - Explore button flow
- **Parity Checklist:**
  - [x] Section layout
  - [x] CTA buttons and destinations
  - [x] Grid layout
  - [x] Animations (scroll-triggered)
  - [x] Responsive text wrapping
- **Rebuild Priority:** P1 - Important entry point
- **Notes:** Entry point for downtown perks flows

---

#### Route: `/ask-the-map`, `/search` ⭐ **PRIORITY AGENT ROUTE**
- **Page File:** `pages/AskMapPage`
- **Surface:** Ask the Map Agent + Discovery
- **Audience:** Public
- **Auth:** None (optional for saved preferences)
- **Map Level:** **PRIMARY**
- **Ask the Map Integration:**
  - Chat interface for intent input
  - Guided prompt chips (coffee, dinner, events, perks, walking, etc.)
  - Intent parsing engine
  - Query state persistence (URL params + recent queries)
  - Map filter/layer sync based on intent
  - Result list auto-generation
  - Detail drawer auto-open on selection
- **Entities Used:**
  - Venue (search, filter, display)
  - Event (search, filter, display)
  - Perk (search, filter, display)
  - Building (reference context)
  - IntentQuery (logging)
- **Key Interactions:**
  - Natural-language input → parse intent → activate filters
  - Guided chip selection → update map + results
  - Result card click → open detail drawer
  - Save perk → persist in resident preferences
  - RSVP to event → trigger RSVP flow
- **Parity Checklist:**
  - [x] Chat interface or input surface
  - [x] Guided prompt chips preserved
  - [x] Intent parsing logic (coffee, dinner, etc. → category filters)
  - [x] Map syncs to query results
  - [x] Detail drawer integrates with ask-map state
  - [x] Result count badge
  - [x] Recent searches (if applicable)
  - [x] Mobile chat overlay
  - [x] Desktop split view (chat + map)
  - [x] Analytics logging (intent, interpreted, result viewed)
  - [x] Link to save/RSVP/explore flows
- **Rebuild Priority:** P0 - **CRITICAL**
- **Production-Critical:** YES
- **Notes:**
  - Core map agent surface
  - Must parse freeform intent + guided chips
  - Must sync Ask the Map results with map filters, markers, and detail states
  - Must enable booking searches: "where should I work", "coffee tonight", "events this weekend"
  - Intent logging feeds analytics pipeline

---

#### Route: `/downtown-perks/explore` ⭐ **PRIORITY MAP ROUTE**
- **Page File:** `pages/downtown-perks/Explore`
- **Surface:** Explore Downtown (Venues + Buildings)
- **Audience:** Public
- **Auth:** None (optional for saved items)
- **Map Level:** **PRIMARY**
- **Shared Components:**
  - `MapFlyTo` - safe coordinate-based map navigation
  - Coordinate validation via `lib/mapCoordinates.js`
  - Custom venue + building icons
  - Result card list + detail drawer
  - Search + filter chip system
- **Entities Used:**
  - Venue (read)
  - Building (read)
- **Key Interactions:**
  - Search → filter venues/buildings → update map + list
  - Category chip → filter → update display
  - Smart filters (walking distance, free perks, event-based) → filter → update
  - Venue/Building click → highlight marker → open drawer
  - Drawer detail → show full info + CTAs
- **Map Behavior:**
  - Initial center: Austin (30.267, -97.743)
  - Venues plotted as colored dots (category-based)
  - Buildings plotted as gold squares
  - Active marker shows label
  - FlyTo on selection with validation
  - Map viewport preserved on mobile as primary surface
- **Parity Checklist:**
  - [x] Map viewport (primary on desktop, hidden on mobile initially)
  - [x] Sidebar with search, category chips, smart filters
  - [x] Venue + Building card list
  - [x] Detail drawer with full info + CTAs
  - [x] Coordinate validation (no NaN errors)
  - [x] Smart filter logic (walking distance, free perks, event-based)
  - [x] Map legend
  - [x] Mobile bottom-sheet behavior
  - [x] Desktop split-view (sidebar + map)
  - [x] Result count badge
  - [x] Loading states
  - [x] Empty state when no results
- **Rebuild Priority:** P1 - **CRITICAL**
- **Map-Sensitive:** YES
- **Parity-Sensitive:** YES
- **Notes:**
  - Established as primary map surface with stable coordinate validation
  - Uses `filterValidMapItems()` + `normalizeCoordinates()` + `getValidLatLng()`
  - No NaN coordinate errors (recently fixed)
  - Both venues and buildings must remain queryable and plottable
  - Walking distance filter uses distance-to-center calculation
  - Free perks detection via text search in perk_description + perk_value
  - Event-based filter checks category membership
  - Mobile: map hidden by default, sidebar primary, can tap to reveal map
  - Desktop: split layout with sidebar left, map right

---

#### Route: `/downtown-perks/events` ⭐ **PRIORITY MAP ROUTE**
- **Page File:** `pages/downtown-perks/Events`
- **Surface:** Downtown Events
- **Audience:** Public
- **Auth:** None
- **Map Level:** **PRIMARY**
- **Shared Components:**
  - `MapFlyTo` - safe coordinate-based map navigation
  - Coordinate validation via `lib/mapCoordinates.js`
  - Category-specific event icons (colored pins)
  - Event card list + detail drawer
  - Search + category chips
- **Entities Used:**
  - Event (read, filter by non-past + non-cancelled)
- **Key Interactions:**
  - Search → filter events → update map + list
  - Category chip → filter by event type → update display
  - Event click → highlight marker → open drawer
  - RSVP button → trigger flow (not yet wired)
  - Detail drawer → full event info + RSVP + social share
- **Map Behavior:**
  - Initial center: Austin (30.267, -97.743)
  - Events plotted as colored dots (category-based)
  - Status badge on card (live, upcoming, past, cancelled)
  - Active marker shows highlighted state
  - FlyTo on selection with validation
  - Map viewport primary
- **Parity Checklist:**
  - [x] Map viewport with event markers
  - [x] Sidebar with search, category chips
  - [x] Event card list with status badges
  - [x] Detail drawer with event info, RSVP, share
  - [x] Coordinate validation (no NaN errors)
  - [x] Category legend
  - [x] Mobile bottom-sheet behavior
  - [x] Desktop split-view
  - [x] Result count badge
  - [x] Loading states
  - [x] Empty state
  - [x] Date/time display
  - [x] Member-only badge
  - [x] Capacity + RSVP count
- **Rebuild Priority:** P1 - **CRITICAL**
- **Map-Sensitive:** YES
- **Parity-Sensitive:** YES
- **Notes:**
  - Parallel structure to Explore page
  - Filters events by status (upcoming, live, past, cancelled)
  - Does not show past or cancelled events in initial load
  - RSVP flow is placeholder (not yet integrated)
  - Share buttons (Twitter, copy link, native share)
  - Event date/time formatted with moment.js
  - Event capacity vs RSVP count displayed
  - Members-only flag per event

---

#### Route: `/downtown-perks/perks`
- **Page File:** `pages/downtown-perks/PerksPage`
- **Surface:** Downtown Perks Catalog
- **Audience:** Public
- **Auth:** None
- **Map Level:** Light (reference only)
- **Components:**
  - Perk grid / list
  - Perk cards with value badges
  - Filter by category, status
  - Detail modal per perk
- **Entities Used:**
  - Perk (read)
- **Key Interactions:**
  - Filter by category → update grid
  - Perk card click → open detail modal
  - Copy perk code / redeem flow (placeholder)
- **Parity Checklist:**
  - [x] Perk card grid
  - [x] Category filter chips
  - [x] Status badge (active, paused, expired)
  - [x] Perk value display
  - [x] Terms display in detail
  - [x] Responsive grid
  - [x] Loading state
  - [x] Empty state
- **Rebuild Priority:** P2 - Important but non-critical
- **Notes:** Catalog view of available perks; lighter map usage

---

#### Route: `/downtown-perks/card`
- **Page File:** `pages/downtown-perks/PerksCard`
- **Surface:** Digital Perks Card
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Card design / mockup
  - QR code placeholder
  - Redemption instructions
  - Card usage info
- **Entities Used:** None (display-only)
- **Key Interactions:**
  - Card reveal / swipe
  - QR scan flow (placeholder)
- **Parity Checklist:**
  - [x] Card design / layout
  - [x] QR code placeholder
  - [x] Redemption instructions
  - [x] Responsive design
- **Rebuild Priority:** P2 - Marketing / onboarding
- **Notes:** Card is static mockup; QR flow not yet implemented

---

#### Route: `/downtown-perks/for-buildings`
- **Page File:** `pages/downtown-perks/ForBuildings`
- **Surface:** Downtown Perks for Buildings (Partner Pitch)
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Hero section
  - Benefits grid with icons
  - Pricing tiers (Pilot, Connected, Intelligence)
  - Feature comparison table
  - CTA section
  - FAQ section
- **Entities Used:** None
- **Key Interactions:**
  - Tier selection
  - CTA buttons → partner inquiry flow
  - FAQ accordion
- **Parity Checklist:**
  - [x] Pricing tier cards
  - [x] Benefit grid
  - [x] Feature comparison table
  - [x] CTA buttons
  - [x] Responsive layout
  - [x] Animations (scroll-triggered)
- **Rebuild Priority:** P2 - Partner acquisition
- **Notes:** Sales pitch page for buildings; no data dependencies

---

#### Route: `/downtown-perks/about`
- **Page File:** `pages/downtown-perks/About`
- **Surface:** About Downtown Perks
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Mission / story section
  - Team / values section
  - Timeline section
  - Press / media section
- **Entities Used:** None
- **Parity Checklist:**
  - [x] Section layout
  - [x] Text content
  - [x] Image placement
  - [x] Responsive design
- **Rebuild Priority:** P3 - Informational
- **Notes:** Static content; can follow core rebuilds

---

### GROUP B: BRAND MARKETING PAGES

#### Route: `/brands`
- **Page File:** `pages/downtown-perks/brands/Index`
- **Surface:** All Brands Directory
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Brand grid with cards
  - Filter by category / tag
  - Navigation to individual brand pages
- **Entities Used:** None (hardcoded brand list)
- **Key Interactions:**
  - Brand card click → navigate to individual brand page
  - Filter navigation
- **Parity Checklist:**
  - [x] Brand grid layout
  - [x] Brand cards (name, category, description, tag)
  - [x] Navigation links
  - [x] Responsive grid
  - [x] Animations
- **Rebuild Priority:** P2 - Partner showcase
- **Notes:** Directory of all brand partners; hardcoded data

---

#### Routes: `/brands/the-paseo`, `/brands/the-waterline`, `/brands/bangers`, `/brands/the-stay-put`, `/brands/yeti`, `/brands/rivian`, `/brands/lululemon`, `/brands/equinox`, `/brands/laz-y-boy-park`, `/brands/fabi-and-rosi`, `/brands/hotel-van-zandt`, `/brands/four-seasons`, `/brands/four-seasons-residences`, `/brands/the-shore`

**Pattern: Individual Brand Pages**

- **Page Files:** `pages/downtown-perks/brands/{BrandName}`
- **Surface:** Brand Profile / Activation Page
- **Audience:** Public
- **Auth:** None
- **Map Level:** Light (location reference, campaign map if applicable)
- **Components:**
  - Hero section with brand name, tagline, description
  - Demo panel (varies by brand: map view, QR interface, notification feed, etc.)
  - Signals / impact metrics
  - Flow diagram (how it works)
  - Use cases / features
  - CTA section (become a partner, view on map, etc.)
- **Entities Used:**
  - Venue (some brands reference venues)
  - Building (some brands reference properties)
  - Campaign / activation (referenced, not queried)
- **Key Interactions:**
  - CTA buttons → partner inquiry
  - Demo panel interaction (brand-specific)
  - Navigation back to brands index
  - Map view CTA → navigate to explore or property overview
- **Parity Checklist:**
  - [x] Brand hero section
  - [x] Demo panel (map, QR, feed, etc.)
  - [x] Metrics / impact display
  - [x] How it works section
  - [x] Use case grid
  - [x] CTA buttons
  - [x] Responsive design
  - [x] Back navigation
- **Rebuild Priority:** P2 - Partner showcase (staggered)
- **Notes:**
  - Each brand has unique demo panel
  - Some include map reference (e.g., Four Seasons, Hotels)
  - No form submission logic yet; CTAs are placeholder

---

### GROUP C: PARTNER MARKETING PAGES

#### Route: `/partners`
- **Page File:** `pages/partners/Index`
- **Surface:** Partner Types Overview
- **Audience:** Public
- **Auth:** None
- **Map Level:** None
- **Components:**
  - Partner type cards (Residential, Property, Hotel, Venue, Brand, Civic)
  - Value proposition per type
  - Stats display (e.g., buildings, residents, perks)
  - How it works section
  - CTA buttons to dive deeper
- **Entities Used:** None (display-only)
- **Key Interactions:**
  - Partner type card click → navigate to partner-specific page
  - CTA buttons → partner inquiry
- **Parity Checklist:**
  - [x] Partner type cards
  - [x] Value prop text per type
  - [x] Stats display
  - [x] Responsive grid
  - [x] Navigation links
- **Rebuild Priority:** P2 - Partner hub entry
- **Notes:** Hub for partner info; directs to specific partner pages

---

#### Route: `/partners/residential`
- **Page File:** `pages/partners/Residential`
- **Surface:** Residential Partner Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Light
- **Components:**
  - Hero section
  - Value props grid
  - Resident benefits section
  - How it works (steps)
  - Resident walkthrough / onboarding
  - Contact form / CTA
- **Entities Used:** None
- **Key Interactions:**
  - Tabs or steps navigation
  - Contact form submission
- **Parity Checklist:**
  - [x] Value prop section
  - [x] Benefits grid
  - [x] How it works steps
  - [x] Onboarding walkthrough
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Partner type page
- **Notes:** Educates residential partners on offering

---

#### Route: `/partners/properties`
- **Page File:** `pages/partners/Properties`
- **Surface:** Property Partner Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (building map reference, property showcase)
- **Components:**
  - Hero with property map
  - Amenities / features grid
  - Resident perks showcase
  - Partner stats
  - Integration steps
  - Contact form
- **Entities Used:**
  - Building (referenced in map)
  - Perk (example perks listed)
- **Key Interactions:**
  - Map interaction (property focus)
  - Form submission
- **Parity Checklist:**
  - [x] Property map display
  - [x] Amenities grid
  - [x] Perks showcase
  - [x] Integration steps
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Partner type page
- **Notes:** Map usage moderate; property reference only

---

#### Route: `/partners/hotels`
- **Page File:** `pages/partners/Hotels`
- **Surface:** Hotel Partner Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (hotel + nearby venue map)
- **Components:**
  - Hero section
  - Guest experience flow
  - Nearby perks map
  - Integration steps
  - Hotel listing (mockup)
  - Contact form
- **Entities Used:**
  - Hotel (referenced)
  - Venue (nearby perks)
  - Event (hotel guest activities)
- **Key Interactions:**
  - Map interaction (hotel + nearby discovery)
  - Form submission
- **Parity Checklist:**
  - [x] Hero section
  - [x] Guest flow steps
  - [x] Nearby perks map
  - [x] Hotel listing
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Partner type page
- **Notes:** Maps guest concierge experience with nearby discovery

---

#### Route: `/partners/venues`
- **Page File:** `pages/partners/Venues`
- **Surface:** Venue Partner Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (venue discovery + events map)
- **Components:**
  - Hero section
  - Venue discovery flow
  - Event activation section
  - QR codes / perk redemption
  - Analytics dashboard mockup
  - Contact form
- **Entities Used:**
  - Venue (reference)
  - Event (activation)
  - Perk (redemption)
- **Key Interactions:**
  - Map interaction (venue + events)
  - QR demo
  - Form submission
- **Parity Checklist:**
  - [x] Discovery flow steps
  - [x] Event activation section
  - [x] QR demo
  - [x] Analytics mockup
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Partner type page
- **Notes:** Maps venue discovery + event activation + QR redemption

---

#### Route: `/partners/civic`
- **Page File:** `pages/partners/Civic`
- **Surface:** Civic Partner Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (district map + civic activations)
- **Components:**
  - Hero section
  - District overview map
  - Civic programs / initiatives grid
  - Partner network display
  - Impact metrics
  - Contact form
- **Entities Used:**
  - Building (district reference)
  - Event (civic activations)
  - Partner (network display)
- **Key Interactions:**
  - Map interaction (district view)
  - Program selection
  - Form submission
- **Parity Checklist:**
  - [x] District map
  - [x] Program grid
  - [x] Partner network
  - [x] Impact metrics
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Civic enablement
- **Notes:** Maps district-wide initiatives and partner ecosystem

---

#### Route: `/partners/brands`
- **Page File:** `pages/partners/Brands`
- **Surface:** Brand Campaign Info
- **Audience:** Public
- **Auth:** None
- **Map Level:** Medium (campaign map, brand touchpoints)
- **Components:**
  - Hero section
  - Campaign map showing brand locations
  - Campaign activation flows
  - QR touchpoints
  - Performance metrics
  - Contact form
- **Entities Used:**
  - Venue (brand locations)
  - Event (campaign events)
  - Campaign (reference)
- **Key Interactions:**
  - Map interaction (brand touchpoints)
  - Campaign selection
  - Form submission
- **Parity Checklist:**
  - [x] Campaign hero
  - [x] Touchpoint map
  - [x] Activation flows
  - [x] QR demo
  - [x] Metrics display
  - [x] Form fields
  - [x] Responsive design
- **Rebuild Priority:** P2 - Brand activation
- **Notes:** Maps brand campaign touchpoints and QR activation

---

### GROUP D: PARTNER / OPERATOR PAGES

#### Route: `/partner-workspace`
- **Page File:** `pages/PartnerWorkspace`
- **Surface:** Partner Management Workspace
- **Audience:** Authenticated (partner/admin only)
- **Auth:** Yes (required)
- **Role Required:** partner / admin
- **Map Level:** Light (reference only in perk/event details)
- **Components:**
  - Tab navigation (Overview, Perks, Events, Profile)
  - Overview dashboard (stats, quick actions, recent items)
  - Perks manager (create, edit, delete perks)
  - Events manager (create, edit, delete events)
  - Profile section (organization info, partner type)
  - Forms for perk/event creation
- **Entities Used:**
  - Perk (CRUD)
  - Event (CRUD)
  - User (read/update - profile info)
- **Key Interactions:**
  - Tab navigation
  - Create perk / event
  - Edit perk / event
  - Delete perk / event
  - Update profile
  - Quick action buttons
  - Form submissions
- **Forms Present:**
  - Perk form (title, venue_name, category, value, description, terms, status)
  - Event form (title, venue_name, category, date, address, capacity, status, is_members_only)
  - Profile form (organization_name, partner_type, website, phone, bio)
- **Parity Checklist:**
  - [x] Tab navigation and persistence
  - [x] Overview dashboard layout
  - [x] Stat cards (active perks, upcoming events, etc.)
  - [x] Quick action buttons
  - [x] Perk list (CRUD cards)
  - [x] Event list (CRUD cards)
  - [x] Forms for perk/event creation
  - [x] Profile form with user info
  - [x] Loading states
  - [x] Empty states per section
  - [x] Auth gating
  - [x] Mobile responsiveness
  - [x] Inline edit capability
  - [x] Delete confirmation
  - [x] Success/error feedback
- **Rebuild Priority:** P1 - **CRITICAL**
- **Production-Critical:** YES
- **Notes:**
  - Core operator dashboard for perks + events management
  - Only accessible to authenticated partners/admins
  - User data stored on User entity (organization_name, partner_type, bio, etc.)
  - Recently refactored to use tabbed interface
  - No map rendering needed; light reference only

---

#### Route: `/dashboard`
- **Page File:** `pages/Dashboard`
- **Surface:** Analytics / Partner Dashboard
- **Audience:** Authenticated (partner/admin only)
- **Auth:** Yes (required)
- **Role Required:** partner / admin
- **Map Level:** Medium (activity map, possibly footfall visualization)
- **Components:**
  - Header with user info
  - Overview stats (views, perks used, events attended, etc.)
  - Interactive map (partner locations / perk/event footfall)
  - Activity timeline / recent interactions
  - Performance charts
  - Settings section
  - Downloadable reports
- **Entities Used:**
  - Perk (read - analytics)
  - Event (read - analytics)
  - Building (reference - map)
  - Venue (reference - map)
  - Activity log (read - timeline)
- **Key Interactions:**
  - Map interaction (location focus, layer toggle)
  - Date range filter for metrics
  - Chart interactions (hover, drill-down)
  - Settings form submission
  - Report download
  - Tab/section navigation
- **Parity Checklist:**
  - [x] Header with user profile
  - [x] Overview stats display
  - [x] Map with perk/event footfall
  - [x] Activity timeline
  - [x] Performance charts
  - [x] Date range filters
  - [x] Settings form
  - [x] Download button
  - [x] Mobile responsiveness
  - [x] Loading states
  - [x] Auth gating
- **Rebuild Priority:** P1 - **CRITICAL**
- **Production-Critical:** YES
- **Notes:**
  - Analytics dashboard for partner engagement tracking
  - Map usage moderate; footfall visualization, not interactive discovery
  - Currently placeholder metrics; integration pending
  - Date filtering for time-based analytics

---

## PART 3: SHARED SYSTEMS INVENTORY

### Map System
- **Primary Component:** `components/map/MapShell.jsx` (new, canonical)
- **Utilities:** `lib/mapCoordinates.js` (shared coordinate validation)
- **Coordinate Helpers:**
  - `toFiniteNumber(value)` - safe number conversion
  - `isValidCoordinate(lat, lng)` - validation check
  - `normalizeCoordinates(entity)` - standardize field names
  - `getValidLatLng(entity)` - return valid [lat, lng] or null
  - `filterValidMapItems(items)` - remove invalid records
- **Used By Routes:**
  - `/` (Home - hero map)
  - `/ask-the-map`, `/search` (Ask the Map agent)
  - `/downtown-perks/explore` (Venues + Buildings)
  - `/downtown-perks/events` (Events)
  - `/resident-app` (Resident map-first surface)
  - `/app/now` (Now page - intent-based discovery)
  - `/partners/properties` (Property showcase)
  - `/partners/hotels` (Hotel + nearby)
  - `/partners/venues` (Venue discovery)
  - `/partners/civic` (District overview)
  - `/partners/brands` (Campaign touchpoints)
  - `/dashboard` (Partner analytics map)
- **Production-Critical:** YES

### Ask the Map Agent System ⭐ **PRODUCTION-CRITICAL**
- **Purpose:** Natural-language intent parsing + map-action execution
- **Components:**
  - Ask the Map chat/input interface
  - Intent parser (interprets user intent)
  - Query state manager
  - Filter/layer sync engine
  - Result card mapper
  - Analytics logger
- **Routes with Ask the Map:**
  - `/ask-the-map` (Dedicated agent page)
  - `/search` (Search alias for agent)
  - `/resident-app` (Map-integrated agent)
  - `/app/now` (Intent-driven discovery)
  - All other map surfaces (optional/contextual)
- **Supported Intents:**
  - Category-based: coffee, dinner, drinks, fitness, wellness
  - Time-based: tonight, now, this weekend
  - Activity-based: happy hour, workout, dinner date, brunch
  - Location-based: nearby, walking, within 5 min
  - Perk-based: free coffee, perks, deals
  - Hybrid: "where should I work", "what's open", "events tonight"
- **Integration Points:**
  - Parse intent → activate map filters
  - Match entities (Venue, Event, Perk, Building)
  - Sync map markers to query results
  - Open correct detail drawer
  - Link to save/RSVP/redeem flows
- **Query State Persistence:**
  - URL query params for bookmarkable searches
  - Recent searches in resident dashboard
  - Intent logging for analytics
- **Analytics Tracked:**
  - intent_query (text + parsed intent)
  - intent_interpreted (category + matched entities)
  - result_viewed (entity + type)
  - result_action (save/rsvp/redeem)
  - query_time (timestamp)
- **Production-Critical:** YES

### Real-Time Geofencing Engagement System ⭐ **PRODUCTION-CRITICAL**
- **Purpose:** Location-based resident engagement at saved perk locations
- **Components:**
  - Geofence detector (proximity engine)
  - Notification trigger logic
  - Toast/alert surface
  - Push notification bridge
  - Permission manager
  - Cooldown state tracker
- **Routes with Geofencing:**
  - `/resident-app` (Geofence toast integration)
  - `/app/now` (Proximity-based suggestions)
  - All resident-app surfaces (alert bar integration)
- **Trigger Logic:**
  - Monitor resident location (with permission)
  - Compare against saved perk locations
  - Trigger when within 500m (configurable)
  - Check cooldown (not more than 2x per day per perk)
  - Show in-app toast + push notification
- **Notification States:**
  - First trigger: full CTA (show perk details)
  - Repeat trigger (same day): subtle reminder
  - Cooldown: suppress for 12 hours
  - Dismissed: track dismissal reason
  - Redeemed: link successful conversion
- **Permission Handling:**
  - Request location permission on welcome flow
  - Request notification permission on welcome flow
  - Allow opt-out per perk/category/all
  - Graceful fallback if permissions denied
- **Link-Back Behavior:**
  - Toast click → open perk detail in map drawer
  - Detail drawer → show perk location on map
  - Detail drawer → show redemption card if applicable
  - Detail drawer → show save button
- **Analytics Tracked:**
  - geofence_trigger_sent (perk_id + distance)
  - geofence_toast_shown
  - geofence_toast_clicked (time to click)
  - geofence_toast_dismissed
  - geofence_detail_opened
  - geofence_perk_redeemed
- **Mobile Behavior:**
  - In-app toast notification (foreground)
  - Push notification (background)
  - Desktop: notification bell icon + alert bar
- **Entity Dependencies:**
  - Saved items (resident favorites/saved perks)
  - Perk (location coordinates, name, redemption rules)
  - Resident (location tracking, preferences)
  - ResidentAlert (alert state + history)
- **Production-Critical:** YES

### Layout System
- **Root Layout:** `components/Layout` (wraps all routes)
- **Navbar:** `components/Navbar` (global navigation)
- **Footer:** `components/Footer` (editorial footer - most pages)
- **HomeFooter:** `components/HomeFooter` (home-specific footer)
- **Used By:** All routes via Layout wrapper

### Auth System
- **Provider:** `lib/AuthContext` (useAuth hook)
- **Methods:**
  - `base44.auth.me()` - get current user
  - Login redirects removed for public local preview
  - `base44.auth.updateMe(data)` - update user profile
  - `base44.auth.logout()` - logout
- **Used By:** 
  - `/partner-workspace` (public preview)
  - `/dashboard` (public preview)
  - All pages (public local preview)

### Query System
- **Provider:** `@tanstack/react-query` via `QueryClientProvider`
- **Config:** `lib/query-client.js`
- **Used By:** All pages fetching entities (Explore, Events, Dashboard, PartnerWorkspace)

### UI Components (shadcn/ui)
- **Buttons, Cards, Badges, Inputs, Modals, Dropdowns, etc.**
- **Used By:** All pages

### Icons
- **Library:** `lucide-react`
- **Used By:** All pages

### Animations
- **Library:** `framer-motion`
- **Used By:** Most pages (scroll animations, entrance transitions)

### Toaster Notifications
- **Library:** `sonner`
- **Wrapper:** `components/ui/toaster`
- **Used By:** Any page needing feedback (future integration)

---

## PART 4: ENTITY DEPENDENCY MATRIX

| Entity | Read By Routes | Write By Routes | Analytics Routes | Notes |
|---|---|---|---|---|
| **Venue** | Explore, Properties, Hotels, Venues, Brands, Home | (Not writable in current UI) | Dashboard | Core discovery entity; used in multiple map surfaces |
| **Building** | Explore, Properties, Civic, Home | (Not writable in current UI) | Dashboard | Core property entity; used in property showcase + district map |
| **Event** | Events, Civic, Brands, Venues, Hotels | PartnerWorkspace (create/edit/delete) | Dashboard | Partner-created events; tied to venues |
| **Perk** | PerksPage, Explore (smart filters), Hotels, Venues | PartnerWorkspace (create/edit/delete) | Dashboard | Partner-created perks; tied to venues |
| **User** | PartnerWorkspace (profile), Dashboard | PartnerWorkspace (profile update), Dashboard (settings) | Dashboard | Stores partner/operator profile; used for auth gating |
| **Hotel** | Hotels partner page, Dashboard | (Not writable in current UI) | Dashboard | Reference entity for hotel partnerships |
| **Brand** | Brands pages, Brands partner page | (Not writable in current UI) | Dashboard | Hardcoded brand data; not currently dynamic |
| **Amenity** | ForBuildings (feature list reference) | (Not writable in current UI) | — | Building amenities; listed in property description |

---

## PART 5: INTERACTION DEPENDENCY MATRIX

| Interaction | Routes | Data Touched | Write | Auth Required | Mobile Diff | Status |
|---|---|---|---|---|---|---|
| **Search → Update Map** | Explore, Events | Venue, Event (filtered) | No | No | Yes (list view primary on mobile) | Active |
| **Filter Chip → Update Display** | Explore, Events, PerksPage | Venue, Event, Perk (filtered) | No | No | No | Active |
| **Smart Filter (Walking, Free, Event)** | Explore | Venue, Building (distance-calculated) | No | No | No | Active |
| **Marker Click → Open Detail** | Explore, Events, Dashboard | Venue, Event, Building (selected) | No | No | No | Active |
| **Detail Drawer Interaction** | Explore, Events, PartnerWorkspace | Venue, Event, Perk (selected) | No | No | Yes (full-screen on mobile) | Active |
| **Create Perk** | PartnerWorkspace | Perk (write) | Yes | Yes | Yes | Active |
| **Edit Perk** | PartnerWorkspace | Perk (write) | Yes | Yes | Yes | Active |
| **Delete Perk** | PartnerWorkspace | Perk (delete) | Yes | Yes | Yes | Active |
| **Create Event** | PartnerWorkspace | Event (write) | Yes | Yes | Yes | Active |
| **Edit Event** | PartnerWorkspace | Event (write) | Yes | Yes | Yes | Active |
| **Delete Event** | PartnerWorkspace | Event (delete) | Yes | Yes | Yes | Active |
| **Update Partner Profile** | PartnerWorkspace | User (write) | Yes | Yes | Yes | Active |
| **RSVP to Event** | Events | Event, Resident Badge (placeholder) | Yes | No (placeholder) | No | Placeholder |
| **Redeem Perk** | PerksCard, PerksPage | Perk, Redemption (placeholder) | Yes | No (placeholder) | No | Placeholder |
| **View Analytics** | Dashboard | Perk, Event, Activity Log (read) | No | Yes | Yes | Active |
| **Download Report** | Dashboard | Perk, Event, Activity Log (export) | No | Yes | No | Placeholder |

---

## PART 6: REBUILD ORDER RECOMMENDATION

### Phase 1: Foundation & Core System (Week 1)
**Goal:** Establish shared infrastructure for all pages

1. **Layout + Navigation System** (Layout, Navbar, Footer)
   - Route wrapping
   - Navigation persistence
   - Footer integration
   - Dependency: None
   - Risk: Low

2. **Auth System** (AuthContext, login/logout flows)
   - User state management
   - Protected route wrapping
   - Profile data persistence
   - Dependency: None
   - Risk: Low

3. **Query System** (React Query provider)
   - Data fetching setup
   - Cache management
   - Error handling
   - Dependency: None
   - Risk: Low

4. **Coordinate Validation System** (`lib/mapCoordinates.js`)
   - Ensure no NaN errors
   - Test with Venue, Building, Event entities
   - Dependency: None
   - Risk: **CRITICAL - foundational**

5. **Toast/Alert System** (Notification layer)
   - Toast component for geofence notifications
   - Alert bar for resident alerts
   - Push notification bridge
   - Dependency: None
   - Risk: Low

---

### Phase 2: Ask the Map Agent System (Week 2)
**Goal:** Build intent parser + query engine for map-action execution

6. **Intent Parser** (Ask the Map core)
   - Natural-language input processing
   - Category mapping (coffee → restaurant filter)
   - Time parsing (tonight → event filter)
   - Activity parsing (workout → fitness)
   - Hybrid intent (where should I work → coworking)
   - Dependency: Phase 1
   - Risk: **CRITICAL** - core product

7. **Query State Manager**
   - URL query param persistence
   - Recent search tracking
   - Intent state synchronization
   - Dependency: Intent Parser
   - Risk: Medium

8. **Filter/Map Sync Engine**
   - Translate parsed intent to map filters
   - Auto-populate category chips from intent
   - Sync result count + markers
   - Dependency: Intent Parser, MapShell (Phase 3)
   - Risk: High (must sync perfectly with map)

---

### Phase 3: Map System (Week 3)
**Goal:** Establish canonical map component and verify coordinate safety

9. **MapShell Component** (`components/map/MapShell.jsx`)
   - Render Leaflet container
   - Marker plotting with validation
   - Result list integration
   - Detail drawer integration
   - Ask the Map query state integration
   - Dependency: Coordinate validation (Phase 1), Filter/Map Sync (Phase 2)
   - Risk: Medium (new component, must be reusable)

10. **Map Integration Test** (Explore page)
    - Verify MapShell with Venue + Building data
    - Test coordinate validation
    - Test smart filters
    - Test Ask the Map integration
    - Test mobile behavior
    - Dependency: MapShell (Phase 3)
    - Risk: High (parity-critical)

---

### Phase 4: Geofencing System (Week 4)
**Goal:** Build real-time proximity detection + engagement

11. **Geofence Detector** (Proximity engine)
    - Location permission request on welcome
    - Background location tracking
    - Distance calculation to saved perks
    - 500m proximity threshold
    - Dependency: Phase 1 (Toast/Alert), Phase 5 (Resident data)
    - Risk: **CRITICAL** - privacy + accuracy sensitive

12. **Trigger Logic** (Notification logic)
    - Cooldown state (not 2x per perk per day)
    - First trigger vs repeat trigger behavior
    - Dismissal state tracking
    - Redemption linkage
    - Dependency: Geofence Detector
    - Risk: High (engagement metric dependent)

---

### Phase 5: Map-Primary Pages (Week 5)
**Goal:** Rebuild critical map-driven resident surfaces

13. **Ask the Map Page Rebuild** (`/ask-the-map`, `/search`)
    - Use intent parser (Phase 2)
    - Integrate MapShell (Phase 3)
    - Chat interface + guided chips
    - Query state persistence
    - Analytics logging
    - Dependency: Intent Parser (Phase 2), MapShell (Phase 3)
    - Risk: High (core product)

14. **Explore Page Rebuild** (`/downtown-perks/explore`)
    - Use MapShell component
    - Venue + Building data flow
    - Search + filter integration
    - Smart filters (walking, free perks, event-based)
    - Detail drawer
    - Dependency: MapShell (Phase 3)
    - Risk: High (currently production, must maintain parity)

15. **Events Page Rebuild** (`/downtown-perks/events`)
    - Use MapShell component
    - Event data flow
    - Category filtering
    - Status badges
    - Detail drawer + RSVP (placeholder)
    - Dependency: MapShell (Phase 3)
    - Risk: High (currently production, must maintain parity)

16. **Resident App Rebuild** (`/resident-app`, `/app/now`)
    - Use MapShell with Ask the Map integration
    - Geofence notification integration
    - Toast display on nearby saved perks
    - Perk detail drawer linkage
    - Dependency: MapShell (Phase 3), Geofence System (Phase 4), Ask the Map (Phase 2)
    - Risk: **CRITICAL** (map-first resident surface + dual systems)

---

### Phase 6: Partner Management (Week 6)
**Goal:** Rebuild operator-facing management interfaces

17. **PartnerWorkspace Rebuild** (`/partner-workspace`)
    - Tab navigation (Overview, Perks, Events, Profile)
    - Perk CRUD forms
    - Event CRUD forms
    - Profile update form
    - User auth gating
    - Dependency: Auth System (Phase 1), Query System (Phase 1)
    - Risk: Medium (data-sensitive, form validation required)

18. **Dashboard Rebuild** (`/dashboard`)
    - User auth gating
    - Analytics display (placeholder metrics)
    - Optional: Map visualization (footfall)
    - Settings form
    - Dependency: Auth System (Phase 1), Query System (Phase 1)
    - Risk: Medium (analytics may be placeholder)

---

### Phase 7: Partner Marketing Pages (Week 7)
**Goal:** Rebuild partner-facing informational surfaces

19. **Partner Hub Pages** (`/partners`, `/partners/residential`, `/partners/properties`, `/partners/hotels`, `/partners/venues`, `/partners/civic`, `/partners/brands`)
    - Static content + light map references
    - Form submission (placeholder)
    - Navigation flows
    - Dependency: Layout System (Phase 1)
    - Risk: Low (mostly static, light map refs)

---

### Phase 8: Brand Pages (Week 8)
**Goal:** Rebuild brand showcase surfaces

20. **Brands Index + Individual Brand Pages** (`/brands`, `/brands/*`)
    - Brand directory grid
    - Individual brand pages with unique demo panels
    - Navigation flows
    - Form submission (placeholder)
    - Dependency: Layout System (Phase 1)
    - Risk: Low (mostly static, demo panels vary)

---

### Phase 9: Public Landing Pages (Week 9)
**Goal:** Rebuild public-facing entry surfaces

21. **Home Page Rebuild** (`/`)
    - Hero map (use MapShell)
    - Value prop sections
    - Partner carousel
    - Pricing section
    - CTA flows
    - Dependency: MapShell (Phase 3)
    - Risk: Medium (hero map must work correctly)

22. **Downtown Perks Landing** (`/downtown-perks`)
    - Static content sections
    - CTA flows
    - Dependency: Layout System (Phase 1)
    - Risk: Low

23. **Additional Pages** (`/downtown-perks/perks`, `/downtown-perks/card`, `/downtown-perks/for-buildings`, `/downtown-perks/about`)
    - Static content + light interactions
    - Placeholder forms
    - Dependency: Layout System (Phase 1)
    - Risk: Low

---

### Phase 10: System Integration & Testing (Week 10)
**Goal:** Verify all pages, fix parity issues, mobile behavior, system integration

24. **Ask the Map + Geofence Integration** (Resident surfaces)
    - Verify Ask the Map query state syncs to map
    - Verify geofence triggers show toast
    - Verify toast click opens detail drawer
    - Verify all three systems work together
    - Dependency: All Phases 2-5
    - Risk: **CRITICAL** (dual system integration)

25. **Parity Verification** (All routes)
    - Compare rebuilt routes against original
    - Check map behavior (Explore, Events, Dashboard, Ask the Map, etc.)
    - Check form behavior (PartnerWorkspace, Partner pages)
    - Check mobile responsiveness (all pages)
    - Dependency: All phases
    - Risk: High (must catch all deviations)

26. **Mobile Testing & Fixes** (All routes)
    - Map viewport behavior (mobile primary on Explore/Events/Resident App)
    - Sidebar collapse on mobile
    - Bottom-sheet behavior
    - Toast positioning on mobile
    - Geofence notification behavior (foreground/background)
    - Responsive text + truncation
    - Dependency: All phases
    - Risk: High (mobile-critical for resident app)

27. **Coordinate Safety Audit** (All map routes)
    - Verify no NaN errors
    - Verify all coordinates normalized before use
    - Verify filterValidMapItems applied everywhere
    - Test with data inconsistencies
    - Dependency: Coordinate validation system (Phase 1)
    - Risk: Critical (must eliminate errors completely)

28. **Analytics Validation** (All systems)
    - Ask the Map: intent queries logged correctly
    - Geofence: triggers and conversions tracked
    - Map interactions: result views and actions logged
    - Dependency: All analytics instrumentation
    - Risk: Medium (analytics must be clean)

---

## PART 7: REBUILD PRIORITY CLASSIFICATION

### Critical (P0) — Production Systems (Must complete before go-live)
- **Ask the Map Agent System** - `/ask-the-map`, `/search`, resident-app integration
- **Real-time Geofencing System** - `/resident-app`, `/app/now`, all resident surfaces
- `/` (Home)
- `/downtown-perks` (Landing)
- `/ask-the-map`, `/search` (Ask the Map agent surface)
- `/downtown-perks/explore` (Map-primary resident surface)
- `/downtown-perks/events` (Map-primary resident surface)
- `/resident-app` (Resident map-first + geofencing + ask-map)
- `/app/now` (Intent-driven discovery + geofencing)
- `/partner-workspace` (Operator management)
- `/dashboard` (Operator analytics)

### Important (P2) — Complete next
- `/downtown-perks/perks` (Perk catalog)
- `/partners` (Partner hub)
- `/partners/residential`, `/partners/properties`, `/partners/hotels`, `/partners/venues`, `/partners/civic`, `/partners/brands` (Partner info pages)
- `/brands` (Brand directory)
- `/brands/*` (Individual brand pages - 14 routes)

### Migrate After Core (P3) — Follow later
- `/downtown-perks/card` (Card mockup)
- `/downtown-perks/for-buildings` (Sales pitch)
- `/downtown-perks/about` (Informational)

---

## PART 8: RISK & PARITY ASSESSMENT

### High-Risk Routes (Parity Failure = Production Impact)
1. **`/downtown-perks/explore`** - Map-primary, coordinate-critical, smart filters, mobile split-view
2. **`/downtown-perks/events`** - Map-primary, coordinate-critical, RSVP placeholder
3. **`/partner-workspace`** - Operator CRUD, forms, data persistence, mobile forms
4. **`/dashboard`** - Analytics, auth gating, optional map

### Medium-Risk Routes (Deviations Noticeable)
- `/` (Home) - Hero map, partner carousel, pricing section
- `/downtown-perks` (Landing) - Section layout, CTA flows
- All partner pages - Light map refs, form placeholders

### Low-Risk Routes (Static Content)
- All brand pages - Static content + demo panels
- All informational pages - Static text + layout

---

## PART 9: COMPLETION CHECKLIST

- [ ] Phase 1 complete (Foundation + Auth + Query + Coordinates)
- [ ] Phase 2 complete (MapShell created, tested with coordinate validation)
- [ ] Phase 3 complete (Explore + Events rebuilt, map behavior verified)
- [ ] Phase 4 complete (PartnerWorkspace + Dashboard rebuilt, CRUD flows working)
- [ ] Phase 5 complete (Partner pages rebuilt, forms in place)
- [ ] Phase 6 complete (Brand pages rebuilt)
- [ ] Phase 7 complete (Public pages rebuilt, hero map working)
- [ ] Phase 8a complete (Parity verification all routes match original)
- [ ] Phase 8b complete (Mobile behavior verified all routes)
- [ ] Phase 8c complete (Coordinate safety audit - zero NaN errors)
- [ ] MAP_PARITY_CHECKLIST.md updated with final status
- [ ] All routes tested in production
- [ ] Handoff ready

---

**Status:** EXECUTION MATRIX COMPLETE  
**Next Step:** Begin Phase 1 (Foundation System) rebuild
