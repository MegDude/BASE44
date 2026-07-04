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

  (collection.stopIds || []).forEach((stopId, index) => {
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
