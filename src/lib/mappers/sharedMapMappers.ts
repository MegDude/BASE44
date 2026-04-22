import { MAP_ENTITIES } from "@/data/mapEntities";
import {
  perks as REPLIT_PERKS,
  events as REPLIT_EVENTS,
  partners as REPLIT_PARTNERS,
  properties as REPLIT_PROPERTIES,
  moments as REPLIT_MOMENTS,
} from "@/data/replitApiStore";

const TYPE_TO_MARKER = {
  venue: "standard",
  event: "event",
  perk: "perk",
  building: "building",
  property: "building",
  hotel: "building",
  moment: "moment",
  brand: "brand",
  civic: "civic",
};

const normalizeType = (type) => {
  if (type === "civic_activation") return "civic";
  if (type === "campaign") return "brand";
  return type || "venue";
};

const toWalkMinutes = (distanceValue) => {
  if (!distanceValue) return undefined;
  const match = String(distanceValue).match(/([\d.]+)\s*mi/i);
  if (!match) return undefined;
  const miles = Number.parseFloat(match[1]);
  return Number.isFinite(miles) ? Math.max(1, Math.round(miles * 20)) : undefined;
};

const inferDistrict = (address = "") => {
  const value = String(address).toLowerCase();
  if (value.includes("rainey")) return "rainey";
  if (value.includes("congress")) return "congress";
  if (value.includes("2nd") || value.includes("second")) return "2nd-street";
  if (value.includes("6th")) return "6th-street";
  if (value.includes("red river")) return "red-river";
  if (value.includes("warehouse")) return "warehouse";
  return "downtown";
};

const dedupeById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.entity_id || item?.id || item?.title || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function mapReplitPerkToSharedItem(perk) {
  return {
    id: `perk-${perk.id}`,
    entity_id: perk.id,
    entity_type: "perk",
    title: perk.title || perk.businessName,
    subtitle: perk.businessName,
    description: perk.description,
    district: inferDistrict(perk.address),
    category: perk.category,
    latitude: perk.latitude,
    longitude: perk.longitude,
    status: perk.active === false ? "inactive" : "active",
    icon: "perk",
    source_ref: "replit-api-store",
    metadata: {
      address: perk.address,
      hours: perk.hours,
      website: perk.website,
      phone: perk.phone,
      tags: perk.tags || [],
      walkMinutes: toWalkMinutes(perk.distance),
      popularity: perk.trendingScore || perk.savedCount || perk.redemptionCount || 0,
      rating: perk.rating,
      reviewCount: perk.reviewCount,
      discount: perk.discount,
      perk_value: perk.discount,
      perk_description: perk.description,
      isOpenNow: Boolean(perk.isOpenNow),
      isFeatured: Boolean(perk.isFeatured),
      searchKeywords: [perk.businessName, perk.title, perk.category].filter(Boolean),
      askMapIntentTags: perk.tags || [],
    },
  };
}

function mapReplitEventToSharedItem(event) {
  const isLive = Boolean(event.date && new Date(event.date).getTime() <= Date.now());
  return {
    id: `event-${event.id}`,
    entity_id: event.id,
    entity_type: "event",
    title: event.title,
    subtitle: event.venue,
    description: event.description,
    district: inferDistrict(event.address),
    category: event.category,
    latitude: event.latitude,
    longitude: event.longitude,
    status: event.active === false ? "inactive" : isLive ? "live" : "upcoming",
    icon: "event",
    source_ref: "replit-api-store",
    metadata: {
      address: event.address,
      venue_name: event.venue,
      rsvp_count: event.rsvpCount,
      date: event.date,
      time: event.time,
      isLive,
      popularity: event.rsvpCount || 0,
      searchKeywords: [event.title, event.venue, event.category].filter(Boolean),
      askMapIntentTags: [event.category, "event", "tonight"].filter(Boolean),
    },
  };
}

function mapReplitPartnerToSharedItem(partner) {
  const entityType = partner.category === "hotel" ? "hotel" : "venue";
  return {
    id: `${entityType}-${partner.id}`,
    entity_id: partner.id,
    entity_type: entityType,
    title: partner.name,
    subtitle: partner.tagline,
    description: partner.description,
    district: inferDistrict(partner.address),
    category: partner.category,
    latitude: partner.latitude,
    longitude: partner.longitude,
    status: "active",
    icon: entityType,
    source_ref: "replit-api-store",
    metadata: {
      address: partner.address,
      hours: partner.hours,
      website: partner.website,
      phone: partner.phone,
      offer: partner.offer,
      offerDetail: partner.offerDetail,
      isFeatured: Boolean(partner.featured),
      popularity: partner.featured ? 80 : 40,
      searchKeywords: [partner.name, partner.tagline, partner.category].filter(Boolean),
      askMapIntentTags: [partner.category, partner.offer].filter(Boolean),
    },
  };
}

function mapReplitPropertyToSharedItem(property) {
  return {
    id: `building-${property.id}`,
    entity_id: property.id,
    entity_type: "building",
    title: property.buildingName,
    subtitle: property.priceRange,
    description: property.description,
    district: inferDistrict(property.address),
    category: "building",
    latitude: property.latitude,
    longitude: property.longitude,
    status: "active",
    icon: "building",
    source_ref: "replit-api-store",
    metadata: {
      address: property.address,
      unitTypes: property.unitTypes || [],
      unitCount: property.unitCount,
      priceRange: property.priceRange,
      amenities: property.amenities || [],
      website: property.website,
      isLegends: Boolean(property.isLegends),
      popularity: property.isFeatured ? 75 : 45,
      searchKeywords: [property.buildingName, property.priceRange, ...(property.unitTypes || [])].filter(Boolean),
      askMapIntentTags: ["building", "property", "apartment", "residential"],
    },
  };
}

function mapReplitMomentToSharedItem(moment) {
  return {
    id: `moment-${moment.id}`,
    entity_id: moment.id,
    entity_type: "moment",
    title: moment.title,
    subtitle: moment.placeName,
    description: moment.note || moment.perkNearby,
    district: moment.district || inferDistrict(moment.address),
    category: moment.category || "moment",
    latitude: moment.latitude,
    longitude: moment.longitude,
    status: "live",
    icon: "moment",
    source_ref: "replit-api-store",
    metadata: {
      address: moment.address,
      host: moment.host,
      participants: moment.participants || [],
      visibility: moment.visibility,
      perk_value: moment.perkNearby,
      isLive: true,
      popularity: Array.isArray(moment.participants) ? moment.participants.length : 0,
      searchKeywords: [moment.title, moment.placeName, moment.category].filter(Boolean),
      askMapIntentTags: ["moment", "social", moment.category].filter(Boolean),
    },
  };
}

export function getFallbackSharedMapItems() {
  const replitItems = [
    ...REPLIT_PERKS.map(mapReplitPerkToSharedItem),
    ...REPLIT_EVENTS.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).map(mapReplitEventToSharedItem),
    ...REPLIT_PARTNERS.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).map(mapReplitPartnerToSharedItem),
    ...REPLIT_PROPERTIES.map(mapReplitPropertyToSharedItem),
    ...REPLIT_MOMENTS.map(mapReplitMomentToSharedItem),
  ];
  const localItems = MAP_ENTITIES.filter((entity) => ["brand", "civic"].includes(entity?.type))
    .map(mapEntityToSharedMapItem)
    .filter(Boolean);
  return dedupeById([...replitItems, ...localItems]);
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
    shortInsight: entity.shortInsight || entity.short_insight,
    district: entity.district || entity.metadata?.district || "Downtown",
    address: entity.address || entity.metadata?.address || entity.district || "Downtown Austin",
    entityType: entity.entityType || entity.entity_type || "zone",
    performanceState: entity.performanceState || entity.performance_state || insightType,
    recommendedAction: entity.recommendedAction || entity.recommended_action,
    trend: entity.trend || entity.metadata?.trend || null,
    metrics: entity.metrics || entity.metadata?.metrics || {},
    sourceBreakdown: entity.sourceBreakdown || entity.source_breakdown || [],
    tags: entity.tags || entity.metadata?.tags || [],
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
    shortInsight: insight.shortInsight,
    metrics: insight.metrics,
    trend: insight.trend,
    sourceBreakdown: insight.sourceBreakdown,
    recommendedAction: insight.recommendedAction,
    district: insight.district,
    address: insight.address,
    entityType: insight.entityType,
    insightType: insight.insightType,
    partnerType: insight.metadata?.partnerType,
    linkedEntityIds: insight.metadata?.linkedEntityIds || [],
    coordinates: insight.location,
  };
}
