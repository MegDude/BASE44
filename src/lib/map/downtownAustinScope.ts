import { toFiniteNumber } from "./coordinateValidation";

const DOWNTOWN_78701_BOUNDS = {
  north: 30.286,
  south: 30.250,
  west: -97.766,
  east: -97.729,
};

const EAST_SIDE_CUTOFF = -97.7289;

function searchableText(entity: Record<string, unknown>): string {
  return [
    entity.address,
    entity.osm_id,
    entity.name,
    entity.summary,
    entity.description,
    entity.zip,
    entity.postalCode,
    entity.postal_code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function isDowntownAustin78701Entity(entity: Record<string, unknown>): boolean {
  const latitude = toFiniteNumber(entity.latitude);
  const longitude = toFiniteNumber(entity.longitude);

  if (latitude === null || longitude === null) return false;

  const inDowntownBox =
    latitude >= DOWNTOWN_78701_BOUNDS.south &&
    latitude <= DOWNTOWN_78701_BOUNDS.north &&
    longitude >= DOWNTOWN_78701_BOUNDS.west &&
    longitude <= DOWNTOWN_78701_BOUNDS.east;

  if (!inDowntownBox) return false;
  if (longitude > EAST_SIDE_CUTOFF) return false;

  const text = searchableText(entity);
  const sourceText = [entity.source, entity.brand, entity.category_key].filter(Boolean).join(" ").toLowerCase();

  if (sourceText.includes("legends") && sourceText.includes("verified listing")) return true;
  return text.includes("78701");
}
