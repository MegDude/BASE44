import { randomUUID } from "node:crypto";
import { requireTransactionDatabase, sendTransactionError } from "../../src/lib/api/transactionAuth.js";

const MAX_RESULTS = 25;
const ALLOWED_TYPES = new Set([
  "bar", "brand", "building", "civic", "coffee", "event", "hotel", "listing",
  "perk", "restaurant", "retail", "service", "wellness",
]);

function cleanText(value, max = 100) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9 '&.,-]/g, "")
    .slice(0, max);
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseCursor(value) {
  try {
    const offset = Number.parseInt(Buffer.from(String(value || ""), "base64url").toString("utf8"), 10);
    return Number.isFinite(offset) && offset >= 0 ? offset : 0;
  } catch {
    return 0;
  }
}

function createCursor(offset) {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function normalizeRequest(body = {}) {
  const limit = Math.max(1, Math.min(MAX_RESULTS, Number.parseInt(body.limit, 10) || 8));
  const entityTypes = [...new Set((Array.isArray(body.entity_types) ? body.entity_types : [])
    .map((value) => cleanText(value, 40).toLowerCase())
    .filter((value) => ALLOWED_TYPES.has(value)))];
  const categories = [...new Set((Array.isArray(body.categories) ? body.categories : [])
    .map((value) => cleanText(value, 60))
    .filter(Boolean))];
  const bounds = body.bounds && typeof body.bounds === "object" ? {
    north: finiteNumber(body.bounds.north),
    south: finiteNumber(body.bounds.south),
    east: finiteNumber(body.bounds.east),
    west: finiteNumber(body.bounds.west),
  } : null;
  const validBounds = bounds && Object.values(bounds).every(Number.isFinite)
    && bounds.north >= bounds.south && bounds.east >= bounds.west
    ? bounds
    : null;

  return {
    query: cleanText(body.query, 100),
    intent: cleanText(body.intent, 100),
    district: cleanText(body.district, 80),
    selectedEntityId: cleanText(body.selected_entity_id, 160),
    entityTypes,
    categories,
    bounds: validBounds,
    limit,
    offset: parseCursor(body.cursor),
    source: cleanText(body.source, 40) || "direct-search",
  };
}

function toPin(row, rank) {
  const id = String(row.canonical_entity_id || row.id);
  return {
    id,
    entity_type: row.entity_type,
    entity_id: id,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    title: row.name,
    category: row.category || null,
    district: row.district || null,
    status: row.status || "active",
    visibility: "public",
    tenant_id: null,
    workspace_id: null,
    partner_id: null,
    property_id: row.entity_type === "building" ? id : null,
    building_id: row.entity_type === "building" ? id : null,
    campaign_id: null,
    perk_id: row.entity_type === "perk" ? id : null,
    event_id: row.entity_type === "event" ? id : null,
    analytics_summary: null,
    last_updated: row.source_updated_at || row.updated_at || "",
    rank,
    relevance_score: Math.max(0, 1 - ((rank - 1) * 0.04)),
    reason: row.verification_status === "verified" ? "Verified downtown listing" : "Current downtown listing",
    canonical_entity_id: id,
    slug: row.slug,
    address: row.address || null,
    source_name: row.source_name || null,
    verification_status: row.verification_status || null,
    ownership_status: row.ownership_status || null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=300, stale-while-revalidate=600");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const request = normalizeRequest(req.body);
    let query = database
      .from("map_inventory")
      .select("id,canonical_entity_id,slug,name,entity_type,category,district,address,latitude,longitude,status,source_name,source_updated_at,verification_status,ownership_status,updated_at", { count: "exact" })
      .eq("status", "active")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (request.selectedEntityId) {
      query = query.or(`id.eq.${request.selectedEntityId},canonical_entity_id.eq.${request.selectedEntityId}`);
    }
    if (request.entityTypes.length) query = query.in("entity_type", request.entityTypes);
    if (request.categories.length) query = query.in("category", request.categories);
    if (request.district) query = query.ilike("district", `%${request.district}%`);
    if (request.bounds) {
      query = query
        .lte("latitude", request.bounds.north)
        .gte("latitude", request.bounds.south)
        .lte("longitude", request.bounds.east)
        .gte("longitude", request.bounds.west);
    }
    const search = request.query || request.intent;
    if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,category.ilike.%${search}%,district.ilike.%${search}%`);

    const end = request.offset + request.limit - 1;
    const { data, count, error } = await query
      .order("verification_status", { ascending: false })
      .order("source_updated_at", { ascending: false, nullsFirst: false })
      .order("canonical_entity_id", { ascending: true })
      .range(request.offset, end);
    if (error) throw error;

    const pins = (data || []).map((row, index) => toPin(row, request.offset + index + 1));
    const total = Number(count || 0);
    const nextOffset = request.offset + pins.length;
    const appliedFilters = [
      request.district,
      ...request.entityTypes,
      ...request.categories,
    ].filter(Boolean);

    return res.status(200).json({
      query_id: randomUUID(),
      interpreted_intent: request.intent || request.query || null,
      pins,
      total_available: total,
      next_cursor: nextOffset < total ? createCursor(nextOffset) : null,
      result_context: {
        title: search ? `Results for ${search}` : "Downtown results",
        subtitle: `${total} current map ${total === 1 ? "listing" : "listings"}`,
        applied_filters: appliedFilters,
      },
      meta: {
        source: "map_inventory",
        bounded: true,
        limit: request.limit,
        offset: request.offset,
        request_source: request.source,
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
