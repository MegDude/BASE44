import {
  BarChart3,
  Building2,
  Calendar,
  Hotel,
  Landmark,
  Megaphone,
  Route,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

export const PARTNER_TYPE_ORDER = [
  "properties",
  "hospitality",
  "venues",
  "brands",
  "civic",
];

export const PARTNER_TYPE_CONTENT = {
  properties: {
    id: "properties",
    label: "Properties",
    shortLabel: "Property layer",
    route: "/partners/properties",
    legacyRoutes: ["/partners/residential"],
    mapMode: "property",
    icon: Building2,
    eyebrow: "Property Partner Layer",
    headline: "Turn the building into a live neighborhood entry point.",
    description:
      "Downtown Perks gives residential properties a mapped local utility for residents and a measurable neighborhood layer for operators. The value is not just the building itself. It is the building connected to what is walkable around it.",
    outcomes: [
      "Resident activation and card adoption",
      "Building-level attribution for scans, saves, RSVPs, and redemptions",
      "Neighborhood relevance for leasing, onboarding, and retention",
    ],
    metrics: [
      { label: "Buildings live", value: "6" },
      { label: "Resident activations", value: "186" },
      { label: "Walkable actions", value: "221" },
      { label: "Partner venues nearby", value: "12" },
    ],
    modules: [
      {
        title: "Resident access",
        body: "Building-specific QR entry, card issuance, building context, and resident onboarding without forcing a hard auth wall before browsing.",
      },
      {
        title: "Neighborhood utility",
        body: "Nearby places, events, and perks positioned as an amenity extension, not a directory.",
      },
      {
        title: "Attribution and retention",
        body: "Track which buildings drive discovery, which categories convert, and what becomes habit over time.",
      },
    ],
    workflow: [
      "Register the building and QR entry points.",
      "Let residents browse immediately and unlock the special layer at high-intent moments.",
      "Track building-driven scans, saves, card activations, and repeat neighborhood use.",
    ],
    kpis: [
      "Card activation rate",
      "Building source attribution",
      "Repeat weekly usage",
      "Resident perk unlock rate",
    ],
    intelligenceTitle: "Property intelligence map",
    intelligenceDescription:
      "See residential engagement clusters, walkable opportunity zones, and building-to-venue relationships without mixing in the resident discovery UI.",
  },
  hospitality: {
    id: "hospitality",
    label: "Hospitality",
    shortLabel: "Guest layer",
    route: "/partners/hospitality",
    legacyRoutes: ["/partners/hotels"],
    mapMode: "hospitality",
    icon: Hotel,
    eyebrow: "Hospitality Partner Layer",
    headline: "Give guests a better way into downtown from the moment they arrive.",
    description:
      "Hospitality partners use Downtown Perks as a QR-led guest layer: instant nearby guidance, walkable discovery, and measurable crossover from stay to local action.",
    outcomes: [
      "Faster guest discovery without front-desk friction",
      "Track guest-to-venue movement and local engagement",
      "Extend the stay beyond the lobby with a live downtown layer",
    ],
    metrics: [
      { label: "Hotels active", value: "9" },
      { label: "Guest interactions", value: "2.1k" },
      { label: "QR access points", value: "18" },
      { label: "Nearby saves", value: "612" },
    ],
    modules: [
      {
        title: "Guest QR entry",
        body: "Open the map instantly from lobby, room, concierge, or welcome materials with source attribution intact.",
      },
      {
        title: "Nearby guidance",
        body: "Dining, events, perks, and walkable places shown in context instead of static recommendation lists.",
      },
      {
        title: "Stay-to-visit measurement",
        body: "Understand which guests browse, save, RSVP, and convert into nearby venue visits.",
      },
    ],
    workflow: [
      "Place dynamic QR entry points across the property.",
      "Let guests browse immediately and unlock offers only when value is clear.",
      "Measure local movement, saves, RSVP activity, and perk redemptions by source.",
    ],
    kpis: [
      "QR open-to-map rate",
      "Guest save rate",
      "Stay-to-visit conversion",
      "Repeat local engagement",
    ],
    intelligenceTitle: "Hospitality intelligence map",
    intelligenceDescription:
      "See guest-local crossover, hotel QR engagement, and nearby activity clusters around hospitality locations.",
  },
  venues: {
    id: "venues",
    label: "Venues",
    shortLabel: "Venue layer",
    route: "/partners/venues",
    mapMode: "venue",
    icon: Store,
    eyebrow: "Venue Partner Layer",
    headline: "Show up when downtown intent is already forming.",
    description:
      "Venue partners do not need broader noise. They need relevance in the moment: nearby discovery, live map visibility, and offers tied to actual conversion behavior.",
    outcomes: [
      "Appear in high-intent nearby searches",
      "Publish perks and events in context",
      "Measure saves, visits, redemptions, and repeat behavior",
    ],
    metrics: [
      { label: "Venues live", value: "24" },
      { label: "Nearby searches", value: "402" },
      { label: "Visits", value: "289" },
      { label: "Redemptions", value: "96" },
    ],
    modules: [
      {
        title: "Map placement",
        body: "Pins, category visibility, live states, and walkable context across the resident map.",
      },
      {
        title: "Offer and event tools",
        body: "Timed perks, RSVP moments, and category-specific placements that match the venue type.",
      },
      {
        title: "Conversion intelligence",
        body: "Track which nearby conditions, hours, and source locations actually drive foot traffic and repeat use.",
      },
    ],
    workflow: [
      "List the venue, category, and live offer or event.",
      "Appear in nearby search and map discovery without forcing the user through signup.",
      "Use the dashboard to tune timing, offers, and category mix.",
    ],
    kpis: [
      "Offer view-to-redemption rate",
      "Repeat customer rate",
      "Time-of-day lift",
      "Map save rate",
    ],
    intelligenceTitle: "Venue performance map",
    intelligenceDescription:
      "See where saves, visit intent, offer redemptions, and coverage gaps cluster around active business nodes.",
  },
  brands: {
    id: "brands",
    label: "Brands",
    shortLabel: "Campaign layer",
    route: "/partners/brands",
    mapMode: "brand",
    icon: Sparkles,
    eyebrow: "Brand Campaign Layer",
    headline: "Use downtown as a live campaign surface, not a generic media buy.",
    description:
      "Brand partners use Downtown Perks to run place-aware campaigns tied to buildings, venues, events, and real movement. The focus is timing, context, and measurable action.",
    outcomes: [
      "Activation tied to district context and audience intent",
      "Campaign placement across buildings, venues, and events",
      "Track scans, saves, visits, redemptions, and repeat behavior",
    ],
    metrics: [
      { label: "Campaigns live", value: "12" },
      { label: "Monthly scans", value: "2.4k+" },
      { label: "Attributed visits", value: "840+" },
      { label: "Redemptions", value: "340+" },
    ],
    modules: [
      {
        title: "Campaign formats",
        body: "Launch campaigns, resident activations, event-led campaigns, and utility-led placements across downtown.",
      },
      {
        title: "Source-aware measurement",
        body: "Track scans, visits, and conversions by placement, building, campaign surface, and timing.",
      },
      {
        title: "Brand showcase",
        body: "Case studies live separately from the core partner narrative so sales examples stay optional and relevant.",
      },
    ],
    workflow: [
      "Choose the campaign format based on downtown context and partner surfaces.",
      "Launch through properties, hospitality, venues, events, or civic nodes.",
      "Measure source, conversion, repeat behavior, and loyalty lift in the dashboard.",
    ],
    kpis: [
      "Scan-to-visit proxy",
      "Campaign conversion rate",
      "Building source attribution",
      "Repeat redemption rate",
    ],
    intelligenceTitle: "Brand campaign map",
    intelligenceDescription:
      "See activation zones, campaign reach, and conversion clusters across buildings, venues, and event nodes.",
  },
  civic: {
    id: "civic",
    label: "Civic",
    shortLabel: "District layer",
    route: "/partners/civic",
    mapMode: "civic",
    icon: Landmark,
    eyebrow: "Civic Partner Layer",
    headline: "Make downtown participation easier to see, join, and measure.",
    description:
      "Civic partners use Downtown Perks to surface district activity, event participation, and public-serving guidance through the same downtown map system.",
    outcomes: [
      "District visibility and event participation",
      "Public-facing layers that remain useful, not promotional",
      "Measure civic engagement by place, source, and activity type",
    ],
    metrics: [
      { label: "Monthly opens", value: "28k+" },
      { label: "Active civic orgs", value: "8+" },
      { label: "RSVPs / month", value: "3.2k" },
      { label: "Attributed visits", value: "8.4k" },
    ],
    modules: [
      {
        title: "District visibility",
        body: "Always-on district presence, event markers, and useful civic information across the map.",
      },
      {
        title: "Participation design",
        body: "Use QR, event-linked prompts, and building outreach to increase turnout and useful engagement.",
      },
      {
        title: "Measurement and governance",
        body: "Track event opens, RSVPs, district movement, and source-based participation patterns.",
      },
    ],
    workflow: [
      "Define the district, initiative, or public moment.",
      "Launch the layer on the map with event, utility, or outreach surfaces.",
      "Use the dashboard to monitor participation and refine what gets surfaced.",
    ],
    kpis: [
      "District engagement",
      "Event participation rate",
      "Civic source attribution",
      "Repeat local engagement",
    ],
    intelligenceTitle: "Civic district intelligence map",
    intelligenceDescription:
      "See event density, district engagement, coverage gaps, and public participation zones without mixing in resident discovery cards.",
  },
};

export const PARTNER_LANDING_SECTIONS = [
  {
    title: "Discovery stays open",
    body: "Residents and guests should be able to browse immediately. Access layers, card issuance, and redemption unlock when the intent is real.",
    icon: Route,
  },
  {
    title: "The map is the operating surface",
    body: "Partner value comes from visibility in context: time, distance, neighborhood, building source, and current demand.",
    icon: Users,
  },
  {
    title: "The dashboard is the intelligence hub",
    body: "Scans, saves, RSVPs, redemptions, repeat behavior, and source attribution should turn into clear next actions.",
    icon: BarChart3,
  },
];

export const PARTNER_PLATFORM_MODULES = [
  {
    title: "Progressive-access resident flow",
    body: "Browse first, then unlock the special layer for saves, RSVP, perks card, and redemption.",
  },
  {
    title: "Dynamic QR infrastructure",
    body: "Track source, building, venue, campaign, placement, and time for every QR-led entry path.",
  },
  {
    title: "Partner offer manager",
    body: "Publish and manage offers, events, listings, timing, and category visibility from one workspace.",
  },
  {
    title: "Attribution and loyalty signals",
    body: "Measure repeat behavior, strongest source locations, and what turns intent into a regular customer base.",
  },
];

export const BRAND_SHOWCASE_GROUPS = [
  {
    id: "campaign",
    label: "Campaign showcase",
    description: "Examples for brand and activation pitches. These are optional references, not the core partner narrative.",
    items: [
      {
        name: "The Paseo",
        route: "/brands/the-paseo",
        summary: "Residential-linked campaign surface with building entry and nearby perk visibility.",
      },
      {
        name: "Hotel Van Zandt",
        route: "/brands/hotel-van-zandt",
        summary: "Hospitality-led activation showing guest flow into local venues and events.",
      },
      {
        name: "YETI",
        route: "/brands/yeti",
        summary: "Branded downtown activation with timing, source tracking, and event tie-ins.",
      },
    ],
  },
  {
    id: "district",
    label: "District and venue showcase",
    description: "Use when the pitch needs contextual proof across places, properties, and downtown corridors.",
    items: [
      {
        name: "Banger's",
        route: "/brands/bangers",
        summary: "Venue example for map-native conversion and repeat local discovery.",
      },
      {
        name: "Four Seasons Residences",
        route: "/brands/four-seasons-residences",
        summary: "Residential example connecting building value to walkable downtown relevance.",
      },
      {
        name: "Waterline",
        route: "/brands/the-waterline",
        summary: "Mixed-use example showing premium positioning and neighborhood utility together.",
      },
    ],
  },
];

export const PARTNER_DASHBOARD_LINK = "/partners/dashboard";
