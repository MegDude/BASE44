import { base44Api } from "@/lib/api/base44Api";
import type { SharedMapFeedRequest } from "@/lib/contracts/entities";
import { getLiveNearby } from "@/lib/logic/liveEngine";
import { rankMapItems } from "@/lib/logic/rankingEngine";
import {
  getFallbackSharedMapItems,
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

function getTextIndex(item) {
  return [
    item?.name,
    item?.title,
    item?.description,
    item?.address,
    item?.category,
    item?.district,
    item?.type,
    item?.entity_type,
    ...(item?.metadata?.tags || []),
    ...(item?.metadata?.searchKeywords || []),
    ...(item?.metadata?.askMapIntentTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterItems(items, params: MapFeedParams = {}) {
  const query = String(params.query || params.search || "").trim().toLowerCase();
  const district = String(params.district || "").trim().toLowerCase();
  const categories = new Set(params.categories || params.filters?.categories || []);
  const types = new Set(params.types || params.filters?.types || []);
  const limit = Number(params.limit || 1000);

  let results = normalizeSharedMapFeedItems(items);

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

  results = rankMapItems(results);

  return Number.isFinite(limit) ? results.slice(0, limit) : results;
}

function buildIntelligence(items, params: MapFeedParams = {}) {
  const ranked: any[] = filterItems(items, params);
  const liveNearby: any = getLiveNearby(ranked);
  const hydrated = ranked.map((item) => (liveNearby && item.id === liveNearby.id ? liveNearby : item));

  return {
    items: hydrated,
    ranked: hydrated,
    liveNearby,
  };
}

export const mapRepository = {
  async getMapFeed(params: MapFeedParams = {}) {
    const feed = await this.getIntelligenceFeed(params);
    return feed.items;
  },

  async getIntelligenceFeed(params: MapFeedParams = {}) {
    try {
      const response = await base44Api.getSharedMapFeed(params);
      const payload = response?.data || response || {};
      const remoteItems = Array.isArray(payload.items) ? payload.items : [];

      if (remoteItems.length > 0) {
        return buildIntelligence(remoteItems, params);
      }
    } catch (error) {
      console.error("getIntelligenceFeed remote error:", error);
    }

    return buildIntelligence(getFallbackSharedMapItems(), params);
  },

  async getMapItemById(id: string, params: MapFeedParams = {}) {
    const items = await this.getMapFeed(params);
    return items.find((item) => item.id === id || item.entity_id === id) || null;
  },

  async searchWithIntent({ query, userLocation }: SearchIntentParams = {}) {
    try {
      const intentResponse = await base44Api.invoke("searchMapIntent", {
        query,
        context: userLocation,
      });
      const intent = intentResponse?.data || intentResponse || {};
      const feed = await this.getIntelligenceFeed({
        query,
        filters: {
          categories: intent.categories || [],
        },
      });

      return { ...feed, intent };
    } catch (error) {
      console.error("searchWithIntent error:", error);
      const feed = await this.getIntelligenceFeed({ query });
      return { ...feed, intent: null };
    }
  },

  adaptSharedItem: sharedMapItemToMapEntity,
};
