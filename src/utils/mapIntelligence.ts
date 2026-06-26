import { type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

const CIVIC_CONTEXT_PATTERN =
  /\b(civic|advocacy|neighborhood association|downtown austin neighborhood association|dana|explore downtown|public space|city service)\b/i;
const DRINKS_CONTEXT_PATTERN = /\b(drinks?|bar|nightlife|cocktail|pub|speakeasy|happy hour|beer|wine|lounge|music)\b/i;
const DINING_CONTEXT_PATTERN = /\b(restaurant|dining|food|coffee|cafe|breakfast|brunch|lunch|dinner|hotel|live music)\b/i;

function metricEntries(entity: MapEntity) {
  const raw = entity?.raw || {};
  const metrics = raw.metrics || entity?.metrics || raw.analytics || entity?.analytics || {};
  return Object.entries(metrics)
    .map(([label, value]) => ({ label, value }))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "" && Number(item.value) !== 0);
}

function entityText(entity: MapEntity = {}) {
  const raw = entity?.raw || {};
  return [
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.subcategory,
    entity?.category_key,
    entity?.entityType,
    entity?.type,
    entity?.kind,
    entity?.partnerType,
    entity?.district,
    entity?.summary,
    entity?.description,
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
    raw?.id,
    raw?.name,
    raw?.title,
    raw?.category,
    raw?.subcategory,
    raw?.category_key,
    raw?.entityType,
    raw?.type,
    raw?.district,
    raw?.summary,
    raw?.description,
    ...(Array.isArray(raw?.tags) ? raw.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function entityName(entity: MapEntity = {}) {
  return entity?.name || entity?.title || entity?.raw?.name || entity?.raw?.title || "";
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isCivicContext(entity: MapEntity = {}) {
  return CIVIC_CONTEXT_PATTERN.test(entityText(entity));
}

function getNearbyNames(selectedEntity: MapEntity, nearby: NearbyRecommendation[]) {
  const selectedText = entityText(selectedEntity);
  const selectedIsCivic = isCivicContext(selectedEntity);
  const selectedIsDrinks = DRINKS_CONTEXT_PATTERN.test(selectedText);
  const selectedIsDining = DINING_CONTEXT_PATTERN.test(selectedText);
  const originalEntities = nearby.map((item) => item.entity).filter(Boolean);
  let candidates = originalEntities;

  if (!selectedIsCivic) {
    candidates = candidates.filter((entity) => !isCivicContext(entity));
  }

  if (selectedIsDrinks) {
    const preferred = candidates.filter((entity) => {
      const text = entityText(entity);
      return DRINKS_CONTEXT_PATTERN.test(text) || DINING_CONTEXT_PATTERN.test(text);
    });
    if (preferred.length) candidates = preferred;
  } else if (selectedIsDining) {
    const preferred = candidates.filter((entity) => {
      const text = entityText(entity);
      return DINING_CONTEXT_PATTERN.test(text) || DRINKS_CONTEXT_PATTERN.test(text);
    });
    if (preferred.length) candidates = preferred;
  }

  const filteredNames = uniqueNames(candidates.map(entityName).filter(Boolean));
  const fallbackNames = uniqueNames(originalEntities.map(entityName).filter(Boolean));
  return (filteredNames.length ? filteredNames : fallbackNames).slice(0, 4);
}

export function buildMapIntelligence({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const metrics = metricEntries(selectedEntity);
  const nearbyNames = getNearbyNames(selectedEntity, nearby);
  const hasActivity = metrics.length > 0;
  const summary = hasActivity
    ? "Current activity and nearby map context point to the next useful move."
    : nearbyNames.length
      ? `${nearbyNames.slice(0, 3).join(", ")} shape the nearby context.`
      : "Nearby places are enough to start with right now.";

  const signals = [
    nearbyNames.length ? `${nearbyNames.slice(0, 3).join(", ")} are close enough to influence plans.` : "",
    metrics.length ? `${metrics.length} local ${metrics.length === 1 ? "read is" : "reads are"} available for this pin.` : "",
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
