// Downtown Perks Partner + Workspace Copy Registry V3
// Source of truth for partner pages, partner dashboard, partner workspace, pricing, forms, campaign packages, and partner map drawers.
// Visible brand identity: Downtown Perks only.

export type DowntownPerksPartnerType =
  | "properties"
  | "hotels"
  | "venues"
  | "brands"
  | "civic"
  | "realEstate";

export type PartnerWorkspaceTab =
  | "overview"
  | "assistant"
  | "map"
  | "offers"
  | "events"
  | "surveys"
  | "broadcasts"
  | "sources"
  | "campaigns"
  | "audience"
  | "media"
  | "reports"
  | "analytics"
  | "profile"
  | "team"
  | "billing";

export const PARTNER_COPY_VERSION = "downtown-perks-partner-workspace-v3" as const;

export const PARTNER_PUBLIC_SYSTEM_COPY = {
  brand: "Downtown Perks",
  deprecatedCopyRule: "Remove legacy brand, portal, media-buy and startup-hype language from production copy.",
  principle:
    "People nearby are already deciding where to go. Downtown Perks helps partners appear at the right time.",
  partnerSignal: "This helps nearby people find us and take the next step.",
  bridge: {
    headline: "Be the place people choose next.",
    body: [
      "People are already downtown.",
      "Already walking.",
      "Already deciding.",
      "You do not need more noise. You need better timing.",
      "Downtown Perks helps nearby people notice you when they are choosing where to go, what to do, or what to come back to.",
    ],
    primaryCta: { label: "Find your partner path", href: "/partners#partner-rail" },
    secondaryCta: { label: "Open the map", href: "/partners/dashboard/map" },
  },
  railTabs: ["Properties", "Hotels", "Venues", "Brands", "Civic", "Real Estate"],
} as const;

export const PARTNER_ROUTES = {
  partners: "/partners",
  apply: "/partners/apply",
  pricing: "/partners/pricing",
  properties: "/partners/properties",
  residential: "/partners/residential",
  hotels: "/partners/hotels",
  hospitality: "/partners/hospitality",
  venues: "/partners/venues",
  brands: "/partners/brands",
  civic: "/partners/civic",
  realEstate: "/partners/real-estate",
  dashboard: "/partners/dashboard",
  dashboardMap: "/partners/dashboard/map",
  dashboardProperties: "/partners/dashboard/properties",
  dashboardHotels: "/partners/dashboard/hotels",
  dashboardVenues: "/partners/dashboard/venues",
  dashboardBrands: "/partners/dashboard/brands",
  dashboardCivic: "/partners/dashboard/civic",
  dashboardRealEstate: "/partners/dashboard/real-estate",
  workspace: "/partner-workspace",
  workspaceOverview: "/partner-workspace/overview",
  workspaceAssistant: "/partner-workspace/assistant",
  workspaceMap: "/partner-workspace/map",
  workspaceOffers: "/partner-workspace/offers",
  workspaceEvents: "/partner-workspace/events",
  workspaceSurveys: "/partner-workspace/surveys",
  workspaceBroadcasts: "/partner-workspace/broadcasts",
  workspaceSources: "/partner-workspace/sources",
  workspaceCampaigns: "/partner-workspace/campaigns",
  workspaceAudience: "/partner-workspace/audience",
  workspaceMedia: "/partner-workspace/media",
  workspaceReports: "/partner-workspace/reports",
  workspaceAnalytics: "/partner-workspace/analytics",
  workspaceProfile: "/partner-workspace/profile",
  workspaceTeam: "/partner-workspace/team",
  workspaceBilling: "/partner-workspace/billing",
} as const;

export const PARTNER_TYPE_ALIASES: Record<string, DowntownPerksPartnerType> = {
  property: "properties",
  properties: "properties",
  residential: "properties",
  building: "properties",
  buildings: "properties",
  hotel: "hotels",
  hotels: "hotels",
  hospitality: "hotels",
  venue: "venues",
  venues: "venues",
  restaurant: "venues",
  restaurants: "venues",
  bar: "venues",
  business: "venues",
  businesses: "venues",
  brand: "brands",
  brands: "brands",
  sponsor: "brands",
  sponsors: "brands",
  civic: "civic",
  district: "civic",
  community: "civic",
  "real-estate": "realEstate",
  realEstate: "realEstate",
  realtor: "realEstate",
  agent: "realEstate",
};

export const PARTNER_FORM_PROMPTS: Record<DowntownPerksPartnerType, string[]> = {
  properties: [
    "We want to add a neighborhood layer for our residents.",
    "Help us set up building access.",
    "We want to connect nearby offers and events to our building.",
    "Show us how the resident card works.",
  ],
  hotels: [
    "We want a simple neighborhood guide guests can open from the lobby.",
    "Help us set up QR access.",
    "We want guests to find dining and events nearby without asking staff.",
    "Show us how offers work for guests.",
  ],
  venues: [
    "We want to add a perk for downtown residents.",
    "How do we track scan and redemption data?",
    "We want to get listed on the resident map.",
    "Tell us about the 12-month free period.",
  ],
  brands: [
    "We want to sponsor a district guide.",
    "We are looking for targeted placement in front of nearby residents and guests.",
    "How do campaigns track real-world action?",
    "We would like to see a case study similar to our brand.",
  ],
  civic: [
    "We are looking to promote a public downtown event.",
    "We want to create a district map guide.",
    "Can we use this for public wayfinding?",
    "Help us measure visits to our public space.",
  ],
  realEstate: [
    "We want to place listings inside the downtown map.",
    "We want to show what is walkable from each property.",
    "Can this connect to our CRM?",
    "Help us understand listing interest by neighborhood.",
  ],
};

export const PARTNER_PAGE_DECK: Record<DowntownPerksPartnerType, any> = {
  properties: {
    id: "properties",
    label: "Properties",
    singularLabel: "Property",
    eyebrow: "FOR PROPERTIES",
    route: PARTNER_ROUTES.properties,
    dashboardRoute: PARTNER_ROUTES.dashboardProperties,
    workspaceRoute: PARTNER_ROUTES.workspaceOverview,
    applyRoute: "/partners/apply?type=properties",
    hero: {
      headline: "Make your building feel connected to downtown.",
      body: [
        "Residents do not only evaluate the apartment. They evaluate the neighborhood around it.",
        "The coffee shop they return to. The bar that feels easy after work. The restaurant that becomes the answer when nobody wants to cook. The event they would have missed without a nudge.",
        "Downtown Perks gives your building a simple neighborhood layer residents can actually use.",
      ],
      primaryCta: { label: "Bring this to your property", href: "/partners/apply?type=properties" },
      secondaryCta: { label: "View resident flow", href: "/resident-app" },
    },
    included: [
      "QR access across lobby, leasing, welcome packet, and resident communications",
      "A live map of nearby places, events, and perks",
      "Your property inside the same downtown experience",
      "Resident card access without a complicated app flow",
      "A clear view of what residents open, save, RSVP to, and use",
    ],
    proof: {
      title: "The Waterline building intelligence layer",
      body: "A resident amenity layer that connects building life to nearby dining, events, perks, and daily neighborhood use.",
      kpis: ["352 Units", "94% Occupancy", "142 Card signups", "318 Nearby saves"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first building activity",
      recentActions: "Waiting for resident scans, saves, RSVPs, and redemptions",
      leadInsight: "The Independent leading live activity",
      rollup: "6 Buildings live · 186 Resident signups · 221 Walkable actions · 12 Partner venues nearby",
      emptyNote: "Property-level results appear once building-linked activity starts.",
    },
    map: {
      title: "Property intelligence map",
      subhead: "See what is close to the building, what residents are using, and which local partners are creating value.",
      filters: ["All activity", "Immediate demand", "5 min radius", "Events live", "Offer results", "Source buildings", "Repeat visits"],
      prompts: [
        "What can residents use within five minutes?",
        "Which nearby perks are getting used?",
        "What events are residents saving?",
        "Which venues drive repeat visits?",
        "What should we promote this week?",
        "Which local partners create the most value?",
      ],
    },
    pricingSummary: "90-day pilot · Free forever · $39/year · $99/year",
    pricingCards: [
      {
        id: "property-free",
        title: "Free forever",
        price: "$0/year",
        description: "Basic results after the 90-day pilot.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_FREE_FOREVER",
        features: ["Map listing", "Basic reports", "Resident access path", "Partner review"],
      },
      {
        id: "property-analytics",
        title: "Analytics",
        price: "$39/year",
        description: "A clearer view of what residents are using.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_ANALYTICS_39_YEAR",
        features: ["Activity dashboard", "Monthly report", "Share links", "Perk usage"],
      },
      {
        id: "property-full-stack",
        title: "Full stack",
        price: "$99/year",
        description: "Full resident setup with deeper reports and support.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_FULL_STACK_99_YEAR",
        features: ["Expanded results", "Resident rollout support", "Campaign setup", "Partner suggestions"],
      },
    ],
    workflow: [
      "Add the building as a source node inside the Downtown Perks map.",
      "Give residents access through QR, SMS, leasing materials, lobby signage, or move-in communications.",
      "Track resident scans, saves, redemptions, event interest, and repeat neighborhood usage.",
    ],
    kpis: [
      "Resident signup rate",
      "Card opt-ins",
      "Nearby perk usage",
      "Saved places",
      "Event saves or RSVPs",
      "Repeat resident use",
      "Local partner use",
      "Leasing or renewal support",
    ],
    finalCta: {
      headline: "Turn the neighborhood into part of the amenity package.",
      body: "Give residents a simple way to use downtown, then show your team which local partnerships are getting used.",
      cta: { label: "Bring this to your property", href: "/partners/apply?type=properties" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.properties,
  },

  hotels: {
    id: "hotels",
    label: "Hotels",
    singularLabel: "Hotel",
    eyebrow: "FOR HOTELS",
    route: PARTNER_ROUTES.hotels,
    dashboardRoute: PARTNER_ROUTES.dashboardHotels,
    workspaceRoute: PARTNER_ROUTES.workspaceOverview,
    applyRoute: "/partners/apply?type=hotels",
    hero: {
      headline: "Give guests a better way to use downtown.",
      body: [
        "Hotels spend carefully on arrival. Then the guest still has to figure out the neighborhood.",
        "Coffee. Dinner. Tonight. What is walkable. What is worth it.",
        "Downtown Perks turns the surrounding neighborhood into a simple guest layer your team can share from the lobby, room, concierge desk, or welcome flow.",
      ],
      primaryCta: { label: "Use this for guests", href: "/partners/apply?type=hotels" },
      secondaryCta: { label: "View hospitality flow", href: "/partners/dashboard/hotels" },
    },
    included: [
      "QR access in rooms, lobby, concierge desk, and guest communications",
      "Live map of nearby dining, events, wellness, nightlife, and local perks",
      "Curated suggestions without a static PDF or printed list",
      "Guest saves, offer use, and off-property interest",
      "Simple reports for concierge and hospitality teams",
    ],
    proof: {
      title: "Hotel guest guide",
      body: "A live concierge layer that connects guest stays to nearby dining, events, perks, and daily neighborhood use.",
      kpis: ["245 Guests live", "1.2k Saves", "48 Redemptions", "0.4 mi Avg distance"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first guest activity",
      recentActions: "Awaiting scans",
      leadInsight: "Guest local movements",
      rollup: "9 Hotels active · 2.1k Guest interactions · 18 QR access points · 612 Nearby saves",
      emptyNote: "Guest results appear once hotel QR and map activity starts.",
    },
    map: {
      title: "Guest movement map",
      subhead: "See what guests are opening, saving, and using within walking distance.",
      filters: ["Live guests", "Popular for dinner", "10 min walk", "Events tonight", "Concierge picks"],
      prompts: [
        "What should guests do tonight?",
        "What is walkable from the hotel?",
        "Which venues are open now?",
        "What events are nearby?",
        "Which perks are useful for guests?",
        "Where are guests most likely to go?",
      ],
    },
    pricingSummary: "90-day pilot · $99–$149/year",
    pricingCards: [
      {
        id: "hotel-active-99",
        title: "Active",
        price: "$99/year",
        description: "Guest layer for one property.",
        stripeKey: "VITE_STRIPE_DP_HOTEL_ACTIVE_99_YEAR",
        features: ["Guest QR entry", "Live local layer", "Concierge guidance", "Monthly traffic report"],
      },
      {
        id: "hotel-active-149",
        title: "Extended",
        price: "$149/year",
        description: "Expanded guest guide with stronger reports.",
        stripeKey: "VITE_STRIPE_DP_HOTEL_ACTIVE_149_YEAR",
        features: ["Multiple QR points", "Guest-to-local visits", "Event and perk reports", "Dashboard access"],
      },
    ],
    workflow: [
      "Add the hotel as a source node in the map.",
      "Curate nearby suggestions, perks, and events for guests.",
      "Track scans, saved places, offer usage, and guest movement into local venues.",
    ],
    kpis: ["Guest QR scans", "Guest map sessions", "Saved suggestions", "Offer redemptions", "Nearby venue visits", "Event interest", "Repeat use during stay", "Partner referrals"],
    finalCta: {
      headline: "Replace the static suggestion list with a live guest map.",
      body: "Help guests find what is nearby, useful, and relevant now.",
      cta: { label: "Use this for guests", href: "/partners/apply?type=hotels" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.hotels,
  },

  venues: {
    id: "venues",
    label: "Venues",
    singularLabel: "Venue",
    eyebrow: "FOR VENUES",
    route: PARTNER_ROUTES.venues,
    dashboardRoute: PARTNER_ROUTES.dashboardVenues,
    workspaceRoute: PARTNER_ROUTES.workspaceOffers,
    applyRoute: "/partners/apply?type=venues",
    hero: {
      headline: "Be visible when someone nearby decides where to go.",
      body: [
        "People do not remember most ads. They remember what is nearby when they are hungry, bored, thirsty, free after work, or looking for something tonight.",
        "Downtown Perks puts your venue inside that decision.",
        "Not a listing for people to forget. A reason to walk in when the timing is right.",
      ],
      primaryCta: { label: "Discuss setup", href: "/partners/apply?type=venues" },
      secondaryCta: { label: "View traffic report", href: "/partners/dashboard/venues" },
    },
    included: [
      "Map placement based on proximity and category",
      "Perks and offers people can actually use",
      "Events shown when people are looking for plans",
      "Save → show card → scan → done",
      "Clear results at 30, 60, and 90 days",
    ],
    proof: {
      title: "Banger's / Rainey",
      body: "Map views, event activity, and measurable district foot traffic for one of Rainey's biggest anchors.",
      kpis: ["342 Scans", "85 Event RSVPs", "112 Redemptions", "22% Repeat visits"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first scan activity",
      recentActions: "Awaiting scans",
      leadInsight: "Banger's leading Rainey footprint",
      rollup: "24 Venues live · 402 Nearby searches · 289 Visits · 96 Redemptions",
      emptyNote: "Venue results appear once a perk, event, or profile is used by someone nearby.",
    },
    map: {
      title: "Venue traffic map",
      subhead: "See who is nearby, which offers are working, and where visits are coming from.",
      filters: ["Live offers", "High volume", "Walkable radius", "Events nearby", "Repeat visits"],
      prompts: [
        "Who is nearby right now?",
        "What is driving traffic tonight?",
        "Which offers are working?",
        "What slow window should we fill?",
        "Which events are creating spillover?",
        "What are residents saving nearby?",
      ],
    },
    pricingSummary: "Free for 12 months · then $49–$99/year",
    pricingCards: [
      {
        id: "venue-free-12",
        title: "Free start",
        price: "Free for 12 months",
        description: "Prove the value before paying.",
        stripeKey: "VITE_STRIPE_DP_VENUE_FREE_12_MONTHS",
        features: ["Live map placement", "Perk offers", "Basic view tracking", "Review at 30/60/90 days"],
      },
      {
        id: "venue-49",
        title: "Ongoing",
        price: "$49/year",
        description: "Basic ongoing presence after the free year.",
        stripeKey: "VITE_STRIPE_DP_VENUE_49_YEAR",
        features: ["Map listing", "Offer tools", "Basic reports", "Event listing"],
      },
      {
        id: "venue-99",
        title: "Plus",
        price: "$99/year",
        description: "More reports for busy venues.",
        stripeKey: "VITE_STRIPE_DP_VENUE_99_YEAR",
        features: ["Action progress", "Share links", "Repeat visits", "Campaign eligibility"],
      },
    ],
    workflow: [
      "Add or verify the venue profile, location, category, and active offer.",
      "Connect offers, events, happy hours, or limited-time experiences to the map.",
      "Measure scans, saves, visits, redemptions, and repeat behavior by timing and source.",
    ],
    kpis: ["Venue profile views", "Offer scans", "Saved venue actions", "Redemption rate", "Event-driven visits", "Busy windows", "Repeat visitors", "Source buildings or nearby districts"],
    finalCta: {
      headline: "Turn nearby attention into actual visits.",
      body: "Show up inside the live map, promote the right offer at the right time, and measure what brings people in.",
      cta: { label: "Discuss setup", href: "/partners/apply?type=venues" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.venues,
  },

  brands: {
    id: "brands",
    label: "Brands",
    singularLabel: "Brand",
    eyebrow: "FOR BRANDS",
    route: PARTNER_ROUTES.brands,
    dashboardRoute: PARTNER_ROUTES.dashboardBrands,
    workspaceRoute: PARTNER_ROUTES.workspaceCampaigns,
    applyRoute: "/partners/apply?type=brands",
    hero: {
      headline: "Be useful when people are deciding.",
      body: [
        "The best advertising does not feel like advertising. It feels like something useful that arrived at the right time.",
        "Coffee. Lunch. Drinks. Tonight. A resident move-in. A hotel weekend. A civic event.",
        "Downtown Perks helps brands show up inside real downtown decisions instead of hoping broad reach turns into action.",
      ],
      primaryCta: { label: "Start a conversation", href: "/partners/apply?type=brands" },
      secondaryCta: { label: "See placement map", href: "/partners/dashboard/brands" },
    },
    included: [
      "Corridor-based placement across downtown",
      "Placement tied to location, timing, and partner pages",
      "Event and campaign integration",
      "QR links and resident offers",
      "Trackable actions, not vague attention",
    ],
    proof: {
      title: "YETI / Paseo / Hotel Van Zandt",
      body: "Flagship city-brand rollout. QR-led product offers. District presence.",
      kpis: ["1.4k Scans", "244 Redemptions", "12k Reach", "17% Follow-through"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for campaign start",
      recentActions: "Awaiting scans",
      leadInsight: "YETI leading district activity",
      rollup: "12 Campaigns live · 2.4k+ Monthly scans · 840+ Attributed visits · 340+ Redemptions",
      emptyNote: "Brand results will appear once a campaign goes live.",
    },
    map: {
      title: "Brand placement map",
      subhead: "See which districts, buildings, venues, and events are getting the strongest response.",
      filters: ["Live campaigns", "Top corridors", "Resident entries", "Event windows", "Venue pages"],
      prompts: [
        "Where are people going right now?",
        "Which venues are performing best tonight?",
        "What is happening around Rainey?",
        "Which buildings are generating traffic?",
        "Where should we show up this weekend?",
        "Which offers are getting used?",
      ],
    },
    pricingSummary: "$99–$149/year + custom campaigns",
    pricingCards: [
      {
        id: "brand-99",
        title: "Starter",
        price: "$99/year",
        description: "Basic brand presence and campaign eligibility.",
        stripeKey: "VITE_STRIPE_DP_BRAND_99_YEAR",
        features: ["Map placement", "Campaign request path", "Basic reports", "Entry review"],
      },
      {
        id: "brand-149",
        title: "Always-on",
        price: "$149/year",
        description: "Ongoing placement across map, building, and district pages.",
        stripeKey: "VITE_STRIPE_DP_BRAND_149_YEAR",
        features: ["Map + building + district", "Ongoing scans/saves", "Campaign dashboard", "Monthly report"],
      },
      {
        id: "brand-custom",
        title: "Custom campaign",
        price: "Custom",
        description: "Event-led or corridor-based campaign packages.",
        stripeKey: null,
        features: ["Campaign format", "QR links", "Venue pages", "Share links"],
      },
    ],
    workflow: [
      "Choose the campaign format based on who should see it, the district, and the available partner pages.",
      "Publish the campaign through selected buildings, venues, events, hotels, or civic partners.",
      "Review entries, follow-through, repeat behavior, and loyalty inside the dashboard.",
    ],
    kpis: ["Campaign scans", "Scan-to-visit estimate", "Redemption rate", "Building entries", "Event-linked traffic", "Repeat use", "Cost per action"],
    finalCta: {
      headline: "Build the campaign layer inside Downtown Perks.",
      body: "Publish through downtown's live map, then see what happened by entry, timing, place, and behavior.",
      cta: { label: "Start a conversation", href: "/partners/apply?type=brands" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.brands,
  },

  civic: {
    id: "civic",
    label: "Civic",
    singularLabel: "Civic partner",
    eyebrow: "FOR CIVIC PARTNERS",
    route: PARTNER_ROUTES.civic,
    dashboardRoute: PARTNER_ROUTES.dashboardCivic,
    workspaceRoute: PARTNER_ROUTES.workspaceEvents,
    applyRoute: "/partners/apply?type=civic",
    hero: {
      headline: "Help people take part.",
      body: [
        "Cities work better when people know what is happening.",
        "Right now, finding a local event often takes too much effort. A flyer in one place. A newsletter in another. A public page nobody checks at the right time.",
        "Downtown Perks makes civic programs easier to see, join, and measure through the same map people use for daily downtown decisions.",
      ],
      primaryCta: { label: "Talk to us", href: "/partners/apply?type=civic" },
      secondaryCta: { label: "View live map", href: "/partners/dashboard/civic" },
    },
    included: [
      "Community events in one visible layer",
      "District-wide map placement",
      "Shared map for public involvement",
      "Clear access to what is happening nearby",
      "Privacy-safe results",
    ],
    proof: {
      title: "DANA / District Programming Layer",
      body: "DANA-led civic touchpoints, walking maps, and public-space programs for downtown residents and hotels.",
      kpis: ["482 Event RSVPs", "3.1k Map opens", "14 Buildings reached", "High Use"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for public event",
      recentActions: "Awaiting RSVPs",
      leadInsight: "Waterloo Park leading public use",
      rollup: "8+ Active civic orgs · 28k+ Monthly opens · 3.2k RSVP/month · 8.4k Attributed visits",
      emptyNote: "Civic results appear when people interact with public places or events.",
    },
    map: {
      title: "District activity map",
      subhead: "See what people are finding, where RSVPs are coming from, and which public spaces are drawing attention.",
      filters: ["Public events", "Busy areas", "Active RSVPs", "Public spaces", "Places to improve"],
      prompts: [
        "Which districts are gaining activity?",
        "What events are driving movement?",
        "Where should we improve?",
        "Which local businesses need more attention?",
        "What is active within a five-minute walk?",
        "Which corridors are underperforming?",
      ],
    },
    pricingSummary: "$49–$79/year + district/custom options",
    pricingCards: [
      {
        id: "civic-49",
        title: "Community",
        price: "$49/year",
        description: "Basic public event and civic map placement.",
        stripeKey: "VITE_STRIPE_DP_CIVIC_49_YEAR",
        features: ["Public event listings", "Map placement", "Basic RSVP tracking", "Community reports"],
      },
      {
        id: "civic-79",
        title: "District",
        price: "$79/year",
        description: "A more detailed district activity view.",
        stripeKey: "VITE_STRIPE_DP_CIVIC_79_YEAR",
        features: ["District program area", "Expanded results", "Cross-building outreach", "Public space reports"],
      },
      {
        id: "civic-custom",
        title: "Custom initiative",
        price: "Custom",
        description: "Larger civic, chamber, or district initiatives.",
        stripeKey: null,
        features: ["Custom district", "Public programming", "Partner coordination", "Detailed reports"],
      },
    ],
    workflow: [
      "Define the district, corridor, or civic program area.",
      "Connect participating venues, properties, events, and community partners.",
      "Review privacy-safe results by area, category, event window, and time period.",
    ],
    kpis: ["District use", "Event impact", "Local business involvement", "Offer or program usage", "Corridor activity", "Places to improve", "Repeat community visits", "Partner network growth"],
    finalCta: {
      headline: "Turn downtown activity into usable civic intelligence.",
      body: "Understand where people take part, where businesses need support, and which programs are moving people through the district.",
      cta: { label: "Talk to us", href: "/partners/apply?type=civic" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.civic,
  },

  realEstate: {
    id: "realEstate",
    label: "Real Estate",
    singularLabel: "Real estate partner",
    eyebrow: "FOR REAL ESTATE",
    route: PARTNER_ROUTES.realEstate,
    dashboardRoute: PARTNER_ROUTES.dashboardRealEstate,
    workspaceRoute: PARTNER_ROUTES.workspaceProfile,
    applyRoute: "/partners/apply?type=real-estate",
    hero: {
      headline: "Turn neighborhood attention into qualified interest.",
      body: [
        "A listing can show square footage. Downtown Perks shows what surrounds it.",
        "Coffee. Groceries. Fitness. Restaurants. Nightlife. Walkability. Daily convenience.",
        "For downtown buyers and renters, the neighborhood is part of the decision. Put the listing inside the map they are already using to understand downtown.",
      ],
      primaryCta: { label: "Discuss lead integration", href: "/partners/apply?type=real-estate" },
      secondaryCta: { label: "View listing layer", href: "/partners/dashboard/real-estate" },
    },
    included: [
      "Listings placed inside the live map experience",
      "Neighborhood context around each property",
      "Lead capture tied to active downtown interest",
      "Optional CRM integration",
      "Map placement for condos, apartments, homes, and mixed-use listings",
    ],
    proof: {
      title: "Neighborhood-led listing interest",
      body: "Listings become more useful when the surrounding downtown layer is visible.",
      kpis: ["Listing views", "Neighborhood saves", "Lead interest", "Share links"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for listing activity",
      recentActions: "Awaiting map views and lead actions",
      leadInsight: "Listing activity will populate after the first map interaction",
      rollup: "Listings become part of the downtown map, not just another search result",
      emptyNote: "Real estate results appear when listings receive views, saves, or lead actions.",
    },
    map: {
      title: "Listing interest map",
      subhead: "See which listings, buildings, and neighborhoods are drawing qualified attention.",
      filters: ["Active listings", "Saved listings", "Lead interest", "Walkability", "CRM ready"],
      prompts: [
        "Which listings are getting attention?",
        "What is walkable from this property?",
        "Which neighborhoods are being saved?",
        "Where are lead actions coming from?",
        "Which listings need stronger context?",
        "What amenities are driving interest?",
      ],
    },
    pricingSummary: "$99–$199/year",
    pricingCards: [
      {
        id: "re-starter-99",
        title: "Starter",
        price: "$99/year",
        description: "Up to 5 listings.",
        stripeKey: "VITE_STRIPE_DP_RE_AGENT_STARTER_99_YEAR",
        features: ["Up to 5 listings", "Basic map placement", "Lead link", "Neighborhood context"],
      },
      {
        id: "re-core-149",
        title: "Core",
        price: "$149/year",
        description: "Up to 15 listings with filters.",
        stripeKey: "VITE_STRIPE_DP_RE_AGENT_CORE_149_YEAR",
        features: ["Up to 15 listings", "Map filters", "Lead capture", "Basic CRM handoff"],
      },
      {
        id: "re-pro-199",
        title: "Pro",
        price: "$199/year",
        description: "Unlimited listings with priority map placement.",
        stripeKey: "VITE_STRIPE_DP_RE_AGENT_PRO_199_YEAR",
        features: ["Unlimited listings", "Priority map placement", "CRM integration", "Expanded reports"],
      },
    ],
    workflow: [
      "Add listings, property type, location, availability, and lead destination.",
      "Connect each listing to nearby places, perks, events, and walkability context.",
      "Track listing views, saves, source locations, and qualified lead actions.",
    ],
    kpis: ["Listing views", "Saved listings", "Neighborhood saves", "Lead clicks", "CRM handoffs", "Source buildings", "Walkability interest"],
    finalCta: {
      headline: "Make the neighborhood part of the listing.",
      body: "Give buyers and renters a better way to understand where they would actually live.",
      cta: { label: "Discuss lead integration", href: "/partners/apply?type=real-estate" },
    },
    formPrompts: PARTNER_FORM_PROMPTS.realEstate,
  },
};

export const PARTNER_WORKSPACE_NAV: Array<{ id: PartnerWorkspaceTab; label: string; href: string; helper: string }> = [
  { id: "overview", label: "Overview", href: PARTNER_ROUTES.workspaceOverview, helper: "What is working nearby." },
  { id: "assistant", label: "Ask the Map", href: PARTNER_ROUTES.workspaceAssistant, helper: "Decide what to do next using live map context." },
  { id: "map", label: "Map", href: PARTNER_ROUTES.workspaceMap, helper: "Your place in the downtown map." },
  { id: "offers", label: "Offers", href: PARTNER_ROUTES.workspaceOffers, helper: "Perks people can use." },
  { id: "events", label: "Events", href: PARTNER_ROUTES.workspaceEvents, helper: "Plans worth showing up for." },
  { id: "surveys", label: "Surveys", href: PARTNER_ROUTES.workspaceSurveys, helper: "Ask the right people." },
  { id: "sources", label: "Connections", href: "/partner-workspace/connections", helper: "Verified services and requests." },
  { id: "campaigns", label: "Campaigns", href: PARTNER_ROUTES.workspaceCampaigns, helper: "Campaigns tied to real places." },
  { id: "broadcasts", label: "Broadcasts", href: PARTNER_ROUTES.workspaceBroadcasts, helper: "Send email and SMS campaigns." },
  { id: "audience", label: "People", href: PARTNER_ROUTES.workspaceAudience, helper: "Choose who should see it." },
  { id: "media", label: "Media", href: PARTNER_ROUTES.workspaceMedia, helper: "Assets ready to publish." },
  { id: "reports", label: "Reports", href: PARTNER_ROUTES.workspaceReports, helper: "Create and share a documented read." },
  { id: "analytics", label: "Analytics", href: PARTNER_ROUTES.workspaceAnalytics, helper: "Understand performance and decide what to do next." },
  { id: "profile", label: "Profile", href: PARTNER_ROUTES.workspaceProfile, helper: "How people see you on the map." },
  { id: "team", label: "Team", href: PARTNER_ROUTES.workspaceTeam, helper: "People who can manage this presence." },
  { id: "billing", label: "Billing", href: PARTNER_ROUTES.workspaceBilling, helper: "Plan and billing." },
];

export const PARTNER_WORKSPACE_MOBILE_NAV = ["Overview", "Offers", "Events", "Campaigns", "Reports"] as const;

export const PARTNER_WORKSPACE_COPY: Record<PartnerWorkspaceTab, any> = {
  overview: {
    route: PARTNER_ROUTES.workspaceOverview,
    headline: "What is working nearby.",
    body: "A simple read on how people are finding, saving, and using your Downtown Perks presence.",
    kpis: ["Map opens", "Saves", "Redemptions", "RSVPs", "Campaign actions", "Source locations"],
    primaryCta: { label: "Update an offer", href: PARTNER_ROUTES.workspaceOffers },
    secondaryCta: { label: "Open map view", href: PARTNER_ROUTES.workspaceMap },
    emptyState: "No activity yet. Publish an offer, event, or share link to start seeing results.",
  },
  assistant: {
    route: PARTNER_ROUTES.workspaceAssistant,
    headline: "Ask what to do next.",
    body: "Use your places, current map context, campaigns, and results to get one practical recommendation at a time.",
    prompts: [
      "What should we improve this week?",
      "Which nearby audience should we focus on?",
      "What campaign fits the current downtown context?",
      "Which listing or offer needs attention first?",
    ],
    primaryCta: { label: "Ask a question", href: PARTNER_ROUTES.workspaceAssistant },
    secondaryCta: { label: "Open partner map", href: "/map?mode=partner&tab=map&filter=All" },
  },
  map: {
    route: PARTNER_ROUTES.workspaceMap,
    headline: "Your place in the downtown map.",
    body: "See your location, nearby properties, events, offers, and the share links that can send people your way.",
    prompts: [
      "Who is nearby right now?",
      "Which offers are working?",
      "What events are creating movement?",
      "Where are saves coming from?",
      "Which share links matter most?",
      "What should we update this week?",
    ],
    drawerTabs: ["Overview", "Progress", "People", "Events", "Actions"],
    actions: ["Create offer", "Add event", "Update profile", "Download report"],
  },
  offers: {
    route: PARTNER_ROUTES.workspaceOffers,
    headline: "Offers people can actually use.",
    body: "Create simple perks that make the next decision easier: save it, show the card, scan, done.",
    columns: ["Offer", "Status", "Available dates", "Redemptions", "Saves", "Last updated", "Actions"],
    createCta: "Create offer",
    fields: ["Offer title", "Short description", "Perk type", "Start date", "End date", "Days active", "Time window", "How to use it", "Limitations", "Primary location", "Active status"],
    success: "Offer saved. It can now appear on the map when active.",
    emptyState: "No offers yet. Start with one useful reason for someone nearby to choose you.",
  },
  events: {
    route: PARTNER_ROUTES.workspaceEvents,
    headline: "Plans worth showing up for.",
    body: "Add events, happy hours, pop-ups, and civic programs that should appear when people are looking for something to do.",
    columns: ["Event", "Date", "Status", "RSVPs", "Saves", "Source", "Actions"],
    createCta: "Create event",
    fields: ["Event title", "Description", "Date", "Start time", "End time", "Location", "Category", "RSVP link", "Capacity", "Perks card eligible", "Active status"],
    success: "Event saved. It can now appear on the map and events feed.",
    emptyState: "No events yet. Add something worth showing up for.",
  },
  surveys: {
    route: PARTNER_ROUTES.workspaceSurveys,
    headline: "Ask the right people.",
    body: "Create a survey, choose who should see it, review the preview, then publish when it is ready.",
    fields: ["Survey title", "Questions", "People", "Delivery method", "Preview", "Review", "Publish"],
    createCta: "Create survey",
    emptyState: "No surveys yet. Start with one question you actually need answered.",
  },
  sources: {
    route: PARTNER_ROUTES.workspaceSources,
    headline: "Keep connected services working.",
    body: "Review the services that supply maps, search reports, billing, messages, and publishing data for this partner.",
    columns: ["Service", "Connection", "Last update", "What it supports", "Status", "Actions"],
    createCta: "Review connections",
    fields: ["Service", "Account", "Connection status", "Last update", "Data available", "Owner", "Notes"],
    sourceTypes: ["Maps", "Search reporting", "Billing", "Email", "SMS", "Listings", "Events", "Other"],
    success: "Connection details saved.",
    emptyState: "No connected services yet. Add only the services this partner actually uses.",
  },
  campaigns: {
    route: PARTNER_ROUTES.workspaceCampaigns,
    headline: "Campaigns tied to real places.",
    body: "Build simple campaigns around where people are, what they are doing, and what you want them to do next.",
    types: ["Featured campaign", "Perk campaign", "Destination campaign", "Multi-property campaign", "Major mixed-use campaign", "Survey campaign", "QR redemption campaign"],
    steps: ["Goal", "People", "Placement", "Offer or event", "Share links", "Timing", "Budget/pricing", "Review"],
    success: "Campaign saved. Review placement, share links, and timing before publishing.",
    emptyState: "No campaigns yet. Start with one clear reason for people to act.",
  },
  broadcasts: {
    route: PARTNER_ROUTES.workspaceBroadcasts,
    headline: "Broadcasts for email and SMS.",
    body: "Plan a message, choose who should get it, preview, schedule, and send. If Broadcasts are not included in the plan, this module shows the available upgrade path.",
    steps: ["Message", "People", "Media", "Preview", "Schedule", "Send"],
    createCta: "Create broadcast",
    emptyState: "Broadcasts are ready to unlock when this workspace needs email or SMS campaigns.",
  },
  audience: {
    route: PARTNER_ROUTES.workspaceAudience,
    headline: "Choose who should see it.",
    body: "Select residents, guests, buildings, districts, saved groups, or uploaded contacts before publishing a campaign, event, survey, or broadcast.",
    filters: ["District", "Building", "Resident", "Hotel guest", "Interests", "Campaign history", "Uploaded list", "Saved group"],
    emptyState: "No saved groups yet. Build one from a campaign, event, survey, or broadcast.",
  },
  media: {
    route: PARTNER_ROUTES.workspaceMedia,
    headline: "Keep publishing assets ready.",
    body: "Store logos, photos, short videos, campaign images, QR assets, and approved copy in one place before publishing.",
    fields: ["Logo", "Gallery", "Campaign media", "Event media", "Offer media", "QR assets", "Approved copy"],
    emptyState: "No media uploaded yet. Add the assets people will see on the map and in campaigns.",
  },
  reports: {
    route: PARTNER_ROUTES.workspaceReports,
    headline: "Show what happened.",
    body: "Export a simple snapshot of scans, saves, RSVPs, redemptions, campaigns, and entry locations.",
    filters: ["Date range", "Partner type", "Location/source", "Offer", "Event", "Campaign", "Format"],
    ctas: ["Preview report", "Download CSV", "Download PDF", "Email report"],
    success: "Report generated.",
    emptyState: "No reportable activity yet. Reports become useful once people start using the workspace.",
  },
  analytics: {
    route: PARTNER_ROUTES.workspaceAnalytics,
    headline: "A clearer read on nearby action.",
    body: "Use scans, saves, RSVPs, redemptions, repeat visits, and share links to decide what to do next.",
    sections: ["Action progress", "Share links", "Offer results", "Event activity", "Repeat visits", "Timing windows", "Nearby properties", "Campaign results"],
    emptyState: "Waiting for activity. Results appear once people start using the workspace.",
  },
  profile: {
    route: PARTNER_ROUTES.workspaceProfile,
    headline: "How people see you on the map.",
    body: "Keep your name, location, category, hours, offer, and description current.",
    fields: ["Business or organization name", "Partner type", "Category", "Address", "Website", "Phone", "Primary contact", "Map description", "Hours", "Images", "Default offer", "Where it appears"],
    success: "Profile saved. Your map presence is up to date.",
  },
  team: {
    route: PARTNER_ROUTES.workspaceTeam,
    headline: "People who can manage this presence.",
    body: "Invite teammates to update offers, events, campaigns, and reports.",
    roles: ["Owner", "Manager", "Contributor", "Viewer"],
    success: "Invite sent.",
    emptyState: "No teammates invited yet.",
  },
  billing: {
    route: PARTNER_ROUTES.workspaceBilling,
    headline: "Plan and billing.",
    body: "Review your current plan, renewal date, Stripe checkout status, and available upgrades.",
    actions: ["Open Stripe checkout", "Change plan", "View invoice", "Update billing contact"],
    missingStripe: "Checkout is not available yet. We can complete setup with your team.",
  },
};

export const PARTNER_DASHBOARD_COPY = {
  title: "Partner Results",
  body: "A high-level view of partner activity across the downtown map: scans, saves, RSVPs, redemptions, campaigns, share links, and repeat visits.",
  nav: ["Overview", "Map", "Properties", "Hotels", "Venues", "Brands", "Civic", "Real Estate", "Redemptions", "Reports"],
  kpis: ["Active partners", "Map opens", "Saves", "Redemptions", "RSVPs", "Campaign actions", "Share links", "Repeat visits"],
  waitingState: "Waiting for activity.",
  exportCta: "Export summary",
} as const;

export const PARTNER_PRICING_AT_A_GLANCE = [
  {
    type: "properties",
    title: "Properties",
    audience: "Multifamily, condos, apartments, and residential buildings.",
    price: "Free · $39 · $99 / year",
    note: "90-day pilot. Then choose your level.",
    line: "Management pays. Residents stay. Your address is your key to unlock downtown.",
  },
  {
    type: "hotels",
    title: "Hotels",
    audience: "Hotels, boutiques, extended stays, and hospitality.",
    price: "$99–$149 / year",
    note: "90-day pilot. Then choose your level.",
    line: "Extend the stay beyond your lobby. One scan. Every option. Guests navigate. You benefit.",
  },
  {
    type: "venues",
    title: "Venues",
    audience: "Restaurants, bars, cafés, fitness, wellness, and experiences.",
    price: "Free for 12 months · then $49–$99 / year",
    note: "Show up when people are choosing where to go.",
    line: "Less noise. Better timing. Clearer next steps.",
  },
  {
    type: "brands",
    title: "Brands · Sponsors",
    audience: "Brands, campaigns, and corridor sponsorships.",
    price: "$99–$149 / year",
    note: "Be useful when people are deciding.",
    line: "Context beats scale. Timing beats frequency.",
  },
  {
    type: "civic",
    title: "Civic",
    audience: "Cities, districts, chambers, and community partners.",
    price: "$49–$79 / year",
    note: "Help people take part.",
    line: "Clear information helps people show up.",
  },
  {
    type: "realEstate",
    title: "Real Estate",
    audience: "Agents, brokers, listings, and property marketing.",
    price: "$99–$199 / year",
    note: "Turn neighborhood attention into qualified interest.",
    line: "Listings become part of the downtown map, not just another search result.",
  },
] as const;

export const CAMPAIGN_PRICING_PACKAGES = [
  {
    id: "featured-49",
    label: "Featured campaign",
    price: "$49",
    asset: "/assets/campaign-pricing/$49 featured campaign.png",
    stripeKey: "VITE_STRIPE_DP_CAMPAIGN_FEATURED_49",
    copy: "A focused placement for a specific offer, event, or partner page.",
  },
  {
    id: "perk-99",
    label: "Perk campaign",
    price: "$99",
    asset: "/assets/campaign-pricing/Perk Campaign .png",
    stripeKey: "VITE_STRIPE_DP_CAMPAIGN_PERK_99",
    copy: "A stronger campaign package built around a usable perk and tracked share links.",
  },
  {
    id: "destination-custom",
    label: "Destination campaign",
    price: "Custom",
    asset: "/assets/campaign-pricing/Designation campaign .png",
    stripeKey: null,
    copy: "A district, event, or corridor campaign for a larger downtown push.",
  },
  {
    id: "multi-property-custom",
    label: "Multi-property campaign",
    price: "Custom",
    asset: "/assets/campaign-pricing/Multi Property.png",
    stripeKey: null,
    copy: "Campaign placement across multiple residential or hospitality share links.",
  },
  {
    id: "survey-custom",
    label: "Survey campaign",
    price: "Custom",
    asset: "/assets/campaign-pricing/Fine Eywear Survey.png",
    stripeKey: null,
    copy: "A lightweight feedback or interest capture campaign tied to real downtown context.",
  },
] as const;

export function normalizePartnerType(input?: string | null): DowntownPerksPartnerType {
  if (!input) return "venues";
  const key = String(input).trim();
  return PARTNER_TYPE_ALIASES[key] || PARTNER_TYPE_ALIASES[key.toLowerCase()] || "venues";
}

export function getPartnerPageDeck(input?: string | null) {
  return PARTNER_PAGE_DECK[normalizePartnerType(input)];
}

export function getPartnerApplyRoute(input?: string | null) {
  const type = normalizePartnerType(input);
  return PARTNER_PAGE_DECK[type].applyRoute;
}

export function getPartnerDashboardRoute(input?: string | null) {
  const type = normalizePartnerType(input);
  return PARTNER_PAGE_DECK[type].dashboardRoute;
}

export function getPartnerWorkspaceRoute(tab: PartnerWorkspaceTab = "overview") {
  return PARTNER_WORKSPACE_COPY[tab]?.route || PARTNER_ROUTES.workspaceOverview;
}

export function getStripeFallbackRoute(type: DowntownPerksPartnerType, plan: string) {
  const publicType = type === "realEstate" ? "real-estate" : type;
  return `/partners/apply?type=${encodeURIComponent(publicType)}&plan=${encodeURIComponent(plan)}&payment=pending`;
}
