import { searchArchiveCatalog } from "./_utils/archiveCatalog.js";
import { supabaseServer } from "../src/lib/supabaseServer.js";
import { DOWNTOWN_BUILDINGS_SEED_RUNTIME, seedBuildingToMapEntity } from "../src/data/downtownBuildings.seed.runtime.js";

const DEFAULT_CENTER = { lat: 30.2672, lng: -97.7431 };
const DEFAULT_LIMIT = 60;

function parseBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }

  return req.body && typeof req.body === "object" ? req.body : {};
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function getPayload(req) {
  const body = parseBody(req);
  const query = String(
    body.query ?? body.search ?? req.query?.query ?? req.query?.search ?? ""
  ).trim();
  const limit = Number(body.limit ?? req.query?.limit ?? DEFAULT_LIMIT);
  const types = normalizeList(body.types ?? body.entityKinds ?? body.filters?.types ?? req.query?.types);
  const categories = normalizeList(body.categories ?? body.filters?.categories ?? req.query?.categories);
  const district = String(body.district ?? body.filters?.district ?? req.query?.district ?? "")
    .trim()
    .toLowerCase();

  return {
    query,
    limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT,
    types,
    categories,
    district,
  };
}

function toFiniteNumber(value) {
  if (value === null || value === undefined) return null;
  const next = typeof value === "string" ? Number.parseFloat(value.trim()) : Number(value);
  return Number.isFinite(next) ? next : null;
}

function safeCoordinates(id, lat, lng) {
  const normalizedLat = toFiniteNumber(lat);
  const normalizedLng = toFiniteNumber(lng);

  if (
    normalizedLat !== null &&
    normalizedLng !== null &&
    normalizedLat >= -90 &&
    normalizedLat <= 90 &&
    normalizedLng >= -180 &&
    normalizedLng <= 180
  ) {
    return { lat: normalizedLat, lng: normalizedLng };
  }

  const seed = String(id || "downtown")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const offset = ((seed % 9) - 4) * 0.00045;

  return {
    lat: DEFAULT_CENTER.lat + offset,
    lng: DEFAULT_CENTER.lng - offset,
  };
}

function normalizeType(rawType = "") {
  const type = String(rawType || "").trim().toLowerCase();
  if (type === "property" || type === "listing") return "building";
  if (type === "civic_activation") return "civic";
  if (type === "campaign") return "brand";
  return type || "venue";
}

function primaryActionForType(type) {
  if (type === "event") return "RSVP";
  if (type === "perk") return "Use Perk";
  if (type === "building") return "View Building";
  return "Save";
}

function mapArchiveTypes(types = []) {
  if (!types.length) return ["location", "listing"];

  if (types.includes("building") || types.includes("hotel")) {
    return ["listing", "location"];
  }

  return ["location"];
}

function mapArchiveItem(item) {
  const baseType = item?.type === "listing" ? "building" : "venue";
  return {
    id: item.id,
    entity_id: item.id,
    entity_type: baseType,
    type: baseType,
    name: item.name || item.searchTerm || item.address || "Downtown place",
    title: item.name || item.searchTerm || item.address || "Downtown place",
    category: String(item.category || (baseType === "building" ? "building" : "nearby")).toLowerCase(),
    description: item.summary || item.alignment || item.specials || item.status || "",
    district: item.district || "Downtown Austin",
    address: item.address || "",
    lat: item.latitude ?? null,
    lng: item.longitude ?? null,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    metadata: {
      source: "archive",
      popularity: item.supportsEvents ? 72 : item.hasSpecials ? 68 : 58,
      searchKeywords: [item.name, item.category, item.district, item.address].filter(Boolean),
      tags: [item.category, item.district, item.type].filter(Boolean),
    },
    status: item.status || "active",
  };
}

function normalizeEntity(item, index = 0) {
  const rawType = item?.entity_type ?? item?.type;
  const type = normalizeType(rawType);
  const id = String(item?.id || item?.entity_id || `${type}-${item?.name || item?.title || index}`);
  const coords = safeCoordinates(
    id,
    item?.lat ?? item?.latitude ?? item?.location?.latitude,
    item?.lng ?? item?.longitude ?? item?.location?.longitude
  );
  const metadata = item?.metadata && typeof item.metadata === "object" ? item.metadata : {};
  const isLive = Boolean(
    item?.isLive ||
      item?.status === "live" ||
      metadata?.isLive ||
      metadata?.eventTiming?.isLive
  );
  const category = String(item?.category || metadata?.category || type).toLowerCase();
  const name = item?.name || item?.title || "Downtown place";
  const title = item?.title || name;
  const district = item?.district || metadata?.district || "Downtown Austin";
  const address = item?.address || metadata?.address || district;
  const _score = Number(item?._score || metadata?.popularity || 50);

  return {
    ...item,
    id,
    entity_id: item?.entity_id || id,
    type,
    entity_type: type,
    name,
    title,
    category,
    description: item?.description || metadata?.description || "",
    district,
    address,
    latitude: coords.lat,
    longitude: coords.lng,
    lat: coords.lat,
    lng: coords.lng,
    location: {
      latitude: coords.lat,
      longitude: coords.lng,
      valid: true,
    },
    status: item?.status || metadata?.status || (isLive ? "live" : "active"),
    isLive,
    isNew: Boolean(item?.isNew || metadata?.isNew),
    isSponsored: Boolean(item?.isSponsored || metadata?.isSponsored || item?.partnerTier === "premium"),
    partnerTier: item?.partnerTier || metadata?.partnerTier || null,
    redemptionsToday: Number(item?.redemptionsToday || metadata?.redemptionsToday || 0),
    primaryAction: item?.primaryAction || primaryActionForType(type),
    metadata: {
      ...metadata,
      popularity: Number(metadata?.popularity || _score || 50),
      tags: Array.isArray(metadata?.tags) ? metadata.tags : [category, district, type].filter(Boolean),
      searchKeywords: Array.isArray(metadata?.searchKeywords)
        ? metadata.searchKeywords
        : [name, title, category, district, address].filter(Boolean),
    },
    _score,
    visual: {
      isActive: Boolean(isLive || item?.status === "active"),
      isNew: Boolean(item?.isNew || metadata?.isNew),
      isSponsored: Boolean(item?.isSponsored || metadata?.isSponsored || item?.partnerTier === "premium"),
      isSaved: Boolean(item?.isSaved || metadata?.isSaved),
    },
  };
}

function dedupeEntities(items = []) {
  const seen = new Map();

  items.forEach((item, index) => {
    const normalized = normalizeEntity(item, index);
    const key = String(normalized.entity_id || normalized.id);
    if (!seen.has(key)) {
      seen.set(key, normalized);
      return;
    }

    const existing = seen.get(key);
    seen.set(key, {
      ...existing,
      ...normalized,
      metadata: {
        ...(existing.metadata || {}),
        ...(normalized.metadata || {}),
      },
    });
  });

  return Array.from(seen.values());
}

function calculateMapScore(entity, intent) {
  let score = Number(entity?._score || entity?.metadata?.popularity || 50);

  const text = [
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.description,
    entity?.district,
    entity?.address,
    ...(entity?.metadata?.tags || []),
    ...(entity?.metadata?.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const query = String(intent?.intent || intent?.category || "").toLowerCase();

  if (query && text.includes(query)) score += 30;
  if (entity?.isLive || entity?.status === "live") score += 20;
  if (entity?.type === "perk") score += 15;
  if (entity?.type === "event") score += 12;
  if (entity?.isSponsored || entity?.partnerTier === "premium") score += 8;

  const walkMinutes = Number(entity?.metadata?.walkMinutes);
  if (Number.isFinite(walkMinutes)) {
    score += Math.max(0, 20 - walkMinutes * 2);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function applyFilters(items = [], payload) {
  const query = String(payload.query || "").toLowerCase();
  const typeSet = new Set(payload.types || []);
  const categorySet = new Set(payload.categories || []);
  const district = payload.district;

  return items.filter((item) => {
    const text = [
      item.name,
      item.title,
      item.category,
      item.description,
      item.district,
      item.address,
      ...(item.metadata?.tags || []),
      ...(item.metadata?.searchKeywords || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || text.includes(query);
    const matchesType =
      typeSet.size === 0 ||
      typeSet.has(String(item.type).toLowerCase()) ||
      typeSet.has(String(item.entity_type).toLowerCase());
    const matchesCategory =
      categorySet.size === 0 || categorySet.has(String(item.category).toLowerCase());
    const matchesDistrict =
      !district || String(item.district || "").toLowerCase() === district;

    return matchesQuery && matchesType && matchesCategory && matchesDistrict;
  });
}

async function fetchSupabaseEntities(limit) {
  if (!supabaseServer) return [];

  const [mapEntitiesResp, buildingsResp] = await Promise.all([
    supabaseServer
      .from("map_entities")
      .select("*")
      .limit(Math.max(limit * 3, 150)),
    supabaseServer
      .from("buildings")
      .select("id,name,address,district,latitude,longitude,unit_count,management_company,status,priority")
      .limit(Math.max(limit * 2, 80)),
  ]);

  const mapEntities = Array.isArray(mapEntitiesResp.data) ? mapEntitiesResp.data : [];
  const buildings = Array.isArray(buildingsResp.data)
    ? buildingsResp.data.map((building) => ({
        id: building.id,
        entity_id: building.id,
        entity_type: "building",
        type: "building",
        name: building.name,
        title: building.name,
        category: "building",
        description: "Downtown building",
        district: building.district || "Downtown Austin",
        address: building.address || "",
        latitude: building.latitude,
        longitude: building.longitude,
        lat: building.latitude,
        lng: building.longitude,
        metadata: {
          unitCount: building.unit_count,
          managementCompany: building.management_company,
          priority: building.priority,
          popularity: 50 + (building.priority === 1 ? 16 : building.priority === 2 ? 8 : 2),
          tags: ["building", building.district].filter(Boolean),
          searchKeywords: [building.name, building.address, building.district, building.management_company].filter(Boolean),
        },
        status: building.status || "active",
      }))
    : [];

  return [...mapEntities, ...buildings];
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({ error: "Method not allowed", results: [] });
  }

  try {
    const payload = getPayload(req);
    const [supabaseItems, archiveItems] = await Promise.all([
      fetchSupabaseEntities(payload.limit),
      searchArchiveCatalog(payload.query, {
        limit: Math.max(payload.limit, 30),
        types: mapArchiveTypes(payload.types),
      }),
    ]);
    const seedEntities = DOWNTOWN_BUILDINGS_SEED_RUNTIME.map(seedBuildingToMapEntity);

    const merged = dedupeEntities([
      ...supabaseItems,
      ...seedEntities,
      ...(Array.isArray(archiveItems) ? archiveItems.map(mapArchiveItem) : []),
    ]);

    const filtered = applyFilters(merged, payload)
      .map((item) => ({
        ...item,
        _score: calculateMapScore(item, {
          intent: payload.query,
          category: payload.categories[0] || null,
        }),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, payload.limit);

    const source =
      supabaseItems.length > 0 && archiveItems.length > 0
        ? "supabase+seed+archive"
        : supabaseItems.length > 0
          ? "supabase"
          : "seed+archive";

    return res.status(200).json({
      ok: true,
      source,
      center: DEFAULT_CENTER,
      count: filtered.length,
      results: filtered,
    });
  } catch (error) {
    console.error("map-data failed", error);
    return res.status(500).json({
      ok: false,
      source: "error",
      center: DEFAULT_CENTER,
      count: 0,
      results: [],
      error: "Map data failed",
    });
  }
}
