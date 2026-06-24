import fullRegistry from "./mapEntityRegistry.full.json";
import type { DowntownDistrict, MapEntity, MapEntityKind } from "./mapEntitySchema";

const registry = fullRegistry as MapEntity[];

export function getMapEntityRegistry(): MapEntity[] {
  return registry;
}

export function getActiveMapEntities(): MapEntity[] {
  return registry.filter((entity) => entity.active && typeof entity.lat === "number" && typeof entity.lng === "number");
}

export function getAllActiveMapEntitiesIncludingQa(): MapEntity[] {
  return registry.filter((entity) => entity.active);
}

export function getMapEntitiesByKind(kind: MapEntityKind): MapEntity[] {
  return getActiveMapEntities().filter((entity) => entity.kind === kind);
}

export function getMapEntitiesByDistrict(neighborhood: DowntownDistrict): MapEntity[] {
  return getActiveMapEntities().filter((entity) => entity.neighborhood === neighborhood);
}

export function findMapEntityById(id: string): MapEntity | undefined {
  return registry.find((entity) => entity.id === id);
}

export function mapEntityToRuntimeLocation(entity: MapEntity) {
  return {
    id: entity.id,
    name: entity.title,
    title: entity.title,
    type: entity.kind,
    kind: entity.kind,
    entityType: entity.kind,
    markerType: entity.kind,
    detailDrawerType: entity.kind === "civic" ? "civic" : entity.kind === "hotel" ? "hotel" : "place",
    pinKey: entity.kind,
    category: entity.category,
    category_key: [entity.kind, entity.category, entity.neighborhood, ...entity.tags].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    latitude: entity.lat,
    longitude: entity.lng,
    district: entity.neighborhood,
    address: entity.address,
    summary: entity.category ? `${entity.category} in ${entity.neighborhood}.` : `Downtown place in ${entity.neighborhood}.`,
    description: entity.category ? `${entity.category} in ${entity.neighborhood}.` : `Downtown place in ${entity.neighborhood}.`,
    rating: entity.rating,
    reviewCount: entity.reviewCount,
    priceLabel: entity.priceLabel,
    phone: entity.phone,
    website: entity.website,
    image: entity.imageUrl,
    googleMapsUrl: entity.googleMapsUrl,
    googlePlaceId: entity.googlePlaceId,
    googleCid: entity.googleCid,
    source: "Downtown Perks canonical Google registry",
    registrySource: entity.source,
    registryDatasetStatus: entity.datasetStatus,
    tags: entity.tags,
    active: entity.active,
    raw: entity,
  };
}

export function getActiveMapEntityLocations() {
  return getActiveMapEntities().map(mapEntityToRuntimeLocation);
}
