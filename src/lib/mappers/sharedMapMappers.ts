import { MAP_ENTITIES } from "@/data/mapEntities";
import { LEGENDS_IMPORTED_PROPERTIES } from "@/data/legendsImportData";
import { getProductGradePlace } from "@/data/productGradePlaces";
import { SUPPLEMENTAL_DOWNTOWN_LOCATIONS } from "@/data/supplementalDowntownLocations";
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

const normalizeEnrichedDistrict = (value = "") => {
  const district = String(value).toLowerCase();
  if (!district) return undefined;
  if (district.includes("rainey")) return "rainey";
  if (district.includes("2nd")) return "2nd-street";
  if (district.includes("congress")) return "congress";
  if (district.includes("seaholm")) return "seaholm";
  if (district.includes("west 6th") || district.includes("west-6th")) return "west-6th";
  if (district.includes("red river")) return "red-river";
  return "other";
};

const normalizeEnrichedCategory = (value = "", type = "venue") => {
  const category = String(value).toLowerCase();
  if (type === "hotel") return "hotel";
  if (category.includes("coffee")) return "coffee";
  if (category.includes("restaurant")) return "restaurant";
  if (category.includes("nightlife") || category.includes("bar")) return "bar";
  if (category.includes("retail")) return "retail";
  if (category.includes("event") || category.includes("music")) return "entertainment";
  if (category.includes("civic") || category.includes("cultural") || category.includes("landmark")) return "services";
  return type;
};

const mergeListValues = (...values) => [
  ...new Set(
    values
      .flat()
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean)
  ),
];

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
  const enrichment = getProductGradePlace(name);
  const address =
    item.address ||
    item.metadata?.address ||
    item.subtitle ||
    enrichment?.district ||
    "Downtown Austin";
  const category =
    item.category ||
    item.metadata?.category ||
    normalizeEnrichedCategory(enrichment?.category, type);
  const district =
    item.district ||
    item.metadata?.district ||
    normalizeEnrichedDistrict(enrichment?.district) ||
    "other";
  const baseDescription = item.description || item.metadata?.description;
  const enrichedKeywords = mergeListValues(
    item.metadata?.searchKeywords,
    enrichment?.tags,
    [enrichment?.subcategory, enrichment?.category, enrichment?.district]
  );
  const enrichedIntentTags = mergeListValues(
    item.metadata?.askMapIntentTags,
    enrichment?.tags,
    [normalizeEnrichedCategory(enrichment?.category, type), type]
  );
  const enrichedTags = mergeListValues(item.metadata?.tags, enrichment?.tags);

  return {
    ...item,
    id,
    entity_id: item.entity_id || id,
    name,
    title: item.title || name,
    type,
    entity_type: type,
    category,
    subcategory: item.subcategory || item.metadata?.subcategory || enrichment?.subcategory,
    description: baseDescription || enrichment?.shortDescription || enrichment?.whyItMatters,
    address,
    district,
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
    isLegends: Boolean(item?.isLegends || item?.metadata?.isLegends),
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
      shortDescription: item.metadata?.shortDescription || enrichment?.shortDescription,
      whyItMatters: item.metadata?.whyItMatters || enrichment?.whyItMatters,
      highlightedFeatures: item.metadata?.highlightedFeatures || enrichment?.subcategory,
      sourceConfidence: item.metadata?.sourceConfidence || enrichment?.sourceConfidence,
      productStatus: item.metadata?.productStatus || enrichment?.status,
      tags: enrichedTags,
      searchKeywords: enrichedKeywords,
      askMapIntentTags: enrichedIntentTags,
      isLegends: Boolean(item?.isLegends || item?.metadata?.isLegends),
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
      buildingId: property.id,
      buildingName: property.buildingName,
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

function mapFeaturedBrandToSharedItem(brand) {
  return {
    id: `brand-${brand.slug}`,
    entity_id: brand.slug,
    entity_type: "brand",
    title: brand.name,
    subtitle: brand.category,
    description: brand.description,
    district: brand.district,
    category: "brand",
    latitude: brand.latitude,
    longitude: brand.longitude,
    status: "active",
    icon: brand.iconType || "brand",
    markerVariant: brand.markerVariant || "gold",
    route: brand.route,
    source_ref: "featured-brands-directory",
    metadata: {
      address: brand.address,
      popularity: 72,
      tag: brand.tag,
      route: brand.route,
      searchKeywords: [brand.name, brand.category, brand.tag, ...(brand.searchKeywords || [])].filter(Boolean),
      askMapIntentTags: [...(brand.askMapIntentTags || []), "brand", "partner"].filter(Boolean),
    },
  };
}

function mapSupplementalLocationToSharedItem(place) {
  return {
    id: place.id,
    entity_id: place.id,
    entity_type: place.entityType,
    title: place.name,
    subtitle: place.sourceCategory,
    description: place.alignment || place.summary,
    district: inferDistrict(place.address),
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    status: "active",
    icon: place.icon,
    source_ref: "downtown-austin-locations-csv",
    metadata: {
      address: place.address,
      website: place.website,
      shortDescription: place.summary,
      whyItMatters: place.alignment,
      sourceCategory: place.sourceCategory,
      popularity: 18,
      searchKeywords: [
        place.name,
        place.sourceCategory,
        place.category,
        place.address,
      ].filter(Boolean),
      askMapIntentTags: [place.category, place.entityType, place.sourceCategory].filter(Boolean),
    },
  };
}

function mapLegendsImportedPropertyToSharedItem(property) {
  const isCommercial = Array.isArray(property.categoryKeys)
    ? property.categoryKeys.includes("commercial_property")
    : false;

  return {
    id: `building-${property.id}`,
    entity_id: property.id,
    entity_type: "building",
    title: property.address || property.name,
    subtitle: `${property.groupedListingCount} imported listing${property.groupedListingCount === 1 ? "" : "s"}`,
    description: isCommercial
      ? "Imported Legends commercial property record grouped into the downtown property layer."
      : "Imported Legends residential property record grouped into the downtown property layer.",
    district: inferDistrict(property.address),
    category: "building",
    latitude: property.latitude,
    longitude: property.longitude,
    status: "active",
    icon: "building",
    source_ref: "legends-property-import-report",
    isLegends: true,
    metadata: {
      buildingId: property.id,
      buildingName: property.address || property.name,
      address: property.address,
      isLegends: true,
      listingType: isCommercial ? "commercial" : "residential",
      listingTypes: [isCommercial ? "commercial" : "residential"],
      groupedListingCount: property.groupedListingCount || 1,
      resolutionMethods: property.resolutions || [],
      importedCategoryKeys: property.categoryKeys || [],
      popularity: 58 + Number(property.groupedListingCount || 1),
      searchKeywords: [
        property.name,
        property.address,
        "legends",
        "property",
        ...(property.categoryKeys || []),
      ].filter(Boolean),
      askMapIntentTags: [
        "building",
        "property",
        "legends",
        isCommercial ? "commercial" : "residential",
      ],
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
  const supplementalLocationItems = SUPPLEMENTAL_DOWNTOWN_LOCATIONS.map(mapSupplementalLocationToSharedItem);
  const legendsImportItems = LEGENDS_IMPORTED_PROPERTIES.map(mapLegendsImportedPropertyToSharedItem);
  const localItems = MAP_ENTITIES.filter((entity) => ["civic"].includes(entity?.type))
    .map(mapEntityToSharedMapItem)
    .filter(Boolean);
  return dedupeById([
    ...replitItems,
    ...supplementalLocationItems,
    ...legendsImportItems,
    ...localItems,
  ]);
}

export function normalizeSharedMapFeedItems(items) {
  return (Array.isArray(items) ? items : []).map(sharedMapItemToMapEntity).filter(Boolean);
}

function normalizeBuildingAddress(value = "") {
  return String(value)
    .replace(/,\s*(austin|tx|texas|7870\d).*$/i, "")
    .replace(/\s+#\s*[\w-]+.*$/i, "")
    .replace(/\s+unit:?\s*[\w-]+.*$/i, "")
    .replace(/\s+apt\.?\s+[\w-]+.*$/i, "")
    .replace(/\s+suite\s+[\w-]+.*$/i, "")
    .replace(/\bstreet\b/gi, "st")
    .replace(/\bavenue\b/gi, "ave")
    .replace(/\bboulevard\b/gi, "blvd")
    .replace(/\broad\b/gi, "rd")
    .replace(/\bdrive\b/gi, "dr")
    .replace(/\s*,\s*/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

const CANONICAL_BUILDING_ALIASES = [
  { canonical: "70 Rainey", patterns: ["70 rainey"] },
  { canonical: "44 East Ave", patterns: ["44 east ave", "44 east avenue"] },
  { canonical: "700 River", patterns: ["700 river"] },
  { canonical: "Natiivo Austin", patterns: ["48 east ave", "natiivo"] },
  { canonical: "Milago", patterns: ["54 rainey", "milago"] },
  { canonical: "Waterloo Tower", patterns: ["700 e 11th", "700 east 11th", "waterloo tower"] },
  { canonical: "360 Condos", patterns: ["360 nueces", "360 condos", "360 condo"] },
  { canonical: "The Independent", patterns: ["301 west ave", "301 west avenue", "the independent"] },
  { canonical: "Austonian", patterns: ["200 congress", "austonian"] },
  { canonical: "Four Seasons Residences", patterns: ["98 san jacinto", "four seasons residences"] },
  { canonical: "The Bowie", patterns: ["311 w 5th", "311 west 5th", "the bowie"] },
  { canonical: "Fifth & West", patterns: ["501 west ave", "501 west avenue", "fifth west"] },
  { canonical: "Towers of Town Lake", patterns: ["40 n interstate 35", "towers of town lake"] },
];

function getCanonicalBuildingName(item) {
  const candidates = [
    item?.metadata?.buildingName,
    item?.buildingName,
    item?.name,
    item?.title,
    item?.address,
    item?.metadata?.address,
    item?.id,
    item?.entity_id,
  ]
    .filter(Boolean)
    .map((value) => normalizeBuildingAddress(String(value)));

  for (const candidate of candidates) {
    const match = CANONICAL_BUILDING_ALIASES.find((alias) =>
      alias.patterns.some((pattern) => candidate.includes(pattern))
    );
    if (match) return match.canonical;
  }

  return item?.metadata?.buildingName || item?.buildingName || null;
}

function getPropertyGroupingKey(item) {
  const canonicalName = getCanonicalBuildingName(item);
  if (canonicalName) return `canonical:${canonicalName.toLowerCase()}`;

  const buildingId = item?.buildingId || item?.metadata?.buildingId;
  if (buildingId) return `building:${String(buildingId).toLowerCase()}`;

  const buildingName = item?.buildingName || item?.metadata?.buildingName;
  if (buildingName) return `name:${String(buildingName).toLowerCase()}`;

  const address = normalizeBuildingAddress(item?.address || item?.metadata?.address || "");
  if (address) return `address:${address.toLowerCase()}`;

  const latitude = Number(item?.latitude ?? item?.lat ?? item?.location?.latitude);
  const longitude = Number(item?.longitude ?? item?.lng ?? item?.location?.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `coords:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  }

  return null;
}

function sortPropertyPrimary(a, b) {
  const rank = (item) => {
    let score = 0;
    if (item?.type === "building") score += 40;
    if (item?.metadata?.buildingName) score += 20;
    if (item?.name && !String(item.name).includes("#")) score += 12;
    if (item?.metadata?.priceRange) score += 10;
    if (item?.metadata?.unitCount) score += 8;
    return score;
  };

  return rank(b) - rank(a);
}

export function groupPropertyMapEntities(items) {
  const sourceItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const grouped = new Map();
  const passthrough = [];

  for (const item of sourceItems) {
    const isProperty = item?.type === "building" || item?.type === "property";
    if (!isProperty) {
      passthrough.push(item);
      continue;
    }

    const key = getPropertyGroupingKey(item);
    if (!key) {
      passthrough.push(item);
      continue;
    }

    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  }

  const collapsed = Array.from(grouped.values()).map((itemsInGroup) => {
    const sorted = [...itemsInGroup].sort(sortPropertyPrimary);
    const primary = sorted[0];
    const allPrices = sorted
      .map((item) => item?.metadata?.priceRange || item?.subtitle || "")
      .filter(Boolean);
    const listingTypes = mergeListValues(
      sorted.map((item) => item?.metadata?.listingType || item?.listingType),
      sorted.flatMap((item) => item?.metadata?.listingTypes || [])
    );
    const listingAddresses = mergeListValues(
      sorted.map((item) => item?.address || item?.metadata?.address),
      sorted.flatMap((item) => item?.metadata?.listingAddresses || [])
    );
    const unitTypes = mergeListValues(
      sorted.flatMap((item) => item?.metadata?.unitTypes || []),
      sorted.map((item) => item?.unitTypes || [])
    );
    const groupedListingCount = sorted.reduce((total, item) => {
      return total + Number(item?.metadata?.groupedListingCount || 1);
    }, 0);

    return {
      ...primary,
      name:
        getCanonicalBuildingName(primary) ||
        primary?.metadata?.buildingName ||
        primary?.buildingName ||
        primary?.name ||
        primary?.title,
      title:
        getCanonicalBuildingName(primary) ||
        primary?.metadata?.buildingName ||
        primary?.buildingName ||
        primary?.title ||
        primary?.name,
      subtitle: primary?.metadata?.priceRange || primary?.subtitle,
      address: primary?.address || primary?.metadata?.address || "",
      metadata: {
        ...(primary?.metadata || {}),
        buildingId: primary?.buildingId || primary?.metadata?.buildingId || primary?.entity_id,
        buildingName:
          getCanonicalBuildingName(primary) ||
          primary?.metadata?.buildingName ||
          primary?.buildingName ||
          primary?.name ||
          primary?.title,
        groupedListingCount,
        groupedEntityCount: sorted.length,
        listingTypes,
        listingAddresses,
        groupedItems: sorted,
        unitTypes,
        allPriceRanges: allPrices,
        rollupKind: "building",
      },
    };
  });

  return [...passthrough, ...collapsed];
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
