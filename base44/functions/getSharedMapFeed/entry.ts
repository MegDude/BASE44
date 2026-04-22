import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENTITY_CONFIG = [
  { key: 'Venue', type: 'venue', title: 'name', status: ['active', 'coming_soon'] },
  { key: 'Event', type: 'event', title: 'title', status: ['upcoming', 'live'] },
  { key: 'Building', type: 'building', title: 'name', status: ['active', 'pilot', 'prospect'] },
  { key: 'Perk', type: 'perk', title: 'title', status: ['active'] },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.search || '').trim().toLowerCase();
    const district = String(body.district || '').trim().toLowerCase();
    const filters = body.filters || {};
    const limit = Number(body.limit || 1000);

    const configuredItems = await readSharedMapItems(base44);
    const sourceItems = configuredItems.length > 0
      ? configuredItems
      : await readEntityBackedItems(base44);

    const items = sourceItems
      .filter((item) => isValidCoordinate(item.latitude, item.longitude))
      .filter((item) => matchesQuery(item, query))
      .filter((item) => matchesDistrict(item, district, filters.districts))
      .filter((item) => matchesSet(item.category, filters.categories))
      .filter((item) => matchesSet(item.entity_type, filters.types))
      .filter((item) => matchesSet(item.status, filters.statuses))
      .slice(0, Number.isFinite(limit) ? limit : 1000);

    return Response.json({
      success: true,
      items,
      source: configuredItems.length > 0 ? 'shared_map_item' : 'base44_entities',
      query,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('getSharedMapFeed error:', error);
    return Response.json(
      {
        success: false,
        items: [],
        error: error?.message || 'Unable to load shared map feed',
        generated_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
});

async function readSharedMapItems(base44) {
  try {
    const rows = await base44.entities.SharedMapItem.list('-updated_date');
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      id: row.id,
      entity_id: row.entity_id || row.id,
      entity_type: normalizeType(row.entity_type),
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      district: row.district,
      category: row.category,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      status: row.status || 'active',
      image: row.image,
      icon: row.icon,
      source_ref: row.source_ref || 'SharedMapItem',
      metadata: row.metadata || {},
    }));
  } catch {
    return [];
  }
}

async function readEntityBackedItems(base44) {
  const batches = await Promise.all(
    ENTITY_CONFIG.map(async (config) => {
      try {
        const rows = await base44.entities[config.key].list('-updated_date');
        return (Array.isArray(rows) ? rows : []).map((row) => mapBase44Entity(row, config));
      } catch {
        return [];
      }
    })
  );

  return batches.flat().filter(Boolean);
}

function mapBase44Entity(row, config) {
  const type = normalizeType(config.type);
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);

  if (!isValidCoordinate(latitude, longitude) && type !== 'perk') {
    return null;
  }

  return {
    id: `${type}-${row.id}`,
    entity_id: row.id,
    entity_type: type,
    title: row[config.title] || row.title || row.name,
    subtitle: row.category || row.venue_name || row.address,
    description: row.description,
    district: row.district,
    category: row.category || type,
    latitude,
    longitude,
    status: row.status || 'active',
    image: row.image_url,
    icon: type,
    source_ref: config.key,
    metadata: {
      address: row.address,
      venue_name: row.venue_name,
      website: row.website,
      hours: row.hours,
      tags: row.tags || [],
      perk_value: row.perk_value || row.value,
      perk_description: row.perk_description,
      rsvp_count: row.rsvp_count,
      date: row.date,
      is_featured: row.is_featured,
      source_status_allowed: config.status,
    },
  };
}

function normalizeType(type) {
  if (type === 'campaign') return 'brand';
  if (type === 'civic_activation') return 'civic';
  return type || 'venue';
}

function isValidCoordinate(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function matchesQuery(item, query) {
  if (!query) return true;
  const text = [
    item.title,
    item.subtitle,
    item.description,
    item.category,
    item.district,
    item.metadata?.address,
    item.metadata?.venue_name,
    ...(item.metadata?.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(query);
}

function matchesDistrict(item, district, districtFilters = []) {
  const requested = district || (Array.isArray(districtFilters) ? districtFilters[0] : '');
  if (!requested || requested === 'downtown') return true;
  return String(item.district || '').toLowerCase() === requested;
}

function matchesSet(value, allowed) {
  if (!Array.isArray(allowed) || allowed.length === 0) return true;
  return allowed.includes(value);
}
