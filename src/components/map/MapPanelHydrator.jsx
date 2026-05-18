import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { parseMapPanelQuery } from "@/lib/mapPanelQuery";
import { useMapPanelStore } from "@/store/useMapPanelStore";

export default function MapPanelHydrator() {
  const location = useLocation();
  const hydrateFromState = useMapPanelStore((state) => state.hydrateFromState);

  useEffect(() => {
    const nextState = parseMapPanelQuery(location.search);
    hydrateFromState(nextState);
  }, [location.search, hydrateFromState]);

  return null;
}
