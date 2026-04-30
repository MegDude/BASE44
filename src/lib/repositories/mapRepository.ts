import { base44Api } from "@/lib/api/base44Api";
import { mapAgentApi } from "@/lib/api/mapAgentApi";
import { parseIntent } from "@/lib/map/intent-parser";
import type { SharedMapFeedRequest } from "@/lib/contracts/entities";
import {
  getFallbackSharedMapItems,
  groupPropertyMapEntities,
  normalizeSharedMapFeedItems,
  sharedMapItemToMapEntity,
} from "@/lib/mappers/sharedMapMappers";

type MapFeedParams = SharedMapFeedRequest & {
  search?: string;
  categories?: string[];
  types?: string[];
};

type SearchIntentParams = {
  query?: string;
  userLocation?: unknown;
};

type AgentIntent = {
  category?: string;
  intentMode?: "now" | "plan" | "perks";
  categories?: string[];
  types?: string[];
  ranking?: "distance" | "popularity" | "live";
  explanation?: string;
  suggestions?: string[];
};

function getTextIndex(item) {
  return [
    item?.name,
    item?.title,
    item?.description,
    item?.address,
    item?.category,
    item?.subcategory,
    item?.district,
    item?.type,
    item?.entity_type,
    item?.metadata?.shortDescription,
    item?.metadata?.whyItMatters,
    item?.metadata?.highlightedFeatures,
    ...(item?.metadata?.tags || []),
    ...(item?.metadata?.searchKeywords || []),
    ...(item?.metadata?.askMapIntentTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFallbackIntentFilters(query = "") {
  const intent = parseIntent(query);

  if (intent.intentMode === "perks") {
    return {
      categories: [],
      types: ["perk"],
      intent,
    };
  }

  const byCategory: Record<string, { categories: string[]; types: string[] }> = {
    coffee: { categories: ["coffee"], types: ["venue"] },
    dining: { categories: ["restaurant", "bar"], types: ["venue"] },
    fitness: { categories: ["fitness"], types: ["venue"] },
    wellness: { categories: ["wellness"], types: ["venue"] },
    entertainment: { categories: ["entertainment", "bar"], types: ["venue", "event"] },
    event: { categories: [], types: ["event"] },
  };

  return {
    categories: byCategory[intent.category]?.categories || [],
    types: byCategory[intent.category]?.types || [],
    intent,
  };
}

function filterItems(items, params: MapFeedParams = {}) {
  const query = String(params.query || params.search || "").trim().toLowerCase();
  const district = String(params.district || "").trim().toLowerCase();
  const categories = new Set(params.categories || params.filters?.categories || []);
  const types = new Set(params.types || params.filters?.types || []);
  const limit = Number(params.limit || 1000);

  let results = groupPropertyMapEntities(normalizeSharedMapFeedItems(items));

  // Brand activations stay in the brand directory and partner pages for now,
  // but they should not appear in the shared map surfaces.
  results = results.filter((item) => item?.type !== "brand" && item?.entity_type !== "brand");

  if (query) {
    results = results.filter((item) => getTextIndex(item).includes(query));
  }

  if (district && district !== "downtown") {
    results = results.filter((item) => String(item.district || "").toLowerCase() === district);
  }

  if (categories.size > 0) {
    results = results.filter((item) => categories.has(item.category));
  }

  if (types.size > 0) {
    results = results.filter((item) => types.has(item.type) || types.has(item.entity_type));
  }

  results.sort((a, b) => {
    const liveDelta = Number(Boolean(b.isLive || b.eventTiming?.isLive)) - Number(Boolean(a.isLive || a.eventTiming?.isLive));
    if (liveDelta !== 0) return liveDelta;
    const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
    if (walkDelta !== 0) return walkDelta;
    return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
  });

  return Number.isFinite(limit) ? results.slice(0, limit) : results;
}

function mergeSharedFeedItems(remoteItems = [], fallbackItems = []) {
  const merged = [...remoteItems, ...fallbackItems];
  const deduped = new Map();

  for (const item of merged) {
    const normalized = sharedMapItemToMapEntity(item);
    if (!normalized) continue;

    const key = String(
      normalized.entity_id ||
      normalized.id ||
      `${normalized.type}-${normalized.name || normalized.title || "entity"}`
    );

    if (!deduped.has(key)) {
      deduped.set(key, normalized);
      continue;
    }

    const existing = deduped.get(key);
    deduped.set(key, {
      ...normalized,
      ...existing,
      metadata: {
        ...(normalized.metadata || {}),
        ...(existing.metadata || {}),
      },
    });
  }

  return groupPropertyMapEntities(Array.from(deduped.values()));
}

function mergeIntent(primary: AgentIntent = {}, fallback: AgentIntent = {}): AgentIntent {
  return {
    category: primary.category || fallback.category,
    intentMode: primary.intentMode || fallback.intentMode,
    categories: Array.isArray(primary.categories) && primary.categories.length > 0 ? primary.categories : fallback.categories || [],
    types: Array.isArray(primary.types) && primary.types.length > 0 ? primary.types : fallback.types || [],
    ranking: primary.ranking || fallback.ranking || "live",
    explanation: primary.explanation || fallback.explanation,
    suggestions: Array.isArray(primary.suggestions) && primary.suggestions.length > 0 ? primary.suggestions : fallback.suggestions || [],
  };
}

function boostByAgent(items = [], query = "", intent: AgentIntent = {}, agentPlaces = []) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const placeNames = new Set(
    (agentPlaces || [])
      .map((place) => String(place?.name || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return [...items].sort((a, b) => {
    const scoreA = scoreItemForIntent(a, normalizedQuery, intent, placeNames);
    const scoreB = scoreItemForIntent(b, normalizedQuery, intent, placeNames);
    return scoreB - scoreA;
  });
}

function scoreItemForIntent(item, query = "", intent: AgentIntent = {}, placeNames = new Set()) {
  let score = Number(item?.metadata?.popularity ?? 0);
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();
  const searchText = getTextIndex(item);
  const walkMinutes = Number(item?.metadata?.walkMinutes ?? 999);

  if (query && searchText.includes(query)) score += 24;
  if (placeNames.has(String(item?.name || item?.title || "").trim().toLowerCase())) score += 36;

  if (intent?.categories?.length && intent.categories.includes(category)) score += 20;
  if (intent?.types?.length && (intent.types.includes(type) || (type === "property" && intent.types.includes("building")))) score += 18;

  if (intent.intentMode === "now") {
    if (item?.isLive || item?.eventTiming?.isLive) score += 28;
    if (item?.isOpenNow) score += 18;
    score += Math.max(0, 12 - walkMinutes);
  }

  if (intent.intentMode === "plan") {
    if (item?.eventTiming?.startTime || item?.type === "event") score += 22;
    if (item?.metadata?.isTrending) score += 12;
  }

  if (intent.intentMode === "perks") {
    if (item?.perk || item?.perk_value || type === "perk") score += 26;
  }

  return score;
}

export const mapRepository = {
  async getMapFeed(params: MapFeedParams = {}) {
    const fallbackItems = getFallbackSharedMapItems();

    try {
      const response = await base44Api.getSharedMapFeed(params);
      const payload = response?.data || response || {};
      const remoteItems = Array.isArray(payload.items) ? payload.items : [];
      return filterItems(mergeSharedFeedItems(remoteItems, fallbackItems), params);
    } catch (error) {
      console.error("getMapFeed remote error:", error);
    }

    return filterItems(fallbackItems, params);
  },

  async getMapItemById(id: string, params: MapFeedParams = {}) {
    const items = await this.getMapFeed(params);
    return items.find((item) => item.id === id || item.entity_id === id) || null;
  },

  async searchWithIntent({ query, userLocation }: SearchIntentParams = {}) {
    const trimmedQuery = String(query || "").trim();
    const fallback = getFallbackIntentFilters(trimmedQuery);
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
=======
    const fallbackRanking: AgentIntent["ranking"] = fallback.intent?.intentMode === "perks" ? "popularity" : "live";
>>>>>>> theirs
    const fallbackIntent: AgentIntent = {
      ...fallback.intent,
      categories: fallback.categories,
      types: fallback.types,
      ranking: fallbackRanking,
      suggestions: [],
    };

    let apiIntent: AgentIntent = {};
    let agentPlaces = [];
    let source: "api" | "base44" | "fallback" = "fallback";

    const apiResponse = await mapAgentApi.askMap(trimmedQuery, {
      userLocation,
    });

    if (apiResponse?.intent) {
      apiIntent = apiResponse.intent;
      agentPlaces = Array.isArray(apiResponse.places) ? apiResponse.places : [];
      source = "api";
    }

    if (source !== "api") {
      try {
        const intentResponse = await base44Api.invoke("searchMapIntent", {
          query: trimmedQuery,
          context: userLocation,
        });
        const base44Intent = intentResponse?.data || intentResponse || {};
        if (base44Intent && (base44Intent.categories || base44Intent.types || base44Intent.explanation)) {
          apiIntent = base44Intent as AgentIntent;
          source = "base44";
        }
      } catch (error) {
        console.error("searchWithIntent base44 error:", error);
      }
    }

    const intent = mergeIntent(apiIntent, fallbackIntent);
    const items = await this.getMapFeed({
      query: trimmedQuery,
      filters: {
        categories: intent.categories || [],
        types: intent.types || [],
      },
    });

    const rankedItems = boostByAgent(items, trimmedQuery, intent, agentPlaces);

    void mapAgentApi.logSearch(trimmedQuery, {
      source,
      intentMode: intent.intentMode || null,
      category: intent.category || null,
      categories: intent.categories || [],
      types: intent.types || [],
    });

    return {
      items: rankedItems,
      intent,
      explanation: intent.explanation || fallbackIntent.explanation,
      suggestions: intent.suggestions || [],
      source,
    };
  },

  adaptSharedItem: sharedMapItemToMapEntity,
};
