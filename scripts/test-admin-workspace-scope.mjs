import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  adminScopeLevel,
  emptyAdminScopeResponse,
  parseAdminScopeQuery,
  serializeAdminScopeResponse,
  validateAdminScopeInput,
} from "../src/lib/admin/adminScopeContract.js";

const api = readFileSync(new URL("../api/admin/scope.js", import.meta.url), "utf8");
const contract = readFileSync(new URL("../src/lib/admin/adminScopeContract.js", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/lib/admin/adminScopeClient.ts", import.meta.url), "utf8");
const switcher = readFileSync(new URL("../src/components/admin/AdminScopeSwitcher.tsx", import.meta.url), "utf8");
const studio = readFileSync(new URL("../src/pages/AdminMarketingStudio.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles/downtown-command-center.css", import.meta.url), "utf8");

assert.match(api, /requireAuthenticatedUser/);
assert.match(api, /ADMIN_ACCESS_REQUIRED/);
assert.match(api, /role !== "super_admin"/);
assert.match(api, /partner_users/);
assert.match(api, /activeScope/);
assert.match(api, /adminScopeLevel/);
assert.match(api, /serializeAdminScopeResponse/);
assert.match(contract, /admin_scope_requested/);
assert.match(contract, /admin_scope_resolved/);
assert.match(contract, /admin_scope_denied/);
assert.match(contract, /admin_scope_failed/);
assert.match(api, /requestId/);
assert.match(api, /ADMIN_SCOPE_FAILED/);
assert.doesNotMatch(api, /sendTransactionError/);
assert.match(api, /deploymentSha/);
assert.match(api, /actorRole/);
assert.match(api, /scopeLevel/);
assert.match(
  api,
  /export default async function handler\(req, res\) \{\s+const startedAt = Date\.now\(\);\s+const requestId = adminScopeRequestId\(req\);\s+res\.setHeader\("Cache-Control", "private, no-store"\);/,
  "the private cache policy must be applied before method, authentication, and authorization responses",
);
assert.match(
  api,
  /partner_listings"\)\.select\("id,organization_id,portfolio_id,name,status,entity_id"\)/,
  "Admin scope listing query must not request the removed partner_listings.address column",
);
assert.doesNotMatch(api, /partner_listings"\)\.select\([^\n]*address/);
assert.doesNotMatch(api, /console\.(log|error)\([^\n]*(email|authorization|session|payload|organizationId|portfolioId|listingId)/i, "Admin scope logging must stay privacy-safe and coarse");
assert.match(client, /type AdminListing = \{ id: string; organization_id: string; portfolio_id\?: string; name: string; status\?: string; entity_id\?: string \}/);
assert.doesNotMatch(client, /address\?: string/);
assert.match(switcher, /Search organization, portfolio, or listing/);
assert.match(switcher, /sessionStorage/);
assert.match(switcher, /DialogPrimitive\.Content/);
assert.doesNotMatch(switcher, /item\.address/);
assert.match(studio, /<AdminScopeSwitcher \/>/);
assert.match(studio, /Admin Workspace/);
assert.match(styles, /min-height: 44px/);
assert.match(styles, /max-height: 85dvh/);
assert.doesNotMatch(switcher, /demoOrganizations/);

const parsed = parseAdminScopeQuery({ organizationId: " org-1 ", portfolioId: " portfolio-1 ", listingId: " listing-1 " });
assert.deepEqual(parsed, { organizationId: "org-1", portfolioId: "portfolio-1", listingId: "listing-1" });
assert.deepEqual(validateAdminScopeInput(parsed), { ok: true });
assert.deepEqual(validateAdminScopeInput({ organizationId: "bad id" }), { ok: false, code: "ADMIN_SCOPE_INVALID", message: "Administrator scope is invalid." });
assert.deepEqual(validateAdminScopeInput({ portfolioId: "portfolio-1" }), { ok: false, code: "ADMIN_SCOPE_ORGANIZATION_REQUIRED", message: "Choose an organization before choosing a narrower scope." });
assert.match(api, /validateAdminScopeInput/);
assert.equal(adminScopeLevel({}), "platform");
assert.equal(adminScopeLevel({ organizationId: "org-1" }), "organization");
assert.equal(adminScopeLevel({ organizationId: "org-1", portfolioId: "portfolio-1" }), "portfolio");
assert.equal(adminScopeLevel({ organizationId: "org-1", portfolioId: "portfolio-1", listingId: "listing-1" }), "listing");
assert.deepEqual(emptyAdminScopeResponse("admin"), { role: "admin", organizations: [], portfolios: [], listings: [], activeScope: {} });

const response = serializeAdminScopeResponse({
  role: "super_admin",
  organizations: [{ id: "org-1", name: "Legends", external_id: "ext", status: "active", legacy_partner_id: "legacy" }],
  portfolios: [{ id: "portfolio-1", organization_id: "org-1", name: "Residential", status: "active" }],
  listings: [{ id: "listing-1", organization_id: "org-1", portfolio_id: "portfolio-1", name: "The Shore", address: "must not serialize", status: "active", entity_id: "property-the-shore" }],
  activeScope: { organizationId: "org-1", portfolioId: "portfolio-1", listingId: "listing-1" },
});
assert.equal(response.role, "super_admin");
assert.equal(response.organizations[0].id, "org-1");
assert.equal(response.portfolios[0].organization_id, "org-1");
assert.equal(response.listings[0].name, "The Shore");
assert.equal(response.listings[0].address, undefined, "listing address must not be part of the Admin scope response contract");
assert.deepEqual(response.activeScope, { organizationId: "org-1", portfolioId: "portfolio-1", listingId: "listing-1" });

console.log("Admin Workspace authorized scope selector contract: PASS");
