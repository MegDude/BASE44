import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCanonicalIntentForFilter, getEntityGovernance } from "@/lib/map/intentGovernance";
import { entityMatchesMapIntent, resolveSearchIntent } from "@/map/searchIntent/mapIntentRegistry";
import {
  MAP_DISCOVERY_LIMITS,
  backendPinToMapEntity,
  getDiscoveryLimit,
  isExplicitMapSearch,
  searchOperationalMap,
  sourceFromTrigger,
} from "@/lib/map/mapDiscovery";
import { isDiscoveryControlFilter, normalizeDiscoveryControlQuery } from "@/lib/map/mapDiscoveryControls";
import { buildPlatformSearchCatalog, groupPlatformSearchResults, searchPlatformCatalog } from "@/lib/search/platformSearchCatalog";
import {
  buildMapQueryFromScope,
  createErrorMapResultState,
  createIdleMapResultState,
  createLoadingMapResultState,
  createReadyMapResultState,
} from "@/lib/map/intentScopedMapResults";

const QUERY_CACHE_MAX = MAP_DISCOVERY_LIMITS.cacheEntries;
const SEARCH_RESULT_LIMITS = Object.freeze({
  text: MAP_DISCOVERY_LIMITS.mobile,
  intent: MAP_DISCOVERY_LIMITS.mobile,
  mobile: MAP_DISCOVERY_LIMITS.mobile,
  desktop: MAP_DISCOVERY_LIMITS.desktop,
  entity: MAP_DISCOVERY_LIMITS.deepLink,
  route: MAP_DISCOVERY_LIMITS.maxVisibleDesktop,
  nearby: 8,
});

const PUBLIC_RAW_FIELD_ALLOWLIST = new Set([
  "id",
  "slug",
  "name",
  "title",
  "displayName",
  "category",
  "category_key",
  "subcategory",
  "type",
  "kind",
  "entityType",
  "markerType",
  "detailDrawerType",
  "detailEntityType",
  "portfolioId",
  "portfolio",
  "operatingStatus",
  "verificationStatus",
  "publicationStatus",
  "mapVisibility",
  "destinationKind",
  "district",
  "neighborhood",
  "address",
  "latitude",
  "longitude",
  "lat",
  "lng",
  "coords",
  "summary",
  "description",
  "shortDescription",
  "panelHeadline",
  "panelBody",
  "panelContent",
  "drawerHeadline",
  "drawerBody",
  "image",
  "imageUrl",
  "images",
  "gallery",
  "galleryImages",
  "video",
  "videos",
  "website",
  "url",
  "phone",
  "contact_phone",
  "bookingUrl",
  "rsvpUrl",
  "menuUrl",
  "offer",
  "deals_offers",
  "specials",
  "perk",
  "perks",
  "perkTitle",
  "perkDescription",
  "terms",
  "perk_terms",
  "valid_until",
  "expires",
  "happyHour",
  "tags",
  "searchKeywords",
  "daaTourStop",
  "eventTime",
  "eventDate",
  "startTime",
  "start_time",
  "endTime",
  "end_time",
  "date",
  "time",
  "schedule",
  "quickFacts",
  "goodFor",
  "included",
  "listings",
  "legendsListing",
  "residentQuickFacts",
  "residentHub",
  "localService",
  "serviceCategory",
  "serviceType",
  "downtownConnection",
  "nearbyBuildings",
  "nearbyPlaces",
  "nearby",
  "partnerSummary",
  "partnerOfferDescription",
  "partnerRecommendation",
  "partnerPerformance",
  "nearbyPriority",
  "linkedBusinesses",
  "linkedBuildings",
  "notableBuildings",
  "highlights",
]);

const INTERNAL_FIELD_PATTERN = /\b(metrics?|analytics|dashboard|crm|pipeline|forecast|financial|revenue|ebitda|pricingStrategy|sales|lead|sponsor|internal|source(Row|File|Table|Database)?|dataQuality|qualityFlag|private|workspace|backend|admin|opportunityScore|partnerOpportunity|campaignObjective)\b/i;

function sanitizeNestedPublicValue(value, depth = 0) {
  if (!value || depth > 4) return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeNestedPublicValue(item, depth + 1));
  if (typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !INTERNAL_FIELD_PATTERN.test(key))
      .map(([key, nestedValue]) => [key, sanitizeNestedPublicValue(nestedValue, depth + 1)]),
  );
}

function sanitizePublicRaw(raw = {}) {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([key]) => PUBLIC_RAW_FIELD_ALLOWLIST.has(key) && !INTERNAL_FIELD_PATTERN.test(key))
      .map(([key, value]) => [key, sanitizeNestedPublicValue(value)]),
  );
}

function toPublicMapEntity(entity = {}) {
  const publicRaw = sanitizePublicRaw(entity.raw);
  const {
    metrics: _metrics,
    analytics: _analytics,
    dashboardMetrics: _dashboardMetrics,
    internalNotes: _internalNotes,
    sourceRow: _sourceRow,
    sourceFile: _sourceFile,
    sourceDatabase: _sourceDatabase,
    crmStatus: _crmStatus,
    leadPriority: _leadPriority,
    sponsorStatus: _sponsorStatus,
    salesStage: _salesStage,
    opportunityScore: _opportunityScore,
    pricingStrategy: _pricingStrategy,
    partnerOpportunity: _partnerOpportunity,
    partner_opportunity: _partnerOpportunitySnake,
    raw: _raw,
    source: _source,
    ...publicEntity
  } = entity;

  const id = String(publicEntity.id || publicEntity.entity_id || "");
  const title = String(publicEntity.name || publicEntity.title || id);
  const lat = Number(publicEntity.lat ?? publicEntity.latitude ?? publicEntity.coords?.[0]);
  const lng = Number(publicEntity.lng ?? publicEntity.longitude ?? publicEntity.coords?.[1]);
  const entityType = String(publicEntity.entity_type || publicEntity.entityType || publicEntity.sourceType || sourceTypeForEntity(publicEntity));
  return {
    ...publicEntity,
    id,
    entity_id: String(publicEntity.entity_id || id),
    entity_type: entityType,
    title,
    name: title,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    status: String(publicEntity.status || "active"),
    visibility: String(publicEntity.visibility || "public"),
    tenant_id: publicEntity.tenant_id || publicEntity.tenantId || null,
    workspace_id: publicEntity.workspace_id || publicEntity.workspaceId || null,
    partner_id: publicEntity.partner_id || publicEntity.partnerId || null,
    property_id: publicEntity.property_id || publicEntity.propertyId || null,
    building_id: publicEntity.building_id || publicEntity.buildingId || null,
    campaign_id: publicEntity.campaign_id || publicEntity.campaignId || null,
    perk_id: publicEntity.perk_id || publicEntity.perkId || null,
    event_id: publicEntity.event_id || publicEntity.eventId || null,
    analytics_summary: publicEntity.analytics_summary || null,
    last_updated: String(publicEntity.last_updated || publicEntity.updatedAt || publicEntity.updated_at || ""),
    raw: publicRaw,
    source: undefined,
    metrics: undefined,
    analytics: undefined,
    dashboardMetrics: undefined,
  };
}

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

function normalizeMapEntityData(locations = []) {
  return locations.map((entity) => toPublicMapEntity({
    ...entity,
    sourceType: entity.sourceType || sourceTypeForEntity(entity),
    lat: entity.lat ?? entity.latitude ?? entity.coords?.[0],
    lng: entity.lng ?? entity.longitude ?? entity.coords?.[1],
    tags: Array.isArray(entity.tags)
      ? entity.tags
      : [entity.category, entity.category_key, entity.type].filter(Boolean),
    description: entity.description || entity.summary,
    timing: entity.timing || entity.time || entity.date || entity.happyHour?.time,
    actions: Array.isArray(entity.actions) ? entity.actions : ["Open", "Save", "Get directions"],
  }));
}

function textForEntity(entity = {}) {
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
    entity.brand,
    entity.summary,
    entity.description,
    ...(Array.isArray(entity.tags) ? entity.tags : []),
    ...(Array.isArray(entity.searchKeywords) ? entity.searchKeywords : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function clampLimit(limit, fallback = SEARCH_RESULT_LIMITS.intent) {
  const next = Number(limit || fallback);
  if (!Number.isFinite(next)) return fallback;
  return Math.max(1, Math.min(MAP_DISCOVERY_LIMITS.maxVisibleDesktop, Math.round(next)));
}

function compactBounds(bounds) {
  if (!bounds) return null;
  const round = (value) => Number(Number(value || 0).toFixed(4));
  return {
    north: round(bounds.north),
    south: round(bounds.south),
    east: round(bounds.east),
    west: round(bounds.west),
    zoom: Number(Number(bounds.zoom || 0).toFixed(1)),
    center: bounds.center ? { lat: round(bounds.center.lat), lng: round(bounds.center.lng) } : null,
  };
}

function getCoords(entity = {}) {
  const lat = Number(entity.latitude ?? entity.lat ?? entity.coords?.[0]);
  const lng = Number(entity.longitude ?? entity.lng ?? entity.coords?.[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function withinBounds(entity, bounds) {
  if (!bounds) return true;
  const coords = getCoords(entity);
  if (!coords) return false;
  const pad = 0.0035;
  return coords.lat <= Number(bounds.north) + pad &&
    coords.lat >= Number(bounds.south) - pad &&
    coords.lng <= Number(bounds.east) + pad &&
    coords.lng >= Number(bounds.west) - pad;
}

function hasActivePerk(entity = {}) {
  const text = textForEntity(entity);
  return Boolean(
    entity.hasPerk ||
      entity.perkEligible ||
      entity.perk?.isActive ||
      entity.raw?.hasPerk ||
      entity.raw?.perkEligible ||
      entity.raw?.perk?.isActive ||
      /\b(perk|offer|redeem|inkind|in kind|resident perk|happy hour)\b/.test(text),
  );
}

function isPrivatePartnerEntity(entity = {}) {
  return /\b(admin|internal|qa only|backend|workspace|private partner)\b/.test(textForEntity(entity));
}

function matchesIntent(entity, intent, filter, mode = "resident") {
  const text = textForEntity(entity);
  const type = String(entity.type || entity.kind || entity.entityType || entity.sourceType || "").toLowerCase();
  const normalizedFilter = String(filter || "").toLowerCase();

  if (["", "all", "nearby", "open now"].includes(normalizedFilter) && ["", "all", "eat_drink"].includes(String(intent || "").toLowerCase())) {
    return true;
  }
  if (mode === "partner" && intent && !["all", "eat_drink"].includes(String(intent).toLowerCase())) {
    return entityMatchesMapIntent(entity, resolveSearchIntent(intent, "partner"));
  }
  if (normalizedFilter && !["all", "nearby", "open now"].includes(normalizedFilter)) {
    return entityMatchesMapIntent(entity, resolveSearchIntent(normalizedFilter, mode));
  }
  if (intent && !["eat_drink", "all"].includes(String(intent).toLowerCase())) {
    return entityMatchesMapIntent(entity, intent);
  }

  if (intent === "lunch") return /\b(lunch|restaurant|dining|food|cafe|café|taco|burger|sandwich|salad|sushi|pizza|kitchen|cocina|brunch)\b/.test(text);
  if (intent === "happy_hour") return /\b(happy hour|perk|offer|cocktail|drinks|bar|beer|wine|nightlife|resident benefit)\b/.test(text);
  if (intent === "drinks") return /\b(drink|drinks|bar|cocktail|beer|wine|nightlife|rooftop|lounge|happy hour)\b/.test(text);
  if (intent === "dinner") return /\b(dinner|restaurant|dining|supper|steak|sushi|italian|kitchen|cocina|grill)\b/.test(text);
  if (intent === "fitness") return /\b(fitness|gym|training|pilates|yoga|wellness|recovery)\b/.test(text);
  if (intent === "walking_route") return /\b(route|walk|trail|tour|stop|waterloo|greenway|art walk|parks tour)\b/.test(text);
  if (intent === "partner") return /\b(partner|venue|brand|civic|property|hotel|real estate)\b/.test(text);
  if (intent === "campaign") return /\b(campaign|activation|passport|challenge|sponsor|featured)\b/.test(text);
  if (intent === "coffee") return /\b(coffee|cafe|espresso|bakery)\b/.test(text);
  if (intent === "hotels") return /\bhotel|hospitality|stay\b/.test(text) || type === "hotel";
  if (intent === "buildings" || intent === "property") return /\b(property|residential|building|rental|listing|legends|condo|apartment|hotel)\b/.test(text);
  if (intent === "resident_perks") return hasActivePerk(entity);
  if (intent === "events") return /\b(event|rsvp|live music|tonight|festival|show|concert)\b/.test(text) || type === "event";
  if (intent === "wellness") return /\b(wellness|fitness|spa|salon|gym|yoga|pilates|recovery)\b/.test(text);
  if (intent === "shopping") return /\b(retail|shopping|shop|store|boutique|eyewear|apparel)\b/.test(text);
  if (intent === "civic") return /\b(civic|public|library|park|government|daa|art walk|waterloo|trail|plaza)\b/.test(text);
  if (intent === "services") return /\b(service|parking|printing|pharmacy|shipping|cleaning|bike share|ev charging|coworking|mobility)\b/.test(text);
  if (intent === "brands") return /\b(brand|sponsor|yeti|rivian|lululemon|topo chico|austin fc)\b/.test(text);
  if (intent === "campaigns") return /\b(campaign|activation|passport|challenge|sponsor|featured)\b/.test(text);
  if (intent === "nightlife") return /\b(bar|cocktail|drinks|nightlife|happy hour|beer|wine|live music)\b/.test(text);
  if (intent === "attractions") return /\b(arts|culture|museum|gallery|public art|route|walk|attraction)\b/.test(text);
  if (normalizedFilter.includes("legends")) return /\blegends\b/.test(text);
  if (normalizedFilter.includes("inkind")) return /\b(inkind|in kind)\b/.test(text);
  return true;
}

function scoreEntity(entity, { query, intent, activeEntityId }) {
  if (String(entity.id) === String(activeEntityId)) return -1000;
  const text = textForEntity(entity);
  const governance = getEntityGovernance(entity);
  const queryScore = query && text.includes(query) ? -50 : 0;
  const perkScore = hasActivePerk(entity) ? -10 : 0;
  const intentScore = governance.searchIntentIds?.includes(intent) ? -20 : 0;
  return queryScore + intentScore + perkScore + governance.priorityTier;
}

function distanceBetween(a = {}, b = {}) {
  const aCoords = getCoords(a);
  const bCoords = getCoords(b);
  if (!aCoords || !bCoords) return Number.POSITIVE_INFINITY;
  return Math.hypot(aCoords.lat - bCoords.lat, aCoords.lng - bCoords.lng);
}

function activeEntityRelatedNames(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return new Set([
    ...(Array.isArray(entity.nearbyBuildings) ? entity.nearbyBuildings : []),
    ...(Array.isArray(entity.linkedBuildings) ? entity.linkedBuildings : []),
    ...(Array.isArray(entity.linkedBusinesses) ? entity.linkedBusinesses : []),
    ...(Array.isArray(entity.notableBuildings) ? entity.notableBuildings : []),
    ...(Array.isArray(entity.nearbyPlaces) ? entity.nearbyPlaces : []),
    ...(Array.isArray(entity.highlights) ? entity.highlights : []),
    ...(Array.isArray(entity.nearby) ? entity.nearby : []),
    ...(Array.isArray(raw.nearbyBuildings) ? raw.nearbyBuildings : []),
    ...(Array.isArray(raw.linkedBuildings) ? raw.linkedBuildings : []),
    ...(Array.isArray(raw.linkedBusinesses) ? raw.linkedBusinesses : []),
    ...(Array.isArray(raw.notableBuildings) ? raw.notableBuildings : []),
    ...(Array.isArray(raw.nearbyPlaces) ? raw.nearbyPlaces : []),
    ...(Array.isArray(raw.highlights) ? raw.highlights : []),
    ...(Array.isArray(raw.nearby) ? raw.nearby : []),
  ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
}

function buildQueryKey(scope = {}) {
  return JSON.stringify({
    query: String(scope.query || "").trim().toLowerCase(),
    intent: scope.intent || "",
    mode: scope.audienceMode || "resident",
    district: scope.district || "",
    bounds: compactBounds(scope.currentBounds),
    center: scope.mapCenter || null,
    zoom: Number(Number(scope.zoom || 0).toFixed(1)),
    radius: scope.radius || "",
    activeEntityId: scope.activeEntityId || "",
    routeId: scope.routeId || "",
    openNow: Boolean(scope.openNow),
    hasPerk: Boolean(scope.hasPerk),
    limit: clampLimit(scope.resultLimit),
    cursor: scope.cursor || "",
  });
}

function normalizeScope(scope = {}) {
  const query = normalizeDiscoveryControlQuery(scope.query, scope.filter);
  const filterIntent = getCanonicalIntentForFilter(scope.filter || "All", query);
  const explicitIntentByFilter = {
    Lunch: "lunch",
    "Happy Hour": "happy_hour",
    "Happy Hours": "happy_hour",
    Drinks: "drinks",
    Cocktails: "drinks",
    Dinner: "dinner",
    Fitness: "fitness",
    Wellness: "wellness",
    Events: "events",
    Campaigns: "campaign",
    "Brand Activations": "campaign",
    Properties: "property",
    Hotels: "property",
    Listings: "property",
    "All Listings": "property",
  };
  const intent = scope.intent || explicitIntentByFilter[scope.filter] || filterIntent;
  const fallbackLimit = query ? SEARCH_RESULT_LIMITS.text : SEARCH_RESULT_LIMITS.intent;
  return {
    ...scope,
    query,
    intent,
    resultLimit: clampLimit(scope.resultLimit, fallbackLimit),
  };
}

function radiusToMeters(radius) {
  const value = Number.parseFloat(String(radius || ""));
  if (!Number.isFinite(value)) return undefined;
  if (/mi|mile/i.test(String(radius))) return Math.round(value * 1609.34);
  if (/min/i.test(String(radius))) return Math.round(value * 80);
  return Math.round(value);
}

export function buildResolverRequest(scope = {}, trigger = "search") {
  const normalized = normalizeScope(scope);
  const source = sourceFromTrigger(trigger);
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const routeStopCount = Array.isArray(normalized.routeIds) ? normalized.routeIds.length : 0;
  const boundedLimit = getDiscoveryLimit({ viewportWidth, source, routeStopCount });
  const filter = String(normalized.filter || "").trim();
  const normalizedFilter = filter.toLowerCase();
  const genericIntent = ["", "all", "eat_drink"].includes(String(normalized.intent || "").toLowerCase());
  const resolverIntent = normalizedFilter === "nearby"
    ? "nearby"
    : genericIntent
      ? undefined
      : normalized.intent;
  return {
    query: normalized.query || undefined,
    intent: resolverIntent,
    source,
    mode: normalized.audienceMode || "resident",
    categories: filter && !isDiscoveryControlFilter(normalizedFilter) ? [filter] : undefined,
    district: normalized.district || undefined,
    radius_meters: radiusToMeters(normalized.radius),
    center: normalized.mapCenter || undefined,
    bounds: normalized.currentBounds ? {
      north: Number(normalized.currentBounds.north),
      south: Number(normalized.currentBounds.south),
      east: Number(normalized.currentBounds.east),
      west: Number(normalized.currentBounds.west),
    } : undefined,
    selected_entity_id: normalized.activeEntityId || undefined,
    partner_id: normalized.partnerId || undefined,
    campaign_id: normalized.campaignId || undefined,
    perk_id: normalized.perkId || undefined,
    event_id: normalized.eventId || undefined,
    route_id: normalized.routeId || undefined,
    cursor: normalized.cursor || undefined,
    limit: Math.min(clampLimit(normalized.resultLimit, boundedLimit), boundedLimit),
  };
}

function putCache(cacheRef, key, value) {
  const cache = cacheRef.current;
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  while (cache.size > QUERY_CACHE_MAX) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

function getCache(cacheRef, key) {
  const cache = cacheRef.current;
  if (!cache.has(key)) return null;
  const value = cache.get(key);
  if (Date.now() - Number(value.fetchedAt || 0) > MAP_DISCOVERY_LIMITS.cacheTtlMs) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, value);
  return value;
}

export function selectScopedEntities(allEntities, scope) {
  const normalizedScope = normalizeScope(scope);
  const query = normalizedScope.query.toLowerCase();
  const intent = normalizedScope.intent;
  const limit = normalizedScope.resultLimit;
  const activeEntityId = scope.activeEntityId || "";
  const savedEntityIds = new Set((scope.savedEntityIds || []).map(String));
  const activeEntity = activeEntityId ? allEntities.find((entity) => String(entity.id) === String(activeEntityId)) : null;
  const relatedLimit = activeEntity ? Math.max(0, limit - 1) : limit;

  if (activeEntity) {
    const relatedNames = activeEntityRelatedNames(activeEntity);
    const activeDistrict = String(activeEntity.district || "").toLowerCase();
    const relatedCandidates = allEntities
      .filter((entity) => {
        if (entity.id === activeEntity.id) return false;
        const governance = getEntityGovernance(entity);
        if (!governance.isMapEligible) return false;
        if (scope.audienceMode !== "partner" && (isPrivatePartnerEntity(entity) || !governance.isResidentVisible)) return false;
        return true;
      })
      .sort((a, b) => {
        const aName = String(a.name || a.title || "").toLowerCase();
        const bName = String(b.name || b.title || "").toLowerCase();
        const aLinked = relatedNames.has(aName) ? -100 : 0;
        const bLinked = relatedNames.has(bName) ? -100 : 0;
        const aDistrict = activeDistrict && String(a.district || "").toLowerCase().includes(activeDistrict) ? -12 : 0;
        const bDistrict = activeDistrict && String(b.district || "").toLowerCase().includes(activeDistrict) ? -12 : 0;
        return (aLinked + aDistrict + distanceBetween(activeEntity, a)) - (bLinked + bDistrict + distanceBetween(activeEntity, b));
      })
      .slice(0, relatedLimit);
    const results = [activeEntity, ...relatedCandidates];
    return {
      queryKey: buildQueryKey({ ...scope, intent, resultLimit: limit }),
      resultIds: results.map((entity) => entity.id),
      entitiesById: Object.fromEntries(results.map((entity) => [entity.id, entity])),
      total: Math.min(1 + relatedCandidates.length, 1 + relatedLimit),
      cursor: "",
      bounds: compactBounds(scope.currentBounds),
      fetchedAt: Date.now(),
      intent,
      limit,
      status: results.length ? "resolved" : "empty",
      resultTitle: activeEntity.name || activeEntity.title || "Downtown result",
      resultSubtitle: relatedCandidates.length ? `${relatedCandidates.length} related places` : "",
    };
  }

  let candidates = allEntities.filter((entity) => {
    const governance = getEntityGovernance(entity);
    if (!governance.isMapEligible) return false;
    if (scope.audienceMode !== "partner" && (isPrivatePartnerEntity(entity) || !governance.isResidentVisible)) return false;
    if (scope.district && scope.district !== "All Downtown" && entity.district !== scope.district) return false;
    if (scope.hasPerk && !hasActivePerk(entity)) return false;
    if (scope.filter === "Saved" && !savedEntityIds.has(String(entity.id))) return false;
    if (!activeEntity && !withinBounds(entity, scope.currentBounds)) return false;
    if (!matchesIntent(entity, intent, scope.filter, scope.audienceMode)) return false;
    if (query && !textForEntity(entity).includes(query)) {
      const tokens = query.split(/\s+/).filter((token) => token.length > 2);
      if (!tokens.some((token) => textForEntity(entity).includes(token))) return false;
    }
    return true;
  });

  if (scope.routeIds?.length) {
    const routeIds = new Set(scope.routeIds.map(String));
    candidates = allEntities.filter((entity) => routeIds.has(String(entity.id)));
  }

  candidates.sort((a, b) => scoreEntity(a, { query, intent, activeEntityId }) - scoreEntity(b, { query, intent, activeEntityId }) || String(a.name).localeCompare(String(b.name)));

  const results = candidates.slice(0, limit);

  return {
    queryKey: buildQueryKey(normalizedScope),
    resultIds: results.map((entity) => entity.id),
    entitiesById: Object.fromEntries(results.map((entity) => [entity.id, entity])),
    total: candidates.length + (activeEntity ? 1 : 0),
    cursor: candidates.length > results.length ? String(results.length) : "",
    bounds: compactBounds(scope.currentBounds),
    fetchedAt: Date.now(),
    intent,
    limit,
    status: results.length ? "resolved" : "empty",
    resultTitle: query || scope.filter || "Downtown results",
    resultSubtitle: candidates.length > results.length ? `${candidates.length} available` : "",
  };
}

let registryPromise;
async function loadRegistry() {
  if (registryPromise) return registryPromise;
  const [{ buildLocations }] = await Promise.all([
    import("@/lib/useLocations"),
  ]);
  registryPromise = Promise.resolve(normalizeMapEntityData(buildLocations()));
  return registryPromise;
}

let platformSearchIndexPromise;
async function loadPlatformSearchIndex() {
  if (platformSearchIndexPromise) return platformSearchIndexPromise;
  platformSearchIndexPromise = import("@/data/production/platform-search-index.json")
    .then((module) => Array.isArray(module.default) ? module.default : []);
  return platformSearchIndexPromise;
}

let productionInventoryPromise;
async function loadProductionInventoryRecords() {
  if (productionInventoryPromise) return productionInventoryPromise;
  productionInventoryPromise = import("@/data/production/production-map-inventory.json")
    .then((module) => Array.isArray(module.default?.records) ? module.default.records : []);
  return productionInventoryPromise;
}

async function loadRegistryForScope(scope = {}) {
  const registry = await loadRegistry();
  const query = String(scope.query || scope.intent || scope.filter || "").trim();
  const activeEntityId = String(scope.activeEntityId || "").trim();
  if (!query && !activeEntityId) return registry;

  const catalog = await loadPlatformSearchIndex();
  const matchedDocuments = query
    ? searchPlatformCatalog(catalog, query, {
        limit: MAP_DISCOVERY_LIMITS.maxVisibleDesktop,
        mode: scope.audienceMode || "resident",
      })
    : [];
  const selectedDocument = activeEntityId
    ? catalog.find((document) => [document.id, document.entityId, document.linkedEntityId].map(String).includes(activeEntityId))
    : null;
  const requestedIds = new Set(
    [...matchedDocuments, selectedDocument]
      .filter((document) => document?.markerEligible || document === selectedDocument)
      .flatMap((document) => [document?.id, document?.entityId, document?.linkedEntityId])
      .filter(Boolean)
      .map(String),
  );
  if (!requestedIds.size) return registry;

  const inventory = await loadProductionInventoryRecords();
  const scopedRecords = inventory.filter((record) => (
    [record.id, record.entity_id, record.entityId].map(String).some((id) => requestedIds.has(id))
  ));
  if (!scopedRecords.length) return registry;
  const merged = new Map(registry.map((entity) => [String(entity.id), entity]));
  for (const entity of normalizeMapEntityData(scopedRecords)) merged.set(String(entity.id), entity);
  return [...merged.values()];
}

function emptyCatalogState(query = "", status = "idle") {
  return {
    status,
    query,
    results: [],
    groups: [],
    entitiesById: {},
    total: 0,
  };
}

function resolveCatalogState(query, catalog = [], entities = [], mode = "resident") {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) return null;
  const boundedEntities = Array.isArray(entities) ? entities.filter(Boolean) : [];
  const runtimeDocuments = buildPlatformSearchCatalog(boundedEntities, { includePublicProfiles: false });
  const mergedCatalog = new Map(
    [...catalog, ...runtimeDocuments].map((document) => [`${document.resultType}:${document.id}`, document]),
  );
  const results = searchPlatformCatalog([...mergedCatalog.values()], normalizedQuery, {
    limit: typeof window !== "undefined" && window.innerWidth >= 768 ? 40 : 24,
    mode,
  });
  const entitiesByCanonicalId = Object.fromEntries(boundedEntities.map((entity) => [String(entity.id), entity]));
  const entitiesById = Object.fromEntries(results.map((document) => {
    const entity = entitiesByCanonicalId[document.entityId] || entitiesByCanonicalId[document.linkedEntityId] || null;
    return [document.id, entity];
  }).filter(([, entity]) => Boolean(entity)));
  return {
    status: results.length ? "resolved" : "empty",
    query: normalizedQuery,
    results,
    groups: groupPlatformSearchResults(results),
    entitiesById,
    total: results.length,
  };
}

export function useSearchDrivenMapEntities() {
  const [resultState, setResultState] = useState({
    queryKey: "",
    resultIds: [],
    entitiesById: {},
    total: 0,
    cursor: "",
    bounds: null,
    fetchedAt: 0,
    intent: "",
    limit: 0,
    status: "idle",
    source: "",
    queryId: "",
    resultTitle: null,
    resultSubtitle: null,
    mapResultState: createIdleMapResultState(),
  });
  const [requestStatus, setRequestStatus] = useState("idle");
  const [lastTrigger, setLastTrigger] = useState("");
  const [catalogState, setCatalogState] = useState(emptyCatalogState);
  const [metrics, setMetrics] = useState({
    initialEntityRequestCount: 0,
    searchRequestCount: 0,
    cacheHitCount: 0,
    staleCancellationCount: 0,
    duplicateRequestCount: 0,
    lastDurationMs: 0,
    localFallbackCount: 0,
  });
  const abortRef = useRef(null);
  const activeRequestRef = useRef({ id: 0, key: "" });
  const catalogRequestRef = useRef(0);
  const cacheRef = useRef(new Map());
  const requestStatusRef = useRef("idle");

  useEffect(() => {
    requestStatusRef.current = requestStatus;
  }, [requestStatus]);

  const searchCatalog = useCallback(async (query = "", entities = [], mode = "resident") => {
    const normalizedQuery = String(query || "").trim();
    const requestId = catalogRequestRef.current + 1;
    catalogRequestRef.current = requestId;
    if (!normalizedQuery) {
      setCatalogState(emptyCatalogState());
      return null;
    }

    setCatalogState((current) => (
      current.query === normalizedQuery && current.status === "resolved"
        ? current
        : emptyCatalogState(normalizedQuery, "loading")
    ));
    try {
      const catalog = await loadPlatformSearchIndex();
      if (catalogRequestRef.current !== requestId) return null;
      const nextState = resolveCatalogState(normalizedQuery, catalog, entities, mode) || emptyCatalogState();
      setCatalogState(nextState);
      return nextState;
    } catch (error) {
      if (catalogRequestRef.current !== requestId) return null;
      console.warn("Platform search index could not be loaded.", error);
      const fallbackState = resolveCatalogState(normalizedQuery, [], entities, mode) || emptyCatalogState(normalizedQuery, "empty");
      setCatalogState(fallbackState);
      return fallbackState;
    }
  }, []);

  const runSearch = useCallback(async (scope = {}, trigger = "search") => {
    const normalizedScope = normalizeScope(scope);
    const resolverRequest = buildResolverRequest(normalizedScope, trigger);
    if (!isExplicitMapSearch(resolverRequest)) return null;
    const queryKey = buildQueryKey({ ...normalizedScope, resultLimit: resolverRequest.limit });
    const cached = getCache(cacheRef, queryKey);
    if (cached) {
      const cachedEntities = cached.resultIds.map((id) => cached.entitiesById[id]).filter(Boolean);
      setResultState({
        ...cached,
        mapResultState: cached.mapResultState || createReadyMapResultState(buildMapQueryFromScope(normalizedScope), cachedEntities, cached.route || null),
      });
      setLastTrigger(trigger);
      setRequestStatus("success");
      await searchCatalog(normalizedScope.query, cachedEntities, normalizedScope.audienceMode);
      setMetrics((current) => ({ ...current, cacheHitCount: current.cacheHitCount + 1 }));
      return cached;
    }

    if (activeRequestRef.current.key === queryKey && requestStatusRef.current === "loading") {
      setMetrics((current) => ({ ...current, duplicateRequestCount: current.duplicateRequestCount + 1 }));
      return null;
    }

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = activeRequestRef.current.id + 1;
    activeRequestRef.current = { id: requestId, key: queryKey };
    setRequestStatus("loading");
    setLastTrigger(trigger);
    const activeMapQuery = buildMapQueryFromScope(normalizedScope);
    const preserveSelectionDuringLookup = Boolean(normalizedScope.activeEntityId) && /entity/i.test(trigger);
    setResultState((current) => ({
      ...current,
      resultIds: preserveSelectionDuringLookup ? current.resultIds : [],
      entitiesById: preserveSelectionDuringLookup ? current.entitiesById : {},
      total: preserveSelectionDuringLookup ? current.total : 0,
      cursor: preserveSelectionDuringLookup ? current.cursor : "",
      status: "resolving",
      source: resolverRequest.source,
      queryId: "",
      resultTitle: preserveSelectionDuringLookup ? current.resultTitle : null,
      resultSubtitle: preserveSelectionDuringLookup ? current.resultSubtitle : null,
      mapResultState: preserveSelectionDuringLookup
        ? current.mapResultState || createLoadingMapResultState(activeMapQuery)
        : createLoadingMapResultState(activeMapQuery),
    }));
    const startedAt = performance.now();

    try {
      const backendResponse = await searchOperationalMap(resolverRequest, controller.signal);
      let result;
      let usedLocalFallback = false;
      if (backendResponse) {
        const entities = backendResponse.pins.map(backendPinToMapEntity);
        result = {
          queryKey,
          resultIds: entities.map((entity) => entity.id),
          entitiesById: Object.fromEntries(entities.map((entity) => [entity.id, entity])),
          total: backendResponse.total_available,
          cursor: backendResponse.next_cursor || "",
          bounds: compactBounds(normalizedScope.currentBounds),
          fetchedAt: Date.now(),
          intent: backendResponse.interpreted_intent || normalizedScope.intent,
          limit: resolverRequest.limit,
          status: entities.length ? "resolved" : "empty",
          source: resolverRequest.source,
          queryId: backendResponse.query_id,
          resultTitle: backendResponse.result_context.title,
          resultSubtitle: backendResponse.result_context.subtitle || null,
        };
      } else {
        const entities = await loadRegistryForScope(normalizedScope);
        if (controller.signal.aborted) throw new DOMException("Map search aborted", "AbortError");
        result = {
          ...selectScopedEntities(entities, { ...normalizedScope, resultLimit: resolverRequest.limit }),
          queryKey,
          source: resolverRequest.source,
          queryId: `local-${requestId}`,
        };
        usedLocalFallback = true;
      }
      if (activeRequestRef.current.id !== requestId) {
        setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
        return null;
      }
      const resolvedEntities = result.resultIds.map((id) => result.entitiesById[id]).filter(Boolean);
      result.mapResultState = createReadyMapResultState(activeMapQuery, resolvedEntities, result.route || null);
      putCache(cacheRef, result.queryKey, result);
      await searchCatalog(normalizedScope.query, resolvedEntities, normalizedScope.audienceMode);
      if (controller.signal.aborted || activeRequestRef.current.id !== requestId || activeRequestRef.current.key !== queryKey) {
        setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
        return null;
      }
      setResultState(result);
      setRequestStatus("success");
      setMetrics((current) => ({
        ...current,
        searchRequestCount: current.searchRequestCount + 1,
        lastDurationMs: Math.round(performance.now() - startedAt),
        localFallbackCount: current.localFallbackCount + (usedLocalFallback ? 1 : 0),
      }));
      return result;
    } catch (error) {
      if (error?.name === "AbortError") {
        setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
        return null;
      }
      try {
        const entities = await loadRegistryForScope(normalizedScope);
        if (controller.signal.aborted || activeRequestRef.current.id !== requestId) return null;
        const result = {
          ...selectScopedEntities(entities, { ...normalizedScope, resultLimit: resolverRequest.limit }),
          queryKey,
          source: resolverRequest.source,
          queryId: `local-${requestId}`,
        };
        const resolvedEntities = result.resultIds.map((id) => result.entitiesById[id]).filter(Boolean);
        result.mapResultState = createReadyMapResultState(activeMapQuery, resolvedEntities, result.route || null);
        putCache(cacheRef, result.queryKey, result);
        await searchCatalog(normalizedScope.query, resolvedEntities, normalizedScope.audienceMode);
        if (controller.signal.aborted || activeRequestRef.current.id !== requestId || activeRequestRef.current.key !== queryKey) {
          setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
          return null;
        }
        setResultState(result);
        setRequestStatus("success");
        setMetrics((current) => ({
          ...current,
          searchRequestCount: current.searchRequestCount + 1,
          lastDurationMs: Math.round(performance.now() - startedAt),
          localFallbackCount: current.localFallbackCount + 1,
        }));
        return result;
      } catch (fallbackError) {
        if (fallbackError?.name === "AbortError") return null;
        console.warn("Map results could not be loaded.", fallbackError);
        setRequestStatus("error");
        setResultState((current) => ({
          ...current,
          resultIds: [],
          entitiesById: {},
          total: 0,
          cursor: "",
          status: "error",
          mapResultState: createErrorMapResultState(activeMapQuery),
        }));
        return null;
      }
    }
  }, [searchCatalog]);

  const clearResults = useCallback(() => {
    abortRef.current?.abort?.();
    activeRequestRef.current = { id: activeRequestRef.current.id + 1, key: "" };
    catalogRequestRef.current += 1;
    setRequestStatus("idle");
    setLastTrigger("");
    setCatalogState(emptyCatalogState());
    setResultState({
      queryKey: "",
      resultIds: [],
      entitiesById: {},
      total: 0,
      cursor: "",
      bounds: null,
      fetchedAt: 0,
      intent: "",
      limit: 0,
      status: "idle",
      source: "",
      queryId: "",
      resultTitle: null,
      resultSubtitle: null,
      mapResultState: createIdleMapResultState(),
    });
  }, []);

  const resultPlaces = useMemo(
    () => resultState.resultIds.map((id) => resultState.entitiesById[id]).filter(Boolean),
    [resultState],
  );

  const places = resultPlaces;

  useEffect(() => {
    if (typeof window === "undefined" || import.meta.env.PROD) return;
    window.__DP_MAP_SEARCH_METRICS__ = {
      ...metrics,
      initialMarkerCount: lastTrigger ? places.length : 0,
      mountedMarkerCount: places.length,
      resultTotal: resultState.total,
      requestStatus,
      lastTrigger,
    };
    if (resultState.total > 100) {
      console.warn("[map-search] public request returned more than 100 records", resultState.total);
    }
  }, [lastTrigger, metrics, places.length, requestStatus, resultState.total]);

  return {
    places,
    allLoadedPlaces: places,
    entitiesById: resultState.entitiesById,
    resultState,
    mapResultState: resultState.mapResultState || createIdleMapResultState(),
    catalogState,
    requestStatus,
    lastTrigger,
    metrics,
    limits: SEARCH_RESULT_LIMITS,
    runSearch,
    searchCatalog,
    clearResults,
  };
}

export default useSearchDrivenMapEntities;
