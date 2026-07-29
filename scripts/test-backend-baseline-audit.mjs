import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const output = execFileSync("node", ["scripts/audit-backend-baseline.mjs"], { encoding: "utf8" });
const baseline = JSON.parse(output);

assert.equal(baseline.mode, "read-only repository baseline");
assert.equal(baseline.guardrails.schemaChanged, false);
assert.equal(baseline.guardrails.productionDataChanged, false);
assert.equal(baseline.guardrails.seedExecuted, false);
assert.equal(baseline.guardrails.importExecuted, false);
assert.ok(baseline.inventory.apiCount > 0);
assert.ok(baseline.inventory.migrationCount > 0);
assert.ok(Array.isArray(baseline.inventory.environmentVariableNames));
assert.equal(baseline.demoAndSeed.executableSeedRouteDetected, false);
assert.equal(baseline.productionDatabase.recordCountsCaptured, false);
assert.equal(baseline.productionDatabase.checksumsCaptured, false);
assert.match(baseline.productionDatabase.reason, /databaseConfigured=false/);

for (const flag of [
  "resident_access_v2",
  "redemption_v2",
  "rsvp_v2",
  "survey_pipeline_v2",
  "broadcast_delivery_v2",
  "partner_reporting_v2",
  "imports_v2",
]) {
  assert.equal(typeof baseline.featureFlags[flag]?.implemented, "boolean");
}

const featureRegistry = readFileSync("src/lib/api/backendFeatureFlags.js", "utf8");
for (const flag of Object.keys(baseline.featureFlags)) {
  assert.equal(baseline.featureFlags[flag].implemented, featureRegistry.includes(flag));
}

assert.equal(baseline.requiredDomainStatus.events.present, true);
assert.equal(baseline.requiredDomainStatus.organizations.present, false);
assert.equal(baseline.requiredDomainStatus.adminAccounts.present, false);

const report = readFileSync("docs/backend/2026-07-29-production-baseline.md", "utf8");
assert.match(report, /dpl_7da8saK2e84EVa9o9AoqnPPhUfDR/);
assert.match(report, /\| `partner_organizations` \| 3 \|/);
assert.match(report, /\| `partner_listings` \| 62 \|/);
assert.match(report, /\| `partner_users` \| 5 \|/);
assert.match(report, /\| `resident_profiles` \| 6 \|/);
assert.match(report, /leaked-password protection disabled/);
assert.match(report, /No executable seed-named API route was detected/);

console.log("Read-only backend baseline audit contract: PASS");
