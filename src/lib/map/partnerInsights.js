import { adaptEntityToInsightCard, adaptEntityToInsightPin } from "@/lib/mappers/sharedMapMappers";

const RAW_PARTNER_INSIGHTS = [
  {
    id: "insight-quincy-engagement",
    title: "Quincy resident demand cluster",
    insightType: "engagement",
    partnerType: "property",
    entityType: "building",
    latitude: 30.268,
    longitude: -97.746,
    district: "West 6th",
    address: "91 Red River St",
    label: "High resident activity",
    summary: "Residents near Quincy are opening the map after work, saving happy-hour venues, and returning for repeat perk use.",
    shortInsight: "Strong evening demand from nearby residents",
    recommendedAction: "Target nearby buildings with an after-work perk window.",
    trend: { direction: "up", delta: "+22%", window: "last 2 hours" },
    metrics: {
      impressions: 1840,
      visits: 462,
      saves: 214,
      redemptions: 76,
      conversionRate: 25,
      repeatRate: 34,
    },
    sourceBreakdown: [
      { label: "The Quincy", value: 38 },
      { label: "The Bowie", value: 24 },
      { label: "West 6th organic", value: 18 },
    ],
    tags: ["after work", "resident origin", "repeat behavior"],
  },
  {
    id: "insight-seaholm-opportunity",
    title: "Seaholm lunch opportunity",
    insightType: "opportunity",
    partnerType: "property",
    entityType: "zone",
    latitude: 30.27,
    longitude: -97.751,
    district: "Seaholm",
    address: "Seaholm district core",
    label: "High demand, low coverage",
    summary: "Lunch and coffee searches are frequent here, but partner visibility drops outside two anchors.",
    shortInsight: "Demand is present but partner coverage is thin",
    recommendedAction: "Launch a timed lunch perk and increase map visibility in this zone.",
    trend: { direction: "up", delta: "+18%", window: "today vs yesterday" },
    metrics: {
      impressions: 1260,
      visits: 284,
      saves: 136,
      redemptions: 34,
      conversionRate: 12,
      repeatRate: 28,
    },
    sourceBreakdown: [
      { label: "The Independent", value: 32 },
      { label: "Seaholm offices", value: 26 },
      { label: "Waterfront walkups", value: 15 },
    ],
    tags: ["coffee", "lunch", "coverage gap"],
  },
  {
    id: "insight-rainey-venue-performance",
    title: "Rainey conversion corridor",
    insightType: "performance",
    partnerType: "venue",
    entityType: "venue",
    latitude: 30.258,
    longitude: -97.737,
    district: "Rainey",
    address: "Rainey Street corridor",
    label: "Top performer tonight",
    summary: "Late-day demand on Rainey is converting into saves, opens, and redemptions faster than the district average.",
    shortInsight: "High conversion from nearby residents and hotel guests",
    recommendedAction: "Extend the active offer window through late evening.",
    trend: { direction: "up", delta: "+31%", window: "since 4 PM" },
    metrics: {
      impressions: 2410,
      visits: 682,
      saves: 318,
      redemptions: 143,
      conversionRate: 21,
      repeatRate: 29,
    },
    sourceBreakdown: [
      { label: "Van Zandt guests", value: 29 },
      { label: "Rainey towers", value: 27 },
      { label: "Event spillover", value: 19 },
    ],
    tags: ["nightlife", "late-day", "conversion"],
  },
  {
    id: "insight-congress-coverage",
    title: "Congress visibility gap",
    insightType: "coverage",
    partnerType: "venue",
    entityType: "zone",
    latitude: 30.266,
    longitude: -97.743,
    district: "Congress",
    address: "Congress and 2nd",
    label: "Low presence nearby",
    summary: "Searches and opens are active here, but only a narrow set of categories have map presence.",
    shortInsight: "Good foot traffic, weak category coverage",
    recommendedAction: "Activate a wellness or daytime offer to cover the gap.",
    trend: { direction: "flat", delta: "+3%", window: "this week" },
    metrics: {
      impressions: 980,
      visits: 210,
      saves: 88,
      redemptions: 21,
      conversionRate: 10,
      repeatRate: 17,
    },
    sourceBreakdown: [
      { label: "Congress foot traffic", value: 34 },
      { label: "Office towers", value: 22 },
      { label: "Convention visitors", value: 11 },
    ],
    tags: ["coverage", "wellness", "daytime"],
  },
  {
    id: "insight-hospitality-guest-flow",
    title: "Hotel guest crossover",
    insightType: "engagement",
    partnerType: "hospitality",
    entityType: "hotel",
    latitude: 30.264,
    longitude: -97.74,
    district: "Waterfront",
    address: "Downtown hotel cluster",
    label: "Strong guest-local flow",
    summary: "Guest QR opens are strongest from lobby and room placements, with dining and waterfront events leading behavior.",
    shortInsight: "Guests are converting on dining and waterfront events",
    recommendedAction: "Add a concierge-ready perk set for evening arrivals.",
    trend: { direction: "up", delta: "+19%", window: "this week" },
    metrics: {
      impressions: 1984,
      visits: 544,
      saves: 188,
      redemptions: 74,
      conversionRate: 14,
      repeatRate: 27,
    },
    sourceBreakdown: [
      { label: "Room QR", value: 41 },
      { label: "Lobby QR", value: 28 },
      { label: "Concierge handoff", value: 12 },
    ],
    tags: ["hospitality", "guest flow", "waterfront"],
  },
  {
    id: "insight-brand-activation-zone",
    title: "Rainey activation zone",
    insightType: "campaign",
    partnerType: "brand",
    entityType: "campaign",
    latitude: 30.267,
    longitude: -97.744,
    district: "Rainey to 2nd",
    address: "Activation corridor",
    label: "Campaign lift zone",
    summary: "Campaign scans and revisits cluster around mixed-use buildings, event tie-ins, and hospitality sources.",
    shortInsight: "Best brand performance is event-linked",
    recommendedAction: "Pair the activation with live event windows and branded perk unlocks.",
    trend: { direction: "up", delta: "+26%", window: "campaign week" },
    metrics: {
      impressions: 6240,
      visits: 1210,
      saves: 402,
      redemptions: 168,
      conversionRate: 13,
      repeatRate: 32,
    },
    sourceBreakdown: [
      { label: "Event QR", value: 37 },
      { label: "Mixed-use towers", value: 24 },
      { label: "Venue placements", value: 18 },
    ],
    tags: ["brand", "campaign", "event-driven"],
  },
  {
    id: "insight-civic-event-density",
    title: "Waterloo participation lift",
    insightType: "engagement",
    partnerType: "civic",
    entityType: "district",
    latitude: 30.272,
    longitude: -97.739,
    district: "Waterloo",
    address: "Waterloo and Red River",
    label: "High civic activity",
    summary: "Event RSVPs and repeat opens are strongest where district programming is dense and easy to find from the map.",
    shortInsight: "Programming density is lifting repeat participation",
    recommendedAction: "Increase visibility for nearby initiatives with low RSVP follow-through.",
    trend: { direction: "up", delta: "+17%", window: "this week" },
    metrics: {
      impressions: 2860,
      visits: 790,
      saves: 184,
      redemptions: 0,
      conversionRate: 28,
      repeatRate: 22,
    },
    sourceBreakdown: [
      { label: "District homepage", value: 31 },
      { label: "Nearby residents", value: 23 },
      { label: "Waterfront visitors", value: 16 },
    ],
    tags: ["civic", "events", "participation"],
  },
];

export function getPartnerInsightPins({ partnerType = "dashboard" } = {}) {
  const filtered =
    partnerType && partnerType !== "dashboard"
      ? RAW_PARTNER_INSIGHTS.filter((item) => item.partnerType === partnerType)
      : RAW_PARTNER_INSIGHTS;

  return filtered.map(adaptEntityToInsightPin).filter(Boolean);
}

export function getPartnerInsightCards(options = {}) {
  return getPartnerInsightPins(options).map(adaptEntityToInsightCard).filter(Boolean);
}

export function getPartnerInsightSummary(options = {}) {
  const items = getPartnerInsightPins(options);
  const totals = items.reduce(
    (acc, item) => {
      acc.interactions += Number(item.metrics?.visits || 0);
      acc.impressions += Number(item.metrics?.impressions || 0);
      acc.redemptions += Number(item.metrics?.redemptions || 0);
      return acc;
    },
    { interactions: 0, impressions: 0, redemptions: 0 }
  );

  return {
    interactions: totals.interactions,
    impressions: totals.impressions,
    redemptions: totals.redemptions,
    activeZones: items.length,
    topInsight: items[0]?.shortInsight || items[0]?.title || "Downtown partner intelligence",
  };
}
