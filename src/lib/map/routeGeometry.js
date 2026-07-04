export function getCollectionRoutePath(collection, entitiesById = {}) {
  if (collection?.routeGeometry?.coordinates?.length) {
    return collection.routeGeometry.coordinates;
  }

  return (collection?.stopIds || [])
    .map((id) => entitiesById[id])
    .filter((entity) => entity?.lat && entity?.lng)
    .map((entity) => ({
      lat: Number(entity.lat),
      lng: Number(entity.lng),
    }));
}
