import { createClient } from "@supabase/supabase-js";
import productionMapInventory from "../src/data/production/production-map-inventory.json" with { type: "json" };

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes("--dry-run");
if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const database = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const records = Array.isArray(productionMapInventory?.records) ? productionMapInventory.records : [];
if (!records.length) throw new Error("No published map records were found.");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(stable(left || {})) === JSON.stringify(stable(right || {}));
}

function validCoordinate(value, min, max) {
  return Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
}

const duplicateIds = records
  .map((record) => String(record?.id || ""))
  .filter(Boolean)
  .filter((id, index, list) => list.indexOf(id) !== index);
const invalidRecords = records.filter((record) => (
  !String(record?.id || "").trim()
  || !String(record?.name || "").trim()
  || !validCoordinate(record?.lat, -90, 90)
  || !validCoordinate(record?.lng, -180, 180)
));
if (duplicateIds.length || invalidRecords.length) {
  throw new Error(JSON.stringify({
    code: "INVENTORY_SOURCE_INVALID",
    duplicateIds: [...new Set(duplicateIds)].slice(0, 20),
    invalidRecords: invalidRecords.slice(0, 20).map((record) => ({ id: record?.id || null, name: record?.name || null })),
  }));
}

const importedAt = new Date().toISOString();
const rows = records.map((record) => ({
  id: String(record.id),
  slug: String(record.slug || record.id),
  name: String(record.name),
  entity_type: String(record.entityType || "place"),
  category: record.category || null,
  district: record.district || null,
  address: record.address || null,
  latitude: Number(record.lat),
  longitude: Number(record.lng),
  status: ["draft", "active", "paused", "archived"].includes(record.status) ? record.status : "active",
  source_name: String(record.source || "published_map_inventory"),
  source_updated_at: record.updatedAt || null,
  verification_status: record.verificationStatus || "unverified",
  ownership_status: record.ownershipStatus || "unassigned",
  canonical_entity_id: String(record.id),
  source_payload: record,
  imported_at: importedAt,
  updated_at: importedAt,
}));

const canonicalRows = records.map((record) => ({
  id: String(record.id),
  slug: String(record.id),
  name: String(record.name),
  entity_type: String(record.entityType || "place"),
  status: ["draft", "active", "paused", "archived"].includes(record.status) ? record.status : "active",
  address: record.address || null,
  district: record.district || null,
  latitude: Number(record.lat),
  longitude: Number(record.lng),
  metadata: { ...record, source: String(record.source || "published_map_inventory") },
  updated_at: importedAt,
}));

async function fetchExisting(table, columns, ids) {
  const result = new Map();
  for (let offset = 0; offset < ids.length; offset += 200) {
    const { data, error } = await database.from(table).select(columns).in("id", ids.slice(offset, offset + 200));
    if (error) throw error;
    for (const row of data || []) result.set(String(row.id), row);
  }
  return result;
}

const ids = rows.map((row) => row.id);
const [existingInventory, existingCanonical] = await Promise.all([
  fetchExisting("map_inventory", "id,source_payload", ids),
  fetchExisting("canonical_entities", "id,metadata", ids),
]);

const inventoryWrites = rows.filter((row) => !same(existingInventory.get(row.id)?.source_payload, row.source_payload));
const canonicalWrites = canonicalRows.filter((row) => !same(existingCanonical.get(row.id)?.metadata, row.metadata));

const summary = {
  sourceRecords: rows.length,
  invalidRecords: invalidRecords.length,
  duplicateIds: [...new Set(duplicateIds)].length,
  mapInventory: {
    create: inventoryWrites.filter((row) => !existingInventory.has(row.id)).length,
    update: inventoryWrites.filter((row) => existingInventory.has(row.id)).length,
    noop: rows.length - inventoryWrites.length,
  },
  canonicalEntities: {
    create: canonicalWrites.filter((row) => !existingCanonical.has(row.id)).length,
    update: canonicalWrites.filter((row) => existingCanonical.has(row.id)).length,
    noop: canonicalRows.length - canonicalWrites.length,
  },
  dryRun,
};

if (dryRun) {
  console.log(JSON.stringify(summary));
  process.exit(0);
}

for (let offset = 0; offset < canonicalWrites.length; offset += 200) {
  const { error } = await database.from("canonical_entities").upsert(canonicalWrites.slice(offset, offset + 200), { onConflict: "id" });
  if (error) throw error;
}
for (let offset = 0; offset < inventoryWrites.length; offset += 200) {
  const { error } = await database.from("map_inventory").upsert(inventoryWrites.slice(offset, offset + 200), { onConflict: "id" });
  if (error) throw error;
}

console.log(JSON.stringify({ ...summary, imported: inventoryWrites.length, canonicalEntitiesImported: canonicalWrites.length }));
