function normalizeVenueName(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadius * Math.asin(Math.sqrt(hav));
}

function scoreVenue(item) {
  let score = 0;
  if (item?.hasPublicSpecial || item?.metadata?.hasActiveSpecials) score += 10;
  if (item?.verified || item?.metadata?.verified) score += 8;
  if (item?.operatingHours || item?.hours) score += 4;
  if (item?.address) score += 3;
  if (item?.lastVerifiedAt || item?.metadata?.lastVerifiedAt) score += 2;
  return score;
}

function mergeOffers(primary, secondary) {
  const specials = [
    ...(primary?.specials || []),
    ...(secondary?.specials || []),
  ].filter(Boolean);

  return [...new Set(specials)];
}

export function dedupeVenues(items = [], getCoords = (item) => item?.coords || null) {
  const results = [];

  items.forEach((item) => {
    const district = String(item?.district || "").toLowerCase().trim();
    const normalizedName = normalizeVenueName(item?.name || item?.title);
    const coords = getCoords(item);

    const duplicateIndex = results.findIndex((existing) => {
      const existingName = normalizeVenueName(existing?.name || existing?.title);
      if (!normalizedName || !district) return false;
      if (existingName !== normalizedName) return false;
      if (String(existing?.district || "").toLowerCase().trim() !== district) return false;

      const existingCoords = getCoords(existing);
      return getDistanceMeters(existingCoords, coords) <= 50;
    });

    if (duplicateIndex === -1) {
      results.push(item);
      return;
    }

    const existing = results[duplicateIndex];
    const preferred = scoreVenue(item) > scoreVenue(existing) ? item : existing;
    const fallback = preferred === item ? existing : item;

    results[duplicateIndex] = {
      ...fallback,
      ...preferred,
      specials: mergeOffers(preferred, fallback),
      hasPublicSpecial: Boolean(preferred?.hasPublicSpecial || fallback?.hasPublicSpecial),
      verified: Boolean(preferred?.verified || fallback?.verified),
      metadata: {
        ...(fallback?.metadata || {}),
        ...(preferred?.metadata || {}),
      },
    };
  });

  return results;
}
