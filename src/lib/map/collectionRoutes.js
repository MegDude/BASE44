import { getCollectionRoutePath } from "./routeGeometry";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCoords(place) {
  if (Array.isArray(place?.coords) && place.coords.length >= 2) return { lat: Number(place.coords[0]), lng: Number(place.coords[1]) };
  if (Number.isFinite(place?.latitude) && Number.isFinite(place?.longitude)) return { lat: Number(place.latitude), lng: Number(place.longitude) };
  if (Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) return { lat: Number(place.lat), lng: Number(place.lng) };
  return null;
}

function entityText(place) {
  return normalize([
    place?.id,
    place?.slug,
    place?.name,
    place?.title,
    place?.category,
    place?.district,
    place?.address,
    place?.summary,
    place?.description,
    place?.offer,
    place?.tags?.join?.(" "),
    place?.searchKeywords?.join?.(" "),
  ].filter(Boolean).join(" "));
}

function entityType(place) {
  return normalize(place?.entityType || place?.type || place?.partnerType || place?.category).split(" ")[0];
}

function hasPerk(place) {
  return Boolean(
    place?.hasActivePerk ||
    place?.activePerk ||
    place?.perk ||
    place?.offer ||
    place?.residentPerk ||
    place?.raw?.hasActivePerk ||
    place?.raw?.activePerk ||
    place?.raw?.offer,
  );
}

function matchesDynamicCollection(place, collection) {
  const rule = collection?.dynamicRule || {};
  const entityRules = collection?.entityRules || {};
  const text = entityText(place);
  const tokens = (rule.tokens || []).map(normalize).filter(Boolean);
  const configuredTypes = rule.entityTypes || entityRules.entityTypes || (entityRules.entityType ? [entityRules.entityType] : []);
  const types = configuredTypes.map(normalize).filter(Boolean);
  const categories = (entityRules.categories || []).map(normalize).filter(Boolean);
  const type = entityType(place);

  if (types.length && !types.some((candidate) => type.includes(candidate) || text.includes(candidate))) return false;
  if (categories.length && !categories.some((candidate) => text.includes(candidate))) return false;
  if (rule.requireActivePerk || entityRules.hasActivePerk) {
    if (!hasPerk(place)) return false;
  }
  if (tokens.length && !tokens.some((token) => text.includes(token))) return false;
  if (!tokens.length && !types.length && !categories.length && !entityRules.hasActivePerk) {
    const category = normalize(collection?.category);
    if (category && category !== "featured" && !text.includes(category)) return false;
  }
  return true;
}

function dynamicCollectionScore(place, collection) {
  const text = entityText(place);
  const tokens = (collection?.dynamicRule?.tokens || []).map(normalize).filter(Boolean);
  const tokenScore = tokens.reduce((score, token) => score + (text.includes(token) ? 4 : 0), 0);
  return tokenScore
    + (hasPerk(place) ? 5 : 0)
    + (place?.featured || place?.launchPriority || place?.raw?.featured ? 4 : 0)
    + (place?.image || place?.heroImage || place?.raw?.image ? 2 : 0)
    + (place?.description || place?.summary ? 1 : 0);
}

function dynamicPlaceIdentity(place) {
  const name = normalize(place?.name || place?.title)
    .replace(/\bnearby pick\b/g, "")
    .replace(/\bnearby recommendation\b/g, "")
    .trim();
  return name || normalize(place?.slug || place?.id);
}

function resolveDynamicStops(collection, places) {
  const limit = Math.max(2, Math.min(12, Number(collection?.dynamicRule?.limit || collection?.limit || 8)));
  const ranked = places
    .filter((place) => place?.id && getCoords(place) && matchesDynamicCollection(place, collection))
    .sort((a, b) => dynamicCollectionScore(b, collection) - dynamicCollectionScore(a, collection) || String(a.name || a.title).localeCompare(String(b.name || b.title)));

  const unique = [];
  const seenPlaces = new Set();
  ranked.forEach((place) => {
    const identity = dynamicPlaceIdentity(place);
    if (!identity || seenPlaces.has(identity)) return;
    seenPlaces.add(identity);
    unique.push(place);
  });
  return unique.slice(0, limit);
}

function resolveStop(stopId, hint, places) {
  const idKey = normalize(stopId);
  const hintKey = normalize(hint || stopId);
  return (
    places.find((place) => normalize(place?.id) === idKey || normalize(place?.slug) === idKey) ||
    places.find((place) => normalize(place?.name) === hintKey || normalize(place?.title) === hintKey) ||
    places.find((place) => hintKey && entityText(place).includes(hintKey)) ||
    null
  );
}

export function resolveMapCollectionRoute(collection, places = []) {
  if (!collection) return null;
  const missingStopIds = [];
  const missingCoordinates = [];
  const seen = new Set();
  const stops = [];

  const configuredStopIds = collection.stopIds || [];
  const dynamicStops = configuredStopIds.length ? [] : resolveDynamicStops(collection, places);

  configuredStopIds.forEach((stopId, index) => {
    const place = resolveStop(stopId, collection.stopHints?.[index], places);
    if (!place) {
      missingStopIds.push(stopId);
      return;
    }
    if (seen.has(place.id)) return;
    seen.add(place.id);
    const coords = getCoords(place);
    if (!coords) {
      missingCoordinates.push(place.id || stopId);
      return;
    }
    stops.push({ ...place, lat: coords.lat, lng: coords.lng, routeStopNumber: stops.length + 1 });
  });

  dynamicStops.forEach((place) => {
    if (seen.has(place.id)) return;
    const coords = getCoords(place);
    if (!coords) return;
    seen.add(place.id);
    stops.push({ ...place, lat: coords.lat, lng: coords.lng, routeStopNumber: stops.length + 1 });
  });

  const entitiesById = Object.fromEntries(stops.map((stop) => [stop.id, stop]));
  const routePath = getCollectionRoutePath({ ...collection, stopIds: stops.map((stop) => stop.id) }, entitiesById);

  return {
    ...collection,
    stops,
    routePath,
    missingStopIds,
    missingCoordinates,
    status: stops.length >= 2 && routePath.length >= 2 ? "pass" : "incomplete",
  };
}

export function createMapCollectionAudit(collections = [], places = []) {
  return collections.map((collection) => {
    const route = resolveMapCollectionRoute(collection, places);
    return {
      collectionId: collection.id,
      title: collection.title,
      stopCount: collection.stopIds?.length || 0,
      validStopCount: route?.stops?.length || 0,
      missingStopIds: route?.missingStopIds || [],
      missingCoordinates: route?.missingCoordinates || [],
      routePathPoints: route?.routePath?.length || 0,
      status: route?.status || "incomplete",
    };
  });
}
