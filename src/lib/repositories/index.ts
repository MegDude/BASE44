/**
 * Downtown Perks Data Repositories
 * FINAL STABLE VERSION (NaN-safe)
 */

import { base44Api } from "@/lib/api/base44Api";

/* =========================================================
   MAP REPOSITORY (CORE SYSTEM)
========================================================= */

export const mapRepository = {
  async searchWithIntent({ query, userLocation }) {
    try {
      const intent = await base44Api.invoke("searchMapIntent", {
        query,
        context: userLocation,
      });

      const items = await this.getMapFeed({
        query,
        categories: intent?.categories || [],
        filters: intent?.filters || [],
      });

      const ranked = rankItems(items, intent?.ranking, userLocation);

      // ✅ CRITICAL FIX: sanitize + filter invalid map items
      const adapted = ranked
        .map(adaptToUI)
        .filter(Boolean);

      return {
        items: adapted,
        intent,
      };
    } catch (err) {
      console.error("searchWithIntent error:", err);

      const items = await this.getMapFeed({ query });

      return {
        items: items.map(adaptToUI).filter(Boolean),
        intent: null,
      };
    }
  },

  async getMapFeed(params = {}) {
    try {
      const res = await base44Api.invoke("getSharedMapFeed", params);
      return res?.items || [];
    } catch (err) {
      console.error("getMapFeed error:", err);
      return [];
    }
  },

  async getMapItemsByType(type, options = {}) {
    const items = await this.getMapFeed();

    const filtered = items.filter(
      (item) => item && item.entity_type === type
    );

    return options.limit ? filtered.slice(0, options.limit) : filtered;
  },
};

/* =========================================================
   RESIDENT REPOSITORY
========================================================= */

export const residentRepository = {
  async getResidentProfile() {
    try {
      const res = await base44Api.invoke("getResidentProfile");
      return res || null;
    } catch (error) {
      console.error("getResidentProfile error:", error);
      return null;
    }
  },

  async getSavedItems(residentEmail) {
    try {
      const res = await base44Api.invoke("getSavedItems", {
        email: residentEmail,
      });
      return res?.items || [];
    } catch (error) {
      console.error("getSavedItems error:", error);
      return [];
    }
  },

  async saveItem({ entity_id, entity_type }) {
    try {
      await base44Api.invoke("saveItem", {
        entity_id,
        entity_type,
      });
      return { success: true };
    } catch (error) {
      console.error("saveItem error:", error);
      return { success: false };
    }
  },
};

/* =========================================================
   PARTNER REPOSITORY
========================================================= */

export const partnerRepository = {
  async getPartnerData() {
    try {
      const res = await base44Api.invoke("getPartnerData");
      return res || null;
    } catch (error) {
      console.error("getPartnerData error:", error);
      return null;
    }
  },
};

/* =========================================================
   UI ADAPTER (CRITICAL FIX)
========================================================= */

function adaptToUI(item) {
  const lat = Number(item?.lat);
  const lng = Number(item?.lng);

  // 🚨 HARD STOP: prevent NaN from reaching map
  if (!isFinite(lat) || !isFinite(lng)) {
    return null;
  }

  return {
    id: item.entity_id,
    type: item.entity_type,
    name: item.title,
    description: item.description,

    latitude: lat,
    longitude: lng,

    category: item.tags?.[0] || null,

    rating: item.metadata?.rating || null,
    popularity: item.metadata?.popularity || null,

    image: item.metadata?.image || null,

    raw: item,
  };
}

/* =========================================================
   RANKING SYSTEM
========================================================= */

function rankItems(items, ranking, userLocation) {
  if (!Array.isArray(items)) return [];

  switch (ranking) {
    case "distance":
      return [...items].sort(
        (a, b) => distance(a, userLocation) - distance(b, userLocation)
      );

    case "popularity":
      return [...items].sort(
        (a, b) =>
          (b?.metadata?.popularity || 0) -
          (a?.metadata?.popularity || 0)
      );

    case "rating":
      return [...items].sort(
        (a, b) =>
          (b?.metadata?.rating || 0) -
          (a?.metadata?.rating || 0)
      );

    default:
      return items;
  }
}

function distance(item, userLocation) {
  if (!userLocation) return 0;
  if (!item?.lat || !item?.lng) return 0;

  const dx = item.lat - userLocation.lat;
  const dy = item.lng - userLocation.lng;

  return Math.sqrt(dx * dx + dy * dy);
}