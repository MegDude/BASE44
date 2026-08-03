import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../api/admin/scope.js", import.meta.url), "utf8");
const switcher = readFileSync(new URL("../src/components/admin/AdminScopeSwitcher.tsx", import.meta.url), "utf8");
const studio = readFileSync(new URL("../src/pages/AdminMarketingStudio.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles/downtown-command-center.css", import.meta.url), "utf8");

assert.match(api, /requireAuthenticatedUser/);
assert.match(api, /ADMIN_ACCESS_REQUIRED/);
assert.match(api, /role !== "super_admin"/);
assert.match(api, /partner_users/);
assert.match(api, /activeScope/);
assert.match(api, /id,organization_id,portfolio_id,name,status,entity_id,metadata/);
assert.doesNotMatch(api, /name,address,status,entity_id/);
assert.match(
  api,
  /export default async function handler\(req, res\) \{\s+res\.setHeader\("Cache-Control", "private, no-store"\);/,
  "the private cache policy must be applied before method, authentication, and authorization responses",
);
assert.match(switcher, /Search organization, portfolio, or listing/);
assert.match(switcher, /sessionStorage/);
assert.match(switcher, /DialogPrimitive\.Content/);
assert.match(studio, /<AdminScopeSwitcher onScopeResolved=\{setSelectedScope\} \/>/);
assert.match(studio, /startPartnerImpersonation/);
assert.match(studio, /Enter selected workspace/);
assert.match(studio, /Admin Workspace/);
assert.match(styles, /min-height: 44px/);
assert.match(styles, /max-height: 85dvh/);
assert.doesNotMatch(switcher, /demoOrganizations/);
console.log("Admin Workspace authorized scope selector contract: PASS");
