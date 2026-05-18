# Downtown Perks unified platform copy deck

## recommendation

Use this document as the single source-of-truth copy deck for Downtown Perks. It is organized by route first, then section and component module, so each line stays tied to where it appears in the product.

## extraction scope

This deck covers the canonical platform route map from `src/lib/routes.js`, including the home page, resident pages, map/explore pages, events, perks, card, about, build pack, brands, partner routes, partner dashboard variants, partner workspace, resident app, resident app card route, and dashboard hub.

It also covers canonical partner routing logic:

- Properties / Residential -> `/partners/properties`
- Hospitality / Hotels -> `/partners/hospitality`
- Venues / Bars / Restaurants / Local Business -> `/partners/venues`
- Brands -> `/partners/brands`
- Civic -> `/partners/civic`

## 1. global system copy

### primary navigation

- Downtown Perks
- Residents
- Partners
- Start Here
- Dashboard
- Get Your Card

### resident navigation/footer links

- Explore Map
- Events
- Perks
- Get Your Card

### partner navigation/footer links

- Partner Overview
- Properties
- Hospitality
- Venues
- Brands
- Civic
- Dashboard

### platform/footer links

- Start Here
- Dashboard
- About

### footer identity

- Downtown Perks
- Downtown Austin's live neighborhood layer.
- © 2026 Downtown Perks · Austin, TX
- Where downtown works like a system.

### shared map/search labels

- Ask the Map
- Ask
- Open Map
- Search places, events, perks, or what is nearby
- Search downtown Austin...
- Results
- Close results
- Back
- Loading the live downtown layer...
- Showing what fits nearby.
- Showing the live downtown layer.
- No exact matches for that filter. Showing the nearest results instead.

## 2. home page `/`

### hero

- Eyebrow: Live Downtown Map
- Headline: Where downtown meets you.
- Lead: Start with one decision. The map does the rest.
- Body: The friction of downtown living is not a lack of options. It is how scattered everything feels. Downtown Perks brings places, plans, and perks together so the next move is easier to make.
- Prompts:
  - Where do you want to go?
  - What do you want to do?
  - Who do you want to meet?
- Primary CTA: Open Map
- Secondary CTA: Get the Perks Card
- Search placeholder: Search places, events, perks, or what is nearby

### why this exists

- Title: Downtown, in one place
- Problem: You live downtown but expect it to be easier. Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.
- Examples: Google for restaurants. Instagram for events. Text three friends to find the best happy hour.
- Summary: Downtown Perks fixes that. The problem is not what to do next. It is the effort it takes to decide.
- Behavior title: Search less. Do more.
- Behavior body: Downtown Perks brings places, events, and perks together so it is easier to decide what to do next.
- Promise title: One map. Everything nearby.
- Promise body: Places, plans, and perks in one simple view. No app download. No account setup.
- Promise note: No switching between apps. No piecing things together. Just what matters, in one place.

### what you can do here

- Title: What you can do here
- Intro: Everything works together, so you spend less time searching and more time showing up.
- List label: Find what you need:
- Restaurants, bars, coffee shops, and services nearby
- Events happening tonight, ready to RSVP
- Local perks from places you'd go anyway
- Places worth coming back to
- CTAs:
  - Explore Downtown
  - Get a Perks Card

### how it works

- Title: Open it. Pick something. Go.
- Step: Open the map.
  - Start with one live downtown layer instead of opening five different apps.
- Step: Tap something that looks good.
  - See what it is, why it matters, and how close it is before you decide.
- Step: Walk there. Show your card if there is a perk.
  - No extra setup. No overthinking. Just go.
- Close: No extra steps. No overthinking. Just go.
- Note: Use the map first. Add the card when saves, RSVP, member perks, or redemption actually matter.

### downtown live map

- Title: Downtown live map
- Subtitle: Explore what is worth walking to right now.
- Search placeholder: Search downtown Austin...
- Result label: Results
- Filter tabs:
  - All
  - Coffee
  - Dining
  - Nightlife
  - Wellness
  - Shopping
  - Market
- Toggles:
  - Crowd
  - Perks

### partner slides

#### residential/properties

- Label: Residential
- Headline: Make your address more useful.
- Body:
  - Connect residents to nearby places, events, and perks that make downtown easier to use.
  - Use the live map, QR entry, and reporting layer to prove what residents actually use.
  - This works as a resident amenity, a leasing signal, and a neighborhood layer at the same time.
- Includes:
  - QR access across lobby, leasing, and welcome flow
  - Live map of nearby places, events, and perks
  - Your property inside the same experience
  - Real engagement, not passive info
- Pricing: Free forever · $39/year · $99/year
- CTA: Bring this to your property

#### hospitality/hotels

- Label: Hospitality
- Headline: Extend the stay beyond the lobby.
- Body:
  - Give guests one live map for dining, events, wellness, and nightlife in real time.
  - One scan gives them coffee, dinner, tonight, and what is nearby without front-desk friction.
  - The city around the hotel becomes easier to use the moment they arrive.
- Includes:
  - QR access in rooms, lobby, and guest flow
  - Live map of nearby venues, events, and perks
  - Better experience, zero extra friction
  - Discovery tied to actual location
- Pricing: From $99/year
- CTA: Use this for guests

#### venues

- Label: Venues
- Headline: Show up when intent is real.
- Body:
  - Appear in the map when people nearby are already deciding where to go next.
  - Track scans, saves, visits, and redemptions instead of vague awareness.
  - This is timing, proximity, and a reason to go now.
- Includes:
  - Map placement based on proximity
  - Perks and offers that actually get used
  - Events surfaced in the right moment
  - Save -> show -> scan -> done
  - Clear engagement at 30, 60, 90 days
- Pricing: Free for 12 months · From $49/year after
- CTA: Discuss activation

#### brands

- Label: Brands
- Headline: Buy context, not broad reach.
- Body:
  - Run campaigns in the right corridor, at the right time, with measurable action afterward.
  - Appear inside real downtown decisions instead of interrupting them.
  - Measure source scans, visits, and response by district.
- Includes:
  - Corridor-based visibility across downtown
  - Placement tied to location and timing
  - Event and campaign integration
  - Trackable actions, not vague impressions
- Pricing: From $149/year
- CTA: Start a conversation

#### civic

- Label: Civic
- Headline: Make participation visible.
- Body:
  - Surface district events and initiatives where people are already looking and deciding.
  - One place and one map makes local programming easier to find and easier to join.
  - Measure attendance signals, RSVPs, visits, and repeat engagement.
- Includes:
  - Community events in one visible layer
  - District-wide discovery
  - Shared map for participation
  - Clear access to what's happening nearby
- Pricing: From $49/year
- CTA: Talk to us

### start here / rollout

- Title: Start Here
- Step: Find Your Place
  - How do you want to show up? Tell us if you are a residential building, a local venue, or a brand. We’ll set up your welcome spots (QR touchpoints) and flip the switch to make you visible to the whole neighborhood on the live map.
- Step: Watch the Movement
  - See what’s actually happening. Once you’re live, you can track how the neighborhood interacts with you. We show you exactly how many people are looking at your spot on the map, saving your offers for later, and walking through your front door.
- Step: Make it Perfect
  - Tune into the neighborhood pulse. Now that we have real data, we’ll help you adjust. We can move your digital touchpoints to better locations or change the timing of your perks to match when your neighbors are actually walking by.
- Step: Anchor the District
  - Become a local landmark. Once we know what works, we make it a permanent fixture. You’ll transition from a pilot to a steady, reliable part of the downtown ecosystem that residents rely on every single day.
- Close title: Pick the role, understand the rollout, and see what is included.
- Close body: Start with the partner model that fits, launch with a pilot, and scale what works with real measurement behind it.
- Note: Start with a pilot, go live quickly, measure what happens, then decide whether to expand the footprint.

### pricing at a glance

- Title: Pricing at a glance
- Intro: Swipe to compare
- Properties: Free · $39 · $99 / year
- Hotels: $99-$149 / year
- Venues: Free for 12 months, then $49-$99 / year
- Brands: $99-$149 / year
- Civic: $49-$79 / year
- Footer: Most partners start with a 90-day pilot. Residents can join directly for $25 per year, and that fee is refunded if their building signs up later.
- CTA: See how it works for you

### contact/final CTA

- Title: Ready when you are.
- Body:
  - People usually choose what feels close, clear, and easy.
  - Downtown Perks helps you be that option.
- Resident label: For residents
- Resident body: Spend less time deciding and more time going.
- Partner label: For partners
- Partner body: Show up when people nearby are ready to choose.
- CTAs:
  - Explore Downtown
  - Become a Partner
  - Apply to Be a Partner

## 3. residents page `/residents`

- Eyebrow: Resident app
- Headline: Your downtown, easier to use
- Body: Find places, events, and perks nearby without downloading a bunch of apps.
- CTA: Open the map
- CTA: Get your perks card

### resident feature cards

- Places nearby: Find coffee, dining, markets, shopping, and wellness inside a few minutes of where you are.
- Happening tonight: Open events and specials nearby when you actually can use them.
- Perks map: Unlock resident-only perks and keep track of what works.
- Save it for later: If a place looks good, keep it in a “default plan” list for the week.

## 4. resident app `/resident-app` and tab routes

### resident app frame

- Resident app
- Downtown, in one place
- The Quincy · Rainey / Waterfront · Now
- Open card
- Tabs:
  - Now
  - Map
  - Saved
  - Plan
  - Card
  - You

### now tab

- Nearby now
- Good choices in the next 5 to 30 minutes
- Open now, happening tonight, worth saving, and easy to reach from your building.
- CTA: Open map

### happening tonight rail

- Happening tonight
- Live events and social moments
- Event: Rainey Street Food + Drink Loop
  - The legendary Rainey Street partner walkabout — hit Banger's, Lustre Pearl, The Stay Put, and Half Step with your Downtown Perks card. Each stop unlocks a partner exclusive. Earn 100 bonus points for completing all four.
- Event: Resident Mixer Night at Lustre Pearl
  - Monthly mixer exclusively for Downtown Perks members. Meet your neighbors, connect with local business owners, and enjoy $2 off cocktails all night. Hosted in Lustre Pearl's iconic backyard courtyard.
- Event: Contemporary Austin Gallery Members Night
  - An after-hours exclusive opening for Downtown Perks members. View the current exhibition before it opens to the public, with artist remarks, complimentary wine, and a curator-led walk-through.
- Event: Morning Yoga at Waterloo Park
  - Start your Sunday with a free community yoga session in Waterloo Park — Austin's newest green space. All levels welcome. Bring a mat, water, and a neighbor. Hosted by Downtown Perks in partnership with local instructors.
- Event: Stand-Up Showcase at Comedy Mothership
  - A private Downtown Perks showcase night at Joe Rogan's Comedy Mothership — featuring nationally touring headliners and Austin locals. Members get priority seating and 2-for-1 drink specials at the bar.

### resident-only unlocks rail

- Resident-only unlocks
- Perks worth using nearby
- Perk: Drinks after work
  - $2 Off Drinks + Free Snacks
- Perk: Anyone going to the pop-up?
  - Priority Pickup Window
- Perk: Coffee now
  - 20% Off + Free Crepe
- Perk: Pizza night
  - $5 Off + Free Garlic Knots
- Perk: 4 min
  - 2 Tickets for $30 — Any Show
  - 2 FOR $30

### best within 5 minutes rail

- Best within 5 minutes
- Fast local decisions
- Event: Rainey Street Food + Drink Loop
- Event: Resident Mixer Night at Lustre Pearl
- Event: Contemporary Austin Gallery Members Night
- Event: Morning Yoga at Waterloo Park
- Perk: Drinks after work
- Venue: Rooftop before the show
  - Pre-gaming Comedy Mothership tonight

### resident card/access form

- Resident access
- Get your perks card
- Downtown Perks costs residents $25 per year unless your building is already live, then the building pays for it.
- If your building joins later, we’ll refund the resident charge and your building will pay for ongoing access.
- Fields:
  - Your name
  - Phone
  - Email
  - Building
- Error: Something went wrong while saving resident access. Try again.
- Success title: Resident access requested
- Success body: We have your request.
- Success body: Downtown Perks will send you a link to activate your resident perks card and access the live map.
- CTA: Open the map
- CTA: View perks

## 5. map/explore routes `/explore`, `/map`, `/downtown-perks/explore`

### map filters and presets

- All
- Coffee
- Dining
- Nightlife
- Wellness
- Shopping
- Market
- Crowd
- Perks

### ask map prompt examples

- Coffee nearby
- Dinner tonight
- Date night / per person
- Cheap eats
- Late night
- Shopping and errands
- Wellness
- What is open right now

### MapShell mode copy

- Property intelligence: Build a resident amenity layer around building life.
- Venue activation: Make “default” your front door.
- Hospitality extensions: Turn guest orientation into a neighborhood system.
- Brand system integration: Put your campaigns where they actually get used.
- Civic alignment: Make participation measurable.

## 6. events `/events` and happy-hour walking map

### events page

- What is on, what is open, and where to go next.
- Pulls a live event list—specials and nearby venues—into one decision layer.
- Filter
- Happy hour walking map
- Submit venue or event update
- Today
- No results match your filters. Try a different time or filter category.

### event/intake form

- Backend intake
- Add a venue, special, or event update
- This is the minimum live capture path needed to run the system.
- Venue or event name
- Category
- Operating times
- Drink or food special
- Happy hour
- Extra notes
- Submissions are written to the shared intake sheet.
- Send update

## 7. perks and card pages `/perks`, `/card`, `/downtown-perks/perks`, `/downtown-perks/card`

### shared perks/card language

- Get Your Card
- Get your perks card
- View perks
- Use with card
- Use a perk
- Save a place
- RSVP tonight
- Show this when you want to unlock something.
- Staff scans it. Perk activates. You keep moving.

## 8. about page `/about`, `/downtown-perks/about`

### approved about copy

- About
- Downtown Perks is a simple way to see what’s happening around you downtown.
- It brings places, events, and perks into one map so you can quickly figure out where to go and what to do.
- Instead of checking multiple apps, everything is in one place.
- One map with everything nearby.
- Downtown Perks shows restaurants, bars, events, buildings, and local perks in a single view.
- The goal is simple: help you decide what to do based on what’s actually nearby and relevant right now.
- There’s a lot downtown. It just isn’t easy to use.
- You might search Google for food, check Instagram for events, and text friends to figure out a plan.
- That takes time and still doesn’t give you a clear answer.
- Downtown Perks brings everything together so you can decide faster.
- Look first. Act when you’re ready.
- You can explore the map freely without signing up.
- When you want to save something, RSVP, or use a perk, the card creates the access layer.

## 9. partner overview `/partners`

### positioning

- Partners
- This is an ecosystem product. We don’t force everyone through the same pitch. We map and measure the best path first.
- Find the right partner path
- Apply to Be a Partner
- Open page

## 10. partner application `/partners/apply`

- Partner application
- Apply to be a Downtown Perks partner
- Downtown Perks starts with a resident experience layer, then extends to business modules (offers, events, and activation).
- Apply now

### partner interest form

- Property
- Residential
- Hospitality
- Venue
- Brand
- Civic
- Other
- Thanks—we’ll route this to the right module.
- Open the Map
- Preview dashboard

## 11. partner type pages

### properties `/partners/properties` and `/partners/residential`

- Label: Properties
- Layer label: Property Layer
- Eyebrow: For Buildings & Residences
- Summary: Make your address more useful. Connect residents to nearby places, events, and perks through one mapped neighborhood layer.
- Highlight: Property views and resident actions
- Hero title: Turn a building into a neighborhood.
- Hero body: Residents discover local perks, events, and neighbors through a map tied to where they live. Your property becomes part of the live downtown layer, not just an address.
- Primary CTA: Partner with us
- Secondary CTA: See how it works
- Metrics:
  - Resident card adoption: 3×
  - Avg. perks activated per resident: 7
  - Neighborhood visibility lift: +60%
- Use cases:
  - Resident onboarding: New residents discover local perks and neighborhood events from move-in day.
  - Amenity visibility: Surface building amenities alongside nearby destinations in a single map layer.
  - Community activation: Connect residents to district events and building-branded perks.
- Platform points:
  - Resident-facing map pinned to your property
  - Card issuance and adoption tracking
  - Building-branded perk visibility
  - District event integration

### hospitality `/partners/hospitality` and `/partners/hotels`

- Label: Hospitality
- Layer label: Guest Layer
- Eyebrow: For Hotels & Short-Term Stays
- Summary: Extend the stay beyond the lobby with one live map for dining, events, wellness, and nightlife.
- Highlight: Guest opens and attributed visits
- Hero title: Extend the stay beyond the lobby.
- Hero body: Guests scan once and get a curated downtown map — restaurants, events, perks — personalized to where they're staying.
- Primary CTA: Explore the guest layer
- Secondary CTA: View all partner types
- Metrics:
  - Avg. guest sessions per stay: 4.2
  - Reduction in front-desk inquiries: −40%
  - Local business referrals driven: 2,100+
- Use cases:
  - QR-based guest activation: A single QR in the room launches a curated downtown guide — no app install required.
  - Curated local recommendations: Surface partner restaurants, venues, and events tailored to your guest profile.
  - Perks-card upgrade path: Offer repeat guests a Perks Card upgrade for extended neighborhood access.
- Platform points:
  - Hotel-specific QR onboarding flow
  - Guest session analytics
  - Curated nearby map layer
  - Perk and event visibility for guests

### venues `/partners/venues`

- Label: Venues
- Layer label: Venue Layer
- Eyebrow: For Restaurants, Bars & Event Spaces
- Summary: Show up when intent is real. Appear in the map when people nearby are already deciding where to go.
- Highlight: Map opens and physical visits
- Hero title: Be the answer to what's next.
- Hero body: Residents and guests discover your venue through the Downtown Perks map at the exact moment they're deciding where to go.
- Primary CTA: List your venue
- Secondary CTA: See all partner types
- Metrics:
  - Avg. impressions per week: 1,800
  - In-map perk redemption rate: 12%
  - Returning resident visits: +28%
- Use cases:
  - Happy hour activation: Push time-sensitive perks to residents and guests nearby during off-peak hours.
  - Event discovery: Surface ticketed and free events to the map before they fill up.
  - Private dining & buyouts: Reach a curated audience of local residents and in-market hotel guests.
- Platform points:
  - Map pin with perk and event visibility
  - Time-based perk activation
  - Audience segmentation by proximity
  - Redemption and impression analytics

### brands `/partners/brands`

- Label: Brands
- Layer label: Campaign Layer
- Eyebrow: For Local & National Brands
- Summary: Buy context, not broad reach. Run place-aware campaigns tied to buildings, venues, events, and districts.
- Highlight: Map opens and source scans
- Hero title: Run campaigns that live in the city.
- Hero body: Reach residents and visitors in context — near your location, your partner venue, or during relevant district events.
- Primary CTA: Explore brand partnership
- Secondary CTA: See the platform
- Metrics:
  - Avg. campaign reach per district: 4,200
  - Intent-to-visit lift: +35%
  - Perk redemption on activation: 8%
- Use cases:
  - Grand opening activation: Reach nearby residents and hotel guests with a localized launch campaign.
  - Seasonal promotions: Layer brand perks onto district events for contextual amplification.
  - Loyalty crossover: Connect existing loyalty programs to the Downtown Perks card layer.
- Platform points:
  - District-scoped campaign targeting
  - Event-linked brand activation
  - Perk-card integration
  - Campaign performance dashboard

### civic `/partners/civic`

- Label: Civic
- Layer label: District Layer
- Eyebrow: For Districts, BIDs & City Partners
- Summary: Make participation visible. Surface district activity, event participation, and neighborhood data where people are already looking.
- Highlight: RSVPs and repeat participation
- Hero title: Scale the pulse of the district.
- Hero body: Downtown Perks gives civic organizations a live data layer — events, foot traffic, resident activation — visible across the entire district map.
- Primary CTA: Explore civic partnership
- Secondary CTA: See all partner types
- Metrics:
  - District events surfaced per month: 40+
  - Resident engagement with civic content: 22%
  - New community programs activated: 12
- Use cases:
  - Event calendar integration: Push public and civic events directly to the resident and guest map layer.
  - District foot traffic visibility: Access aggregated, privacy-safe data on resident and visitor movement.
  - Community program activation: Promote neighborhood programs, sustainability initiatives, and community resources.
- Platform points:
  - District-wide event map layer
  - Foot traffic and activation analytics
  - Community program surfacing
  - Civic partner dashboard

## 12. partner dashboards

### canonical dashboard routes

- `/partners/dashboard`
- `/partners/dashboard/residential`
- `/partners/dashboard/hospitality`
- `/partners/dashboard/venues`
- `/partners/dashboard/brands`
- `/partners/dashboard/civic`

### shared dashboard copy

- Dashboard
- See what’s working downtown right now
- Track activity, redemption, and what becomes “default” after repeated use.
- Manage offers
- Partner overview

## 13. dashboard hub `/dashboard`

- Dashboard
- Choose your layer in the downtown system
- Downtown Perks starts with a resident’s live map layer.
- Open live map
- Shared system
- Resident search feeds the map
- Partner modules sit on top of the same index
- The downtown system integrates intent with action

## 14. building intelligence pages

### Waterline partner page `/buildings/the-waterline/partners`

- Breadcrumb: Properties / Buildings / The Waterline
- Eyebrow: Building intelligence
- Title: The Waterline
- Body: A resident amenity layer that connects building life to nearby dining, events, perks, and daily neighborhood use.
- Address: 98 Red River St, Austin, TX 78701
- District: Rainey / Waterfront
- Walk time: 5 min to Rainey
- Availability: 12 units available
- CTA: Get your card
- CTA: Reserve amenity
- CTA: Explore nearby
- Stat: Units / 352
- Stat: Occupancy / 94%
- Stat: Card activations / 142
- Stat: Price from / $2,450
- Stat: Resident mix / Young professionals, relocations, and downtown regulars
- Tabs:
  - Overview
  - Residents
  - Amenities
  - Maintenance
  - Reports
  - Partners

### Waterline partner network section

- Partner network
- Nearby venues, brands, and hospitality tied to this building.
- Use the building as an anchor for the partner layer instead of flattening it into a static amenity page.
- Why this block works
- Events tonight within a short walk
- Resident-only perks near Rainey Street
- Wellness, coffee, and social plans in one loop
- Venue: Banger's
  - 41 redemptions
  - Late-day dining and resident groups
- Hospitality: Hotel Van Zandt
  - 19 referrals
  - Guest crossover and rooftop traffic
- Brand: YETI
  - 2.3x lift
  - Campaign scans around event nights
- Waterline nearby layer
- The building page stays map-native: building anchor, nearby partners, event energy, and active perk context remain visible instead of collapsing into a static amenity sheet.

## 15. brands and campaign pages

### route group

- `/brands`
- `/downtown-perks/brands/Equinox`
- `/downtown-perks/brands/ThePaseo`
- `/downtown-perks/brands/TopoChico`
- `/downtown-perks/brands/DottieMay`
- `/downtown-perks/brands/TheShore`

### shared brand/campaign module language

- Campaign showcase
- District showcase
- Brand intelligence
- Campaign amplification
- Map opens
- Source scans
- District-scoped campaign targeting
- Event-linked brand activation
- Perk-card integration
- Campaign performance dashboard

## 16. pricing `/pricing`

- Pricing
- Your footprint defines your plan more than your intent.
- Monthly
- Annual
- Pilot
- Connected
- Intelligence
- Next step
- Ready when you are
- People don’t choose the best option. They choose the least risky option they understand.
- Open dashboard
- See the live map

## 17. build pack `/build-pack`

- System intent
- Core loop
- Behavior distribution
- Routes logic
- Data system
- UI kit decisions
- Map interaction model
- Analytics events
- Implementation order
- Acceptance criteria

## 18. FAQ catalogue

### audiences covered

- Home
- Resident
- Partner
- Property
- Hospitality
- Venue
- Brand
- Civic

### recurring FAQ CTA labels

- Open map
- Get your perks card
- Apply
- Partner with us
- See how it works
- View all partner types
- Explore civic partnership
- Explore brand partnership

## notes on completeness

This deck includes all currently confirmed canonical route copy, active browser page copy, resident-app visible rails, partner type variants, dashboard routes, form labels, CTAs, loading states, empty states, and footer/navigation copy available from the repo-backed extraction pass.

For a future automated extraction pass, use the source files listed in the extraction plan: `src/lib/approvedCopy.js`, `src/lib/routes.js`, `src/content/partnerTypes.ts`, `src/lib/partnerContent.js`, `src/lib/partner-system.js`, `src/lib/partner/partnerPlatformManifest.js`, `src/lib/partner/workspaceModules.js`, `src/lib/faq-data.js`, `src/lib/faq-partner-data.js`, `src/data/buildingIntelligence.js`, `src/data/homepage.ts`, `src/data/mapEntities.ts`, `src/data/featuredBrands.js`, `src/pages/**`, and `src/components/**`.
