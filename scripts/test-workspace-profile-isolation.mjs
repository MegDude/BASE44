import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/pages/PartnerWorkspace.jsx"), "utf8");
const shareLinks = readFileSync(join(process.cwd(), "src/components/partner/workspace/PartnerShareLinksPanel.jsx"), "utf8");

assert.match(source, /<PerksManager key="offers" user=\{user\} scope=\{workspaceScope\}/);
assert.match(source, /<EventsManager key="events" user=\{user\} scope=\{workspaceScope\}/);
assert.match(source, /function PerksManager\(\{ user, scope \}\)/);
assert.match(source, /function EventsManager\(\{ user, scope \}\)/);
assert.match(source, /item\.organization_id === organizationId/);
assert.match(source, /organization_id: scope\?\.organizationId/);
assert.match(source, /listing_id: scope\?\.listingId \|\| undefined/);
assert.match(source, /No verified user activity is connected to this workspace yet/);
assert.doesNotMatch(source, /Use DANA, The Shore, and Legends as potential distribution sources/);
assert.match(source, /image: heroMedia\.src/);
assert.match(shareLinks, /getScopedOrganizationEntities\(organizationId, scope\.portfolioId, scope\.listingId\)/);

console.log("Workspace profile isolation contract passed.");
