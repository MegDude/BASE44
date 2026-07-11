import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCanonicalIntentForFilter, getEntityGovernance } from "@/lib/map/intentGovernance";
import { entityMatchesMapIntent, resolveSearchIntent } from "@/map/searchIntent/mapIntentRegistry";

const QUERY_CACHE_MAX = 40;
const SEARCH_RESULT_LIMITS = Object.freeze({
  text: 30,
  intent: 40,
  mobile: 30,
  desktop: 50,
  entity: 9,
  route: 75,
  nearby: 12,
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

  return {
    ...publicEntity,
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
  return Math.max(1, Math.min(75, Math.round(next)));
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

  if (intent === "coffee") return /\b(coffee|cafe|espresso|bakery)\b/.test(text);
  if (intent === "hotels") return /\bhotel|hospitality|stay\b/.test(text) || type === "hotel";
  if (intent === "buildings") return /\b(property|residential|building|rental|listing|legends|condo|apartment)\b/.test(text);
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
  const query = String(scope.query || "").trim();
  const intent = scope.intent || getCanonicalIntentForFilter(scope.filter || "All", query);
  const fallbackLimit = query ? SEARCH_RESULT_LIMITS.text : SEARCH_RESULT_LIMITS.intent;
  return {
    ...scope,
    query,
    intent,
    resultLimit: clampLimit(scope.resultLimit, fallbackLimit),
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
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function selectScopedEntities(allEntities, scope) {
  const normalizedScope = normalizeScope(scope);
  const query = normalizedScope.query.toLowerCase();
  const intent = normalizedScope.intent;
  const limit = normalizedScope.resultLimit;
  const activeEntityId = scope.activeEntityId || "";
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
    };
  }

  let candidates = allEntities.filter((entity) => {
    const governance = getEntityGovernance(entity);
    if (!governance.isMapEligible) return false;
    if (scope.audienceMode !== "partner" && (isPrivatePartnerEntity(entity) || !governance.isResidentVisible)) return false;
    if (scope.district && scope.district !== "All Downtown" && entity.district !== scope.district) return false;
    if (scope.hasPerk && !hasActivePerk(entity)) return false;
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
  };
}

async function loadRegistry() {
  const [{ buildLocations }] = await Promise.all([
    import("@/lib/useLocations"),
  ]);
  return normalizeMapEntityData(buildLocations());
}

export function useSearchDrivenMapEntities() {
  const [loadedRegistry, setLoadedRegistry] = useState([]);
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
  });
  const [requestStatus, setRequestStatus] = useState("idle");
  const [lastTrigger, setLastTrigger] = useState("");
  const [metrics, setMetrics] = useState({
    initialEntityRequestCount: 0,
    searchRequestCount: 0,
    cacheHitCount: 0,
    staleCancellationCount: 0,
    duplicateRequestCount: 0,
    lastDurationMs: 0,
    loadedRegistryCount: 0,
  });
  const registryPromiseRef = useRef(null);
  const abortRef = useRef(null);
  const activeRequestRef = useRef({ id: 0, key: "" });
  const cacheRef = useRef(new Map());
  const loadedRegistryRef = useRef([]);
  const requestStatusRef = useRef("idle");

  useEffect(() => {
    loadedRegistryRef.current = loadedRegistry;
  }, [loadedRegistry]);

  useEffect(() => {
    requestStatusRef.current = requestStatus;
  }, [requestStatus]);

  const runSearch = useCallback(async (scope = {}, trigger = "search") => {
    const normalizedScope = normalizeScope(scope);
    const queryKey = buildQueryKey(normalizedScope);
    const cached = getCache(cacheRef, queryKey);
    if (cached) {
      setResultState(cached);
      setLastTrigger(trigger);
      setRequestStatus("success");
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
    const startedAt = performance.now();

    try {
      let entities = loadedRegistryRef.current;
      if (!entities.length) {
        if (!registryPromiseRef.current) {
          registryPromiseRef.current = loadRegistry();
        }
        entities = await registryPromiseRef.current;
        if (controller.signal.aborted) throw new DOMException("Map search aborted", "AbortError");
        setLoadedRegistry(entities);
      }

      const result = selectScopedEntities(entities, normalizedScope);
      if (activeRequestRef.current.id !== requestId) {
        setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
        return null;
      }
      putCache(cacheRef, result.queryKey, result);
      setResultState(result);
      setRequestStatus("success");
      setMetrics((current) => ({
        ...current,
        searchRequestCount: current.searchRequestCount + 1,
        lastDurationMs: Math.round(performance.now() - startedAt),
        loadedRegistryCount: entities.length,
      }));
      return result;
    } catch (error) {
      if (!loadedRegistryRef.current.length) registryPromiseRef.current = null;
      if (error?.name === "AbortError") {
        setMetrics((current) => ({ ...current, staleCancellationCount: current.staleCancellationCount + 1 }));
        return null;
      }
      console.warn("Map results could not be loaded.", error);
      setRequestStatus("error");
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    abortRef.current?.abort?.();
    activeRequestRef.current = { id: activeRequestRef.current.id + 1, key: "" };
    setRequestStatus("idle");
    setLastTrigger("");
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
    });
  }, []);

  const resultPlaces = useMemo(
    () => resultState.resultIds.map((id) => resultState.entitiesById[id]).filter(Boolean),
    [resultState],
  );

  useEffect(() => {
    if (typeof window === "undefined" || import.meta.env.PROD) return;
    window.__DP_MAP_SEARCH_METRICS__ = {
      ...metrics,
      initialMarkerCount: resultPlaces.length ? resultPlaces.length : 0,
      mountedMarkerCount: resultPlaces.length,
      resultTotal: resultState.total,
      requestStatus,
      lastTrigger,
    };
    if (!lastTrigger && resultPlaces.length > 0) {
      console.warn("[map-search] initial general-purpose pins exceed zero", resultPlaces.length);
    }
    if (resultPlaces.length > 75) {
      console.warn("[map-search] mounted marker count exceeds cap", resultPlaces.length);
    }
    if (resultState.total > 100) {
      console.warn("[map-search] public request returned more than 100 records", resultState.total);
    }
  }, [lastTrigger, metrics, requestStatus, resultPlaces.length, resultState.total]);

  return {
    places: resultPlaces,
    allLoadedPlaces: loadedRegistry,
    entitiesById: resultState.entitiesById,
    resultState,
    requestStatus,
    lastTrigger,
    metrics,
    limits: SEARCH_RESULT_LIMITS,
    runSearch,
    clearResults,
  };
}

export default useSearchDrivenMapEntities;
