import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../src/components/analytics/PartnerAnalyticsExperience.jsx", import.meta.url), "utf8");
const detailedPage = await readFile(new URL("../src/components/analytics/PartnerAnalyticsPage.jsx", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/partner-analytics-decision-system.css", import.meta.url), "utf8");

for (const view of ["overview", "audience", "places", "campaigns", "activity", "sources", "geography", "reports"]) assert.match(component, new RegExp(`\\[\\"${view}\\"`), `missing view: ${view}`);
for (const parameter of ["workspace", "view"]) assert.match(component, new RegExp(`params\\.get\\(\\"${parameter}\\"\\)`), `missing URL parameter: ${parameter}`);
for (const parameter of ["range", "comparison", "view"]) assert.match(detailedPage, new RegExp(`params\\.get\\(\\"${parameter}\\"\\)`), `missing detailed analytics URL parameter: ${parameter}`);
assert.match(component, /No generated performance data/);
assert.match(component, /See what residents used/);
assert.match(component, /Scan resident pass/);
assert.match(detailedPage, /URL\.createObjectURL/);
assert.match(component, /\/map\?mode=partner&tab=map/);
assert.match(workspace, /<PartnerAnalyticsExperience\s*\/>/);
assert.doesNotMatch(workspace, /<section className="dp-featured-experience">/);
assert.doesNotMatch(workspace, /<section className="dp-operating-section dp-recent-activity"/);
assert.match(styles, /@media\(max-width:560px\)/);
console.log("Partner Analytics contract: PASS");
