import { useEffect, useState } from "react";
import { fetchMapData } from "@/lib/api/mapApi";
import { useMapStateStore } from "@/store/mapStateStore";

export function useMapData({ query = "", activeCategory = "all", limit = 120 } = {}) {
  const setFilteredResults = useMapStateStore((state) => state.setFilteredResults);
  const setRawResults = useMapStateStore((state) => state.setRawResults);
  const setSearchQuery = useMapStateStore((state) => state.setSearchQuery);
  const setIsMapLoading = useMapStateStore((state) => state.setIsMapLoading);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setIsMapLoading(true);
      setSearchQuery(query);
      try {
        const data = await fetchMapData({
          query,
          limit,
          filters: {
            categories: activeCategory && activeCategory !== "all" ? [activeCategory] : [],
          },
        });

        if (!mounted) return;
        const nextItems = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        setItems(nextItems);
        setRawResults(nextItems);
        setFilteredResults(nextItems);
        setError(null);
      } catch (nextError) {
        if (!mounted) return;
        setItems([]);
        setRawResults([]);
        setFilteredResults([]);
        setError(nextError);
      } finally {
        if (mounted) {
          setIsMapLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeCategory, limit, query, setFilteredResults, setIsMapLoading, setRawResults, setSearchQuery]);

  return {
    items,
    error,
    loading: useMapStateStore.getState().isMapLoading,
  };
}
