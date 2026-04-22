import { useEffect, useMemo, useState } from "react";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { filterValidMapItems, normalizeCoordinates } from "@/lib/mapCoordinates";

export function useSharedMapFeed({ query = "", district = "Downtown", activeCategory = "all", limit = 1000 } = {}) {
  const [items, setItems] = useState([]);
  const [liveNearby, setLiveNearby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useMemo(
    () => ({
      query,
      district,
      limit,
      filters: {
        categories: activeCategory && activeCategory !== "all" ? [activeCategory] : [],
      },
    }),
    [activeCategory, district, limit, query]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const feed = await mapRepository.getIntelligenceFeed(params);
        const normalizedItems = filterValidMapItems(feed.items).map(normalizeCoordinates);
        const normalizedLive = feed.liveNearby ? normalizeCoordinates(feed.liveNearby) : null;
        if (mounted) {
          setItems(normalizedItems);
          setLiveNearby(normalizedLive);
        }
      } catch (nextError) {
        console.error("useSharedMapFeed failed:", nextError);
        if (mounted) {
          setItems([]);
          setLiveNearby(null);
          setError(nextError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  return {
    data: {
      items,
      liveNearby,
      source: "shared-map-feed",
      query,
    },
    items,
    liveNearby,
    loading,
    error,
  };
}
