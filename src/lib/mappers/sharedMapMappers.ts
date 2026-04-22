import { MAP_ENTITIES } from "@/data/mapEntities";

const TYPE_TO_MARKER = {
  venue: "standard",
  event: "event",
  perk: "perk",
  building: "building",
  property: "building",
  hotel: "building",
  brand: "brand",
  civic: "civic",
};

const normalizeType = (type) => {
  if (type === "civic_activation") return "civic";
  if (type === "campaign") return "brand";
  return type || "venue";
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return null;
  const next = typeof value === "string" ? Number.parseFloat(value.trim()) : Number(value);
  return Number.isFinite(next) ? next : null;
};

const isValidCoordinatePair = (latitude, longitude) => {
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const getRawCoordinates = (item) => {
  const latitude = toFiniteNumber(
    item?.location?.latitude ?? item?.latitude ?? item?.lat ?? item?.metadata?.latitude
  );
  const longitude = toFiniteNumber(
    item?.location?.longitude ?? item?.longitude ?? item?.lng ?? item?.lon ?? item?.metadata?.longitude
  );
  return { latitude, longitude };
};

export function sharedMapItemToMapEntity(item) {
  if (!item) return null;

  if (item.location?.valid && Number.isFinite(item.location.latitude) && Number.isFinite(item.location.longitude)) {
    return item;
  }

  const { latitude, longitude } = getRawCoordinates(item);

  if (!isValidCoordinatePair(latitude, longitude)) {
    return null;
  }

  const type = normalizeType(item.entity_type ?? item.type);
  const id = String(item.id || item.entity_id || `${type}-${item.title || item.name}`);
  const name = item.name || item.title || "Downtown place";
  const address = item.address || item.metadata?.address || item.subtitle || "Downtown Austin";

  return {
    ...item,
    id,
    entity_id: item.entity_id || id,
    name,
    title: item.title || name,
    type,
    entity_type: type,
    category: item.category || item.metadata?.category || type,
    description: item.description || item.metadata?.description,
    address,
    district: item.district || item.metadata?.district || "other",
    location: {
      latitude,
      longitude,
      valid: true,
    },
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    isPlotted: item.isPlotted !== false,
    isVisibleInResults: item.isVisibleInResults !== false,
    isOpenNow: Boolean(item.isOpenNow || item.metadata?.isOpenNow),
    isLive: Boolean(item.isLive || item.metadata?.isLive),
    isVenue: type === "venue",
    isEvent: type === "event",
    isPerk: type === "perk",
    isBuilding: type === "building" || type === "property" || type === "hotel",
    markerType: item.markerType || TYPE_TO_MARKER[type] || "standard",
    markerVariant: item.markerVariant || "default",
    iconType: item.iconType || item.icon,
    image_url: item.image_url || item.image || item.metadata?.image,
    website: item.website || item.metadata?.website,
    hours: item.hours || item.metadata?.hours,
    perk_description: item.perk_description || item.perk?.description || item.metadata?.perk_description,
    perk_value: item.perk_value || item.perk?.value || item.metadata?.perk_value || item.metadata?.value,
    rsvp_count: item.rsvp_count || item.metadata?.rsvp_count,
    metadata: {
      ...(item.metadata || {}),
      sourceRef: item.source_ref || item.metadata?.sourceRef,
    },
  };
}

export function mapEntityToSharedMapItem(entity) {
  if (!entity) return null;
  const { latitude, longitude } = getRawCoordinates(entity);
  if (!isValidCoordinatePair(latitude, longitude)) return null;

  return {
    id: entity.id,
    entity_id: entity.entity_id || entity.id,
    entity_type: entity.entity_type || entity.type,
    title: entity.title || entity.name,
    subtitle: entity.subtitle || entity.category || entity.address,
    description: entity.description,
    district: entity.district,
    category: entity.category,
    latitude,
    longitude,
    status: entity.status || "active",
    image: entity.image || entity.image_url,
    icon: entity.icon || entity.iconType,
    source_ref: entity.source_ref || "local-map-entities",
    metadata: {
      ...(entity.metadata || {}),
      address: entity.address,
      website: entity.website,
      hours: entity.hours,
      perk_value: entity.perk_value || entity.perk?.value,
      perk_description: entity.perk_description || entity.perk?.description,
      walkMinutes: entity.metadata?.walkMinutes,
      popularity: entity.metadata?.popularity,
      tags: entity.metadata?.tags,
      searchKeywords: entity.metadata?.searchKeywords,
    },
  };
}

export function getFallbackSharedMapItems() {
  return MAP_ENTITIES.map(mapEntityToSharedMapItem).filter(Boolean);
}

export function normalizeSharedMapFeedItems(items) {
  return (Array.isArray(items) ? items : []).map(sharedMapItemToMapEntity).filter(Boolean);
}

export function adaptEntityToMapPin(entity) {
  const item = sharedMapItemToMapEntity(entity);
  if (!item) return null;

  return {
    ...item,
    mapMode: "resident",
    pinType: item.markerType || TYPE_TO_MARKER[item.type] || "standard",
    cardTitle: item.title || item.name,
    cardSubtitle: item.subtitle || item.address || item.category,
  };
}

export function adaptEntityToInsightPin(entity) {
  if (!entity) return null;
  const { latitude, longitude } = getRawCoordinates(entity);
  if (!isValidCoordinatePair(latitude, longitude)) return null;

  const insightType = entity.insightType || entity.insight_type || entity.type || "performance";
  const id = String(entity.id || entity.entity_id || `${insightType}-${entity.title || entity.name}`);
  const title = entity.title || entity.name || entity.label || "Partner insight";

  return {
    ...entity,
    id,
    entity_id: entity.entity_id || id,
    name: title,
    title,
    type: "insight",
    entity_type: "insight",
    insightType,
    category: entity.category || insightType,
    markerType: "insight",
    markerVariant: insightType,
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    location: {
      latitude,
      longitude,
      valid: true,
    },
    mapMode: "partner",
    isPlotted: true,
    isVisibleInResults: true,
    isInsight: true,
    label: entity.label,
    value: entity.value,
    summary: entity.summary || entity.description,
    metadata: {
      ...(entity.metadata || {}),
      partnerType: entity.partnerType || entity.partner_type,
      linkedEntityIds: entity.linkedEntityIds || entity.linked_entity_ids || [],
    },
  };
}

export function adaptEntityToCardModel(entity) {
  const item = sharedMapItemToMapEntity(entity);
  if (!item) return null;

  return {
    id: item.id,
    title: item.title || item.name,
    subtitle: item.subtitle || item.address || item.category,
    description: item.description || item.perk_description,
    type: item.type,
    category: item.category,
    status: item.status || (item.isLive ? "live" : item.isOpenNow ? "open" : "active"),
    imageUrl: item.image_url || item.image,
    coordinates: item.location,
    actions: item.quickActions || ["save", "directions", "details"],
  };
}

export function adaptEntityToInsightCard(entity) {
  const insight = adaptEntityToInsightPin(entity);
  if (!insight) return null;

  return {
    id: insight.id,
    title: insight.title,
    label: insight.label || insight.insightType,
    value: insight.value,
    summary: insight.summary || insight.description,
    insightType: insight.insightType,
    partnerType: insight.metadata?.partnerType,
    linkedEntityIds: insight.metadata?.linkedEntityIds || [],
    coordinates: insight.location,
  };
}
