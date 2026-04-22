import { adaptEntityToInsightCard, adaptEntityToInsightPin } from "@/lib/mappers/sharedMapMappers";

const RAW_PARTNER_INSIGHTS = [
  {
    id: "insight-quincy-engagement",
    title: "West 6th resident engagement cluster",
    insightType: "engagement",
    partnerType: "property",
    latitude: 30.268,
    longitude: -97.746,
    value: 214,
    label: "214 interactions",
    summary: "The Quincy and nearby residential nodes are driving saves, scans, and happy-hour discovery.",
    linkedEntityIds: ["quincy", "halfstep"],
  },
  {
    id: "insight-seaholm-opportunity",
    title: "Seaholm coffee and lunch opportunity",
    insightType: "opportunity",
    partnerType: "property",
    latitude: 30.27,
    longitude: -97.751,
    value: 36,
    label: "36 saves",
    summary: "Residents near Seaholm are repeatedly searching coffee, lunch, and weekday reset moments.",
    linkedEntityIds: ["seaholm", "merit"],
  },
  {
    id: "insight-rainey-venue-performance",
    title: "Rainey venue conversion corridor",
    insightType: "performance",
    partnerType: "venue",
    latitude: 30.258,
    longitude: -97.737,
    value: 96,
    label: "96 redemptions",
    summary: "Bars and restaurants around Rainey are converting late-day intent into saves, visits, and redemptions.",
    linkedEntityIds: ["bangers", "halfstep", "vanzandt"],
  },
  {
    id: "insight-congress-coverage",
    title: "Congress coverage gap",
    insightType: "coverage",
    partnerType: "venue",
    latitude: 30.266,
    longitude: -97.743,
    value: 8,
    label: "8 searches",
    summary: "Congress searches are active, but coverage is thin outside dining and wellness partners.",
    linkedEntityIds: ["equinox", "hestia"],
  },
  {
    id: "insight-hospitality-guest-flow",
    title: "Hospitality guest-local crossover",
    insightType: "engagement",
    partnerType: "hospitality",
    latitude: 30.264,
    longitude: -97.74,
    value: 612,
    label: "612 guest saves",
    summary: "Hotel QR entries are pushing guests into nearby dining, waterfront events, and evening venues.",
    linkedEntityIds: ["vanzandt", "fairmont", "proper"],
  },
  {
    id: "insight-brand-activation-zone",
    title: "Brand activation zone",
    insightType: "campaign",
    partnerType: "brand",
    latitude: 30.267,
    longitude: -97.744,
    value: 52,
    label: "52% retention",
    summary: "Campaign reach clusters around events, mixed-use buildings, and venues with active offers.",
    linkedEntityIds: ["brand-yeti", "brand-rivian"],
  },
  {
    id: "insight-civic-event-density",
    title: "Civic event density",
    insightType: "engagement",
    partnerType: "civic",
    latitude: 30.272,
    longitude: -97.739,
    value: 184,
    label: "184 RSVPs",
    summary: "District programming near Waterloo and the waterfront is creating measurable RSVP and foot-traffic lift.",
    linkedEntityIds: ["waterloo", "civic-events"],
  },
];

export function getPartnerInsightPins({ partnerType = "dashboard" } = {}) {
  const filtered =
    partnerType && partnerType !== "dashboard"
      ? RAW_PARTNER_INSIGHTS.filter(
          (item) => item.partnerType === partnerType || item.partnerType === "dashboard"
        )
      : RAW_PARTNER_INSIGHTS;

  return filtered.map(adaptEntityToInsightPin).filter(Boolean);
}

export function getPartnerInsightCards(options = {}) {
  return getPartnerInsightPins(options).map(adaptEntityToInsightCard).filter(Boolean);
}

export function getPartnerInsightSummary(options = {}) {
  const items = getPartnerInsightPins(options);
  return {
    interactions: items.reduce((sum, item) => sum + Number(item.value || 0), 0),
    activeZones: items.length,
    topInsight: items[0]?.title || "Downtown partner intelligence",
  };
}
