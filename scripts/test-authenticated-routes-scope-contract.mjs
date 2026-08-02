import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const adminScope = readFileSync(join(root, "api/admin/scope.js"), "utf8");
const docs = readFileSync(join(root, "docs/authenticated-routes-scope-live-data.md"), "utf8");
const workspaceSummary = readFileSync(join(root, "api/partner/workspace-summary.js"), "utf8");
const partnerWorkspace = readFileSync(join(root, "src/pages/PartnerWorkspace.jsx"), "utf8");

assert.match(adminScope, /requireAuthenticatedUser/);
assert.match(adminScope, /ADMIN_ROLES/);
assert.match(adminScope, /partner_organizations/);
assert.match(adminScope, /partner_portfolios/);
assert.match(adminScope, /partner_listings/);
assert.match(adminScope, /select\("id,organization_id,portfolio_id,name,status,entity_id"\)/);
assert.doesNotMatch(adminScope, /partner_listings"\)\.select\("[^"]*address/);
assert.doesNotMatch(adminScope, /select\("id,organization_id,portfolio_id,name,address,status,entity_id"\)/);
assert.match(adminScope, /TransactionApiError\(403, "ADMIN_ACCESS_REQUIRED"/);

assert.match(docs, /Route authorization contract/);
assert.match(docs, /server-resolved profile and roles/);
assert.match(docs, /The browser may preserve `returnTo` and requested scope\. It never grants access\./);
assert.match(docs, /partner_listings\.address/);
assert.match(docs, /Password recovery contract/);
assert.match(docs, /https:\/\/app\.downtownperks\.com\/reset-password/);
assert.match(docs, /If an account matches this email/);
assert.match(docs, /Do not display fabricated counts/);

assert.match(workspaceSummary, /requirePartnerMembership/);
assert.match(workspaceSummary, /requireTransactionDatabase/);
assert.match(workspaceSummary, /SCOPE_NOT_AUTHORIZED/);
assert.match(workspaceSummary, /contactableAudience: metric\(null, "not_connected"/);
assert.match(workspaceSummary, /audienceBasis/);
assert.match(workspaceSummary, /resident_profiles/);
assert.match(workspaceSummary, /partner_listings/);
assert.doesNotMatch(workspaceSummary, /resident_names|unit|email.*select/i);

assert.match(partnerWorkspace, /\/api\/partner\/workspace-summary/);
assert.match(partnerWorkspace, /Authorization: `Bearer \$\{token\}`/);
assert.match(partnerWorkspace, /Verified resident audience/);
assert.match(partnerWorkspace, /Contactable audience/);
assert.match(partnerWorkspace, /Source not connected/);
assert.doesNotMatch(partnerWorkspace, /\["Potential audience", "Not connected"\]/);

console.log("Authenticated route and admin scope contract checks passed.");
