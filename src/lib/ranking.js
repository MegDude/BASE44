const CATEGORY_MATCH_WEIGHT = 42;
const OPEN_NOW_WEIGHT = 18;
const FEATURED_WEIGHT = 14;
const REDEEMABLE_WEIGHT = 12;
const DISTANCE_PENALTY_PER_MILE = 8;

function includesAny(value, terms = []) {
  if (!value || !terms.length) return false;
  const haystack = String(value).toLowerCase();
  return terms.some((term) => haystack.includes(String(term).toLowerCase()));
}

function getDistanceScore(item) {
  const distance = Number(item.distanceMiles ?? item.meta?.distanceMiles ?? 0);
  if (!Number.isFinite(distance)) return 0;
  return Math.max(0, 24 - distance * DISTANCE_PENALTY_PER_MILE);
}

export function scoreMapEntity(item, context = {}) {
  const intent = context.intent || "";
  const filters = context.filters || [];
  const terms = [intent, ...filters].filter(Boolean);

  let score = 0;

  if (includesAny(item.name, terms)) score += CATEGORY_MATCH_WEIGHT;
  if (includesAny(item.type, terms)) score += CATEGORY_MATCH_WEIGHT / 2;
  if (includesAny(item.meta?.category, terms)) score += CATEGORY_MATCH_WEIGHT;
  if (includesAny(item.meta?.tags?.join(" "), terms)) score += CATEGORY_MATCH_WEIGHT / 2;

  if (item.meta?.openNow) score += OPEN_NOW_WEIGHT;
  if (item.meta?.featured) score += FEATURED_WEIGHT;
  if (item.meta?.hasPerk || item.meta?.redeemable) score += REDEEMABLE_WEIGHT;

  score += getDistanceScore(item);

  return Math.round(score);
}

export function rankMapEntities(items = [], context = {}) {
  return [...items]
    .map((item) => ({
      ...item,
      rankScore: scoreMapEntity(item, context),
    }))
    .sort((a, b) => b.rankScore - a.rankScore);
}

export function getBestNow(items = [], context = {}) {
  return rankMapEntities(items, context)[0] || null;
}
