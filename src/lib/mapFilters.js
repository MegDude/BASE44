function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getTypeSet(type, intent, category) {
  const normalizedType = normalizeText(type);
  const normalizedIntent = normalizeText(intent);
  const normalizedCategory = normalizeText(category);

  if (normalizedType === "property") return new Set(["property", "building", "hotel"]);
  if (normalizedType === "event") return new Set(["event"]);
  if (normalizedType === "perk") return new Set(["perk"]);
  if (normalizedType === "hotel") return new Set(["hotel"]);
  if (normalizedIntent === "places") return new Set(["venue", "hotel"]);
  if (normalizedIntent === "residential") return new Set(["property", "building", "hotel"]);
  if (normalizedCategory === "perks") return new Set(["perk", "venue", "hotel", "property"]);
  return null;
}

function matchesQuery(entity, q) {
  const query = normalizeText(q);
  if (!query) return true;

  const haystack = [
    entity.name,
    entity.title,
    entity.description,
    entity.address,
    entity.category,
    entity.district,
    ...(entity.metadata?.tags || []),
    ...(entity.metadata?.searchKeywords || []),
    ...(entity.metadata?.askMapIntentTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function scoreEntity(entity, filters) {
  const walk = Number(entity?.metadata?.walkMinutes ?? 999);
  let score = Number(entity?.metadata?.popularity ?? 0);

  if (entity?.isLive || entity?.eventTiming?.isLive) score += 40;
  if (entity?.isOpenNow) score += 20;
  if (entity?.perk?.value || entity?.perk_value || entity?.type === "perk") score += 16;

  if (normalizeText(filters.intent) === "nearby") score += Math.max(0, 20 - walk);
  if (normalizeText(filters.intent) === "places" && ["venue", "hotel"].includes(entity?.type)) score += 18;
  if (normalizeText(filters.intent) === "residential" && ["property", "building", "hotel"].includes(entity?.type)) score += 24;

  if (normalizeText(filters.time) === "now" && (entity?.isLive || entity?.eventTiming?.isLive || entity?.isOpenNow)) {
    score += 28;
  }

  return score;
}

export function filterEntities(entities = [], filters = {}) {
  const category = normalizeText(filters.category);
  const district = normalizeText(filters.district);
  const time = normalizeText(filters.time);
  const radius = Number(filters.radius || 0);
  const typeSet = getTypeSet(filters.type, filters.intent, filters.category);

  let results = [...entities].filter((entity) => entity?.isVisibleInResults !== false);

  if (typeSet) {
    results = results.filter((entity) => {
      if (typeSet.has(entity.type)) return true;
      if (entity.type === "property" && typeSet.has("building")) return true;
      if (category === "perks" && typeSet.has(entity.type) && (entity.perk?.value || entity.perk_value || entity.type === "perk")) return true;
      return false;
    });
  }

  if (category) {
    if (category === "perks") {
      results = results.filter((entity) => Boolean(entity.perk?.value || entity.perk_value || entity.type === "perk"));
    } else {
      results = results.filter((entity) => normalizeText(entity.category) === category);
    }
  }

  if (district) {
    results = results.filter((entity) => normalizeText(entity.district) === district);
  }

  if (filters.saved) {
    const savedIds = filters.savedIds instanceof Set ? filters.savedIds : new Set(filters.savedIds || []);
    results = results.filter((entity) => savedIds.has(entity.id));
  }

  if (radius > 0) {
    results = results.filter((entity) => (entity?.metadata?.walkMinutes ?? 999) <= radius);
  }

  if (time === "now") {
    results = results.filter((entity) => Boolean(entity?.isLive || entity?.eventTiming?.isLive || entity?.isOpenNow || entity?.eventTiming?.startTime));
  }

  results = results.filter((entity) => matchesQuery(entity, filters.q));

  results.sort((a, b) => scoreEntity(b, filters) - scoreEntity(a, filters));
  return results;
}
