export const PIN_COLORS = {
  default: "#0b1a2b",
  perk: "#c6a85a",
  event: "#c6a85a",
  building: "#0b1a2b",
  hotel: "#0b1a2b",
  brand: "#c6a85a",
  civic: "#0b1a2b",
  coffee: "#0b1a2b",
  restaurant: "#0b1a2b",
  nightlife: "#c6a85a",
  wellness: "#c6a85a",
  retail: "#c6a85a",
  services: "#0b1a2b",
};

export function getScale(score = 0, selected = false) {
  if (selected) return 1.35;
  if (score > 80) return 1.15;
  if (score > 60) return 1.08;
  if (score > 40) return 1.02;
  return 0.95;
}

export function isWithinRadius(entity, radiusMinutes) {
  if (!Number.isFinite(radiusMinutes)) return true;
  const walkMinutes = entity?.metadata?.walkMinutes;
  if (!Number.isFinite(walkMinutes)) return true;
  return walkMinutes <= radiusMinutes;
}
