import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audienceApi = readFileSync("api/partner/audience.js", "utf8");
const connectionsApi = readFileSync("api/partner/connections.js", "utf8");
const scopeApi = readFileSync("api/_lib/workspaceScope.js", "utf8");
const client = readFileSync("src/lib/partner/audienceConnectionsClient.ts", "utf8");
const panel = readFileSync("src/components/partner/workspace/ProtectedAudienceConnections.jsx", "utf8");
const workspace = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const migration = readFileSync("supabase/migrations/202608020004_partner_audience_connections_workspace.sql", "utf8");
const registry = readFileSync("src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts", "utf8");
const moduleRegistry = readFileSync("src/config/workspaceModuleRegistry.ts", "utf8");

assert.match(scopeApi, /platform_profiles/, "workspace scope must resolve trusted platform roles server-side");
assert.match(scopeApi, /app_metadata/, "workspace scope must honor trusted Supabase super-admin claims server-side");
assert.match(scopeApi, /requirePartnerMembership/, "partner scopes must require server-side membership");
assert.match(scopeApi, /resolveListing/, "listing scope must be resolved server-side");
assert.doesNotMatch(client, /localStorage.*role|browser.*role/i, "client must not grant roles from browser state");
assert.match(client, /Authorization: `Bearer \$\{token\}`/, "client calls must use authenticated bearer token");

assert.match(audienceApi, /MINIMUM_COHORT_SIZE = 5/, "audience API must enforce the minimum cohort threshold");
assert.match(audienceApi, /count: null/, "suppressed cohorts must not return exact partner counts");
assert.doesNotMatch(audienceApi, /email|resident_profile_id|external_member_id/, "audience API must not select person-level fields");
assert.match(audienceApi, /audience_scope_bindings/, "audience API must use authorized building bindings");

assert.match(connectionsApi, /partner_integration_requests/, "connections API must create backend request work items");
assert.match(connectionsApi, /snapshot_available/, "Luxury Presence snapshots must be separated from live connections");
assert.match(connectionsApi, /lead_activity_events/, "live Legends metrics require verified activity delivery");
assert.doesNotMatch(connectionsApi, /raw_payload|lead_email|lead_name/, "connections API must not return raw webhook or lead records");

assert.match(panel, /No verified audience is connected yet\./, "audience empty state must be explicit");
assert.match(panel, /Request connection creates a backend work item only/, "connections UI must not ask for secrets");
assert.doesNotMatch(panel, /<input[^>]+(api|password|secret|token|webhook)/i, "connections UI must not prompt for credentials");
assert.match(workspace, /<ProtectedAudiencePanel/, "audience route must load the protected module");
assert.match(workspace, /<ProtectedConnectionsPanel/, "connections route must load the protected module");
assert.match(registry, /href: "\/partner-workspace\/connections"/, "workspace nav should route to the Connections module");
assert.match(moduleRegistry, /\/partner-workspace\/profile\?section=support/, "Support must route to workspace support, not map Info");
assert.match(migration, /create table if not exists public\.audience_scope_bindings/, "migration must create audience bindings");
assert.match(migration, /create table if not exists public\.partner_integration_requests/, "migration must create backend connection requests");

console.log("protected audience/connections contract passed");
