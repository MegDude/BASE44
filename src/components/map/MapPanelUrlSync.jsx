import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { buildMapPanelQuery } from "@/lib/mapPanelQuery";

export default function MapPanelUrlSync() {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, query, decision, type, categories, filters } = useMapPanelStore();

  useEffect(() => {
    const search = buildMapPanelQuery({
      mode,
      query,
      decision,
      type,
      categories,
      filters,
    });

    const nextUrl = `${location.pathname}${search ? `?${search}` : ""}`;
    const currentUrl = `${location.pathname}${location.search}`;

    if (nextUrl !== currentUrl) {
      navigate(nextUrl, { replace: true });
    }
  }, [
    mode,
    query,
    decision,
    type,
    categories,
    filters,
    navigate,
    location.pathname,
    location.search,
  ]);

  return null;
}
