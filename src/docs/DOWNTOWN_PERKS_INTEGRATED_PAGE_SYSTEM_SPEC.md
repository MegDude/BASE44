# Downtown Perks Integrated Page System Spec

## Purpose

This document defines the complete standalone page system for Downtown Perks. The goal is not to create a stack of disconnected landing pages. The goal is to build one connected operating layer where each audience has its own page, its own message, and its own proof, but every path still resolves into the same Downtown Perks product:

- one live map
- one card access model
- one analytics system
- one submission system
- one design system

Every page should feel like a continuation of the same product. Nothing should feel like a dead redirect, a detached marketing page, or a hard handoff into a different app.

## Core Product Rules

Downtown Perks should behave like a downtown operating layer, not a brochure.

That means:

1. The map is the primary product surface.
2. The card is progressive access, not the product itself.
3. Residents should be able to browse before giving anything.
4. Partners should see measurable value, not vague awareness language.
5. Every page should lead naturally into the next action without breaking continuity.

## Global Design and UX Rules

Use the same design system across every page.

- Primary structure color: deep navy
- Surface color: cool off-white
- Accent color: restrained brand gold
- Panel treatment: soft glass or clean white surfaces
- Motion: subtle, structural, and useful
- Typography: Canela for display headlines, Inter for UI and body copy
- Spacing: consistent and slightly condensed, never loose and empty

Do not overload pages with long rows of buttons or filter chips. Use:

- one dropdown where a list is long
- one segmented control where there are two or three states
- one clear primary action
- one clear secondary action

Do not use multiple stacked CTA rows for the same idea.

## Core Site Architecture

These routes define the integrated system:

- `/`
- `/map`
- `/residents`
- `/properties`
- `/venues`
- `/brands`
- `/civic`
- `/partners`
- `/dashboard`
- `/join`
- `/api/submissions`
- `/api/map-data`
- `/api/heatmap`
- `/api/track`

Each route must stand on its own, but each route must also feel like part of the same live system.

## Shared Product Components

The site should be built from a small shared component set, reused everywhere:

- `SiteHeader`
- `SiteFooter`
- `PageShell`
- `MapShell`
- `MapIntentSearch`
- `MapResultsDrawer`
- `MapPreviewPanel`
- `SkylineEngine`
- `SkylineSignals`
- `SkylineFocus`
- `PartnerInterestForm`
- `ResidentCardForm`
- `AudienceHero`
- `AudienceValueGrid`
- `ProofStrip`
- `DashboardPreview`

No page should invent a separate map implementation or separate form system when a shared version already exists.

## Hidden Attribution Rule

The visible UI must not expose a `source` field.

The user should never see or edit:

- source
- utm source
- utm medium
- utm campaign
- referrer

That information must still be included in the submission payload for attribution and routing.

### Required Payload Model

Every public form should submit:

```js
{
  name,
  email,
  phone,
  organization,
  role,
  partnerType,
  message,
  source,
  campaign,
  medium,
  referrer,
  page,
}
```

### Required Hidden Source Values

- homepage join: `homepage_join_section`
- residents: `resident_page`
- properties: `property_partner_page`
- venues: `venue_partner_page`
- brands: `brand_sponsor_page`
- civic: `civic_partner_page`
- partners overview: `partners_overview_page`
- dashboard preview: `dashboard_preview_page`
- join page: `universal_join_page`

Source should be passed as a prop or computed from the route, never typed by the user.

## Shared Form Rule

Use one shared `PartnerInterestForm` component across public partner pages.

Visible fields only:

- name
- email
- phone
- organization
- role
- partner type
- message

Behavior requirements:

1. Submit inline to `/api/submissions`.
2. Show success inline on the same page.
3. Never redirect after submission.
4. Offer the next action inside the confirmation panel.
5. Include hidden attribution metadata automatically.

The confirmation state should feel like a continuation of the page, not a thank-you dead end.

## Analytics Rule

Every meaningful action must track into the shared analytics endpoint.

Required events:

- `page_view`
- `map_open`
- `search_submit`
- `marker_click`
- `result_open`
- `save_click`
- `perk_claim`
- `resident_signup`
- `partner_interest_submit`
- `dashboard_preview_open`

Use the same event model across the site. Do not invent one-off tracking payloads per page.

## Homepage: `/`

### Job of the page

The homepage should explain the product in one pass:

1. what Downtown Perks is
2. how a resident uses it
3. how a partner benefits from it
4. how activity becomes measurable

The homepage should not feel like a standard marketing homepage. It should feel like the product is already running.

### Page structure

1. Cinematic live hero
2. Resident utility section
3. Live map preview
4. Partner ecosystem section
5. Dashboard proof section
6. Shared join section

### Hero direction

The hero should be map-first and skyline-backed.

Headline:

`Where downtown meets you.`

Subhead:

`A live map for perks, events, places, and neighborhood activity across downtown Austin.`

Primary CTA:

`Open the Map`

Secondary CTA:

`Get Your Card`

The primary CTA should not dump users into an unrelated route without context. It should either scroll them into the live map section or route into `/map` with preserved state.

### What the homepage needs to prove

The homepage should show:

- walkable nearby discovery
- real event visibility
- live perk relevance
- building and resident context
- partner visibility
- measurable outcomes

The join form at the bottom should use hidden source `homepage_join_section`.

## Resident Page: `/residents`

### Job of the page

This page is for people who live downtown, spend time downtown, or want a simpler way to decide what to do nearby.

It should feel useful, clear, and immediate.

### Message

Headline:

`Your downtown, in one map.`

Subhead:

`Find nearby perks, events, restaurants, bars, coffee, services, and local favorites without downloading another app.`

### Required sections

1. Resident hero
2. Live map preview
3. Perks card explanation
4. Event discovery section
5. Saved places and repeat-use section
6. Resident signup form

### Required resident flow

The page should explain the actual resident flow in plain language:

1. open the map
2. see what is nearby
3. save or RSVP when something matters
4. unlock the card when access matters
5. redeem or show the card at participating places

The form on this page should use hidden source `resident_page`.

After success, keep the user on the page and offer:

- `Open the map`
- `See nearby perks`

## Property Page: `/properties`

### Job of the page

This page is for:

- apartment communities
- luxury towers
- condo buildings
- mixed-use developments
- leasing teams
- developer portfolios
- property managers

The page should frame Downtown Perks as a resident amenity and measurable neighborhood layer.

### Message

Headline:

`Turn the neighborhood into a resident amenity.`

Body direction:

Downtown Perks helps properties make downtown easier to use. Residents can see what is nearby, useful, active, and worth acting on. Property teams can see what people actually open, save, visit, and use.

### Required sections

1. Property-specific hero
2. Building QR and resident entry explanation
3. Perks card as resident access layer
4. Resident value section
5. Property dashboard preview
6. Example building activation section
7. Shared form

### What the page should show

This page should explicitly show:

- lobby QR entry
- resident map access
- nearby venues, events, and perks
- building-linked attribution
- scans, saves, visits, and redemptions

The form should use:

- `partnerType="property"`
- hidden source `property_partner_page`

After submission, keep the user inline and offer:

- `Preview dashboard`
- `Open resident map`

## Venues Page: `/venues`

### Job of the page

This page is for:

- restaurants
- bars
- coffee shops
- nightlife
- retail
- wellness
- services
- hotels
- local businesses

This page should explain why map visibility matters at the moment nearby people are deciding where to go.

### Message

Headline:

`Show up when nearby people are deciding.`

Core message:

Downtown Perks helps local businesses become visible when downtown residents, guests, and nearby people are actively choosing where to go.

### Required sections

1. Venue hero
2. Live visibility on the map
3. Perk and offer publishing
4. Event listing tools
5. Staff redemption explanation
6. Venue dashboard preview
7. Shared form

### Segment messaging

Bars:

Downtown Perks should help bars capture nearby nightlife intent before the night moves elsewhere.

Restaurants:

Downtown Perks should help restaurants show up when residents are deciding where to eat now.

Coffee shops:

Downtown Perks should help coffee shops own the daily morning and midday loop.

Retail and services:

Downtown Perks should help local utility show up when people need it, not after they have already defaulted elsewhere.

Hotels:

Downtown Perks should help hotels connect guests to actual downtown decisions, not static concierge lists.

### Required form behavior

Use:

- `partnerType="venue"`
- hidden source `venue_partner_page`

After success:

- `Preview dashboard`
- `See the live map`

## Brands Page: `/brands`

### Job of the page

This page is for:

- brands
- sponsors
- agencies
- activation partners

The page should position Downtown Perks as a district-level activation and measurable behavior layer, not a generic advertising surface.

### Message

Headline:

`Show up inside real downtown behavior.`

Core message:

Downtown Perks gives brands a way to participate in actual local movement, timing, and district attention instead of buying disconnected awareness.

### Required sections

1. Brand hero
2. Sponsor zone explanation
3. District activation examples
4. Building network access
5. Event and nightlife window examples
6. Dashboard and heatmap preview
7. Shared form

### Required examples

The page should show brand use cases such as:

- district sponsor
- event window sponsor
- building network activation
- resident card tie-in
- local venue bundle

The form should use:

- `partnerType="brand"`
- hidden source `brand_sponsor_page`

After success:

- `Preview dashboard`
- `View sponsor zones on the map`

## Civic Page: `/civic`

### Job of the page

This page is for:

- civic organizations
- district groups
- community organizations
- downtown alliances
- chambers
- cultural groups
- neighborhood initiatives

The page should feel useful, credible, and grounded in public-facing utility.

### Message

Headline:

`Make downtown easier to see, join, and support.`

Core message:

Downtown Perks helps civic and district organizations make events more visible, support local businesses, guide people through downtown, and read neighborhood activity without exposing personal data.

### Required sections

1. Civic hero
2. Public map utility explanation
3. Event visibility and programming support
4. Local business support layer
5. Privacy-protected heatmap and reporting explanation
6. Community dashboard preview
7. Shared form

### What the civic page needs to show

The civic page must not open in a dead zero-state.

It should show starter intelligence from:

- mapped public events
- district momentum
- resident and public moments
- walkable clusters
- local perk density
- corridor visibility

The civic page should explain:

- where events are building
- which downtown corridors are drawing attention
- where more visibility is needed
- how public-facing programming connects to business support

The form should use:

- `partnerType="civic"`
- hidden source `civic_partner_page`

After success:

- `View public map`
- `Preview community dashboard`

## Partners Overview Page: `/partners`

### Job of the page

This page should explain the entire partner ecosystem in one place without feeling like a rigid chooser screen.

It should introduce:

- properties
- venues and local businesses
- brands
- civic organizations

### Required behavior

Do not force immediate redirection.

Instead:

- use inline expandable sections
- use anchored transitions
- keep the user inside the same page while they learn

### What each partner section should include

Each section should answer:

- what they get
- how it works
- what they can measure
- how it appears on the map
- what the next action is

The form should use hidden source `partners_overview_page`.

## Dashboard Preview Page: `/dashboard`

### Job of the page

This page should preview the analytics environment. It should not be treated like a locked admin shell for now.

The dashboard should feel like the answer layer that sits under the map.

### Required structure

1. Live map or heatmap at the top
2. District metrics
3. Top venues or locations
4. Offer and event performance
5. Engagement and redemption metrics
6. Time-of-day activity
7. Attribution signals

### Required principle

The map should come first.
The numbers below should read as the answer to what the map is seeing.

### Required metrics

- impressions
- clicks
- saves
- redemptions
- engagement rate
- top district
- peak time
- partner lift

No dead links. If a CTA exists here, it should open inline UI or connect naturally to the partner form flow.

The shared form or CTA state here should carry hidden source `dashboard_preview_page`.

## Join Page: `/join`

### Job of the page

This page should serve as the universal interest flow without feeling generic.

### Required behavior

Ask the user what best describes them:

- resident
- property or building
- venue or local business
- brand or sponsor
- civic or community partner

The visible form should stay simple. Helper text should shift based on partner type.

The hidden source value should be `universal_join_page`.

After submission, show an inline confirmation with next steps that match the selected audience.

## Map Data Contract

All map surfaces should resolve into one normalized structure:

```js
{
  id: string,
  type: "venue" | "event" | "property" | "perk" | "brand" | "civic",
  name: string,
  category: string,
  district: string,
  lat: number,
  lng: number,
  description: string,
  offer: string | null,
  image: string | null,
  partnerId: string | null,
  active: boolean
}
```

Do not create a separate hand-maintained map schema per page.

Every page can present the map differently, but the feed should still normalize into the same contract.

## Natural Flow Rule

Every page should follow this logic:

1. explain the use case clearly
2. show the map context
3. show value in action
4. show proof
5. ask for the next step
6. keep the user inline after the action

That means:

- no hard dead-end success pages
- no unnecessary route jumps
- no CTA that just throws the user into an unrelated screen

Each page should feel like it continues the same Downtown Perks system.

## Theme Transition Rule

The full experience should respond to time of day and activity level.

Light mode should be used during the day when activity is daytime-oriented.

Dark mode should be used:

- in the evening
- at night
- when nightlife or high-intensity downtown activity is being emphasized

The transition should be smooth and shared across:

- homepage
- map
- dashboard
- forms
- partner pages
- mobile sheets

## Mobile Rule

Mobile should not be a compressed desktop layout.

Required mobile patterns:

- full-screen map
- floating search
- bottom-sheet results
- expandable detail sheet
- full-screen form sheet where needed
- stacked metrics
- no horizontal overflow

Do not ship three-column desktop card layouts unchanged onto mobile.

## Acceptance Criteria

The integrated page system is complete only when:

1. all routes render
2. no visible source field appears in any public form
3. hidden source is present in every submission payload
4. every CTA works
5. every success state is inline
6. the same map system powers every map surface
7. the dashboard reads from the same activity logic
8. mobile behavior is fully responsive
9. dark and light theme transitions behave consistently
10. the experience feels like one product, not a collection of unrelated pages

## Final Product Standard

Downtown Perks should read as one live downtown system.

Residents should feel like they are opening a useful neighborhood layer.

Properties should feel like they are buying a resident amenity with measurable proof.

Venues should feel like they are becoming visible when nearby people are deciding.

Brands should feel like they are entering real district behavior.

Civic organizations should feel like they are gaining a practical public-facing intelligence layer.

That is the standard for every page.
