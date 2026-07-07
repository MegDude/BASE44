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

function normalizeName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|at|austin|tx)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();
  const kept: string[] = [];
  names.forEach((name) => {
    const cleanName = String(name || "").trim();
    const key = normalizeName(cleanName);
    if (!key || seen.has(key)) return false;
    if (kept.some((existing) => key.startsWith(`${normalizeName(existing)} `) || normalizeName(existing).startsWith(`${key} `))) {
      return false;
    }
    seen.add(key);
    kept.push(cleanName);
    return true;
  });
  return kept;
}

function isSelectedNameOverlap(selectedEntity: MapEntity, candidate: MapEntity) {
  const selected = normalizeName(entityName(selectedEntity));
  const candidateName = normalizeName(entityName(candidate));
  if (!selected || !candidateName) return false;
  return selected.includes(candidateName) || candidateName.includes(selected);
}

function formatNameList(names: string[]) {
  if (!names.length) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
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

  const filteredNames = uniqueNames(candidates.filter((entity) => !isSelectedNameOverlap(selectedEntity, entity)).map(entityName).filter(Boolean));
  const fallbackNames = uniqueNames(originalEntities.filter((entity) => !isSelectedNameOverlap(selectedEntity, entity)).map(entityName).filter(Boolean));
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
  const nearbyCopy = formatNameList(nearbyNames.slice(0, 2));
  const summary = hasActivity
    ? "Current activity and nearby map context point to the next useful move."
    : nearbyNames.length
      ? `${nearbyCopy} ${nearbyNames.length === 1 ? "shapes" : "shape"} the nearby context.`
      : "Nearby places are enough to start with right now.";

  const signals = [
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
