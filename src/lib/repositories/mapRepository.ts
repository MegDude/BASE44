import { base44Api } from "@/lib/api/base44Api";
import type { SharedMapFeedRequest } from "@/lib/contracts/entities";
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

  results.sort((a, b) => {
    const liveDelta = Number(Boolean(b.isLive || b.eventTiming?.isLive)) - Number(Boolean(a.isLive || a.eventTiming?.isLive));
    if (liveDelta !== 0) return liveDelta;
    const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
    if (walkDelta !== 0) return walkDelta;
    return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
  });

  return Number.isFinite(limit) ? results.slice(0, limit) : results;
}

export const mapRepository = {
  async getMapFeed(params: MapFeedParams = {}) {
    try {
      const response = await base44Api.getSharedMapFeed(params);
      const payload = response?.data || response || {};
      const remoteItems = Array.isArray(payload.items) ? payload.items : [];

      if (remoteItems.length > 0) {
        return filterItems(remoteItems, params);
      }
    } catch (error) {
      console.error("getMapFeed remote error:", error);
    }

    return filterItems(getFallbackSharedMapItems(), params);
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
      const items = await this.getMapFeed({
        query,
        filters: {
          categories: intent.categories || [],
        },
      });

      return { items, intent };
    } catch (error) {
      console.error("searchWithIntent error:", error);
      const items = await this.getMapFeed({ query });
      return { items, intent: null };
    }
  },

  adaptSharedItem: sharedMapItemToMapEntity,
};
