import { getMapCollectionById } from "../../data/mapCollections";
import { entityHasExplicitInKindMembership } from "../../map/searchIntent/mapIntentRegistry";
import { resolveEntityType } from "./entityTypeResolver";

const DEFAULT_CENTER = { lat: 30.25855, lng: -97.73835 };
const INKIND_COLLECTION_ID = "inkind-dining-market";
const INKIND_COLLECTION_STOP_IDS = new Set(getMapCollectionById(INKIND_COLLECTION_ID)?.stopIds || []);

export const CANONICAL_SEARCH_INTENTS = Object.freeze({
  eat_drink: {
    id: "eat_drink",
    label: "Eat & Drink",
    aliases: ["dining", "dinner", "lunch", "breakfast", "brunch", "food", "restaurant", "eat", "drink", "drinks", "nightlife"],
    iconKey: "dining",
    cap: 36,
  },
  coffee: {
    id: "coffee",
    label: "Coffee",
    aliases: ["coffee", "cafe", "espresso"],
    iconKey: "coffee",
    cap: 28,
  },
  nightlife: {
    id: "nightlife",
    label: "Nightlife",
    aliases: ["nightlife", "bar", "cocktail", "happy hour", "happy_hour", "drinks", "live music"],
    iconKey: "nightlife",
    cap: 32,
  },
  events: {
    id: "events",
    label: "Events",
    aliases: ["events", "event", "rsvp", "things to do", "live music", "tonight"],
    iconKey: "event",
    cap: 36,
  },
  inkind: {
    id: "inkind",
    label: "inKind",
    aliases: ["inkind", "in kind"],
    iconKey: "dining",
    cap: 24,
  },
  resident_perks: {
    id: "resident_perks",
    label: "Resident Perks",
    aliases: ["perks", "perk", "offer", "offers", "redeem", "use perk", "resident perk"],
    iconKey: "offer",
    cap: 36,
  },
  hotels: {
    id: "hotels",
    label: "Hotels",
    aliases: ["hotel", "hotels", "stay", "guest", "hospitality"],
    iconKey: "hotel",
    cap: 28,
  },
  buildings: {
    id: "buildings",
    label: "Buildings",
    aliases: ["property", "properties", "building", "buildings", "residential", "apartment", "condo", "legends", "listing"],
    iconKey: "residential",
    cap: 44,
  },
  shopping: {
    id: "shopping",
    label: "Shopping",
    aliases: ["shopping", "retail", "shop", "store", "boutique", "eyewear", "apparel"],
    iconKey: "retail",
    cap: 28,
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    aliases: ["wellness", "fitness", "spa", "salon", "gym", "yoga", "pilates", "recovery"],
    iconKey: "wellness",
    cap: 28,
  },
  attractions: {
    id: "attractions",
    label: "Attractions",
    aliases: ["attraction", "attractions", "arts", "culture", "museum", "gallery", "public art", "route", "walk"],
    iconKey: "culture",
    cap: 36,
  },
  civic: {
    id: "civic",
    label: "Civic",
    aliases: ["civic", "public", "library", "park", "government", "community", "service", "daa", "art walk", "waterloo"],
    iconKey: "civic",
    cap: 28,
  },
  services: {
    id: "services",
    label: "Services",
    aliases: ["services", "service", "parking", "printing", "pharmacy", "shipping", "cleaning", "bike share", "visitor info", "ev charging"],
    iconKey: "service",
    cap: 24,
  },
  campaigns: {
    id: "campaigns",
    label: "Campaigns",
    aliases: ["campaign", "campaigns", "activation", "activations", "passport", "challenge", "sponsor", "sponsorship"],
    iconKey: "campaign",
    cap: 28,
  },
  brands: {
    id: "brands",
    label: "Brands",
    aliases: ["brand", "brands", "sponsor", "topo chico", "yeti", "rivian", "lululemon"],
    iconKey: "brand",
    cap: 28,
  },
});

export const CIVIC_SUB_INTENTS = Object.freeze({
  civic_meetings: ["meeting", "council", "commission", "board", "agenda"],
  public_services: ["library", "permit", "service", "visitor info", "transit", "utility", "public service"],
  community_programs: ["program", "community", "association", "workshop", "education"],
  public_spaces: ["park", "plaza", "square", "trail", "greenway", "public space", "waterloo"],
  local_government: ["government", "city hall", "municipal", "county", "state", "capitol"],
  mobility: ["mobility", "bike", "scooter", "transit", "parking", "ev", "charging", "walk"],
  safety: ["safety", "police", "fire", "medical", "emergency"],
  volunteering: ["volunteer", "donate", "cleanup", "steward", "nonprofit"],
});

const FILTER_INTENT_MAP = Object.freeze({
  All: "eat_drink",
  Nearby: "eat_drink",
  Dining: "eat_drink",
  Dinner: "eat_drink",
  Lunch: "eat_drink",
  Breakfast: "eat_drink",
  Brunch: "eat_drink",
  Drinks: "nightlife",
  Cocktails: "nightlife",
  Nightlife: "nightlife",
  "Happy Hour": "nightlife",
  "Happy Hours": "nightlife",
  "Happy Hour Now": "nightlife",
  "Happy Hour Today": "nightlife",
  Coffee: "coffee",
  Events: "events",
  "Live Music": "events",
  Perks: "resident_perks",
  inKind: "inkind",
  Hotels: "hotels",
  Properties: "buildings",
  Rentals: "buildings",
  Legends: "buildings",
  Listings: "buildings",
  "All Listings": "buildings",
  Retail: "shopping",
  Shopping: "shopping",
  Wellness: "wellness",
  Fitness: "wellness",
  Civic: "civic",
  "Explore Downtown": "civic",
  Arts: "attractions",
  Campaigns: "campaigns",
  "Brand Activations": "campaigns",
  Brands: "brands",
  Services: "services",
  Parking: "services",
  "EV Charging": "services",
  Printing: "services",
  Pharmacy: "services",
  Cleaners: "services",
  Shipping: "services",
  "Bike Share": "services",
  "Visitor Info": "services",
});

function textForEntity(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.district,
    entity.address,
    entity.sourceType,
    entity.visibilityMode,
    entity.utilityType,
    entity.offerType,
    entity.partnerType,
    entity.partnerNetwork,
    entity.brand,
    entity.program,
    raw.id,
    raw.title,
    raw.kind,
    raw.category,
    raw.neighborhood,
    raw.visibilityMode,
    raw.utilityType,
    raw.offerType,
    raw.partnerType,
    raw.partnerNetwork,
    raw.brand,
    raw.program,
    ...(Array.isArray(entity.tags) ? entity.tags : []),
    ...(Array.isArray(raw.tags) ? raw.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function numberOrNull(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function normalizeIconKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableEntityId(entity = {}) {
  return String(entity.id || entity.entityId || entity.raw?.id || "").trim();
}

export function hasVerifiedInKindMembership(entity = {}) {
  return entityHasExplicitInKindMembership(entity) || INKIND_COLLECTION_STOP_IDS.has(stableEntityId(entity));
}

function hasActivePerk(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const text = textForEntity(entity);
  return Boolean(
    entity.perkEligible ||
      raw.perkEligible ||
      entity.hasPerk ||
      raw.hasPerk ||
      entity.perk?.isActive ||
      raw.perk?.isActive ||
      entity.perkStatus === "active" ||
      raw.perkStatus === "active" ||
      /\b(perk|offer|redeem|resident perk|happy hour)\b/.test(text),
  );
}

function hasActiveCampaign(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const text = textForEntity(entity);
  return Boolean(
    entity.campaignId ||
      raw.campaignId ||
      raw.campaign_id ||
      entity.activeCampaign ||
      raw.activeCampaign ||
      /\b(campaign|activation|passport|challenge|sponsor|featured)\b/.test(text),
  );
}

function deriveIntentIds(entity = {}) {
  const text = textForEntity(entity);
  const ids = Object.values(CANONICAL_SEARCH_INTENTS)
    .filter((intent) => intent.id !== "inkind" && intent.aliases.some((alias) => text.includes(alias)))
    .map((intent) => intent.id);

  if (hasVerifiedInKindMembership(entity)) ids.push("inkind");
  if (hasActivePerk(entity)) ids.push("resident_perks");
  if (hasActiveCampaign(entity)) ids.push("campaigns");
  if (/\b(event|rsvp|festival|show|concert)\b/.test(text)) ids.push("events");
  if (/\b(hotel|hospitality|stay|guest)\b/.test(text)) ids.push("hotels");
  if (/\b(civic|public|library|park|government|daa|waterloo|greenway)\b/.test(text)) ids.push("civic");
  return unique(ids.length ? ids : ["eat_drink"]);
}

function deriveCivicSubtype(entity = {}) {
  const text = textForEntity(entity);
  return Object.entries(CIVIC_SUB_INTENTS).find(([, tokens]) => tokens.some((token) => text.includes(token)))?.[0] || "";
}

function derivePublicationStatus(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const explicit = String(entity.publicationStatus || raw.publicationStatus || raw.publication_status || "").toLowerCase();
  if (explicit) return explicit;
  if (entity.active === false || raw.active === false) return "draft";
  if (/\b(test|placeholder|demo|qa only|internal)\b/.test(textForEntity(entity))) return "draft";
  return "published";
}

function deriveVisibility(entity = {}, searchIntentIds = []) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const explicit = String(entity.mapVisibility || raw.mapVisibility || raw.map_visibility || "").toLowerCase();
  if (["priority", "intent_only", "viewport_only", "search_only", "hidden"].includes(explicit)) return explicit;
  if (entity.visibilityMode === "utility" || raw.visibilityMode === "utility") return "intent_only";
  if (entity.visibilityMode === "parking" || raw.visibilityMode === "parking") return "intent_only";
  if (hasActiveCampaign(entity) || hasActivePerk(entity)) return "priority";
  if (searchIntentIds.includes("civic") || searchIntentIds.includes("services")) return "viewport_only";
  return "priority";
}

function derivePriorityTier(entity = {}, searchIntentIds = []) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const explicit = numberOrNull(entity.priorityTier ?? raw.priorityTier ?? raw.priority_tier ?? entity.entityTier ?? raw.entityTier);
  if (explicit) return Math.max(1, Math.min(4, explicit));
  const score = numberOrNull(entity.experienceScore ?? raw.experienceScore);
  if (score && score >= 85) return 1;
  if (hasActiveCampaign(entity) || hasActivePerk(entity)) return 1;
  if (searchIntentIds.includes("events") || searchIntentIds.includes("hotels") || searchIntentIds.includes("buildings")) return 2;
  if (searchIntentIds.includes("services")) return 4;
  return 3;
}

function resolvedEntityType(entity = {}) {
  try {
    return String(resolveEntityType(entity) || entity.entityType || entity.type || entity.kind || entity.raw?.kind || "place").toLowerCase();
  } catch {
    return String(entity.entityType || entity.type || entity.kind || entity.raw?.kind || "place").toLowerCase();
  }
}

function canonicalMarkerIconKey(entity = {}, targetType = resolvedEntityType(entity)) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const explicitPin = normalizeIconKey(entity.pinKey || raw.pinKey);

  if (targetType === "restaurant") return "dining";
  if (["coffee", "cafe"].includes(targetType)) return "coffee";
  if (["bar", "nightlife"].includes(targetType)) return "nightlife";
  if (explicitPin && explicitPin !== "default") return explicitPin;
  if (["property", "residential", "building"].includes(targetType)) return "residential";
  if (["listing", "rental"].includes(targetType)) return "listing";
  if (targetType === "hotel") return "hotel";
  if (targetType === "event") return "event";
  if (targetType === "civic") return "civic";
  if (targetType === "wellness") return "wellness";
  if (targetType === "retail") return "retail";
  if (targetType === "brand") return "brand";
  if (targetType === "campaign") return "campaign";
  if (["perk", "offer"].includes(targetType)) return "offer";
  if (["service", "mobility"].includes(targetType)) return "service";
  return "guide";
}

function canonicalPlaceIntentId(targetType, iconKey, fallbackIntentIds = []) {
  if (targetType === "restaurant" || iconKey === "dining") return "eat_drink";
  if (["coffee", "cafe"].includes(targetType) || iconKey === "coffee") return "coffee";
  if (["bar", "nightlife"].includes(targetType) || iconKey === "nightlife") return "nightlife";
  if (targetType === "event" || iconKey === "event") return "events";
  if (targetType === "hotel" || iconKey === "hotel") return "hotels";
  if (["property", "residential", "building", "listing", "rental"].includes(targetType)) return "buildings";
  if (targetType === "retail" || iconKey === "retail") return "shopping";
  if (targetType === "wellness" || iconKey === "wellness") return "wellness";
  if (targetType === "civic" || iconKey === "civic") return "civic";
  return fallbackIntentIds.find((intentId) => intentId !== "inkind") || "eat_drink";
}

export function getCanonicalIntentForFilter(filter = "All", query = "") {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (/\binkind\b|\bin\s+kind\b/.test(normalizedQuery)) return "inkind";

  const mapped = FILTER_INTENT_MAP[filter] || "";
  if (mapped) return mapped;

  const matched = Object.values(CANONICAL_SEARCH_INTENTS)
    .filter((intent) => intent.id !== "inkind")
    .find((intent) => intent.aliases.some((alias) => normalizedQuery.includes(alias)));
  return matched?.id || "eat_drink";
}

export function getEntityGovernance(entity = {}) {
  const searchIntentIds = deriveIntentIds(entity);
  const publicationStatus = derivePublicationStatus(entity);
  const mapVisibility = deriveVisibility(entity, searchIntentIds);
  const priorityTier = derivePriorityTier(entity, searchIntentIds);
  const lat = numberOrNull(entity.latitude ?? entity.lat ?? entity.raw?.lat);
  const lng = numberOrNull(entity.longitude ?? entity.lng ?? entity.raw?.lng);
  const isMapEligible = publicationStatus === "published" && mapVisibility !== "hidden" && lat !== null && lng !== null;
  const isResidentVisible = !/\b(admin|internal|qa only|backend|workspace)\b/.test(textForEntity(entity));
  const targetType = resolvedEntityType(entity);
  return {
    publicationStatus,
    mapVisibility,
    priorityTier,
    isMapEligible,
    isResidentVisible,
    searchIntentIds,
    targetType,
    civicSubtype: deriveCivicSubtype(entity),
    hasActivePerk: hasActivePerk(entity),
    hasActiveCampaign: hasActiveCampaign(entity),
    hasVerifiedInKindMembership: hasVerifiedInKindMembership(entity),
    lat,
    lng,
  };
}

function isWithinBounds(entity, bounds) {
  if (!bounds) return true;
  const lat = numberOrNull(entity.latitude ?? entity.lat ?? entity.raw?.lat);
  const lng = numberOrNull(entity.longitude ?? entity.lng ?? entity.raw?.lng);
  if (lat === null || lng === null) return false;
  const pad = 0.0035;
  return lat <= Number(bounds.north) + pad && lat >= Number(bounds.south) - pad && lng <= Number(bounds.east) + pad && lng >= Number(bounds.west) - pad;
}

function distanceScore(entity, center = DEFAULT_CENTER) {
  const lat = numberOrNull(entity.latitude ?? entity.lat ?? entity.raw?.lat) ?? DEFAULT_CENTER.lat;
  const lng = numberOrNull(entity.longitude ?? entity.lng ?? entity.raw?.lng) ?? DEFAULT_CENTER.lng;
  return Math.hypot(lat - center.lat, lng - center.lng);
}

function matchesIntent(entity, intentId) {
  if (!intentId || intentId === "all") return true;
  if (intentId === "inkind") return hasVerifiedInKindMembership(entity);

  const governance = getEntityGovernance(entity);
  if (!governance.searchIntentIds.includes(intentId)) return false;
  if (intentId === "civic") {
    const isUsefulCivic = Boolean(governance.civicSubtype) || governance.priorityTier <= 2 || governance.hasActiveCampaign;
    return isUsefulCivic && !/\b(generic|expired|incomplete|placeholder|test)\b/.test(textForEntity(entity));
  }
  return true;
}

export function getMarkerLimit({ zoom = 16, viewportBounds = null, intentId = "eat_drink" } = {}) {
  const baseCap = CANONICAL_SEARCH_INTENTS[intentId]?.cap || 32;
  const effectiveZoom = Number(viewportBounds?.zoom || zoom || 16);
  if (effectiveZoom >= 18.5) return Math.min(80, baseCap + 24);
  if (effectiveZoom >= 17) return Math.min(56, baseCap + 12);
  if (effectiveZoom < 15.5) return Math.min(18, baseCap);
  return baseCap;
}

export function getMarkerProjection(entity = {}) {
  const governance = getEntityGovernance(entity);
  const iconKey = canonicalMarkerIconKey(entity, governance.targetType);
  const primaryIntentId = canonicalPlaceIntentId(governance.targetType, iconKey, governance.searchIntentIds);
  return {
    id: String(entity.id || entity.raw?.id || ""),
    lat: governance.lat,
    lng: governance.lng,
    label: String(entity.name || entity.title || entity.raw?.title || ""),
    entityType: governance.targetType,
    primaryIntentId,
    iconKey,
    programIntentIds: governance.searchIntentIds.filter((intentId) => intentId === "inkind"),
    priorityTier: governance.priorityTier,
    hasActivePerk: governance.hasActivePerk,
    hasActiveCampaign: governance.hasActiveCampaign,
  };
}

export function getViewportBoundedMarkerPlaces(places = [], {
  activeFilter = "All",
  query = "",
  viewportBounds = null,
  zoom = 16,
  selectedId = "",
  mode = "resident",
} = {}) {
  const intentId = getCanonicalIntentForFilter(activeFilter, query);
  const center = viewportBounds?.center || DEFAULT_CENTER;
  const limit = getMarkerLimit({ zoom, viewportBounds, intentId });
  const selected = selectedId ? places.find((place) => String(place.id) === String(selectedId)) : null;
  const isPartner = mode === "partner";
  const scoped = places
    .filter((place) => {
      const governance = getEntityGovernance(place);
      if (!governance.isMapEligible) return false;
      if (!isPartner && !governance.isResidentVisible) return false;
      if (String(place.id) === String(selectedId)) return true;
      if (!matchesIntent(place, intentId)) return false;
      if (governance.mapVisibility === "search_only" && !query) return false;
      if (governance.mapVisibility === "intent_only" && activeFilter === "All" && !query) return false;
      return isWithinBounds(place, viewportBounds) || governance.mapVisibility === "priority";
    })
    .sort((a, b) => {
      const aGov = getEntityGovernance(a);
      const bGov = getEntityGovernance(b);
      if (aGov.priorityTier !== bGov.priorityTier) return aGov.priorityTier - bGov.priorityTier;
      if (aGov.hasActiveCampaign !== bGov.hasActiveCampaign) return aGov.hasActiveCampaign ? -1 : 1;
      if (aGov.hasActivePerk !== bGov.hasActivePerk) return aGov.hasActivePerk ? -1 : 1;
      return distanceScore(a, center) - distanceScore(b, center) || String(a.id).localeCompare(String(b.id));
    });

  const selectedPrepended = selected && !scoped.some((place) => place.id === selected.id)
    ? [selected, ...scoped]
    : scoped;

  return {
    intentId,
    limit,
    places: selectedPrepended.slice(0, selected ? limit + 1 : limit),
    markerPayload: selectedPrepended.slice(0, limit).map(getMarkerProjection),
    totalCandidates: scoped.length,
  };
}

export function getAgentEntityRegistrySnapshot(places = [], options = {}) {
  return getViewportBoundedMarkerPlaces(places, options).places.slice(0, 32).map((place) => {
    const governance = getEntityGovernance(place);
    const marker = getMarkerProjection(place);
    return {
      id: place.id,
      title: place.name || place.title,
      kind: place.kind || place.type || place.category || "",
      category: place.category || "",
      district: place.district || "",
      primaryIntentId: marker.primaryIntentId,
      programIntentIds: marker.programIntentIds,
      priorityTier: governance.priorityTier,
      hasActivePerk: governance.hasActivePerk,
      hasActiveCampaign: governance.hasActiveCampaign,
    };
  });
}
