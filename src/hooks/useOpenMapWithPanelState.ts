import { useNavigate } from "react-router-dom";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { buildMapPanelQuery } from "@/lib/mapPanelQuery";

export function useOpenMapWithPanelState() {
  const navigate = useNavigate();

  return useMapPanelStore((state) => () => {
    const search = buildMapPanelQuery({
      mode: state.mode,
      query: state.query,
      decision: state.decision,
      type: state.type,
      categories: state.categories,
      filters: state.filters,
    });

    navigate(`/downtown-perks/explore${search ? `?${search}` : ""}`);
  });
}
