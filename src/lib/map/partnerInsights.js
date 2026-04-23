import { useEffect, useMemo, useState } from "react";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { adaptEntityToInsightCard, adaptEntityToInsightPin } from "@/lib/mappers/sharedMapMappers";

const DEFAULT_SUMMARY = {
  dashboard: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No partner analytics captured yet",
    narrative: "Live partner intelligence will appear here once scans, saves, visits, and redemptions are flowing into the system.",
  },
  property: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No property analytics captured yet",
    narrative: "Property-level insight appears once building-linked activity starts writing to the analytics layer.",
  },
  hospitality: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No hospitality analytics captured yet",
    narrative: "Guest-local crossover appears here once hotel-linked scans and visits are flowing into the system.",
  },
  venue: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No venue analytics captured yet",
    narrative: "Venue intelligence appears here once scans, visits, and redemptions are flowing into the system.",
  },
  brand: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No campaign analytics captured yet",
    narrative: "Brand and campaign intelligence appears here once activations are writing measurable signals into the system.",
  },
  civic: {
    peakWindow: "Awaiting live activity",
    recentActions: 0,
    leadingLabel: "No civic analytics captured yet",
    narrative: "District and civic intelligence appears here once event and district interactions are flowing into the system.",
  },
};

function normalizePartnerType(partnerType = "dashboard") {
  if (partnerType === "properties") return "property";
  if (partnerType === "venues") return "venue";
  if (partnerType === "brands") return "brand";
  return partnerType;
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
  return "Awaiting activity";
}

function buildEntitySummary(item, metrics) {
  const venueLike = item.type === "venue" || item.type === "hotel";
  if (metrics.visits > 0 || metrics.redemptions > 0 || metrics.impressions > 0) {
    return venueLike
      ? `${item.title || item.name} is receiving measurable downtown activity from the live map and action layer.`
      : `${item.title || item.name} is now receiving measurable activity from the live downtown system.`;
  }
  return `${item.title || item.name} is mapped and ready, but no live partner analytics have been captured for this entity yet.`;
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

function buildInsightEntity(item, metrics) {
  const trendDirection =
    metrics.redemptions > 0 || metrics.visits > 0 ? "up" : metrics.impressions > 0 ? "stable" : "flat";

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
    label: buildLabel(item, metrics),
    summary: buildEntitySummary(item, metrics),
    shortInsight:
      metrics.redemptions > 0
        ? `${metrics.redemptions} redemptions captured`
        : metrics.visits > 0
          ? `${metrics.visits} visits captured`
          : metrics.impressions > 0
            ? `${metrics.impressions} scans captured`
            : "Mapped but waiting for live analytics",
    recommendedAction: buildRecommendation(item, metrics),
    trend: {
      direction: trendDirection,
      delta:
        metrics.redemptions > 0
          ? `+${metrics.redemptions}`
          : metrics.visits > 0
            ? `+${metrics.visits}`
            : metrics.impressions > 0
              ? `+${metrics.impressions}`
              : "0",
      window: "captured activity",
    },
    metrics: {
      impressions: Number(metrics.impressions || 0),
      visits: Number(metrics.visits || 0),
      saves: Number(metrics.saves || 0),
      redemptions: Number(metrics.redemptions || 0),
      conversionRate: Number(metrics.conversionRate || 0),
      repeatRate: Number(metrics.repeatRate || 0),
      activePerks: 0,
      activeEvents: 0,
      activeMembers: 0,
    },
    sourceBreakdown: [],
    relatedEvents: [],
    tags: [item.category, item.type, item.district].filter(Boolean),
  };
}

function buildSummary(items, partnerType, hasLiveData) {
  const defaults = DEFAULT_SUMMARY[normalizePartnerType(partnerType)] || DEFAULT_SUMMARY.dashboard;

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
    interactions: totals.interactions,
    impressions: totals.impressions,
    redemptions: totals.redemptions,
    activePerks: totals.activePerks,
    activeEvents: totals.activeEvents,
    activeMembers: totals.activeMembers,
    activeZones: items.length,
    partnerLocations: items.length,
    conversionRate: weightedVisits > 0 ? Math.round(weightedConversion / weightedVisits) : 0,
    repeatRate: 0,
    topInsight: items[0]?.shortInsight || defaults.leadingLabel,
    peakWindow: defaults.peakWindow,
    recentActions: hasLiveData ? items.filter((item) => Number(item.metrics?.visits || 0) > 0 || Number(item.metrics?.redemptions || 0) > 0).length : 0,
    leadingLabel: items[0]?.title ? `${items[0].title} leading live activity` : defaults.leadingLabel,
    narrative: hasLiveData
      ? "This view is now reading real captured partner activity from the analytics tables instead of shipping hardcoded dashboard metrics."
      : defaults.narrative,
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
            : "Mapped and waiting for live activity",
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
        const [mapItems, metricsResponse] = await Promise.all([
          mapRepository.getMapFeed({ limit: 1000 }),
          fetch("/api/partner-insights").then(async (response) => {
            if (!response.ok) return { metricsByEntity: {}, hasLiveData: false };
            return response.json();
          }).catch(() => ({ metricsByEntity: {}, hasLiveData: false })),
        ]);

        if (cancelled) return;

        const relevantItems = (Array.isArray(mapItems) ? mapItems : [])
          .filter((item) => isRelevantEntity(item, partnerType))
          .map((item) => {
            const metrics = getMetricEntry(metricsResponse.metricsByEntity || {}, item) || {};
            return buildInsightEntity(item, metrics);
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

        setState({
          items: relevantItems,
          summary: buildSummary(relevantItems, partnerType, hasLiveData),
          activityFeed: buildActivityFeed(relevantItems),
          loading: false,
          hasLiveData,
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
