import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [api, migration] = await Promise.all([
  readFile(new URL("../api/map/scoped-inventory.js", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/202608020002_luxury_presence_and_scoped_map_query.sql", import.meta.url), "utf8"),
]);

assert.match(api, /map_inventory/, "scoped map API must read canonical map inventory");
assert.match(api, /MAX_RESULTS = 25/, "scoped map API must bound response size");
assert.match(api, /source_payload/, "scoped map API must not return raw source payload");
assert.match(api, /Cache-Control/, "scoped map API must cache bounded public discovery safely");
for (const table of ["luxury_presence_webhook_events", "lead_activity_events", "luxury_presence_listing_intelligence", "luxury_presence_followup_queue", "luxury_presence_suppression_signals", "luxury_presence_agents"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`), `${table} storage is missing`);
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`), `${table} must have RLS enabled`);
}
console.log("Canonical map query and Luxury Presence foundation: PASS");
