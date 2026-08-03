import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workspace = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const audience = readFileSync("api/partner/audience.js", "utf8");
const connections = readFileSync("api/partner/connections.js", "utf8");
const audienceClient = readFileSync("src/lib/partner/audienceClient.ts", "utf8");
const connectionsClient = readFileSync("src/lib/partner/workspaceConnectionsClient.ts", "utf8");
const registry = readFileSync("src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts", "utf8");
const analytics = readFileSync("src/components/analytics/PartnerAnalyticsExperience.jsx", "utf8");

assert.match(workspace, /<WorkspaceAudience/, "Audience route must render the live workspace audience module");
assert.match(workspace, /<WorkspaceConnections/, "Connections route must render the live workspace connections module");
assert.match(audienceClient, /Authorization: `Bearer \$\{token\}`/, "Audience client must use authenticated bearer token");
assert.match(connectionsClient, /Authorization: `Bearer \$\{accessToken\}`/, "Connections client must use authenticated bearer token");
assert.match(audience, /MINIMUM_COHORT_SIZE = 5/, "Audience API must enforce the privacy threshold");
assert.match(audience, /safeCohortCount/, "Audience API must suppress small cohorts");
assert.doesNotMatch(audience, /email_hash|resident_profile_id|external_member_id/, "Audience API must not select person-level audience identifiers");
assert.match(connections, /partner_integration_requests/, "Connections API must create backend request work items");
assert.match(connections, /getLegendsSeoReport/, "Connections API must expose Legends SEO snapshot state");
assert.match(analytics, /Verified snapshot available; live activity is not connected yet\./, "Legends analytics must label snapshots separately from live delivery");
assert.doesNotMatch(registry, /No connected services yet/, "Registry must not retain repeated empty service placeholder copy");
assert.doesNotMatch(registry, /support.*\/map\?mode=partner&tab=info/i, "Workspace support must not route to partner map Info");

console.log("protected audience/connections release contract passed");
