import { useMemo } from "react";
import { useLocations } from "@/lib/useLocations";

function sourceTypeForEntity(entity) {
  const text = [
    entity?.sourceType,
    entity?.type,
    entity?.markerType,
    entity?.detailDrawerType,
    entity?.category,
    entity?.category_key,
    entity?.partnerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("happy_hour") || text.includes("happy hour")) return "happy_hour";
  if (text.includes("rental") || text.includes("leasing")) return "rental";
  if (text.includes("event")) return "event";
  if (text.includes("civic") || text.includes("public")) return "civic";
  if (text.includes("brand") || text.includes("sponsor")) return "brand";
  if (text.includes("property") || text.includes("residential") || text.includes("building")) return "building";
  return "venue";
}

export function useMapEntityData() {
  const locations = useLocations();

  return useMemo(
    () =>
      locations.map((entity) => ({
        ...entity,
        sourceType: entity.sourceType || sourceTypeForEntity(entity),
        lat: entity.lat ?? entity.latitude ?? entity.coords?.[0],
        lng: entity.lng ?? entity.longitude ?? entity.coords?.[1],
        tags: Array.isArray(entity.tags)
          ? entity.tags
          : [entity.category, entity.category_key, entity.type, entity.partnerType].filter(Boolean),
        description: entity.description || entity.summary,
        timing: entity.timing || entity.time || entity.date || entity.happyHour?.time,
        metrics: entity.metrics || entity.analytics || entity.dashboardMetrics || {},
        actions: Array.isArray(entity.actions) ? entity.actions : ["Open", "Save", "Get directions"],
      })),
    [locations],
  );
}

export default useMapEntityData;
