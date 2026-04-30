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
    audienceSummary:
      "For apartment communities, condo towers, mixed-use buildings, leasing teams, and portfolio groups that want the neighborhood to feel like part of the building.",
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
    storySlides: [
      {
        title: "The building becomes the front door.",
        body: "Lobby QR cards, welcome emails, leasing follow-up, and resident links all open the same downtown view. People do not have to hunt for what is nearby or download something new just to get started.",
        note: "Best for: move-ins, renewals, tours, daily resident use",
      },
      {
        title: "You are not just selling square footage.",
        body: "You are selling the coffee run, the dinner plan, the walkable gym, the late drink, the corner market, and the fact that downtown feels easy when you live there.",
        note: "Best for: leasing, retention, amenity positioning",
      },
      {
        title: "Resident value stays visible after move-in.",
        body: "The strongest buildings keep being useful after the lease is signed. This keeps the neighborhood active inside the resident experience instead of leaving it as a one-time tour talking point.",
        note: "Best for: retention, resident satisfaction, recurring use",
      },
    ],
    kpis: [
      "Card signups",
      "Building-led visits",
      "Weekly repeat use",
      "Perk unlocks",
    ],
    moduleReason:
      "Property teams need the resident path, the neighborhood layer, and the proof of use to live together. That is how the building keeps feeling useful after the first tour.",
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
    audienceSummary:
      "For hotels, concierge teams, hospitality groups, and guest-experience operators that want the stay to feel local from the minute someone checks in.",
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
    storySlides: [
      {
        title: "Arrival turns into orientation.",
        body: "Instead of handing over a static list, the hotel gives guests a live way to see coffee, dinner, nightlife, and what is happening tonight around the property.",
        note: "Best for: lobby, room QR, concierge, welcome text",
      },
      {
        title: "Guests decide faster when the map is tied to the hotel.",
        body: "Distance, timing, and what feels worth doing right now matter more than long recommendation lists. The map keeps that decision simple.",
        note: "Best for: first-night planning, weekend stays, quick orientation",
      },
      {
        title: "The hotel gets credit for sending people out well.",
        body: "You can see what guests opened, saved, and actually followed through on, which makes the local layer part of the guest experience instead of a vague add-on.",
        note: "Best for: guest satisfaction, local spend, partner relationships",
      },
    ],
    kpis: [
      "QR opens",
      "Guest saves",
      "Guest-to-visit rate",
      "Repeat local use",
    ],
    moduleReason:
      "Hospitality teams need the guest path to feel immediate. The hotel should be able to hand someone one clean neighborhood view and know whether it actually got used.",
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
    audienceSummary:
      "For restaurants, bars, cafes, wellness spots, retail, services, and local operators who want to show up at the exact moment nearby intent forms.",
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
    storySlides: [
      {
        title: "Bars and nightlife win before the night starts.",
        body: "When someone nearby is deciding between two or three places, being visible at that moment matters more than being loud all week.",
        note: "Best for: happy hour, live music, late-night traffic",
      },
      {
        title: "Dining works when the choice is easy.",
        body: "People should be able to see what the place is, how far it is, whether there is an offer, and why it is worth choosing right now.",
        note: "Best for: lunch, dinner, walk-up conversions",
      },
      {
        title: "Routine businesses stop getting buried.",
        body: "Coffee, wellness, services, and retail should appear in context as part of daily life, not disappear inside a generic directory.",
        note: "Best for: morning routines, repeat visits, weekday traffic",
      },
    ],
    kpis: [
      "Offer-to-redemption rate",
      "Repeat customer rate",
      "Busy-hour lift",
      "Map saves",
    ],
    moduleReason:
      "Venue teams need the basics to stay simple: show up clearly, give people one reason to choose you, and make it obvious later whether that worked.",
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
    audienceSummary:
      "For brands, sponsors, activations teams, and district partners who want their presence to feel useful instead of interruptive.",
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
    storySlides: [
      {
        title: "Brands show up inside useful moments.",
        body: "A strong brand placement feels like access, welcome, or a good local fit. It should not feel like the user got pulled into an ad break.",
        note: "Best for: welcome flows, local bundles, resident moments",
      },
      {
        title: "District context matters more than generic reach.",
        body: "Rainey, Seaholm, Red River, and the core all behave differently. The value is putting a brand in the right place at the right time, not blanketing the whole district the same way.",
        note: "Best for: corridor sponsorship, event timing, campaign focus",
      },
      {
        title: "The proof has to stay tied to the place.",
        body: "You should be able to see which building, event, or venue source actually moved the campaign forward, then adjust without waiting for a postmortem deck.",
        note: "Best for: sponsorship reporting, event recaps, repeat campaigns",
      },
    ],
    kpis: [
      "Scan-to-visit rate",
      "Campaign conversion rate",
      "Top source location",
      "Repeat redemption rate",
    ],
    moduleReason:
      "Brand teams need to see which placement was worth it. The useful part is the tie between a place, a moment, and an actual response.",
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
    headline: "Make participation visible.",
    description:
      "Civic groups can use Downtown Perks to show district activity, public events, and useful local information in one place.",
    audienceSummary:
      "For downtown organizations, civic groups, arts and culture teams, community partners, and public-facing programs that want participation to be easier to find and easier to measure.",
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
    storySlides: [
      {
        title: "Public programming becomes easier to find.",
        body: "Instead of expecting people to search across feeds and flyers, the event or district moment shows up right where they are already looking around downtown.",
        note: "Best for: markets, arts, festivals, district programming",
      },
      {
        title: "Participation gets easier when navigation is part of it.",
        body: "If people can see what is nearby, what is walkable, and where the energy already is, they are more likely to actually show up.",
        note: "Best for: turnout, neighborhood movement, district discovery",
      },
      {
        title: "The readout stays useful without getting invasive.",
        body: "Teams can look at opens, saves, RSVPs, and district activity in aggregate without turning the civic layer into personal surveillance.",
        note: "Best for: reporting, sponsor support, public accountability",
      },
    ],
    kpis: [
      "District engagement",
      "Event turnout",
      "Top source locations",
      "Repeat local use",
    ],
    moduleReason:
      "Civic teams need the district story to stay simple: what is live, who is finding it, and what is helping people participate more easily.",
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
