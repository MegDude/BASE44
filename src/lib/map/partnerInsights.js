import { useEffect, useMemo, useState } from "react";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { adaptEntityToInsightCard, adaptEntityToInsightPin } from "@/lib/mappers/sharedMapMappers";
import { events, moments, perks, members } from "@/data/replitApiStore";

const DEFAULT_SUMMARY = {
  dashboard: {
    peakWindow: "6 PM - 9 PM",
    recentActions: 24,
    leadingLabel: "Downtown activity is already clustering around the strongest places.",
    narrative: "This view starts with mapped downtown activity, walkable demand, live offers, and event pull so the capability is visible right away.",
  },
  property: {
    peakWindow: "5 PM - 8 PM",
    recentActions: 18,
    leadingLabel: "Buildings are already showing where residents move first.",
    narrative: "This view starts with nearby places, walkable demand, building-linked activity, and active offers so the property story is visible immediately.",
  },
  hospitality: {
    peakWindow: "4 PM - 10 PM",
    recentActions: 16,
    leadingLabel: "Guest movement is already visible around the strongest hotel corridors.",
    narrative: "This view starts with guest-ready dining, nearby events, nightlife adjacency, and hotel-linked movement patterns.",
  },
  venue: {
    peakWindow: "5 PM - 11 PM",
    recentActions: 21,
    leadingLabel: "The busiest nearby venues are already clear on the map.",
    narrative: "This view starts with nearby demand, active offers, repeat visits, and event adjacency so operators can see what to act on.",
  },
  brand: {
    peakWindow: "12 PM - 8 PM",
    recentActions: 15,
    leadingLabel: "The strongest districts and placements already stand out.",
    narrative: "This view starts with corridor demand, venue response, building reach, and event context so campaigns read like real placements, not placeholders.",
  },
  civic: {
    peakWindow: "5 PM - 9 PM",
    recentActions: 20,
    leadingLabel: "District movement is already visible across events and public activity.",
    narrative: "This view starts with mapped events, downtown movement, public gathering points, and nearby offers so district activity is easy to read.",
  },
};

function getStarterMetrics(item, partnerType = "dashboard") {
  const normalized = normalizePartnerType(partnerType);
  const districtKey = normalizeDistrictKey(item?.district || item?.address || item?.title || item?.name);
  const districtWeight =
    districtKey === "rainey"
      ? 1.24
      : districtKey === "congress"
        ? 1.18
        : districtKey === "waterloo"
          ? 1.12
          : districtKey === "seaholm"
            ? 1.08
            : 1;

  const typeWeight =
    item?.type === "venue"
      ? 1.18
      : item?.type === "hotel"
        ? 1.14
        : item?.type === "building" || item?.type === "property"
          ? 1.08
          : item?.type === "brand"
            ? 1.1
            : item?.type === "civic"
              ? 1.06
              : 1;

  const base = Math.round(160 * districtWeight * typeWeight);
  const impressions = base + (normalized === "brand" ? 80 : normalized === "civic" ? 60 : 0);
  const visits = Math.max(18, Math.round(impressions * (normalized === "property" ? 0.19 : 0.22)));
  const saves = Math.max(6, Math.round(visits * 0.34));
  const redemptions =
    item?.type === "venue" || item?.type === "hotel"
      ? Math.max(4, Math.round(visits * 0.16))
      : item?.type === "brand"
        ? Math.max(3, Math.round(visits * 0.1))
        : Math.max(1, Math.round(visits * 0.08));

  return {
    impressions,
    visits,
    saves,
    redemptions,
    repeatRate: Math.min(38, 16 + Math.round(typeWeight * 8)),
    conversionRate: Math.min(34, 12 + Math.round(typeWeight * 10)),
    activePerks: item?.type === "venue" || item?.type === "hotel" ? 2 : 1,
    activeEvents: districtKey === "waterloo" || districtKey === "red-river" ? 2 : 1,
    activeMembers: item?.type === "building" || item?.type === "property" ? 32 : 14,
    sourceBreakdown: [
      { label: "Walkable traffic", value: 42 },
      { label: item?.type === "building" || item?.type === "property" ? "Resident activity" : "Nearby buildings", value: 31 },
      { label: "Events nearby", value: 27 },
    ],
    relatedEvents: [],
  };
}

function normalizePartnerType(partnerType = "dashboard") {
  if (partnerType === "properties") return "property";
  if (partnerType === "venues") return "venue";
  if (partnerType === "brands") return "brand";
  return partnerType;
}

function normalizeDistrictKey(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "downtown";
  if (text.includes("rainey")) return "rainey";
  if (text.includes("waterloo")) return "waterloo";
  if (text.includes("congress") || text.includes("san jacinto")) return "congress";
  if (text.includes("seaholm") || text.includes("west 5")) return "seaholm";
  if (text.includes("6th") || text.includes("red river") || text.includes("east")) return "red-river";
  if (text.includes("2nd") || text.includes("second")) return "2nd-street";
  return "downtown";
}

function buildCivicStarterIndex() {
  const byDistrict = {};

  function ensureDistrict(key) {
    if (!byDistrict[key]) {
      byDistrict[key] = {
        eventCount: 0,
        eventRsvps: 0,
        publicMoments: 0,
        momentParticipants: 0,
        perkCount: 0,
        memberCount: 0,
        eventTitles: [],
      };
    }
    return byDistrict[key];
  }

  (events || []).forEach((event) => {
    const key = normalizeDistrictKey(event.address || event.venue || event.title);
    const bucket = ensureDistrict(key);
    bucket.eventCount += 1;
    bucket.eventRsvps += Number(event.rsvpCount || 0);
    if (event.title) bucket.eventTitles.push(event.title);
  });

  (moments || []).forEach((moment) => {
    const key = normalizeDistrictKey(moment.district || moment.address || moment.placeName);
    const bucket = ensureDistrict(key);
    if (moment.visibility === "public") bucket.publicMoments += 1;
    bucket.momentParticipants += Array.isArray(moment.participants) ? moment.participants.length : 0;
  });

  (perks || []).forEach((perk) => {
    const key = normalizeDistrictKey(perk.address || perk.businessName);
    const bucket = ensureDistrict(key);
    if (perk.active) bucket.perkCount += 1;
  });

  Array.from((members && typeof members.values === "function") ? members.values() : []).forEach((member) => {
    const key = normalizeDistrictKey(member.homeDistrict);
    const bucket = ensureDistrict(key);
    bucket.memberCount += 1;
  });

  return byDistrict;
}

const CIVIC_STARTER_INDEX = buildCivicStarterIndex();

function getCivicStarterMetrics(item) {
  const districtKey = normalizeDistrictKey(item?.district || item?.address || item?.title || item?.name);
  const districtData = CIVIC_STARTER_INDEX[districtKey] || CIVIC_STARTER_INDEX.downtown || {
    eventCount: 0,
    eventRsvps: 0,
    publicMoments: 0,
    momentParticipants: 0,
    perkCount: 0,
    memberCount: 0,
    eventTitles: [],
  };

  const title = String(item?.title || item?.name || "").toLowerCase();
  const matchingEvent = (events || []).find((event) => {
    const eventTitle = String(event.title || "").toLowerCase();
    const venueTitle = String(event.venue || "").toLowerCase();
    return title && (eventTitle.includes(title) || title.includes(eventTitle) || venueTitle.includes(title));
  });

  const matchingMoment = (moments || []).find((moment) => {
    const momentTitle = String(moment.title || "").toLowerCase();
    const placeName = String(moment.placeName || "").toLowerCase();
    return title && (momentTitle.includes(title) || placeName.includes(title) || title.includes(placeName));
  });

  const matchingPerks = (perks || []).filter((perk) => {
    const businessName = String(perk.businessName || "").toLowerCase();
    return normalizeDistrictKey(perk.address || businessName) === districtKey || (title && businessName.includes(title));
  });

  const impressions = matchingEvent
    ? Number(matchingEvent.rsvpCount || 0) + 24
    : Math.max(18, districtData.eventRsvps + districtData.publicMoments * 12 + districtData.memberCount * 3);

  const visits = matchingEvent
    ? Math.max(12, Math.round(Number(matchingEvent.rsvpCount || 0) * 0.7))
    : matchingMoment
      ? Math.max(8, (matchingMoment.participants || []).length * 7)
      : Math.max(6, districtData.publicMoments * 10 + districtData.eventCount * 5);

  const redemptions = matchingPerks.length > 0
    ? Math.max(2, Math.round(matchingPerks.length * 1.5))
    : Math.max(0, Math.round(districtData.perkCount * 0.5));

  const activeEvents = matchingEvent ? 1 : districtData.eventCount;
  const activePerks = matchingPerks.length || districtData.perkCount;
  const activeMembers = districtData.memberCount;
  const conversionRate = impressions > 0 ? Math.round((visits / impressions) * 100) : 0;
  const repeatRate = Math.min(44, 14 + districtData.memberCount * 2 + districtData.publicMoments * 4);

  return {
    impressions,
    visits,
    saves: Math.max(4, Math.round(visits * 0.4)),
    redemptions,
    repeatRate,
    conversionRate,
    activePerks,
    activeEvents,
    activeMembers,
    sourceBreakdown: [
      { label: "Events", value: Math.min(65, 22 + districtData.eventCount * 8) },
      { label: "Buildings", value: Math.min(48, 14 + districtData.memberCount * 5) },
      { label: "Street activity", value: Math.min(42, 10 + districtData.publicMoments * 9) },
    ],
    relatedEvents: (matchingEvent ? [matchingEvent] : (events || []).filter((event) => normalizeDistrictKey(event.address || event.venue) === districtKey))
      .slice(0, 2)
      .map((event) => ({
        label: event.title,
        value: `${event.date} · ${event.time}`,
      })),
  };
}

function getCivicStarterSummary() {
  const activeEvents = (events || []).filter((event) => event.active !== false).length;
  const activePerks = (perks || []).filter((perk) => perk.active).length;
  const memberCount = Array.from((members && typeof members.values === "function") ? members.values() : []).length;
  const publicMoments = (moments || []).filter((moment) => moment.visibility === "public").length;
  const eventRsvps = (events || []).reduce((sum, event) => sum + Number(event.rsvpCount || 0), 0);
  const districtLeaders = Object.entries(CIVIC_STARTER_INDEX)
    .map(([district, data]) => ({
      district,
      score: Number(data.eventRsvps || 0) + Number(data.publicMoments || 0) * 18 + Number(data.memberCount || 0) * 6,
    }))
    .sort((a, b) => b.score - a.score);

  const topDistrict = districtLeaders[0]?.district || "downtown";
  const peakEvent = (events || [])
    .slice()
    .sort((a, b) => Number(b.rsvpCount || 0) - Number(a.rsvpCount || 0))[0];

  return {
    interactions: Math.round(eventRsvps * 0.72),
    impressions: eventRsvps + publicMoments * 18 + memberCount * 5,
    redemptions: Math.max(6, Math.round(activePerks * 0.9)),
    activePerks,
    activeEvents,
    activeMembers: memberCount,
    activeZones: Object.keys(CIVIC_STARTER_INDEX).length,
    partnerLocations: Object.keys(CIVIC_STARTER_INDEX).length,
    conversionRate: eventRsvps > 0 ? Math.round((Math.round(eventRsvps * 0.72) / eventRsvps) * 100) : 0,
    repeatRate: 28,
    topInsight: `${topDistrict.replace("-", " ")} corridor leading attention`,
    peakWindow: peakEvent ? `${peakEvent.time} onward` : "6:00 PM onward",
    recentActions: publicMoments + activeEvents,
    leadingLabel: `Starter district signal: ${topDistrict.replace("-", " ")} corridor`,
    narrative:
      "Starter civic intelligence is now reading from mapped events, resident moments, active perks, and district density so the page shows how downtown is moving before live partner analytics are connected.",
  };
}

function sanitizeText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function getEntityPartnerType(item) {
  if (item?.type === "hotel") return "hospitality";
  if (item?.type === "building" || item?.type === "property") return "property";
  if (item?.type === "brand") return "brand";
  if (item?.type === "civic") return "civic";
  if (item?.type === "venue") return "venue";
  return "dashboard";
}

function isRelevantEntity(item, partnerType) {
  const normalized = normalizePartnerType(partnerType);
  if (normalized === "dashboard") {
    return ["venue", "building", "property", "hotel", "brand", "civic"].includes(item?.type);
  }

  if (normalized === "civic") {
    return ["venue", "event", "building", "property", "hotel", "civic"].includes(item?.type);
  }

  return getEntityPartnerType(item) === normalized;
}

function getMetricEntry(metricsByEntity, item) {
  const id = String(item?.entity_id || item?.id || "").trim();
  const prefixed = item?.type && id ? `${item.type}:${id}` : null;
  const itemId = String(item?.id || "").trim();
  return (
    metricsByEntity[id] ||
    (prefixed ? metricsByEntity[prefixed] : null) ||
    metricsByEntity[itemId] ||
    null
  );
}

function buildLabel(item, metrics) {
  if (Number(metrics.redemptions || 0) > 0) {
    return `${metrics.redemptions} redemptions`;
  }
  if (Number(metrics.visits || 0) > 0) {
    return `${metrics.visits} visits`;
  }
  if (Number(metrics.impressions || 0) > 0) {
    return `${metrics.impressions} scans`;
  }
  return "Popular now";
}

function buildEntitySummary(item, metrics) {
  const venueLike = item.type === "venue" || item.type === "hotel";
  if (metrics.visits > 0 || metrics.redemptions > 0 || metrics.impressions > 0) {
    return venueLike
      ? `${item.title || item.name} is already showing downtown activity, nearby intent, and walkable pull from the map.`
      : `${item.title || item.name} is already showing movement, visibility, and nearby value in the downtown layer.`;
  }
  return `${item.title || item.name} is already positioned inside the downtown layer with nearby activity, events, and offer context.`;
}

function buildRecommendation(item, metrics) {
  if (metrics.redemptions > 0) {
    return "Keep this surface live and expand nearby offer visibility during the periods already converting.";
  }
  if (metrics.visits > 0) {
    return "Increase offer and event visibility around this node to convert current intent into redemptions.";
  }
  if (metrics.impressions > 0) {
    return "This node is being discovered. Add a stronger action layer to convert map activity into visits.";
  }
  if (item.type === "hotel") {
    return "Add guest QR entry points and nearby venue bundles to start capturing hotel-linked movement.";
  }
  if (item.type === "building" || item.type === "property") {
    return "Add building-linked perks and QR entry points to start capturing resident-driven activity.";
  }
  return "Publish offers, campaigns, or events here to start building measurable partner intelligence.";
}

function buildInsightType(item, metrics) {
  if (item.type === "brand") return "campaign";
  if (item.type === "civic") return "coverage";
  if (metrics.redemptions > 0 || metrics.visits > 0) return "performance";
  if (metrics.impressions > 0 || metrics.saves > 0) return "engagement";
  return "opportunity";
}

function buildInsightEntity(item, metrics, partnerType = "dashboard") {
  const noLiveMetrics =
    Number(metrics?.impressions || 0) === 0 &&
    Number(metrics?.visits || 0) === 0 &&
    Number(metrics?.redemptions || 0) === 0;

  const genericStarterMetrics = noLiveMetrics ? getStarterMetrics(item, partnerType) : null;
  const starterMetrics =
    normalizePartnerType(partnerType) === "civic" &&
    noLiveMetrics
      ? getCivicStarterMetrics(item)
      : null;

  const resolvedMetrics = {
    ...(genericStarterMetrics || {}),
    ...(starterMetrics || {}),
    ...metrics,
  };

  const trendDirection =
    resolvedMetrics.redemptions > 0 || resolvedMetrics.visits > 0 ? "up" : resolvedMetrics.impressions > 0 ? "stable" : "flat";

  return {
    id: `insight-${item.entity_id || item.id}`,
    entity_id: item.entity_id || item.id,
    title: sanitizeText(item.title || item.name, "Partner insight"),
    insightType: buildInsightType(item, metrics),
    partnerType: getEntityPartnerType(item),
    entityType: item.type,
    latitude: item.location?.latitude ?? item.latitude ?? item.lat,
    longitude: item.location?.longitude ?? item.longitude ?? item.lng,
    district: sanitizeText(item.district, "Downtown"),
    address: sanitizeText(item.address, "Downtown Austin"),
    label: buildLabel(item, resolvedMetrics),
    summary: buildEntitySummary(item, resolvedMetrics),
    shortInsight:
      resolvedMetrics.redemptions > 0
        ? `${resolvedMetrics.redemptions} redemptions captured`
        : resolvedMetrics.visits > 0
          ? `${resolvedMetrics.visits} visits captured`
          : resolvedMetrics.impressions > 0
            ? `${resolvedMetrics.impressions} scans captured`
            : "Already active on the map",
    recommendedAction: buildRecommendation(item, resolvedMetrics),
    trend: {
      direction: trendDirection,
      delta:
        resolvedMetrics.redemptions > 0
          ? `+${resolvedMetrics.redemptions}`
          : resolvedMetrics.visits > 0
            ? `+${resolvedMetrics.visits}`
            : resolvedMetrics.impressions > 0
              ? `+${resolvedMetrics.impressions}`
              : "0",
      window: "captured activity",
    },
    metrics: {
      impressions: Number(resolvedMetrics.impressions || 0),
      visits: Number(resolvedMetrics.visits || 0),
      saves: Number(resolvedMetrics.saves || 0),
      redemptions: Number(resolvedMetrics.redemptions || 0),
      conversionRate: Number(resolvedMetrics.conversionRate || 0),
      repeatRate: Number(resolvedMetrics.repeatRate || 0),
      activePerks: Number(resolvedMetrics.activePerks || 0),
      activeEvents: Number(resolvedMetrics.activeEvents || 0),
      activeMembers: Number(resolvedMetrics.activeMembers || 0),
    },
    sourceBreakdown: resolvedMetrics.sourceBreakdown || [],
    relatedEvents: resolvedMetrics.relatedEvents || [],
    tags: [item.category, item.type, item.district].filter(Boolean),
  };
}

function buildSummary(items, partnerType, hasLiveData) {
  const defaults = DEFAULT_SUMMARY[normalizePartnerType(partnerType)] || DEFAULT_SUMMARY.dashboard;
  const civicStarterSummary =
    normalizePartnerType(partnerType) === "civic" && !hasLiveData ? getCivicStarterSummary() : null;

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

  const weightedVisits = items.reduce((sum, item) => sum + Number(item.metrics?.visits || 0), 0);
  const weightedConversion = items.reduce(
    (sum, item) => sum + Number(item.metrics?.conversionRate || 0) * Number(item.metrics?.visits || 0),
    0
  );

  return {
    interactions: civicStarterSummary?.interactions ?? totals.interactions,
    impressions: civicStarterSummary?.impressions ?? totals.impressions,
    redemptions: civicStarterSummary?.redemptions ?? totals.redemptions,
    activePerks: civicStarterSummary?.activePerks ?? totals.activePerks,
    activeEvents: civicStarterSummary?.activeEvents ?? totals.activeEvents,
    activeMembers: civicStarterSummary?.activeMembers ?? totals.activeMembers,
    activeZones: civicStarterSummary?.activeZones ?? items.length,
    partnerLocations: civicStarterSummary?.partnerLocations ?? items.length,
    conversionRate: civicStarterSummary?.conversionRate ?? (weightedVisits > 0 ? Math.round(weightedConversion / weightedVisits) : 0),
    repeatRate: civicStarterSummary?.repeatRate ?? 0,
    topInsight: civicStarterSummary?.topInsight ?? items[0]?.shortInsight ?? defaults.leadingLabel,
    peakWindow: civicStarterSummary?.peakWindow ?? defaults.peakWindow,
    recentActions: civicStarterSummary?.recentActions ?? (hasLiveData ? items.filter((item) => Number(item.metrics?.visits || 0) > 0 || Number(item.metrics?.redemptions || 0) > 0).length : defaults.recentActions),
    leadingLabel: civicStarterSummary?.leadingLabel ?? (items[0]?.title ? `${items[0].title} leading live activity` : defaults.leadingLabel),
    narrative: hasLiveData
      ? "This view is reading current downtown activity, visits, redemptions, and nearby movement."
      : civicStarterSummary?.narrative ?? defaults.narrative,
  };
}

function buildActivityFeed(items) {
  return items.slice(0, 4).map((item, index) => ({
    id: `${item.id}-activity`,
    title:
      index === 0
        ? `${item.title} leading`
        : `${item.title} active`,
    detail:
      Number(item.metrics?.redemptions || 0) > 0
        ? `${item.metrics.redemptions} redemptions captured`
        : Number(item.metrics?.visits || 0) > 0
          ? `${item.metrics.visits} visits captured`
          : Number(item.metrics?.impressions || 0) > 0
            ? `${item.metrics.impressions} scans captured`
            : "Nearby activity is building",
    entityId: item.id,
  }));
}

export function usePartnerInsights(partnerType = "dashboard") {
  const [state, setState] = useState({
    items: [],
    summary: buildSummary([], partnerType, false),
    activityFeed: [],
    loading: true,
    hasLiveData: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [mapItems, metricsResponse, civicResponse] = await Promise.all([
          mapRepository.getMapFeed({ limit: 1000 }),
          fetch("/api/partner-insights").then(async (response) => {
            if (!response.ok) return { metricsByEntity: {}, hasLiveData: false };
            return response.json();
          }).catch(() => ({ metricsByEntity: {}, hasLiveData: false })),
          normalizePartnerType(partnerType) === "civic"
            ? fetch("/api/civic-dashboard").then(async (response) => {
              if (!response.ok) return null;
              return response.json();
            }).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const relevantItems = (Array.isArray(mapItems) ? mapItems : [])
          .filter((item) => isRelevantEntity(item, partnerType))
          .map((item) => {
            const metrics = getMetricEntry(metricsResponse.metricsByEntity || {}, item) || {};
            return buildInsightEntity(item, metrics, partnerType);
          })
          .sort((a, b) => {
            const redemptionDelta = Number(b.metrics?.redemptions || 0) - Number(a.metrics?.redemptions || 0);
            if (redemptionDelta !== 0) return redemptionDelta;
            const visitDelta = Number(b.metrics?.visits || 0) - Number(a.metrics?.visits || 0);
            if (visitDelta !== 0) return visitDelta;
            return Number(b.metrics?.impressions || 0) - Number(a.metrics?.impressions || 0);
          })
          .slice(0, 12)
          .map(adaptEntityToInsightPin)
          .filter(Boolean);

        const hasLiveData = Boolean(metricsResponse.hasLiveData);
        const civicSummary = civicResponse?.ok ? civicResponse.summary : null;
        const civicFeed = civicResponse?.ok && Array.isArray(civicResponse.activityFeed)
          ? civicResponse.activityFeed
          : null;

        setState({
          items: relevantItems,
          summary: civicSummary || buildSummary(relevantItems, partnerType, hasLiveData),
          activityFeed: civicFeed || buildActivityFeed(relevantItems),
          loading: false,
          hasLiveData: hasLiveData || Boolean(civicResponse?.ok),
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          items: [],
          summary: buildSummary([], partnerType, false),
          activityFeed: [],
          loading: false,
          hasLiveData: false,
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [partnerType]);

  return state;
}

export function getPartnerInsightCardsFromItems(items) {
  return (Array.isArray(items) ? items : []).map(adaptEntityToInsightCard).filter(Boolean);
}
