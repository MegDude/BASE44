const BOUNDS = {
  north: 30.276,
  south: 30.255,
  west: -97.755,
  east: -97.735
};

export function projectToScreen(lat, lng) {
  const safeLat = Number(lat);
  const safeLng = Number(lng);

  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
    return { x: 50, y: 50 };
  }

  const x = ((safeLng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * 100;
  const y = ((BOUNDS.north - safeLat) / (BOUNDS.north - BOUNDS.south)) * 100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y))
  };
}
