import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useMapFilters() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);

    return {
      mode: params.get("mode") || "",
      type: params.get("type") || "",
      intent: params.get("intent") || "",
      time: params.get("time") || "",
      radius: params.get("radius") || "",
      saved: params.get("saved") === "true",
      district: params.get("district") || "",
      category: params.get("category") || "",
      q: params.get("q") || params.get("query") || "",
    };
  }, [location.search]);
}
