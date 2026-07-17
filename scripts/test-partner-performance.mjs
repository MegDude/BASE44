import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWorkspacePerformanceReport, PERFORMANCE_THRESHOLDS } from "../src/lib/performance/workspacePerformance.js";

const workspace = { id: "workspace-test", slug: "waterloo-greenway", name: "Waterloo Greenway", plan: "enterprise" };
const period = { from: "2026-06-01T00:00:00.000Z", to: "2026-06-30T23:59:59.999Z", comparisonFrom: "2026-05-02T00:00:00.000Z", comparisonTo: "2026-05-31T23:59:59.999Z" };
const scorecard = (values = {}) => ["qr_activity", "opens", "views", "saves", "redemptions"].map((id) => ({ id, value: values[id] || 0 }));

const empty = buildWorkspacePerformanceReport({ workspace, analytics: { scorecard: scorecard(), previousScorecard: scorecard(), period, sources: [], campaigns: [], offers: [], partnerEvents: [] } });
assert.equal(empty.launchReadiness.ready, false);
assert.equal(empty.metrics.find((metric) => metric.key === "qr_activity").statusLabel, "Setup needed");
assert.match(empty.primaryRecommendation.title, /Share Waterloo Greenway/);

const live = buildWorkspacePerformanceReport({
  workspace,
  analytics: {
    scorecard: scorecard({ qr_activity: 40, opens: 40, views: 30, saves: 12, redemptions: 4 }),
    previousScorecard: scorecard({ qr_activity: 25, opens: 30, views: 20, saves: 10, redemptions: 3 }),
    period,
    sources: [{ id: "qr", label: "QR code", entries: 40, actions: 52 }],
    campaigns: [{ id: "campaign-1", label: "Summer resident guide", actions: 22 }],
    offers: [],
    partnerEvents: [],
  },
});
assert.equal(live.launchReadiness.ready, true);
assert.equal(live.launchReadiness.sourceActionTotal, 52);
assert.equal(live.items[0].label, "Summer resident guide");
assert.equal(live.metrics.find((metric) => metric.key === "qr_activity").recommendation.decision, "expand");
assert.equal(live.metrics.find((metric) => metric.key === "redemptions").changePercent, null);
assert.ok(PERFORMANCE_THRESHOLDS.minimumComparisonEvents > 0);

const appSource = fs.readFileSync("src/App.jsx", "utf8");
assert.match(appSource, /path="\/app\/workspace\/reports" element={<ProtectedRoute><PartnerWorkspace/);
for (const alias of ["/workspace/reports", "/workspace/performance", "/workspace/analytics", "/partner-workspace/reports", "/partner-workspace/performance", "/partner-workspace/analytics"]) {
  assert.match(appSource, new RegExp(`path="${alias.replaceAll("/", "\\/")}" element={<RedirectWithSearch to="\\/app\\/workspace\\/reports"`));
}

console.log("partner performance: canonical routes, empty/live decisions, thresholds, and low-volume comparisons passed");
