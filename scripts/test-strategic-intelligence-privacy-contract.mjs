import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PRIVACY_SAFE_BENCHMARK_POLICY,
  STRATEGIC_INTELLIGENCE_REQUIRED_OUTPUTS,
  buildStrategicIntelligenceDisclosure,
  canShowPrivacySafeBenchmark,
  privacySafeBenchmarkMessage,
} from "../src/lib/partner/strategicIntelligencePolicy.js";

const sheetSource = readFileSync("src/components/map/native-sheet/NativeDetailSheet.tsx", "utf8");
const policySource = readFileSync("src/lib/partner/strategicIntelligencePolicy.js", "utf8");
const analyticsSource = readFileSync("src/config/partnerAnalyticsIntelligence.js", "utf8");
const workspaceAgentSource = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");

for (const exportedSheet of ["ResidentPassSheet", "PartnerIntelligenceSheet"]) {
  assert.match(sheetSource, new RegExp(`export const ${exportedSheet} = NativeDetailSheet`), `${exportedSheet} must use the shared NativeDetailSheet foundation`);
}
assert.equal(PRIVACY_SAFE_BENCHMARK_POLICY.minimumEligibleOrganizations, 5, "Privacy-safe benchmarks require five eligible organizations");
assert.equal(PRIVACY_SAFE_BENCHMARK_POLICY.minimumReportingWindowDays, 30, "Privacy-safe benchmarks require a 30-day reporting window");
assert.equal(canShowPrivacySafeBenchmark({ eligibleOrganizationCount: 4, reportingWindowDays: 30 }), false, "Small cohorts must be blocked");
assert.equal(canShowPrivacySafeBenchmark({ eligibleOrganizationCount: 5, reportingWindowDays: 29 }), false, "Short reporting windows must be blocked");
assert.equal(canShowPrivacySafeBenchmark({ eligibleOrganizationCount: 5, reportingWindowDays: 30 }), true, "Qualified benchmark cohorts should be allowed");
assert.equal(
  privacySafeBenchmarkMessage({ eligibleOrganizationCount: 1, reportingWindowDays: 7 }),
  "Insufficient anonymized market data for this comparison. Expand the reporting period or await more qualifying activity.",
  "Insufficient benchmark copy must match the directive",
);
for (const key of STRATEGIC_INTELLIGENCE_REQUIRED_OUTPUTS) {
  assert.match(policySource, new RegExp(`"${key}"`), `Strategic Intelligence output field ${key} is missing`);
}
const disclosure = buildStrategicIntelligenceDisclosure({
  organizationId: "demo-org-larry-and-guy",
  scope: { portfolioId: "portfolio-larry-and-guy-dining", accessScope: "portfolio" },
  sources: [{ id: "owned-map-records", label: "Owned map records" }],
});
assert.equal(disclosure.scope.organizationId, "demo-org-larry-and-guy");
assert.equal(disclosure.scope.portfolioId, "portfolio-larry-and-guy-dining");
assert.equal(disclosure.scope.accessScope, "portfolio");
assert.equal(disclosure.sources[0].metricDefinition, "Verified partner-owned or privacy-safe aggregate signal");
assert.doesNotMatch(analyticsSource, /another business.{0,80}(impressions|opens|clicks|redemptions|spend|revenue)/i, "Partner intelligence copy must not expose another business's private metrics");
assert.match(workspaceAgentSource, /organizationId,\n\s+listingIds: scope\?\.listingId/, "Workspace agent payload must carry active organization and listing scope");
assert.match(workspaceAgentSource, /Evidence used/, "Workspace agent must expose the evidence used in its answer");

console.log("Strategic Intelligence privacy contract: PASS");
