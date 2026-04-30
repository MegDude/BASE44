import { useEffect, useMemo, useState } from "react";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { filterValidMapItems, normalizeCoordinates } from "@/lib/mapCoordinates";

export function useSharedMapFeed({ query = "", district = "Downtown", activeCategory = "all", limit = 1000 } = {}) {
  const [items, setItems] = useState([]);
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
        const nextItems = await mapRepository.getMapFeed(params);
        const normalizedItems = filterValidMapItems(nextItems).map(normalizeCoordinates);
        if (mounted) setItems(normalizedItems);
      } catch (nextError) {
        console.error("useSharedMapFeed failed:", nextError);
        if (mounted) {
          setItems([]);
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
      source: "shared-map-feed",
      query,
    },
    items,
    loading,
    error,
  };
}
