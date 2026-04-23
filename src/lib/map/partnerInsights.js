import { adaptEntityToInsightCard, adaptEntityToInsightPin } from "@/lib/mappers/sharedMapMappers";

const RAW_PARTNER_INSIGHTS = [
  {
    id: "venue-le-cafe-crepe",
    title: "Le Cafe Crepe",
    insightType: "performance",
    partnerType: "venue",
    entityType: "venue",
    latitude: 30.2678,
    longitude: -97.7429,
    district: "Congress",
    address: "200 Congress Ave",
    label: "Leading redemptions",
    summary: "Breakfast and coffee traffic is converting early from nearby residential towers and office walkups.",
    shortInsight: "Strong morning conversion from Seaholm and Congress residents",
    recommendedAction: "Extend the breakfast perk window by one hour and keep coffee visibility high through 11 AM.",
    trend: { direction: "up", delta: "+18%", window: "since 7 AM" },
    metrics: {
      impressions: 2280,
      visits: 412,
      saves: 168,
      redemptions: 301,
      conversionRate: 73,
      repeatRate: 36,
      activePerks: 3,
      activeEvents: 0,
      activeMembers: 54,
    },
    sourceBreakdown: [
      { label: "The Independent", value: 29 },
      { label: "Seaholm residents", value: 24 },
      { label: "Congress offices", value: 18 },
    ],
    relatedEvents: [],
    tags: ["coffee", "breakfast", "morning peak"],
  },
  {
    id: "venue-bangers-rainey",
    title: "Banger's",
    insightType: "performance",
    partnerType: "venue",
    entityType: "venue",
    latitude: 30.2592,
    longitude: -97.7393,
    district: "Rainey",
    address: "79 Rainey St",
    label: "Top performer tonight",
    summary: "Evening traffic on Rainey is driving a high save-to-redemption rate with hotel and residential crossover.",
    shortInsight: "High conversion from nearby residents and hotel guests",
    recommendedAction: "Extend the active offer window through late evening and increase visibility around live music hours.",
    trend: { direction: "up", delta: "+31%", window: "since 4 PM" },
    metrics: {
      impressions: 2410,
      visits: 682,
      saves: 318,
      redemptions: 143,
      conversionRate: 21,
      repeatRate: 29,
      activePerks: 4,
      activeEvents: 1,
      activeMembers: 88,
    },
    sourceBreakdown: [
      { label: "Hotel Van Zandt guests", value: 29 },
      { label: "Rainey towers", value: 27 },
      { label: "Event spillover", value: 19 },
    ],
    relatedEvents: [{ label: "Live music spillover", value: "84 RSVPs nearby" }],
    tags: ["nightlife", "late-day", "conversion"],
  },
  {
    id: "property-the-shore",
    title: "The Shore",
    insightType: "engagement",
    partnerType: "property",
    entityType: "building",
    latitude: 30.2584,
    longitude: -97.7383,
    district: "Rainey",
    address: "603 Davis St",
    label: "Resident demand cluster",
    summary: "Residents activate toward Rainey in the evening and skew toward dining, drinks, and event-led plans.",
    shortInsight: "Residents strongly activate toward the Rainey corridor in evenings",
    recommendedAction: "Add two to three more perks within a five-minute radius and push weekday activation to balance the weekend spike.",
    trend: { direction: "up", delta: "+22%", window: "last 2 hours" },
    metrics: {
      impressions: 1840,
      visits: 462,
      saves: 214,
      redemptions: 76,
      conversionRate: 25,
      repeatRate: 34,
      activePerks: 6,
      activeEvents: 2,
      activeMembers: 186,
    },
    sourceBreakdown: [
      { label: "Rainey dining", value: 62 },
      { label: "Coffee destinations", value: 18 },
      { label: "Waterfront walkups", value: 11 },
    ],
    relatedEvents: [{ label: "Cocktail class", value: "34 RSVPs" }],
    tags: ["resident origin", "after work", "repeat behavior"],
  },
  {
    id: "zone-seaholm-opportunity",
    title: "Seaholm zone",
    insightType: "opportunity",
    partnerType: "property",
    entityType: "zone",
    latitude: 30.2697,
    longitude: -97.7512,
    district: "Seaholm",
    address: "Seaholm district core",
    label: "High demand, low coverage",
    summary: "Morning and lunch searches are frequent here, but offer density drops outside a small number of anchors.",
    shortInsight: "Demand exists, but there are not enough nearby offers",
    recommendedAction: "Add coffee and lunch partners, then introduce a weekday perk cluster to capture morning activity.",
    trend: { direction: "up", delta: "+18%", window: "today vs yesterday" },
    metrics: {
      impressions: 1260,
      visits: 284,
      saves: 136,
      redemptions: 34,
      conversionRate: 12,
      repeatRate: 28,
      activePerks: 1,
      activeEvents: 0,
      activeMembers: 92,
    },
    sourceBreakdown: [
      { label: "The Independent", value: 32 },
      { label: "Seaholm offices", value: 26 },
      { label: "Trail walkups", value: 15 },
    ],
    relatedEvents: [],
    tags: ["coffee", "lunch", "coverage gap"],
  },
  {
    id: "hotel-van-zandt",
    title: "Hotel Van Zandt",
    insightType: "engagement",
    partnerType: "hospitality",
    entityType: "hotel",
    latitude: 30.2586,
    longitude: -97.7396,
    district: "Rainey",
    address: "605 Davis St",
    label: "Strong guest-local flow",
    summary: "Guests are choosing drinks, live music, and rooftop destinations within a short walking radius.",
    shortInsight: "Guests favor nightlife and short walking distance experiences",
    recommendedAction: "Highlight three nightlife partners in the lobby QR flow and add a late-night perk bundle.",
    trend: { direction: "up", delta: "+19%", window: "this week" },
    metrics: {
      impressions: 1984,
      visits: 544,
      saves: 188,
      redemptions: 74,
      conversionRate: 41,
      repeatRate: 27,
      activePerks: 5,
      activeEvents: 2,
      activeMembers: 92,
    },
    sourceBreakdown: [
      { label: "Lobby QR", value: 33 },
      { label: "Room QR", value: 28 },
      { label: "Concierge handoff", value: 12 },
    ],
    relatedEvents: [{ label: "Rooftop before the show", value: "27 guest opens" }],
    tags: ["hospitality", "guest flow", "nightlife"],
  },
  {
    id: "hotel-four-seasons",
    title: "Four Seasons Hotel Austin",
    insightType: "performance",
    partnerType: "hospitality",
    entityType: "hotel",
    latitude: 30.2637,
    longitude: -97.7406,
    district: "Waterfront",
    address: "98 San Jacinto Blvd",
    label: "High-value guest intent",
    summary: "Waterfront and dining recommendations are converting well from premium guest traffic with a slightly longer walking radius.",
    shortInsight: "Guests convert best on dining, rooftop, and waterfront event choices",
    recommendedAction: "Bundle three premium downtown stops into the guest flow and keep evening events prominent.",
    trend: { direction: "up", delta: "+14%", window: "this week" },
    metrics: {
      impressions: 1720,
      visits: 394,
      saves: 121,
      redemptions: 59,
      conversionRate: 41,
      repeatRate: 24,
      activePerks: 4,
      activeEvents: 3,
      activeMembers: 61,
    },
    sourceBreakdown: [
      { label: "Lobby staff handoff", value: 31 },
      { label: "Guest QR card", value: 26 },
      { label: "Waterfront events", value: 18 },
    ],
    relatedEvents: [{ label: "Comedy Mothership", value: "18 booked walks" }],
    tags: ["guest flow", "premium", "waterfront"],
  },
  {
    id: "brand-yeti-activation",
    title: "YETI Pop-Up Activation",
    insightType: "campaign",
    partnerType: "brand",
    entityType: "campaign",
    latitude: 30.2671,
    longitude: -97.7442,
    district: "Rainey to 2nd",
    address: "Activation corridor",
    label: "Campaign lift zone",
    summary: "Campaign scans and revisits cluster around mixed-use buildings, event tie-ins, and hospitality sources.",
    shortInsight: "Strong engagement is being driven by event spillover traffic",
    recommendedAction: "Extend the activation during the evening peak and replicate the format in the Seaholm corridor.",
    trend: { direction: "up", delta: "+26%", window: "campaign week" },
    metrics: {
      impressions: 6240,
      visits: 1240,
      saves: 312,
      redemptions: 118,
      conversionRate: 10,
      repeatRate: 32,
      activePerks: 1,
      activeEvents: 2,
      activeMembers: 312,
    },
    sourceBreakdown: [
      { label: "Event QR", value: 37 },
      { label: "Mixed-use towers", value: 24 },
      { label: "Venue placements", value: 18 },
    ],
    relatedEvents: [{ label: "Peak window", value: "5 PM - 8 PM" }],
    tags: ["brand", "campaign", "event-driven"],
  },
  {
    id: "brand-rivian-seaholm",
    title: "Rivian Activation",
    insightType: "campaign",
    partnerType: "brand",
    entityType: "campaign",
    latitude: 30.2689,
    longitude: -97.7508,
    district: "Seaholm",
    address: "Seaholm trail edge",
    label: "High lifestyle fit",
    summary: "Engagement is clustering where trail movement, coffee routes, and residential density overlap.",
    shortInsight: "High engagement near trail and coffee routes",
    recommendedAction: "Deploy a second activation in Seaholm and pair it with morning fitness and coffee touchpoints.",
    trend: { direction: "up", delta: "+16%", window: "this week" },
    metrics: {
      impressions: 4180,
      visits: 812,
      saves: 204,
      redemptions: 97,
      conversionRate: 12,
      repeatRate: 28,
      activePerks: 1,
      activeEvents: 1,
      activeMembers: 188,
    },
    sourceBreakdown: [
      { label: "Trail walkers", value: 33 },
      { label: "Coffee routes", value: 21 },
      { label: "The Independent", value: 19 },
    ],
    relatedEvents: [{ label: "Morning demo block", value: "52 scans" }],
    tags: ["brand", "trail", "coffee route"],
  },
  {
    id: "civic-rainey-district",
    title: "Rainey Street District",
    insightType: "engagement",
    partnerType: "civic",
    entityType: "district",
    latitude: 30.2591,
    longitude: -97.7392,
    district: "Rainey",
    address: "Rainey Street district core",
    label: "High district activity",
    summary: "District-wide demand is strong, but performance is uneven across participating venues and event nodes.",
    shortInsight: "High density engagement with uneven distribution across venues",
    recommendedAction: "Promote underperforming venues through perk visibility and cluster activations around live events.",
    trend: { direction: "up", delta: "+24%", window: "this week" },
    metrics: {
      impressions: 4820,
      visits: 1120,
      saves: 620,
      redemptions: 620,
      conversionRate: 55,
      repeatRate: 22,
      activePerks: 9,
      activeEvents: 3,
      activeMembers: 420,
    },
    sourceBreakdown: [
      { label: "Rainey towers", value: 28 },
      { label: "Hotel guests", value: 22 },
      { label: "Weekend walkups", value: 17 },
    ],
    relatedEvents: [{ label: "Events live", value: "3 district events" }],
    tags: ["civic", "district", "events"],
  },
  {
    id: "civic-waterloo-events",
    title: "Waterloo Park programming",
    insightType: "engagement",
    partnerType: "civic",
    entityType: "event",
    latitude: 30.2722,
    longitude: -97.7395,
    district: "Waterloo",
    address: "Waterloo Park",
    label: "Participation lift",
    summary: "Event RSVPs and repeat opens are strongest where district programming is dense and easy to find from the map.",
    shortInsight: "Programming density is lifting repeat participation",
    recommendedAction: "Increase visibility for nearby initiatives with low RSVP follow-through and keep evening programming grouped.",
    trend: { direction: "up", delta: "+17%", window: "this week" },
    metrics: {
      impressions: 2860,
      visits: 790,
      saves: 184,
      redemptions: 63,
      conversionRate: 22,
      repeatRate: 22,
      activePerks: 0,
      activeEvents: 3,
      activeMembers: 184,
    },
    sourceBreakdown: [
      { label: "District homepage", value: 31 },
      { label: "Nearby residents", value: 23 },
      { label: "Waterfront visitors", value: 16 },
    ],
    relatedEvents: [{ label: "RSVPs", value: "84 active RSVPs" }],
    tags: ["civic", "events", "participation"],
  },
];

const PARTNER_SUMMARY_DEFAULTS = {
  dashboard: {
    peakWindow: "6:30 PM - 8:00 PM",
    recentActions: 3,
    leader: "Rainey Street leading activity",
    summary: "Live venue intelligence is strongest where buildings, hotels, events, and offers overlap.",
  },
  property: {
    peakWindow: "6:00 PM - 8:30 PM",
    recentActions: 2,
    leader: "Rainey corridor leading resident activation",
    summary: "Residential demand is strongest after work when nearby offers are visible and walkable.",
  },
  hospitality: {
    peakWindow: "5:00 PM - 8:00 PM",
    recentActions: 3,
    leader: "Guest traffic is concentrating around nightlife and waterfront routes",
    summary: "Hotels perform best when dining, music, and short-walk plans are surfaced at the right moment.",
  },
  venue: {
    peakWindow: "4:30 PM - 7:30 PM",
    recentActions: 3,
    leader: "Banger's leading redemptions tonight",
    summary: "Venue performance accelerates when nearby residents and hotel guests are already deciding where to go.",
  },
  brand: {
    peakWindow: "5:00 PM - 8:00 PM",
    recentActions: 4,
    leader: "YETI activation leading event-linked engagement",
    summary: "Brand lift is strongest when activations tie directly to districts, events, and live map behavior.",
  },
  civic: {
    peakWindow: "6:00 PM - 9:00 PM",
    recentActions: 2,
    leader: "Waterloo and Rainey are driving participation",
    summary: "Civic participation rises when districts, initiatives, and nearby venue activity are easy to discover together.",
  },
};

function scopedItems(partnerType = "dashboard") {
  return partnerType && partnerType !== "dashboard"
    ? RAW_PARTNER_INSIGHTS.filter((item) => item.partnerType === partnerType)
    : RAW_PARTNER_INSIGHTS;
}

function weightedRate(items, metricKey, weightKey) {
  const weighted = items.reduce(
    (acc, item) => {
      const rate = Number(item.metrics?.[metricKey] || 0);
      const weight = Number(item.metrics?.[weightKey] || 0);
      acc.total += rate * weight;
      acc.weight += weight;
      return acc;
    },
    { total: 0, weight: 0 }
  );

  if (!weighted.weight) return 0;
  return Math.round(weighted.total / weighted.weight);
}

export function getPartnerInsightPins({ partnerType = "dashboard" } = {}) {
  return scopedItems(partnerType).map(adaptEntityToInsightPin).filter(Boolean);
}

export function getPartnerInsightCards(options = {}) {
  return getPartnerInsightPins(options).map(adaptEntityToInsightCard).filter(Boolean);
}

export function getPartnerInsightSummary({ partnerType = "dashboard" } = {}) {
  const items = getPartnerInsightPins({ partnerType });
  const defaults = PARTNER_SUMMARY_DEFAULTS[partnerType] || PARTNER_SUMMARY_DEFAULTS.dashboard;

  const totals = items.reduce(
    (acc, item) => {
      acc.interactions += Number(item.metrics?.visits || 0);
      acc.impressions += Number(item.metrics?.impressions || 0);
      acc.redemptions += Number(item.metrics?.redemptions || 0);
      acc.activePerks += Number(item.metrics?.activePerks || 0);
      acc.activeEvents += Number(item.metrics?.activeEvents || 0);
      acc.activeMembers += Number(item.metrics?.activeMembers || 0);
      return acc;
    },
    {
      interactions: 0,
      impressions: 0,
      redemptions: 0,
      activePerks: 0,
      activeEvents: 0,
      activeMembers: 0,
    }
  );

  return {
    interactions: totals.interactions,
    impressions: totals.impressions,
    redemptions: totals.redemptions,
    activePerks: totals.activePerks,
    activeEvents: totals.activeEvents,
    activeMembers: totals.activeMembers,
    activeZones: items.length,
    partnerLocations: items.filter((item) => ["venue", "building", "hotel", "campaign", "district", "event"].includes(item.entityType)).length,
    conversionRate: weightedRate(items, "conversionRate", "visits"),
    repeatRate: weightedRate(items, "repeatRate", "visits"),
    topInsight: items[0]?.shortInsight || items[0]?.title || "Downtown partner intelligence",
    peakWindow: defaults.peakWindow,
    recentActions: defaults.recentActions,
    leadingLabel: defaults.leader,
    narrative: defaults.summary,
  };
}

export function getPartnerActivityFeed({ partnerType = "dashboard" } = {}) {
  const items = scopedItems(partnerType)
    .slice()
    .sort((a, b) => Number(b.metrics?.visits || 0) - Number(a.metrics?.visits || 0));

  return items.slice(0, 4).map((item, index) => ({
    id: `${item.id}-activity`,
    title:
      index === 0
        ? `${item.title} leading`
        : item.entityType === "event"
          ? `${item.title} drawing RSVP activity`
          : `${item.title} active now`,
    detail:
      item.entityType === "hotel"
        ? `${item.metrics?.visits || 0} guest interactions this week`
        : item.entityType === "building"
          ? `${item.metrics?.activeMembers || 0} resident actions this week`
          : item.entityType === "campaign"
            ? `${item.metrics?.redemptions || 0} conversions from activation traffic`
            : `${item.metrics?.redemptions || 0} recent redemptions`,
    entityId: item.id,
  }));
}
