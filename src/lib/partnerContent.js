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
import { ROUTES } from "@/lib/routes";

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
    route: ROUTES.partnerProperties,
    legacyRoutes: [ROUTES.partnerResidential],
    mapMode: "property",
    icon: Building2,
    eyebrow: "For properties",
    headline: "Turn the building into a stronger way into downtown.",
    description:
      "Downtown Perks helps property teams make downtown feel easier to use. Residents can see what is nearby, worth going to, and easy to act on. Property teams can see what people actually open, save, visit, and use.",
    outcomes: [
      "Give residents one clear downtown layer instead of a scattered mix of apps and links",
      "See which buildings lead to visits, saves, RSVPs, and redemptions",
      "Make the building feel more useful in everyday life, not just on move-in day",
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
        body: "Give residents a simple way in through QR, text, card access, and building-linked entry.",
      },
      {
        title: "Neighborhood utility",
        body: "Show nearby places, events, and perks as part of the building experience, not as a separate extra step.",
      },
      {
        title: "Attribution and retention",
        body: "See what residents use most, what brings them back, and what actually adds day-to-day value.",
      },
    ],
    workflow: [
      "Connect the building and set up the QR and access points.",
      "Let residents browse first and unlock more when they are ready to act.",
      "Track scans, saves, card signups, visits, and repeat use in one system.",
    ],
    kpis: [
      "Card signups",
      "Building-led visits",
      "Weekly repeat use",
      "Perk unlocks",
    ],
    intelligenceTitle: "Property intelligence map",
    intelligenceDescription:
      "See where residents are engaging, what is close enough to matter, and which buildings are actually driving activity.",
  },
  hospitality: {
    id: "hospitality",
    label: "Hospitality",
    shortLabel: "Guest layer",
    route: ROUTES.partnerHospitality,
    legacyRoutes: [ROUTES.partnerHotelsLegacy],
    mapMode: "hospitality",
    icon: Hotel,
    eyebrow: "For hospitality",
    headline: "Help guests figure out downtown faster.",
    description:
      "Hotels can use Downtown Perks to show guests what is nearby, what is happening, and where to go next without sending them through a long front-desk process.",
    outcomes: [
      "Help guests find places faster",
      "See where guests go after they scan in",
      "Make the hotel feel more connected to downtown",
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
        body: "Let guests open the map from the lobby, room, concierge desk, or welcome materials.",
      },
      {
        title: "Nearby guidance",
        body: "Show dining, events, perks, and walkable places instead of handing out a static list.",
      },
      {
        title: "Stay-to-visit measurement",
        body: "See which guests browse, save, RSVP, and actually head out to nearby places.",
      },
    ],
    workflow: [
      "Place QR entry points around the property.",
      "Let guests browse right away and unlock offers when they want them.",
      "Measure local movement, saves, RSVPs, and redemptions.",
    ],
    kpis: [
      "QR opens",
      "Guest saves",
      "Guest-to-visit rate",
      "Repeat local use",
    ],
    intelligenceTitle: "Hospitality intelligence map",
    intelligenceDescription:
      "See guest activity, QR use, and what nearby places are getting attention.",
  },
  venues: {
    id: "venues",
    label: "Venues",
    shortLabel: "Venue layer",
    route: "/partners/venues",
    mapMode: "venue",
    icon: Store,
    eyebrow: "For venues",
    headline: "Show up when people nearby are deciding where to go.",
    description:
      "Venues do not need more noise. They need to be easy to notice when someone nearby is ready to choose a place.",
    outcomes: [
      "Show up in nearby searches that matter",
      "Post perks and events at the right time",
      "Track saves, visits, redemptions, and repeat use",
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
        body: "Show your pin, category, hours, and walking distance on the live map.",
      },
      {
        title: "Offer and event tools",
        body: "Run perks and events that match your venue and your busiest hours.",
      },
      {
        title: "Conversion intelligence",
        body: "See what brings people in and what keeps them coming back.",
      },
    ],
    workflow: [
      "Add your venue, category, and current offer or event.",
      "Show up on the map without forcing people to sign up first.",
      "Use the dashboard to adjust timing, offers, and placement.",
    ],
    kpis: [
      "Offer-to-redemption rate",
      "Repeat customer rate",
      "Busy-hour lift",
      "Map saves",
    ],
    intelligenceTitle: "Venue performance map",
    intelligenceDescription:
      "See where visits, saves, redemptions, and missed opportunities are showing up around your venue.",
  },
  brands: {
    id: "brands",
    label: "Brands",
    shortLabel: "Campaign layer",
    route: "/partners/brands",
    mapMode: "brand",
    icon: Sparkles,
    eyebrow: "For brands",
    headline: "Show up in the moments when people are already paying attention.",
    description:
      "Brands can use Downtown Perks to run campaigns tied to real places, real timing, and real activity across downtown.",
    outcomes: [
      "Reach people based on where they are and what they are doing",
      "Run campaigns across buildings, venues, and events",
      "Track scans, saves, visits, and redemptions",
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
        body: "Run brand campaigns, resident offers, event tie-ins, and location-based placements.",
      },
      {
        title: "Source-aware measurement",
        body: "See which placement, building, or event is driving action.",
      },
      {
        title: "Brand showcase",
        body: "Use examples when needed, without turning the whole page into a pitch deck.",
      },
    ],
    workflow: [
      "Pick the campaign type that fits the moment.",
      "Launch through buildings, hotels, venues, events, or civic placements.",
      "Track source, conversion, and repeat engagement in the dashboard.",
    ],
    kpis: [
      "Scan-to-visit rate",
      "Campaign conversion rate",
      "Top source location",
      "Repeat redemption rate",
    ],
    intelligenceTitle: "Brand campaign map",
    intelligenceDescription:
      "See where campaigns are being noticed and where they are leading to action.",
  },
  civic: {
    id: "civic",
    label: "Civic",
    shortLabel: "District layer",
    route: "/partners/civic",
    mapMode: "civic",
    icon: Landmark,
    eyebrow: "For civic groups",
    headline: "Make it easier for people to see what is happening and join in.",
    description:
      "Civic groups can use Downtown Perks to show district activity, public events, and useful local information in one place.",
    outcomes: [
      "Help more people find what is happening",
      "Keep public information useful and easy to understand",
      "Measure engagement by place and event type",
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
        body: "Keep district events and useful public information easy to find on the map.",
      },
      {
        title: "Participation design",
        body: "Use QR codes, event prompts, and building outreach to help more people show up.",
      },
      {
        title: "Measurement and governance",
        body: "Track opens, RSVPs, visits, and where engagement is coming from.",
      },
    ],
    workflow: [
      "Set up the district, initiative, or public moment.",
      "Put it on the map with events, guidance, and outreach points.",
      "Use the dashboard to see what people are responding to.",
    ],
    kpis: [
      "District engagement",
      "Event turnout",
      "Top source locations",
      "Repeat local use",
    ],
    intelligenceTitle: "Civic district intelligence map",
    intelligenceDescription:
      "See where events are active, where engagement is growing, and where more visibility is needed.",
  },
};

export const PARTNER_LANDING_SECTIONS = [
  {
    title: "Let people browse first",
    body: "People open the map, look around, and see what is nearby right away. The card, sign-up, and scan steps only appear when they want to save, RSVP, or redeem.",
    icon: Route,
  },
  {
    title: "Show up when the choice is happening",
    body: "The map works because it puts your place, offer, or event in front of someone while they are already downtown and already deciding what to do next.",
    icon: Users,
  },
  {
    title: "See what worked and what to change",
    body: "The dashboard turns scans, saves, RSVPs, visits, and redemptions into something simple: what is working now, what needs help, and what to do next.",
    icon: BarChart3,
  },
];

export const PARTNER_PLATFORM_MODULES = [
  {
    title: "Progressive-access resident flow",
    body: "Let people browse first, then unlock saves, RSVP, the card, and redemption when they need it.",
  },
  {
    title: "Dynamic QR infrastructure",
    body: "Track where each QR scan came from, including the building, venue, campaign, and timing.",
  },
  {
    title: "Partner offer manager",
    body: "Manage offers, events, listings, timing, and visibility from one place.",
  },
  {
    title: "Attribution and loyalty signals",
    body: "See what brings people back and which locations are doing the most work.",
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
      {
        name: "Inspired Closets Austin",
        route: "/brands/inspired-closets-austin",
        summary: "Home-services brand tied to downtown move-ins, upgrades, and everyday resident needs.",
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
        summary: "Mixed-use example showing how building value and neighborhood value work together.",
      },
    ],
  },
];

export const PARTNER_DASHBOARD_LINK = "/partners/dashboard";
