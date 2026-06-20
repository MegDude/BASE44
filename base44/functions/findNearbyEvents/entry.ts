import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DEFAULT_RADIUS_MILES = 2;
const MAX_RADIUS_MILES = 10;
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
    const now = new Date();

    if (!isValidCoordinate(latitude, longitude)) {
      return Response.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 });
    }

    const [eventRows, sharedRows] = await Promise.all([
      listEntities(base44.asServiceRole.entities.Event),
      listEntities(base44.asServiceRole.entities.SharedMapItem),
    ]);

    const candidates = dedupeCandidates([
      ...buildEventCandidates(eventRows, query, now),
      ...buildSharedCandidates(sharedRows, query, now),
    ]);

    const scored = candidates
      .map((item) => enrichCandidate(item, latitude, longitude, query, now))
      .filter((item) => item.distance_miles <= radiusMiles)
      .sort(sortByScore)
      .slice(0, limit);

    const fallback = scored.length > 0
      ? scored
      : candidates
          .map((item) => enrichCandidate(item, latitude, longitude, query, now))
          .filter((item) => item.distance_miles <= Math.max(radiusMiles * 2, 4))
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
        event_id: item.event_id,
        title: item.title,
        venue_name: item.venue_name,
        category: item.category,
        description: item.description,
        address: item.address,
        date: item.date,
        end_date: item.end_date,
        distance_miles: Number(item.distance_miles.toFixed(2)),
        walk_minutes: Math.max(1, Math.round(item.distance_miles * 20)),
        is_members_only: item.is_members_only,
        status: item.status,
        rsvp_count: item.rsvp_count,
        why_relevant: item.why_relevant,
        source_type: item.source_type,
      })),
      summary: buildSummary(fallback),
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('findNearbyEvents error:', error);
    return Response.json({ error: error.message || 'Unable to find nearby events.' }, { status: 500 });
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

function buildEventCandidates(rows, query, now) {
  return rows
    .filter((row) => ['upcoming', 'live'].includes(String(row?.status || 'upcoming')))
    .filter((row) => isValidCoordinate(row?.latitude, row?.longitude))
    .filter((row) => isUpcomingEnough(row?.date, row?.end_date, now))
    .map((row) => ({
      id: `event-${row.id}`,
      event_id: row.id,
      title: row?.title || 'Upcoming event',
      venue_name: row?.venue_name || '',
      category: row?.category || 'event',
      description: row?.description || '',
      address: row?.address || '',
      latitude: toNumber(row?.latitude),
      longitude: toNumber(row?.longitude),
      date: row?.date || null,
      end_date: row?.end_date || null,
      status: row?.status || 'upcoming',
      is_members_only: Boolean(row?.is_members_only),
      rsvp_count: Number(row?.rsvp_count || 0),
      featured: Boolean(row?.is_featured),
      source_type: 'event',
      search_text: [row?.title, row?.description, row?.category, row?.venue_name, row?.address, ...(Array.isArray(row?.tags) ? row.tags : [])]
        .filter(Boolean)
        .join(' '),
    }))
    .filter((item) => matchesQuery(item.search_text, query));
}

function buildSharedCandidates(rows, query, now) {
  return rows
    .map((row) => {
      const entityType = normalizeText(row?.entity_type);
      const latitude = toNumber(row?.lat ?? row?.latitude);
      const longitude = toNumber(row?.lng ?? row?.longitude);
      const eventDate = row?.metadata?.date || row?.metadata?.start_date || null;
      const endDate = row?.metadata?.end_date || null;

      if (entityType !== 'event' || !isValidCoordinate(latitude, longitude) || !isUpcomingEnough(eventDate, endDate, now)) {
        return null;
      }

      return {
        id: `shared-${row.id}`,
        event_id: row?.entity_id || row.id,
        title: row?.title || 'Upcoming event',
        venue_name: row?.subtitle || row?.metadata?.venue_name || '',
        category: row?.category || row?.metadata?.category || 'event',
        description: row?.description || '',
        address: row?.metadata?.address || '',
        latitude,
        longitude,
        date: eventDate,
        end_date: endDate,
        status: row?.metadata?.status || 'upcoming',
        is_members_only: Boolean(row?.metadata?.is_members_only),
        rsvp_count: Number(row?.metadata?.rsvp_count || 0),
        featured: Boolean(row?.metadata?.is_featured),
        source_type: 'shared_map_item',
        search_text: [row?.title, row?.subtitle, row?.description, row?.category, row?.metadata?.venue_name, row?.metadata?.address]
          .filter(Boolean)
          .join(' '),
      };
    })
    .filter(Boolean)
    .filter((item) => matchesQuery(item.search_text, query));
}

function dedupeCandidates(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText([item.event_id, item.title, item.date].filter(Boolean).join('|'));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichCandidate(item, latitude, longitude, query, now) {
  const distance = haversineMiles(latitude, longitude, item.latitude, item.longitude);
  const queryMatch = matchesQuery(item.search_text, query);
  const hoursAway = getHoursAway(item.date, now);
  const soonBonus = Number.isFinite(hoursAway) ? Math.max(0, 14 - Math.min(hoursAway, 14)) : 0;
  const score = (queryMatch ? 30 : 0) + (item.featured ? 10 : 0) + (item.status === 'live' ? 12 : 0) + soonBonus + Math.max(0, 24 - distance * 10);

  return {
    ...item,
    distance_miles: distance,
    score,
    why_relevant: buildWhyRelevant(item, distance, queryMatch, hoursAway),
  };
}

function buildWhyRelevant(item, distance, queryMatch, hoursAway) {
  const distanceText = `${distance.toFixed(1)} miles away`;
  if (item.status === 'live') return `Live now and ${distanceText}.`;
  if (queryMatch && Number.isFinite(hoursAway)) return `Matches your request and starts in about ${Math.max(1, Math.round(hoursAway))} hours.`;
  if (Number.isFinite(hoursAway) && hoursAway <= 24) return `Starting soon and ${distanceText}.`;
  return `Nearby event ${distanceText}.`;
}

function buildSummary(items) {
  if (!items.length) return 'No nearby events found.';
  return items
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.title} — ${item.distance_miles.toFixed(1)} mi away`)
    .join('\n');
}

function isUpcomingEnough(date, endDate, now) {
  const startValue = Date.parse(date || '');
  const endValue = Date.parse(endDate || date || '');
  if (!Number.isFinite(startValue) && !Number.isFinite(endValue)) return true;
  const compareValue = Number.isFinite(endValue) ? endValue : startValue;
  return compareValue >= now.getTime() - 3 * 60 * 60 * 1000;
}

function getHoursAway(date, now) {
  const value = Date.parse(date || '');
  if (!Number.isFinite(value)) return NaN;
  return Math.max(0, (value - now.getTime()) / (1000 * 60 * 60));
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