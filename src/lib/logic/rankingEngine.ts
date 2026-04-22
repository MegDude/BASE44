type FeedItem = Record<string, any>;

const EVENING_CATEGORIES = new Set([
  "bar",
  "bars",
  "cocktails",
  "nightlife",
  "drinks",
  "happy hour",
  "restaurant",
  "dining",
  "music",
]);

const MORNING_CATEGORIES = new Set([
  "coffee",
  "cafe",
  "breakfast",
  "bakery",
  "brunch",
  "coworking",
]);

const FITNESS_CATEGORIES = new Set([
  "fitness",
  "wellness",
  "gym",
  "recovery",
  "spa",
  "yoga",
]);

function toLower(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function getCategory(item: FeedItem) {
  return toLower(item?.category || item?.metadata?.category || item?.type || item?.entity_type);
}

function getPopularity(item: FeedItem) {
  const value = Number(item?.metadata?.popularity ?? item?.popularity ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getWalkMinutes(item: FeedItem) {
  const value = Number(item?.metadata?.walkMinutes ?? item?.walkMinutes);
  return Number.isFinite(value) ? Math.max(0, value) : null;
}

function getLinkCandidates(item: FeedItem) {
  const title = toLower(item?.title || item?.name);
  const subtitle = toLower(item?.subtitle);
  const venueName = toLower(item?.metadata?.venue_name);
  const businessName = toLower(item?.metadata?.businessName);
  const address = toLower(item?.address || item?.metadata?.address);

  return [title, subtitle, venueName, businessName, address].filter(Boolean);
}

function sharesLink(a: FeedItem, b: FeedItem) {
  const aTokens = getLinkCandidates(a);
  const bTokens = new Set(getLinkCandidates(b));
  if (!aTokens.length || !bTokens.size) return false;
  return aTokens.some((token) => bTokens.has(token));
}

function timeBoost(item: FeedItem, now = new Date()) {
  const hour = now.getHours();
  const category = getCategory(item);
  const isLive = Boolean(item?.isLive || item?.eventTiming?.isLive || item?.metadata?.isLive);
  const isOpenNow = Boolean(item?.isOpenNow || item?.metadata?.isOpenNow);

  if (hour >= 17 && EVENING_CATEGORIES.has(category)) return 10;
  if (hour <= 11 && MORNING_CATEGORIES.has(category)) return 8;
  if (hour >= 6 && hour <= 9 && category === "event") return 4;
  if (hour >= 11 && hour <= 14 && category === "perk") return 4;
  if (hour >= 6 && hour <= 20 && FITNESS_CATEGORIES.has(category)) return 6;
  if (isLive) return 5;
  if (isOpenNow) return 3;
  return 0;
}

function proximityScore(item: FeedItem) {
  const walkMinutes = getWalkMinutes(item);
  if (walkMinutes === null) return 0;
  return Math.max(0, 20 - walkMinutes);
}

function popularityScore(item: FeedItem) {
  return Math.min(12, Math.round(getPopularity(item) / 8));
}

function typeWeight(item: FeedItem) {
  const type = toLower(item?.type || item?.entity_type);
  if (type === "venue") return 4;
  if (type === "event") return 5;
  if (type === "perk") return 3;
  if (type === "hotel" || type === "building" || type === "property") return 2;
  return 1;
}

function getLinkedSignals(item: FeedItem, items: FeedItem[]) {
  const related = items.filter(
    (candidate) =>
      candidate?.id !== item?.id &&
      (sharesLink(item, candidate) ||
        (item?.district && candidate?.district && item.district === candidate.district))
  );

  const activePerks = related.filter(
    (candidate) =>
      toLower(candidate?.type || candidate?.entity_type) === "perk" &&
      (candidate?.status !== "inactive" || candidate?.isOpenNow || candidate?.metadata?.isOpenNow)
  );

  const liveEvents = related.filter(
    (candidate) =>
      toLower(candidate?.type || candidate?.entity_type) === "event" &&
      Boolean(candidate?.isLive || candidate?.eventTiming?.isLive || candidate?.metadata?.isLive)
  );

  return {
    activePerks,
    liveEvents,
  };
}

function computeScore(item: FeedItem, items: FeedItem[], now = new Date()) {
  const { activePerks, liveEvents } = getLinkedSignals(item, items);
  const liveNow = Boolean(item?.isLive || item?.eventTiming?.isLive || item?.metadata?.isLive);
  const openNow = Boolean(item?.isOpenNow || item?.metadata?.isOpenNow);

  let score = 0;
  score += proximityScore(item);
  score += activePerks.length * 5;
  score += liveEvents.length * 12;
  score += liveNow ? 14 : 0;
  score += openNow ? 4 : 0;
  score += popularityScore(item);
  score += timeBoost(item, now);
  score += typeWeight(item);

  return {
    score,
    activePerks,
    liveEvents,
    liveNow,
    openNow,
  };
}

export function rankMapItems(items: FeedItem[] = [], now = new Date()) {
  const ranked = [...items]
    .map((item) => {
      const computed = computeScore(item, items, now);
      return {
        ...item,
        metadata: {
          ...(item?.metadata || {}),
          intelligence: {
            score: computed.score,
            activePerkCount: computed.activePerks.length,
            liveEventCount: computed.liveEvents.length,
            liveNow: computed.liveNow,
            openNow: computed.openNow,
            trending: computed.score >= 28,
          },
        },
        activePerks: computed.activePerks,
        liveEvents: computed.liveEvents,
      };
    })
    .sort((a, b) => {
      const scoreDelta = (b?.metadata?.intelligence?.score ?? 0) - (a?.metadata?.intelligence?.score ?? 0);
      if (scoreDelta !== 0) return scoreDelta;
      const walkDelta = (getWalkMinutes(a) ?? 999) - (getWalkMinutes(b) ?? 999);
      if (walkDelta !== 0) return walkDelta;
      return getPopularity(b) - getPopularity(a);
    })
    .map((item, index) => ({
      ...item,
      metadata: {
        ...(item?.metadata || {}),
        intelligence: {
          ...(item?.metadata?.intelligence || {}),
          rank: index + 1,
          isTopRanked: index < 3,
        },
      },
    }));

  return ranked;
}
