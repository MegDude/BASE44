import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isResearchSummaryPayload, normalizeResearchSummary } from "../api/research-intelligence/summary.js";

const normalized = normalizeResearchSummary({
  generatedAt: "2026-07-18T00:00:00.000Z",
  reviewRequired: true,
  consumerDataIncluded: true,
  summary: {
    entities: 1214,
    contacts: 512,
    restrictedAudience: 1262,
    campaigns: "159",
  },
});

assert.equal(normalized.summary.entities, 1214);
assert.equal(normalized.summary.contacts, 512);
assert.equal(normalized.summary.campaigns, 159);
assert.equal(normalized.consumerDataIncluded, false);
assert.equal("restrictedAudience" in normalized.summary, false);
assert.equal(isResearchSummaryPayload({ summary: { entities: 1214 } }), true);
assert.equal(isResearchSummaryPayload({ summary: { entities: 0 } }), false);
assert.equal(isResearchSummaryPayload({}), false);

const registry = await readFile(new URL("../src/config/workspaceModuleRegistry.ts", import.meta.url), "utf8");
const destination = await readFile(new URL("../src/components/partner/workspace/WorkspaceDestinationRoot.jsx", import.meta.url), "utf8");
const analytics = await readFile(new URL("../src/components/analytics/PartnerAnalyticsExperience.jsx", import.meta.url), "utf8");

assert.match(registry, /id: "research"[\s\S]*view=research/);
assert.match(destination, /ids: \["research", "seo", "map_activity"\]/);
assert.match(analytics, /Research is evidence, not publication approval\./);

console.log("Research intelligence contract checks passed.");
