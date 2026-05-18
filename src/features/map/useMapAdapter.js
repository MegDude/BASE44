import { useEffect } from "react";
import { useMapDecisionStore } from "@/store/useMapDecisionStore";
import { normalizeCoordinates } from "@/lib/coordinates";

export default function useMapAdapter(rawData = []) {
  const setResults = useMapDecisionStore((s) => s.setResults);

  useEffect(() => {
    const adapted = (rawData || [])
      .map((item) => {
        const coords = normalizeCoordinates(item);
        if (!coords) return null;

        return {
          id: item.id,
          type: item.type,
          name: item.name,
          lat: coords.lat,
          lng: coords.lng,
          meta: item.meta || {},
        };
      })
      .filter(Boolean);

    setResults(adapted);
  }, [rawData, setResults]);
}
