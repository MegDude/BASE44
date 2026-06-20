import { type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

function metricEntries(entity: MapEntity) {
  const raw = entity?.raw || {};
  const metrics = raw.metrics || entity?.metrics || raw.analytics || entity?.analytics || {};
  return Object.entries(metrics)
    .map(([label, value]) => ({ label, value }))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "" && Number(item.value) !== 0);
}

export function buildMapIntelligence({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const metrics = metricEntries(selectedEntity);
  const nearbyNames = nearby.slice(0, 4).map((item) => item.entity?.name || item.entity?.title).filter(Boolean);
  const hasActivity = metrics.length > 0;
  const summary = hasActivity
    ? "Current activity and nearby map context point to the next useful move."
    : nearbyNames.length
      ? `${nearbyNames.slice(0, 3).join(", ")} shape the nearby context.`
      : "Nearby context is the best signal right now.";

  const signals = [
    nearbyNames.length ? `${nearbyNames.slice(0, 3).join(", ")} are close enough to influence plans.` : "",
    metrics.length ? `${metrics.length} local ${metrics.length === 1 ? "signal is" : "signals are"} available for this pin.` : "",
  ].filter(Boolean);

  return {
    summary,
    signals,
    opportunities: nearbyNames,
    recommendedActions: hasActivity ? ["Review performance", "Create campaign"] : ["Create campaign", "Create perk"],
    riskNotes: hasActivity ? [] : ["Start with one focused local test."],
    metrics,
  };
}
