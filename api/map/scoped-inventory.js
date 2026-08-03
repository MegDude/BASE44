import { requireTransactionDatabase, sendTransactionError } from "../../src/lib/api/transactionAuth.js";

const TYPES = new Set(["restaurant","building","listing","retail","bar","civic","hotel","wellness","coffee","brand","event","service","perk"]);
const MAX_RESULTS = 25;

function clean(value, max = 100) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9 -]/g, "").slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const type = clean(req.query?.type, 40);
    const district = clean(req.query?.district, 80);
    const search = clean(req.query?.q, 100);
    const entityId = clean(req.query?.entityId, 160);
    const requestedLimit = Number.parseInt(req.query?.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(MAX_RESULTS, requestedLimit)) : 12;

    let query = database
      .from("map_inventory")
      .select("id,slug,name,entity_type,category,district,address,latitude,longitude,status,source_name,source_updated_at,verification_status,ownership_status,updated_at", { count: "exact" })
      .eq("status", "active");

    if (entityId) query = query.eq("id", entityId);
    if (type && TYPES.has(type)) query = query.eq("entity_type", type);
    if (district) query = query.ilike("district", `%${district}%`);
    if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,category.ilike.%${search}%`);
    const { data, count, error } = await query.order("updated_at", { ascending: false }).limit(limit);
    if (error) throw error;

    return res.status(200).json({
      data: data || [],
      meta: {
        source: "map_inventory",
        total: Number(count || 0),
        limit,
        bounded: true,
        filters: { type: type || null, district: district || null, query: search || null, entityId: entityId || null },
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
