import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DEFAULT_RADIUS_MILES = 1.5;
const MAX_RADIUS_MILES = 8;
const DEFAULT_LIMIT = 6;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await base44.auth.me().catch(() => null);

    const body = await req.json().catch(() => ({}));
    const latitude = toNumber(body.latitude);
    const longitude = toNumber(body.longitude);
    const query = String(body.query || '').trim();
    const radiusMiles = clampNumber(toNumber(body.radius_miles), DEFAULT_RADIUS_MILES, MAX_RADIUS_MILES);
    const limit = clampInteger(toNumber(body.limit), DEFAULT_LIMIT, 12);

    if (!isValidCoordinate(latitude, longitude)) {
      return Response.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 });
    }

    const [sharedRows, venueRows, perkRows] = await Promise.all([
      listEntities(base44.asServiceRole.entities.SharedMapItem),
      listEntities(base44.asServiceRole.entities.Venue),
      listEntities(base44.asServiceRole.entities.Perk),
    ]);

    const venueIndex = buildVenueIndex(venueRows);
    const candidates = dedupeCandidates([
      ...buildVenueCandidates(venueRows, query),
      ...buildPerkCandidates(perkRows, venueIndex, query),
      ...buildSharedCandidates(sharedRows, query),
    ]);

    const scored = candidates
      .map((item) => enrichCandidate(item, latitude, longitude, query))
      .filter((item) => item.distance_miles <= radiusMiles)
      .sort(sortByScore)
      .slice(0, limit);

    const fallback = scored.length > 0
      ? scored
      : candidates
          .map((item) => enrichCandidate(item, latitude, longitude, query))
          .filter((item) => item.distance_miles <= Math.max(radiusMiles * 2, 3))
          .sort(sortByScore)
          .slice(0, limit);

    return Response.json({
      success: true,
      location: { latitude, longitude },
      query,
      radius_miles: radiusMiles,
      radius_expanded: scored.length === 0 && fallback.length > 0,
      count: fallback.length,
      items: fallback.map((item) => ({
        id: item.id,
        title: item.title,
        venue_name: item.venue_name,
        category: item.category,
        value: item.value,
        description: item.description,
        address: item.address,
        distance_miles: Number(item.distance_miles.toFixed(2)),
        walk_minutes: Math.max(1, Math.round(item.distance_miles * 20)),
        why_relevant: item.why_relevant,
        latitude: item.latitude,
        longitude: item.longitude,
        source_type: item.source_type,
      })),
      summary: buildSummary(fallback),
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('findNearbyPerks error:', error);
    return Response.json({ error: error.message || 'Unable to find nearby perks.' }, { status: 500 });
  }
});

async function listEntities(entityApi) {
  try {
    const rows = await entityApi.list('-updated_date', 300);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function buildVenueIndex(rows) {
  return rows.reduce((acc, row) => {
    if (!isValidCoordinate(row?.latitude, row?.longitude)) return acc;
    const key = normalizeText(row?.name);
    if (!key) return acc;
    acc.set(key, row);
    return acc;
  }, new Map());
}

function buildVenueCandidates(rows, query) {
  return rows
    .filter((row) => ['active', 'coming_soon'].includes(String(row?.status || 'active')))
    .filter((row) => isValidCoordinate(row?.latitude, row?.longitude))
    .filter((row) => row?.perk_value || row?.perk_description)
    .map((row) => ({
      id: `venue-${row.id}`,
      title: row?.perk_value ? `${row.perk_value} at ${row.name}` : `${row.name} resident perk`,
      venue_name: row?.name,
      category: row?.category || 'perk',
      value: row?.perk_value || 'Resident perk',
      description: row?.perk_description || row?.description || '',
      address: row?.address || '',
      latitude: toNumber(row?.latitude),
      longitude: toNumber(row?.longitude),
      source_type: 'venue',
      search_text: [row?.name, row?.category, row?.perk_value, row?.perk_description, row?.description].filter(Boolean).join(' '),
      featured: Boolean(row?.is_featured),
    }))
    .filter((item) => matchesQuery(item.search_text, query));
}

function buildPerkCandidates(rows, venueIndex, query) {
  return rows
    .filter((row) => String(row?.status || 'active') === 'active')
    .map((row) => {
      const venue = venueIndex.get(normalizeText(row?.venue_name));
      if (!venue) return null;
      return {
        id: `perk-${row.id}`,
        title: row?.title || `${row?.venue_name || 'Nearby'} perk`,
        venue_name: row?.venue_name || venue?.name,
        category: row?.category || 'perk',
        value: row?.value || 'Resident perk',
        description: row?.description || '',
        address: venue?.address || '',
        latitude: toNumber(venue?.latitude),
        longitude: toNumber(venue?.longitude),
        source_type: 'perk',
        search_text: [row?.title, row?.venue_name, row?.category, row?.value, row?.description].filter(Boolean).join(' '),
        featured: Boolean(row?.is_featured),
      };
    })
    .filter(Boolean)
    .filter((item) => matchesQuery(item.search_text, query));
}

function buildSharedCandidates(rows, query) {
  return rows
    .map((row) => {
      const entityType = normalizeText(row?.entity_type);
      const hasPerkSignal = entityType === 'perk' || row?.metadata?.perk_value || row?.metadata?.perk_description || normalizeText(row?.category) === 'perk';
      const latitude = toNumber(row?.lat ?? row?.latitude);
      const longitude = toNumber(row?.lng ?? row?.longitude);
      if (!hasPerkSignal || !isValidCoordinate(latitude, longitude)) return null;
      return {
        id: `shared-${row.id}`,
        title: row?.title || row?.name || 'Nearby perk',
        venue_name: row?.subtitle || row?.metadata?.venue_name || '',
        category: row?.category || 'perk',
        value: row?.metadata?.perk_value || 'Resident perk',
        description: row?.description || row?.metadata?.perk_description || '',
        address: row?.metadata?.address || '',
        latitude,
        longitude,
        source_type: 'shared_map_item',
        search_text: [row?.title, row?.subtitle, row?.description, row?.category, row?.metadata?.perk_value, row?.metadata?.perk_description].filter(Boolean).join(' '),
        featured: Boolean(row?.metadata?.is_featured),
      };
    })
    .filter(Boolean)
    .filter((item) => matchesQuery(item.search_text, query));
}

function dedupeCandidates(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText([item.venue_name, item.title, item.value].filter(Boolean).join('|'));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichCandidate(item, latitude, longitude, query) {
  const distance = haversineMiles(latitude, longitude, item.latitude, item.longitude);
  const queryMatch = matchesQuery(item.search_text, query);
  const score = (queryMatch ? 30 : 0) + (item.featured ? 12 : 0) + Math.max(0, 25 - distance * 10);

  return {
    ...item,
    distance_miles: distance,
    score,
    why_relevant: buildWhyRelevant(item, distance, queryMatch),
  };
}

function buildWhyRelevant(item, distance, queryMatch) {
  if (queryMatch) return `Matches your request and is about ${distance.toFixed(1)} miles away.`;
  if (item.value) return `${item.value} about ${distance.toFixed(1)} miles away.`;
  return `Walkable option about ${distance.toFixed(1)} miles away.`;
}

function buildSummary(items) {
  if (!items.length) return 'No nearby perks found.';
  return items
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.title} — ${item.distance_miles.toFixed(1)} mi away`)
    .join('\n');
}

function sortByScore(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return a.distance_miles - b.distance_miles;
}

function matchesQuery(text, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;
  return normalizeText(text).includes(normalizedQuery);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(toNumber(latitude)) && Number.isFinite(toNumber(longitude));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function clampNumber(value, fallback, max) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, 0.2), max);
}

function clampInteger(value, fallback, max) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), 1), max);
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}