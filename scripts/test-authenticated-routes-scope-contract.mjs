import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const adminScope = readFileSync(join(root, "api/admin/scope.js"), "utf8");
const docs = readFileSync(join(root, "docs/authenticated-routes-scope-live-data.md"), "utf8");

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

console.log("Authenticated route and admin scope contract checks passed.");
