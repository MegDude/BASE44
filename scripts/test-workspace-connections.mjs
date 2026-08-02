import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = await readFile(new URL("../src/config/workspaceModuleRegistry.ts", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const connections = await readFile(new URL("../src/components/partner/workspace/WorkspaceConnections.jsx", import.meta.url), "utf8");
const connectionApi = await readFile(new URL("../api/partner/connections.js", import.meta.url), "utf8");
const analyticsApi = await readFile(new URL("../api/partner/analytics.js", import.meta.url), "utf8");
const analyticsUi = await readFile(new URL("../src/components/analytics/PartnerAnalyticsExperience.jsx", import.meta.url), "utf8");

const support = registry.match(/id: "support"[\s\S]{0,320}/)?.[0] || "";
assert.match(support, /\/partner-workspace\/sources\?section=support/);
assert.doesNotMatch(support, /tab=info/);
assert.match(workspace, /WorkspaceConnections/);
assert.match(connections, /requestWorkspaceConnection/);
assert.doesNotMatch(connections, /No connected services yet/);
assert.match(connectionApi, /resolveAuthorizedWorkspaceScope/);
assert.match(connectionApi, /partner_integration_requests/);
assert.match(connectionApi, /getLegendsSeoReport/);
assert.match(analyticsApi, /resolveAuthorizedWorkspaceScope/);
assert.match(analyticsApi, /luxury_presence_listing_intelligence/);
assert.match(analyticsUi, /getPartnerWorkspaceAnalytics/);
assert.match(analyticsUi, /live Luxury Presence activity is awaiting/);
assert.doesNotMatch(analyticsUi, /no admin-aware reporting source is available/);

console.log("Workspace connections and production Legends analytics contract passed.");
