import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const adminScope = readFileSync(join(root, "api/admin/scope.js"), "utf8");
const docs = readFileSync(join(root, "docs/authenticated-routes-scope-live-data.md"), "utf8");
const workspaceSummary = readFileSync(join(root, "api/partner/workspace-summary.js"), "utf8");
const partnerWorkspace = readFileSync(join(root, "src/pages/PartnerWorkspace.jsx"), "utf8");
const adminScopeSwitcher = readFileSync(join(root, "src/components/admin/AdminScopeSwitcher.tsx"), "utf8");
const workspaceScopeSwitcher = readFileSync(join(root, "src/components/partner/workspace/WorkspaceScopeSwitcher.tsx"), "utf8");

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
assert.match(workspaceSummary, /sections: \{/);
assert.match(workspaceSummary, /mapCoverage: \{/);
assert.match(workspaceSummary, /label: "Map inventory"/);
assert.match(workspaceSummary, /partnerResults: \{/);
assert.match(workspaceSummary, /label: "Partner results"/);
assert.match(workspaceSummary, /persistedCampaigns/);
assert.match(workspaceSummary, /danaAudience/);
assert.match(workspaceSummary, /attributedActivity/);
assert.match(workspaceSummary, /unassigned.*Platform activity is currently unassigned/);
assert.match(workspaceSummary, /audienceBasis/);
assert.match(workspaceSummary, /resident_profiles/);
assert.match(workspaceSummary, /partner_listings/);
assert.doesNotMatch(workspaceSummary, /resident_names|unit|email.*select/i);

assert.match(partnerWorkspace, /\/api\/partner\/workspace-summary/);
assert.match(partnerWorkspace, /Authorization: `Bearer \$\{token\}`/);
assert.match(partnerWorkspace, /Map inventory/);
assert.match(partnerWorkspace, /Partner listings/);
assert.match(partnerWorkspace, /Partner results/);
assert.match(partnerWorkspace, /Verified resident audience/);
assert.match(partnerWorkspace, /Contactable audience/);
assert.match(partnerWorkspace, /Source not connected/);
assert.doesNotMatch(partnerWorkspace, /\["Potential audience", "Not connected"\]/);
assert.match(readFileSync(join(root, "src/pages/Map.jsx"), "utf8"), /<h2 className="dp-map-panel-title dp-map-detail-navigation-title">/);

console.log("Authenticated route and admin scope contract checks passed.");


assert.doesNotMatch(adminScopeSwitcher, /Scope unavailable/);
assert.match(adminScopeSwitcher, /Loading authorized access/);
assert.match(adminScopeSwitcher, /We could not load your authorized scope/);
assert.match(adminScopeSwitcher, /Try again/);
assert.match(adminScopeSwitcher, /Platform-wide access/);
assert.doesNotMatch(adminScopeSwitcher, /disabled=\{status !== "ready"\}/);
assert.match(workspaceScopeSwitcher, /Platform control/);
assert.match(workspaceScopeSwitcher, /Manage people & access/);
assert.match(workspaceScopeSwitcher, /View organization members/);
assert.match(workspaceScopeSwitcher, /View listing access/);
assert.doesNotMatch(workspaceScopeSwitcher, /Authorized platform scope/);
