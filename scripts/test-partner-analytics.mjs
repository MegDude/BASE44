import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../src/components/analytics/PartnerAnalyticsExperience.jsx", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/partner-analytics-decision-system.css", import.meta.url), "utf8");

for (const view of ["overview", "audience", "places", "campaigns", "activity", "sources", "geography", "reports"]) assert.match(component, new RegExp(`\\[\\"${view}\\"`), `missing view: ${view}`);
for (const parameter of ["workspace", "range", "comparison", "view"]) assert.match(component, new RegExp(`params\\.get\\(\\"${parameter}\\"\\)`), `missing URL parameter: ${parameter}`);
assert.match(component, /Demo workspace data/);
assert.match(component, /Production values must come from the canonical backend analytics contract/);
assert.match(component, /URL\.createObjectURL/);
assert.match(component, /\/map\?mode=partner&tab=map/);
assert.match(workspace, /<PartnerAnalyticsExperience\s*\/>/);
assert.doesNotMatch(workspace, /<section className="dp-featured-experience">/);
assert.doesNotMatch(workspace, /<section className="dp-operating-section dp-recent-activity"/);
assert.match(styles, /@media\(max-width:560px\)/);
console.log("Partner Analytics contract: PASS");
