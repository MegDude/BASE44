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
  | "map"
  | "offers"
  | "events"
  | "sources"
  | "campaigns"
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
    "People nearby are already deciding. Downtown Perks helps partners show up at the right moment.",
  partnerOutcome: "This helps nearby people find and act on us.",
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
  workspaceMap: "/partner-workspace/map",
  workspaceOffers: "/partner-workspace/offers",
  workspaceEvents: "/partner-workspace/events",
  workspaceSources: "/partner-workspace/sources",
  workspaceCampaigns: "/partner-workspace/campaigns",
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
    "We want to sponsor a district moment.",
    "We are looking for targeted placement in front of nearby residents and guests.",
    "How do campaigns track real-world action?",
    "We would like to see a case study similar to our brand.",
  ],
  civic: [
    "We are looking to promote a public downtown event.",
    "We want to create a district visibility layer.",
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
      kpis: ["352 Units", "94% Occupancy", "142 Card activations", "318 Nearby saves"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first building activity signal",
      recentActions: "Waiting for resident scans, saves, RSVPs, and redemptions",
      leadInsight: "The Independent leading live activity",
      rollup: "6 Buildings live · 186 Resident activations · 221 Walkable actions · 12 Partner venues nearby",
      emptyNote: "Property-level insight appears once building-linked activity starts writing to the analytics layer.",
    },
    map: {
      title: "Property intelligence map",
      subhead: "See what is close to the building, what residents are using, and which local partners are creating value.",
      filters: ["All signals", "Immediate demand", "5 min radius", "Events live", "Offer performance", "Source buildings", "Repeat signals"],
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
        description: "Basic insights after the 90-day pilot.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_FREE_FOREVER",
        features: ["Map presence", "Basic reporting", "Resident access path", "Partner review"],
      },
      {
        id: "property-analytics",
        title: "Analytics",
        price: "$39/year",
        description: "A clearer view of what residents are using.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_ANALYTICS_39_YEAR",
        features: ["Activity dashboard", "Monthly report", "Source attribution", "Perk usage"],
      },
      {
        id: "property-full-stack",
        title: "Full stack",
        price: "$99/year",
        description: "Full resident layer with deeper reporting and support.",
        stripeKey: "VITE_STRIPE_DP_PROPERTY_FULL_STACK_99_YEAR",
        features: ["Advanced analytics", "Resident launch support", "Campaign routing", "Partner recommendations"],
      },
    ],
    workflow: [
      "Add the building as a source node inside the Downtown Perks map.",
      "Give residents access through QR, SMS, leasing materials, lobby signage, or move-in communications.",
      "Track resident scans, saves, redemptions, event interest, and repeat neighborhood usage.",
    ],
    kpis: [
      "Resident activation rate",
      "Card opt-ins",
      "Nearby perk usage",
      "Saved places",
      "Event saves or RSVPs",
      "Repeat resident engagement",
      "Local partner participation",
      "Leasing or renewal support signals",
    ],
    finalCta: {
      headline: "Turn the neighborhood into part of the amenity package.",
      body: "Give residents a simple way to use downtown, then show your team which local partnerships are creating engagement.",
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
      "Curated recommendations without a static PDF or printed list",
      "Guest saves, offer use, and off-property interest signals",
      "Simple reporting for concierge and hospitality teams",
    ],
    proof: {
      title: "Hotel guest journey",
      body: "A live concierge layer that connects guest stays to nearby dining, events, perks, and daily neighborhood use.",
      kpis: ["245 Guests live", "1.2k Saves", "48 Redemptions", "0.4 mi Avg distance"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first guest activity signal",
      recentActions: "Awaiting scans",
      leadInsight: "Guest local movements",
      rollup: "9 Hotels active · 2.1k Guest interactions · 18 QR access points · 612 Nearby saves",
      emptyNote: "Guest insight appears once hotel QR and map activity starts writing to the analytics layer.",
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
        description: "Expanded guest layer with stronger reporting.",
        stripeKey: "VITE_STRIPE_DP_HOTEL_ACTIVE_149_YEAR",
        features: ["Multiple QR points", "Guest-to-local movement", "Event/perk reporting", "Dashboard access"],
      },
    ],
    workflow: [
      "Add the hotel as a source node in the map.",
      "Curate nearby recommendations, perks, and events for guests.",
      "Track scans, saved places, offer usage, and guest movement into local venues.",
    ],
    kpis: ["Guest QR scans", "Guest map sessions", "Saved recommendations", "Offer redemptions", "Nearby venue visits", "Event interest", "Repeat use during stay", "Partner referral value"],
    finalCta: {
      headline: "Replace the static recommendation list with a live guest map.",
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
      primaryCta: { label: "Discuss activation", href: "/partners/apply?type=venues" },
      secondaryCta: { label: "View traffic signals", href: "/partners/dashboard/venues" },
    },
    included: [
      "Map placement based on proximity and category",
      "Perks and offers people can actually use",
      "Events surfaced when people are looking for plans",
      "Save → show card → scan → done",
      "Clear engagement at 30, 60, and 90 days",
    ],
    proof: {
      title: "Banger's / Rainey",
      body: "Map discovery, event activity, and measurable district foot traffic for one of Rainey's biggest anchors.",
      kpis: ["342 Scans", "85 Event RSVPs", "112 Redemptions", "22% Repeat visits"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for first scan activity",
      recentActions: "Awaiting scans",
      leadInsight: "Banger's leading Rainey footprint",
      rollup: "24 Venues live · 402 Nearby searches · 289 Visits · 96 Redemptions",
      emptyNote: "Venue insight appears once a perk, event, or profile is used by someone nearby.",
    },
    map: {
      title: "Venue traffic map",
      subhead: "See who is nearby, which offers are working, and where visits are coming from.",
      filters: ["Live offers", "High volume", "Walkable radius", "Events nearby", "Repeat signals"],
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
        features: ["Live map placement", "Perk offers", "Basic visibility tracking", "Review at 30/60/90 days"],
      },
      {
        id: "venue-49",
        title: "Ongoing",
        price: "$49/year",
        description: "Basic ongoing presence after the free year.",
        stripeKey: "VITE_STRIPE_DP_VENUE_49_YEAR",
        features: ["Map presence", "Offer tools", "Basic reporting", "Event listing"],
      },
      {
        id: "venue-99",
        title: "Plus",
        price: "$99/year",
        description: "More reporting for higher-activity venues.",
        stripeKey: "VITE_STRIPE_DP_VENUE_99_YEAR",
        features: ["Conversion funnel", "Source attribution", "Repeat signals", "Campaign eligibility"],
      },
    ],
    workflow: [
      "Add or verify the venue profile, location, category, and active offer.",
      "Connect offers, events, happy hours, or limited-time experiences to the map.",
      "Measure scans, saves, visits, redemptions, and repeat behavior by timing and source.",
    ],
    kpis: ["Venue profile views", "Offer scans", "Saved venue actions", "Redemption rate", "Event-driven visits", "Peak window engagement", "Repeat visitor signals", "Source buildings or nearby districts"],
    finalCta: {
      headline: "Turn nearby attention into actual visits.",
      body: "Show up inside the live map, promote the right offer at the right time, and measure what brings people in.",
      cta: { label: "Discuss activation", href: "/partners/apply?type=venues" },
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
      headline: "Buy the moment, not the impression.",
      body: [
        "The best advertising does not feel like advertising. It feels like something useful that arrived at the right time.",
        "Coffee. Lunch. Drinks. Tonight. A resident move-in. A hotel weekend. A civic event.",
        "Downtown Perks helps brands show up inside real downtown decisions instead of hoping broad reach turns into action.",
      ],
      primaryCta: { label: "Start a conversation", href: "/partners/apply?type=brands" },
      secondaryCta: { label: "See placement map", href: "/partners/dashboard/brands" },
    },
    included: [
      "Corridor-based visibility across downtown",
      "Placement tied to location, timing, and partner surface",
      "Event and campaign integration",
      "QR moments and resident offers",
      "Trackable actions, not vague attention",
    ],
    proof: {
      title: "YETI / Paseo / Hotel Van Zandt",
      body: "Flagship city-brand activation. QR-led product moments. District presence.",
      kpis: ["1.4k Scans", "244 Redemptions", "12k Reach", "17% Conversion"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for campaign launch",
      recentActions: "Awaiting scans",
      leadInsight: "YETI leading district activation",
      rollup: "12 Campaigns live · 2.4k+ Monthly scans · 840+ Attributed visits · 340+ Redemptions",
      emptyNote: "Brand analytics will populate once a campaign goes live.",
    },
    map: {
      title: "Brand placement map",
      subhead: "See which districts, buildings, venues, and events are creating the strongest brand interaction.",
      filters: ["Live campaigns", "Top corridors", "Resident sources", "Event windows", "Venue surfaces"],
      prompts: [
        "Where are people going right now?",
        "Which venues are performing best tonight?",
        "What is happening around Rainey?",
        "Which buildings are generating traffic?",
        "Where should we activate this weekend?",
        "Which offers are converting?",
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
        features: ["Map visibility", "Campaign request path", "Basic reporting", "Source review"],
      },
      {
        id: "brand-149",
        title: "Always-on",
        price: "$149/year",
        description: "Ongoing placement across map, building, and district surfaces.",
        stripeKey: "VITE_STRIPE_DP_BRAND_149_YEAR",
        features: ["Map + building + district", "Ongoing scans/saves", "Campaign dashboard", "Monthly report"],
      },
      {
        id: "brand-custom",
        title: "Custom campaign",
        price: "Custom",
        description: "Event-led or corridor-based campaign packages.",
        stripeKey: null,
        features: ["Campaign format", "QR moments", "Venue surfaces", "Source attribution"],
      },
    ],
    workflow: [
      "Choose the campaign format based on audience intent, district context, and available partner surfaces.",
      "Launch the campaign through selected buildings, venues, events, hotels, or civic nodes.",
      "Measure source, conversion, repeat behavior, and loyalty signals inside the dashboard.",
    ],
    kpis: ["Campaign scans", "Scan-to-visit proxy", "Redemption rate", "Building source attribution", "Event-linked traffic", "Repeat engagement", "Cost per attributed action"],
    finalCta: {
      headline: "Build the campaign layer inside Downtown Perks.",
      body: "Activate through downtown's live map, then measure what happened by source, timing, place, and behavior.",
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
      headline: "Turn attendance into participation.",
      body: [
        "Cities work better when people know what is happening.",
        "Right now, finding a local event often takes too much effort. A flyer in one place. A newsletter in another. A public page nobody checks at the right time.",
        "Downtown Perks makes civic moments easier to see, join, and measure through the same map people use for daily downtown decisions.",
      ],
      primaryCta: { label: "Talk to us", href: "/partners/apply?type=civic" },
      secondaryCta: { label: "View live map", href: "/partners/dashboard/civic" },
    },
    included: [
      "Community events in one visible layer",
      "District-wide discovery",
      "Shared map for public participation",
      "Clear access to what is happening nearby",
      "Privacy-safe engagement signals",
    ],
    proof: {
      title: "DANA / District Programming Layer",
      body: "DANA-led civic touchpoints, walking-map utility, and public space activation across downtown residents and hotels.",
      kpis: ["482 Event RSVPs", "3.1k Map opens", "14 Buildings reached", "High Participation"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for public event",
      recentActions: "Awaiting RSVPs",
      leadInsight: "Waterloo Park leading public engagement",
      rollup: "8+ Active civic orgs · 28k+ Monthly opens · 3.2k RSVP/month · 8.4k Attributed visits",
      emptyNote: "Civic engagement analytics populate when users interact with public places or events.",
    },
    map: {
      title: "District participation map",
      subhead: "See what people are finding, where RSVPs are coming from, and which public spaces are drawing attention.",
      filters: ["Public events", "High engagement zones", "Active RSVPs", "Public spaces", "Engagement gaps"],
      prompts: [
        "Which districts are gaining activity?",
        "What events are driving movement?",
        "Where are engagement gaps forming?",
        "Which local businesses need visibility?",
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
        description: "Basic public event and civic visibility layer.",
        stripeKey: "VITE_STRIPE_DP_CIVIC_49_YEAR",
        features: ["Public event listings", "Map visibility", "Basic RSVP tracking", "Community reporting"],
      },
      {
        id: "civic-79",
        title: "District",
        price: "$79/year",
        description: "More detailed district participation layer.",
        stripeKey: "VITE_STRIPE_DP_CIVIC_79_YEAR",
        features: ["District program area", "Enhanced analytics", "Cross-building outreach", "Public space reporting"],
      },
      {
        id: "civic-custom",
        title: "Custom initiative",
        price: "Custom",
        description: "Larger civic, chamber, or district initiatives.",
        stripeKey: null,
        features: ["Custom district", "Public programming", "Partner coordination", "Detailed reporting"],
      },
    ],
    workflow: [
      "Define the district, corridor, or civic program area.",
      "Connect participating venues, properties, events, and community partners.",
      "Review privacy-safe engagement signals by area, category, event window, and time period.",
    ],
    kpis: ["District engagement", "Event impact", "Local business participation", "Offer or program usage", "Corridor activity", "Engagement gaps", "Repeat community interactions", "Partner network growth"],
    finalCta: {
      headline: "Turn downtown activity into usable civic intelligence.",
      body: "Understand where people engage, where businesses need support, and which programs are creating movement across the district.",
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
      "Visibility for condos, apartments, homes, and mixed-use listings",
    ],
    proof: {
      title: "Neighborhood-led listing discovery",
      body: "Listings become more useful when the surrounding downtown layer is visible.",
      kpis: ["Listing views", "Neighborhood saves", "Lead intent", "Source attribution"],
    },
    analyticsSnapshot: {
      peakWindow: "Waiting for listing activity",
      recentActions: "Awaiting map views and lead actions",
      leadInsight: "Listing activity will populate after the first map interaction",
      rollup: "Listings become part of the downtown map, not just another search result",
      emptyNote: "Real estate analytics populate when listings receive views, saves, or lead actions.",
    },
    map: {
      title: "Listing interest map",
      subhead: "See which listings, buildings, and neighborhoods are drawing qualified attention.",
      filters: ["Active listings", "Saved listings", "Lead intent", "Walkability", "CRM ready"],
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
        description: "Unlimited listings with priority visibility.",
        stripeKey: "VITE_STRIPE_DP_RE_AGENT_PRO_199_YEAR",
        features: ["Unlimited listings", "Priority visibility", "CRM integration", "Advanced reporting"],
      },
    ],
    workflow: [
      "Add listings, property type, location, availability, and lead destination.",
      "Connect each listing to nearby places, perks, events, and walkability context.",
      "Track listing views, saves, source locations, and qualified lead actions.",
    ],
    kpis: ["Listing views", "Saved listings", "Neighborhood saves", "Lead clicks", "CRM handoffs", "Source buildings", "Walkability engagement"],
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
  { id: "map", label: "Map", href: PARTNER_ROUTES.workspaceMap, helper: "Your place in the downtown map." },
  { id: "offers", label: "Offers", href: PARTNER_ROUTES.workspaceOffers, helper: "Perks people can use." },
  { id: "events", label: "Events", href: PARTNER_ROUTES.workspaceEvents, helper: "Plans worth showing up for." },
  { id: "sources", label: "Sources", href: PARTNER_ROUTES.workspaceSources, helper: "Where people enter from." },
  { id: "campaigns", label: "Campaigns", href: PARTNER_ROUTES.workspaceCampaigns, helper: "Campaigns tied to real places." },
  { id: "reports", label: "Reports", href: PARTNER_ROUTES.workspaceReports, helper: "Show what happened." },
  { id: "analytics", label: "Analytics", href: PARTNER_ROUTES.workspaceAnalytics, helper: "A clearer read on nearby action." },
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
    emptyState: "No live signals yet. Publish an offer, event, or source point to start collecting activity.",
  },
  map: {
    route: PARTNER_ROUTES.workspaceMap,
    headline: "Your place in the downtown map.",
    body: "See your location, nearby properties, events, offers, and the source points that can send people your way.",
    prompts: [
      "Who is nearby right now?",
      "Which offers are working?",
      "What events are creating movement?",
      "Where are saves coming from?",
      "Which source points matter most?",
      "What should we update this week?",
    ],
    drawerTabs: ["Overview", "Conversion", "Audience", "Events", "Actions"],
    actions: ["Create offer", "Add event", "Update profile", "Download report"],
  },
  offers: {
    route: PARTNER_ROUTES.workspaceOffers,
    headline: "Offers people can actually use.",
    body: "Create simple perks that make the next decision easier: save it, show the card, scan, done.",
    columns: ["Offer", "Status", "Available dates", "Redemptions", "Saves", "Last updated", "Actions"],
    createCta: "Create offer",
    fields: ["Offer title", "Short description", "Perk type", "Start date", "End date", "Days active", "Time window", "Redemption instructions", "Limitations", "Primary location", "Active status"],
    success: "Offer saved. It can now appear on the map when active.",
    emptyState: "No offers yet. Start with one useful reason for someone nearby to choose you.",
  },
  events: {
    route: PARTNER_ROUTES.workspaceEvents,
    headline: "Plans worth showing up for.",
    body: "Add events, programming, happy hours, pop-ups, and civic moments that should appear when people are looking for something to do.",
    columns: ["Event", "Date", "Status", "RSVPs", "Saves", "Source", "Actions"],
    createCta: "Create event",
    fields: ["Event title", "Description", "Date", "Start time", "End time", "Location", "Category", "RSVP link", "Capacity", "Perks card eligible", "Active status"],
    success: "Event saved. It can now be surfaced in the map and events feed.",
    emptyState: "No events yet. Add something worth showing up for.",
  },
  sources: {
    route: PARTNER_ROUTES.workspaceSources,
    headline: "Where people enter from.",
    body: "Source points show where someone starts: a lobby QR, hotel desk, event poster, venue counter, campaign placement, or listing link.",
    columns: ["Source point", "Type", "Location", "Scans", "Linked campaign", "Status", "Actions"],
    createCta: "Create source point",
    fields: ["Source name", "Source type", "Address or placement", "QR label", "Linked offer/event/campaign", "Notes", "Active status"],
    sourceTypes: ["Building lobby", "Leasing flow", "Hotel lobby", "Guest room", "Venue counter", "Event poster", "Campaign placement", "Listing page", "Civic sign", "Other"],
    success: "Source point saved. Use it anywhere people should enter the map.",
    emptyState: "No source points yet. Add the places where people should enter the map.",
  },
  campaigns: {
    route: PARTNER_ROUTES.workspaceCampaigns,
    headline: "Campaigns tied to real places.",
    body: "Build simple campaigns around where people are, what they are doing, and what decision you want to make easier.",
    types: ["Featured campaign", "Perk campaign", "Destination campaign", "Multi-property campaign", "Major mixed-use campaign", "Survey campaign", "QR redemption campaign"],
    steps: ["Goal", "Audience", "Placement", "Offer or event", "Source points", "Timing", "Budget/pricing", "Review"],
    success: "Campaign saved. Review placement, source points, and timing before launch.",
    emptyState: "No campaigns yet. Start with one moment where better timing would matter.",
  },
  reports: {
    route: PARTNER_ROUTES.workspaceReports,
    headline: "Show what happened.",
    body: "Export a simple snapshot of scans, saves, RSVPs, redemptions, campaigns, and source locations.",
    filters: ["Date range", "Partner type", "Location/source", "Offer", "Event", "Campaign", "Format"],
    ctas: ["Preview report", "Download CSV", "Download PDF", "Email report"],
    success: "Report generated.",
    emptyState: "No reportable activity yet. Reports will become useful once live activity starts writing to the workspace.",
  },
  analytics: {
    route: PARTNER_ROUTES.workspaceAnalytics,
    headline: "A clearer read on nearby action.",
    body: "Use scans, saves, RSVPs, redemptions, repeat behavior, and source attribution to decide what to do next.",
    sections: ["Action funnel", "Source attribution", "Offer performance", "Event movement", "Repeat behavior", "Timing windows", "Nearby properties", "Campaign results"],
    emptyState: "Waiting for live signal. Analytics appear once activity starts writing to the workspace.",
  },
  profile: {
    route: PARTNER_ROUTES.workspaceProfile,
    headline: "How people see you on the map.",
    body: "Keep your name, location, category, hours, offer, and description current.",
    fields: ["Business or organization name", "Partner type", "Category", "Address", "Website", "Phone", "Primary contact", "Map description", "Hours", "Images", "Default offer", "Visibility status"],
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
    missingStripe: "Checkout link not configured. Add the Stripe environment variable before using this in production.",
  },
};

export const PARTNER_DASHBOARD_COPY = {
  title: "Partner Intelligence",
  body: "A high-level view of partner activity across the downtown map: scans, saves, RSVPs, redemptions, campaigns, source points, and repeat behavior.",
  nav: ["Overview", "Map", "Properties", "Hotels", "Venues", "Brands", "Civic", "Real Estate", "Redemptions", "Reports"],
  kpis: ["Active partners", "Map opens", "Saves", "Redemptions", "RSVPs", "Campaign actions", "Source points", "Repeat signals"],
  waitingState: "Waiting for live signal.",
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
    note: "Show up in the moment that counts.",
    line: "Not reach. Relevance. Not noise. Intent.",
  },
  {
    type: "brands",
    title: "Brands · Sponsors",
    audience: "Brands, activations, campaigns, and corridor sponsorships.",
    price: "$99–$149 / year",
    note: "Buy the moment, not the impression.",
    line: "Context beats scale. Timing beats frequency.",
  },
  {
    type: "civic",
    title: "Civic",
    audience: "Cities, districts, chambers, and community partners.",
    price: "$49–$79 / year",
    note: "Turn attendance into participation.",
    line: "Discovery drives turnout. Access drives engagement.",
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
    copy: "A focused placement for a specific offer, moment, or partner surface.",
  },
  {
    id: "perk-99",
    label: "Perk campaign",
    price: "$99",
    asset: "/assets/campaign-pricing/Perk Campaign .png",
    stripeKey: "VITE_STRIPE_DP_CAMPAIGN_PERK_99",
    copy: "A stronger campaign package built around a usable perk and tracked source points.",
  },
  {
    id: "destination-custom",
    label: "Destination campaign",
    price: "Custom",
    asset: "/assets/campaign-pricing/Designation campaign .png",
    stripeKey: null,
    copy: "A district, event, or corridor campaign for a larger downtown movement moment.",
  },
  {
    id: "multi-property-custom",
    label: "Multi-property campaign",
    price: "Custom",
    asset: "/assets/campaign-pricing/Multi Property.png",
    stripeKey: null,
    copy: "Campaign visibility across multiple residential or hospitality source points.",
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
