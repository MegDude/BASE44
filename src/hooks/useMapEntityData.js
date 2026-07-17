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
  if (text.includes("parking") || text.includes("garage") || text.includes("reservable")) return "parking";
  if (text.includes("rental") || text.includes("leasing")) return "rental";
  if (text.includes("campaign") || text.includes("passport") || text.includes("challenge")) return "campaign";
  if (text.includes("event")) return "event";
  if (text.includes("civic") || text.includes("public")) return "civic";
  if (text.includes("brand") || text.includes("sponsor")) return "brand";
  if (text.includes("property") || text.includes("residential") || text.includes("building")) return "building";
  return "venue";
}

function toFiniteNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coordinatePairFrom(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const lat = toFiniteNumber(value[0]);
    const lng = toFiniteNumber(value[1]);
    return lat === null || lng === null ? null : { lat, lng };
  }
  const lat = toFiniteNumber(value.latitude ?? value.lat);
  const lng = toFiniteNumber(value.longitude ?? value.lng);
  return lat === null || lng === null ? null : { lat, lng };
}

function coordinatesForEntity(entity) {
  const direct = coordinatePairFrom({ lat: entity?.lat, lng: entity?.lng });
  if (direct) return direct;
  const directNamed = coordinatePairFrom({ latitude: entity?.latitude, longitude: entity?.longitude });
  if (directNamed) return directNamed;
  return (
    coordinatePairFrom(entity?.coords) ||
    coordinatePairFrom(entity?.coordinates) ||
    coordinatePairFrom(entity?.location) ||
    coordinatePairFrom(entity?.geometry?.location)
  );
}

export function useMapEntityData() {
  const locations = useLocations();

  return useMemo(
    () =>
      locations.map((entity) => {
        const coordinates = coordinatesForEntity(entity);
        return {
          ...entity,
          sourceType: entity.sourceType || sourceTypeForEntity(entity),
          lat: coordinates?.lat,
          lng: coordinates?.lng,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
          coords: coordinates ? [coordinates.lat, coordinates.lng] : entity.coords,
          tags: Array.isArray(entity.tags)
            ? entity.tags
            : [entity.category, entity.category_key, entity.type, entity.partnerType].filter(Boolean),
          description: entity.description || entity.summary,
          timing: entity.timing || entity.time || entity.date || entity.happyHour?.time,
          metrics: entity.metrics || entity.analytics || entity.dashboardMetrics || {},
          actions: Array.isArray(entity.actions) ? entity.actions : ["Open", "Save", "Get directions"],
        };
      }),
    [locations],
  );
}

export default useMapEntityData;
