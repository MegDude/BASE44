import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const endpoint = readFileSync(new URL("../api/map/results.js", import.meta.url), "utf8");
const discovery = readFileSync(new URL("../src/lib/map/mapDiscovery.ts", import.meta.url), "utf8");
const scoped = readFileSync(new URL("../api/map/scoped-inventory.js", import.meta.url), "utf8");

for (const contract of [
  'const MAX_RESULTS = 25',
  '.eq("status", "active")',
  '.not("latitude", "is", null)',
  '.not("longitude", "is", null)',
  'canonical_entity_id',
  'total_available',
  'next_cursor',
  'bounded: true',
  'stale-while-revalidate=600',
]) {
  assert.ok(endpoint.includes(contract), `Canonical map endpoint is missing: ${contract}`);
}

assert.ok(endpoint.includes('canonical_entity_id.eq.${request.selectedEntityId}'), "Deep-link identity must resolve by canonical entity ID");
assert.ok(endpoint.includes('Math.min(MAX_RESULTS'), "Map result limits must be clamped server-side");
assert.ok(endpoint.includes('.range(request.offset, end)'), "Canonical map queries must use bounded pagination");
assert.ok(discovery.includes('return baseUrl ? `${baseUrl}/api/map/results` : "/api/map/results"'), "Map discovery must use one canonical results endpoint");
assert.ok(!discovery.includes('return null;\n  const parsedRequest'), "Map discovery must not silently skip the live endpoint");
assert.ok(scoped.includes('canonical_entity_id.eq.${entityId}'), "Scoped inventory must use canonical identity resolution");

console.log("Canonical map result contract checks passed.");
