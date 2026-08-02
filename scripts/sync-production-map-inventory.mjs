import { createClient } from "@supabase/supabase-js";
import productionMapInventory from "../src/data/production/production-map-inventory.json" with { type: "json" };

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const database = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const records = Array.isArray(productionMapInventory?.records) ? productionMapInventory.records : [];
if (!records.length) throw new Error("No published map records were found.");

const rows = records.map((record) => ({
  id: String(record.id),
  slug: String(record.slug || record.id),
  name: String(record.name),
  entity_type: String(record.entityType || "place"),
  category: record.category || null,
  district: record.district || null,
  address: record.address || null,
  latitude: Number.isFinite(Number(record.lat)) ? Number(record.lat) : null,
  longitude: Number.isFinite(Number(record.lng)) ? Number(record.lng) : null,
  status: ["draft", "active", "paused", "archived"].includes(record.status) ? record.status : "active",
  source_name: String(record.source || "published_map_inventory"),
  source_updated_at: record.updatedAt || null,
  verification_status: record.verificationStatus || "unverified",
  ownership_status: record.ownershipStatus || "unassigned",
  canonical_entity_id: String(record.id),
  source_payload: record,
  imported_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const canonicalRows = records.map((record) => ({
  id: String(record.id),
  // `canonical_entities.slug` is globally unique; published map slugs are not.
  // Keep the display slug in metadata and use the immutable inventory ID here.
  slug: String(record.id),
  name: String(record.name),
  entity_type: String(record.entityType || "place"),
  status: ["draft", "active", "paused", "archived"].includes(record.status) ? record.status : "active",
  address: record.address || null,
  district: record.district || null,
  latitude: Number.isFinite(Number(record.lat)) ? Number(record.lat) : null,
  longitude: Number.isFinite(Number(record.lng)) ? Number(record.lng) : null,
  metadata: { ...record, source: String(record.source || "published_map_inventory") },
  updated_at: new Date().toISOString(),
}));

for (let offset = 0; offset < rows.length; offset += 200) {
  const [{ error: canonicalError }, { error: inventoryError }] = await Promise.all([
    database.from("canonical_entities").upsert(canonicalRows.slice(offset, offset + 200), { onConflict: "id" }),
    database.from("map_inventory").upsert(rows.slice(offset, offset + 200), { onConflict: "id" }),
  ]);
  if (canonicalError) throw canonicalError;
  if (inventoryError) throw inventoryError;
}

console.log(JSON.stringify({ imported: rows.length, canonicalEntities: canonicalRows.length, source: "production-map-inventory.json" }));
