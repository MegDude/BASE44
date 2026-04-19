/**
 * Downtown Perks Data Repositories
 * SINGLE SOURCE OF TRUTH
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

      return {
        items: ranked,
        intent,
      };
    } catch (err) {
      console.error("searchWithIntent error:", err);

      const items = await this.getMapFeed({ query });

      return {
        items,
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

    if (options.limit) {
      return filtered.slice(0, options.limit);
    }

    return filtered;
  },
};

/* =========================================================
   RESIDENT REPOSITORY (FIXED)
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
   RANKING SYSTEM
========================================================= */

function rankItems(items, ranking, userLocation) {
  if (!Array.isArray(items)) return [];

  switch (ranking) {
    case "distance":
      return items.sort(
        (a, b) => distance(a, userLocation) - distance(b, userLocation)
      );

    case "popularity":
      return items.sort(
        (a, b) =>
          (b?.metadata?.popularity || 0) -
          (a?.metadata?.popularity || 0)
      );

    case "rating":
      return items.sort(
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