import { ROUTES } from "@/lib/routes";

export const PARTNER_SYSTEM_ROLES = [
  {
    id: "properties",
    label: "Residential",
    href: ROUTES.partnerProperties,
    title: "Make your building feel connected",
    subtitle: "Give residents a reason to use what's around them",
    context:
      "People do not just want amenities inside the building. They want to feel connected to everything around it.",
    whatItGets: [
      "A live downtown map residents will actually open",
      "QR entry points across lobby, leasing, and welcome flow",
      "Nearby places, events, perks, and building context in one system",
    ],
    howItWorks: [
      "Residents open one map instead of a static amenity list.",
      "They see what is close, useful, and easy to walk to.",
      "You see what they actually use around the building.",
    ],
    ctaLabel: "Open properties view",
    mapMode: "property",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    href: ROUTES.partnerHospitality,
    title: "Extend the stay beyond the lobby",
    subtitle: "Give guests one clear downtown guide without extra friction",
    context:
      "Hotels spend a lot to shape the arrival experience. Downtown Perks helps the rest of the stay feel just as easy to use.",
    whatItGets: [
      "Guest-facing QR entry in rooms, lobby, and welcome flow",
      "Dining, events, nightlife, and wellness in one live map",
      "A better local handoff than a photocopied recommendation list",
    ],
    howItWorks: [
      "Guests scan once and know where to go next.",
      "The map keeps nearby options easy to compare in real time.",
      "Your team gets a clearer view of what guests actually use.",
    ],
    ctaLabel: "Open hospitality view",
    mapMode: "hospitality",
  },
  {
    id: "venues",
    label: "Venues",
    href: ROUTES.partnerVenues,
    title: "Show up when people are deciding",
    subtitle: "Right place, right moment, when someone nearby is choosing where to go",
    context:
      "When someone opens the map nearby, you show up. Not later. Not in a feed. Right when they are deciding.",
    whatItGets: [
      "Placement tied to proximity and live downtown intent",
      "Perks, offers, and events surfaced in the right moment",
      "Clear proof through scans, saves, visits, and redemptions",
    ],
    howItWorks: [
      "A nearby resident or guest opens the map.",
      "Your venue appears inside a decision already happening.",
      "The follow-through becomes measurable instead of guessed.",
    ],
    ctaLabel: "Open venues view",
    mapMode: "venue",
  },
  {
    id: "brands",
    label: "Brands",
    href: ROUTES.partnerBrands,
    title: "Be seen when it matters",
    subtitle: "Not ads. Presence at the moment someone is ready",
    context:
      "This is not broad reach. It is showing up when someone is nearby, interested, and already moving through downtown.",
    whatItGets: [
      "Corridor-based visibility tied to real movement and timing",
      "Brand, event, and campaign moments inside the live downtown layer",
      "Trackable actions instead of vague impression reporting",
    ],
    howItWorks: [
      "You choose the corridor, timing window, and activation.",
      "The campaign appears inside real downtown behavior.",
      "The map and dashboard show what actually happened next.",
    ],
    ctaLabel: "Open brands view",
    mapMode: "brand",
  },
  {
    id: "civic",
    label: "Civic",
    href: ROUTES.partnerCivic,
    title: "Make participation visible",
    subtitle: "Events, programs, and activity made easy to find and join",
    context:
      "If it is happening downtown, people should be able to see it instantly. The point is to reduce effort and increase participation.",
    whatItGets: [
      "District-wide visibility for events, initiatives, and programming",
      "A shared map people can open instead of searching across scattered sources",
      "Simple reporting on what gets noticed, opened, and used",
    ],
    howItWorks: [
      "Programs and events appear inside one downtown layer.",
      "People see what is nearby and what is happening now.",
      "Participation becomes easier to measure and easier to grow.",
    ],
    ctaLabel: "Open civic view",
    mapMode: "civic",
  },
];

export const PARTNER_SYSTEM_STEPS = [
  {
    title: "Context",
    body: "Start with the partner role and what it needs to make downtown easier to use.",
  },
  {
    title: "Map",
    body: "Keep the live map central so visibility, discovery, and action all happen in one place.",
  },
  {
    title: "Action",
    body: "Turn what people do into useful next steps instead of another disconnected reporting flow.",
  },
];

export function getPartnerRoleConfig(roleId) {
  return PARTNER_SYSTEM_ROLES.find((role) => role.id === roleId) || PARTNER_SYSTEM_ROLES[0];
}
