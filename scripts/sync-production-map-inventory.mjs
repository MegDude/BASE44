import { createClient } from "@supabase/supabase-js";
import productionMapInventory from "../src/data/production/production-map-inventory.json" with { type: "json" };

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const batchSize = 200;

function clean(value) {
  return String(value || "").trim();
}

function normalizeStatus(value) {
  return ["draft", "active", "paused", "archived"].includes(value) ? value : "active";
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validateRecords(records) {
  const seen = new Set();
  const invalid = [];

  records.forEach((record, index) => {
    const id = clean(record?.id);
    const name = clean(record?.name);
    const latitude = normalizeNumber(record?.lat);
    const longitude = normalizeNumber(record?.lng);
    const reasons = [];

    if (!id) reasons.push("missing_id");
    if (id && seen.has(id)) reasons.push("duplicate_id");
    if (!name) reasons.push("missing_name");
    if (latitude === null || latitude < -90 || latitude > 90) reasons.push("invalid_latitude");
    if (longitude === null || longitude < -180 || longitude > 180) reasons.push("invalid_longitude");

    if (id) seen.add(id);
    if (reasons.length) invalid.push({ index, id: id || null, name: name || null, reasons });
  });

  return invalid;
}

function buildRows(records) {
  return records.map((record) => ({
    id: clean(record.id),
    slug: clean(record.slug || record.id),
    name: clean(record.name),
    entity_type: clean(record.entityType || "place"),
    category: record.category || null,
    district: record.district || null,
    address: record.address || null,
    latitude: normalizeNumber(record.lat),
    longitude: normalizeNumber(record.lng),
    status: normalizeStatus(record.status),
    source_name: clean(record.source || "published_map_inventory"),
    source_updated_at: record.updatedAt || null,
    verification_status: record.verificationStatus || "unverified",
    ownership_status: record.ownershipStatus || "unassigned",
    canonical_entity_id: clean(record.id),
    source_payload: record,
  }));
}

function comparable(row = {}) {
  return JSON.stringify({
    id: row.id,
    slug: row.slug,
    name: row.name,
    entity_type: row.entity_type,
    category: row.category || null,
    district: row.district || null,
    address: row.address || null,
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    status: row.status || "active",
    source_name: row.source_name || "published_map_inventory",
    source_updated_at: row.source_updated_at || null,
    verification_status: row.verification_status || "unverified",
    ownership_status: row.ownership_status || "unassigned",
    canonical_entity_id: row.canonical_entity_id || row.id,
    source_payload: row.source_payload || {},
  });
}

async function fetchExistingRows(database, rows) {
  const existing = new Map();
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const ids = rows.slice(offset, offset + batchSize).map((row) => row.id);
    const { data, error } = await database
      .from("map_inventory")
      .select("id,slug,name,entity_type,category,district,address,latitude,longitude,status,source_name,source_updated_at,verification_status,ownership_status,canonical_entity_id,source_payload")
      .in("id", ids);
    if (error) throw error;
    for (const row of data || []) existing.set(row.id, row);
  }
  return existing;
}

function planChanges(rows, existing) {
  const create = [];
  const update = [];
  const noop = [];

  for (const row of rows) {
    const current = existing.get(row.id);
    if (!current) {
      create.push(row);
    } else if (comparable(row) === comparable(current)) {
      noop.push(row);
    } else {
      update.push(row);
    }
  }

  return { create, update, noop };
}

async function writeChangedRows(database, changedRows) {
  const now = new Date().toISOString();
  for (let offset = 0; offset < changedRows.length; offset += batchSize) {
    const batch = changedRows.slice(offset, offset + batchSize).map((row) => ({
      ...row,
      imported_at: now,
      updated_at: now,
    }));
    const { error } = await database.from("map_inventory").upsert(batch, { onConflict: "id" });
    if (error) throw error;
  }
}

const records = Array.isArray(productionMapInventory?.records) ? productionMapInventory.records : [];
if (!records.length) throw new Error("No published map records were found.");

const invalid = validateRecords(records);
if (invalid.length) {
  console.log(JSON.stringify({ dryRun, source: "production-map-inventory.json", total: records.length, invalidCount: invalid.length, invalid }, null, 2));
  process.exitCode = 1;
  throw new Error(`Inventory validation failed for ${invalid.length} records.`);
}

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for inventory comparison.");

const database = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const rows = buildRows(records);
const existing = await fetchExistingRows(database, rows);
const plan = planChanges(rows, existing);
const changedRows = [...plan.create, ...plan.update];

if (!dryRun && changedRows.length) {
  await writeChangedRows(database, changedRows);
}

console.log(JSON.stringify({
  dryRun,
  source: "production-map-inventory.json",
  total: rows.length,
  invalidCount: 0,
  create: plan.create.length,
  update: plan.update.length,
  noop: plan.noop.length,
  written: dryRun ? 0 : changedRows.length,
}, null, 2));
