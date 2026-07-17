export interface DowntownPerksCollectionSeed {
  id: string;
  type: "collection";
  label: string;
  residentLabel: string;
  description: string;
  defaultFilter: string;
  priority: number;
  contains: Array<"entity" | "route" | "campaign" | "event" | "perk">;
  powers: Array<"resident-map" | "partner-workspace" | "marketing" | "resident-onboarding" | "ai" | "qr" | "reports" | "campaigns">;
  entityRules: Record<string, unknown>;
}

export const downtownPerksCollectionSeeds: DowntownPerksCollectionSeed[] = [
  {
    id: "downtown-perks-featured",
    type: "collection",
    label: "Downtown Perks Map",
    residentLabel: "Featured",
    description: "Launch partners, resident anchors, current perks, events and routes across downtown Austin.",
    defaultFilter: "Featured",
    priority: 100,
    contains: ["entity", "route", "campaign", "event", "perk"],
    powers: ["resident-map", "partner-workspace", "marketing", "resident-onboarding", "ai", "qr", "reports", "campaigns"],
    entityRules: {
      operationalStatus: "active",
      publicVisibility: true,
      any: [{ launchPriority: true }, { partnerTier: 1 }, { activeCampaign: true }],
    },
  },
  {
    id: "resident-benefits",
    type: "collection",
    label: "Resident Benefits",
    residentLabel: "Perks",
    description: "Active Downtown Perks benefits and participating places.",
    defaultFilter: "Perks",
    priority: 90,
    contains: ["entity", "perk", "campaign"],
    powers: ["resident-map", "partner-workspace", "ai", "qr", "reports", "campaigns"],
    entityRules: {
      hasActivePerk: true,
      publicVisibility: true,
    },
  },
  {
    id: "events-nearby",
    type: "collection",
    label: "Events Nearby",
    residentLabel: "Events",
    description: "Upcoming events, music, markets and neighborhood activations.",
    defaultFilter: "Events",
    priority: 85,
    contains: ["entity", "event", "campaign"],
    powers: ["resident-map", "partner-workspace", "marketing", "ai", "reports", "campaigns"],
    entityRules: {
      entityType: "event",
      status: "upcoming",
    },
  },
  {
    id: "downtown-dining",
    type: "collection",
    label: "Downtown Dining",
    residentLabel: "Dining",
    description: "Restaurants, coffee, patios and resident dining access.",
    defaultFilter: "Dining",
    priority: 80,
    contains: ["entity", "perk", "route", "campaign"],
    powers: ["resident-map", "partner-workspace", "marketing", "ai", "qr", "reports", "campaigns"],
    entityRules: {
      categories: ["dining", "coffee", "nightlife"],
      operationalStatus: "active",
    },
  },
  {
    id: "buildings-and-residences",
    type: "collection",
    label: "Buildings & Residences",
    residentLabel: "Properties",
    description: "Residential, mixed-use, hotel and property anchors.",
    defaultFilter: "Buildings",
    priority: 75,
    contains: ["entity", "perk", "campaign"],
    powers: ["resident-map", "partner-workspace", "marketing", "resident-onboarding", "ai", "reports", "campaigns"],
    entityRules: {
      entityTypes: ["property", "building", "hotel", "real-estate"],
    },
  },
  {
    id: "walking-routes",
    type: "collection",
    label: "Walking Routes",
    residentLabel: "Routes",
    description: "Curated Downtown Perks journeys and connected route stops.",
    defaultFilter: "Routes",
    priority: 70,
    contains: ["entity", "route", "campaign"],
    powers: ["resident-map", "partner-workspace", "marketing", "resident-onboarding", "ai", "qr", "reports", "campaigns"],
    entityRules: {
      entityTypes: ["route", "route-stop"],
    },
  },
];
