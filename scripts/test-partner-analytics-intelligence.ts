import assert from "node:assert/strict";
import {
  demoOrganizations,
  getOrganizationEntities,
} from "../src/config/workspaceArchitecture";
import {
  getPartnerAnalyticsIntelligence,
} from "../src/config/partnerAnalyticsIntelligence";

const recommendations = new Set<string>();

for (const organization of demoOrganizations) {
  const entities = getOrganizationEntities(organization.id);
  const intelligence = getPartnerAnalyticsIntelligence(organization, entities);

  assert.ok(intelligence.purpose.includes(".") && intelligence.purpose.length > 28);
  assert.ok(intelligence.context.length > 100, `${organization.name} needs a partner-specific context brief`);
  assert.ok(intelligence.evidence.length > 60, `${organization.name} needs a sourced evidence explanation`);
  assert.equal(intelligence.opportunities.length, entities.length);
  assert.ok(!recommendations.has(intelligence.recommendation), `${organization.name} reused another partner recommendation`);
  recommendations.add(intelligence.recommendation);
}

const larryAndGuy = getPartnerAnalyticsIntelligence(
  demoOrganizations.find((organization) => organization.id === "demo-org-larry-and-guy"),
  getOrganizationEntities("demo-org-larry-and-guy"),
);

assert.match(larryAndGuy.context, /ATX Cocina/);
assert.match(larryAndGuy.context, /Red Ash/);
assert.doesNotMatch(larryAndGuy.context, /DANA|The Shore|Legends/);
assert.equal(larryAndGuy.opportunities.length, 5);

console.log("Partner-specific analytics intelligence contract passed.");
