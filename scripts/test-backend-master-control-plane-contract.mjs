import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const contracts = readFileSync(join(root, "src/lib/platformControlPlane/contracts.ts"), "utf8");
const adminResource = readFileSync(join(root, "src/components/admin/BackendMasterControlPlaneResource.jsx"), "utf8");
const adminConfig = readFileSync(join(root, "src/config/adminResources.ts"), "utf8");
const app = readFileSync(join(root, "src/App.jsx"), "utf8");
const docs = readFileSync(join(root, "docs/backend-master-admin-studio-contract.md"), "utf8");

for (const route of [
  "/admin",
  "/admin/people",
  "/admin/residents",
  "/admin/partners",
  "/admin/organizations",
  "/admin/buildings",
  "/admin/portfolios",
  "/admin/listings",
  "/admin/map",
  "/admin/offers",
  "/admin/events",
  "/admin/campaigns",
  "/admin/reports",
  "/admin/plans",
  "/admin/add-ons",
  "/admin/payments",
  "/admin/entitlements",
  "/admin/integrations",
  "/admin/provisioning",
  "/admin/audit-log",
  "/admin/support",
]) {
  assert.match(contracts, new RegExp(route.replace(/[/-]/g, (match) => `\\${match}`)), `${route} must be in the Admin Studio master contract`);
}

for (const route of [
  "/partner-workspace/home",
  "/partner-workspace/map",
  "/partner-workspace/offers",
  "/partner-workspace/events",
  "/partner-workspace/reach",
  "/partner-workspace/updates",
  "/partner-workspace/results",
  "/partner-workspace/reports",
  "/partner-workspace/connections",
  "/partner-workspace/media",
  "/partner-workspace/team",
  "/partner-workspace/settings",
]) {
  assert.match(contracts, new RegExp(route.replace(/[/-]/g, (match) => `\\${match}`)), `${route} must be in the workspace shell contract`);
}

for (const eventName of [
  "map_opened",
  "search_submitted",
  "filter_applied",
  "entity_viewed",
  "offer_opened",
  "qr_displayed",
  "qr_scanned",
  "redemption_completed",
  "event_rsvp_created",
  "campaign_delivered",
  "campaign_opened",
  "campaign_clicked",
]) {
  assert.match(contracts, new RegExp(`"${eventName}"`), `${eventName} must be in the product activity contract`);
}

for (const addonKey of [
  "map_profile",
  "member_offers",
  "events",
  "campaigns",
  "updates",
  "results",
  "reports",
  "media",
  "team",
  "listings",
  "resident_updates",
  "local_recommendations",
  "surveys",
  "sponsorships",
  "integrations",
  "scheduled_actions",
  "support",
  "billing",
]) {
  assert.match(contracts, new RegExp(`key: "${addonKey}"`), `${addonKey} must be in the add-on contract`);
}

assert.match(contracts, /verifiedEmail: "me@megdude\.com"/);
assert.match(contracts, /requiresServerAuthorization: true/);
assert.match(contracts, /requiresAuditLog: true/);
assert.match(contracts, /source: "backend-platform"/);
assert.match(contracts, /authenticated user[\s\S]*verified role[\s\S]*organization or building membership[\s\S]*entitlement[\s\S]*permitted records/);

assert.match(adminResource, /Backend Platform owns persistence, RBAC, Stripe webhooks, QR validation, reporting, and integrations/);
assert.match(adminResource, /This page documents the platform contract/);
assert.match(adminResource, /does not show live backend status, grant permissions/);
assert.match(adminResource, /Required backend contract — not verified account state/);
assert.match(adminResource, /Actual role, entitlement, and scope must come from authorized backend APIs/);
assert.match(adminResource, /Visible only when the backend returns an authorized organization scope and active entitlement/);
assert.doesNotMatch(adminResource, /fake|demo metrics|placeholder metrics/i);

assert.match(adminConfig, /backendMasterControlPlane/);
assert.match(adminConfig, /\/admin\/resources\/backend-master-control-plane/);
assert.match(app, /BackendMasterControlPlaneResource/);
assert.match(app, /\/admin\/resources\/backend-master-control-plane/);
assert.doesNotMatch(app, /path="\/admin" element=\{<AdminProtectedRoute><BackendMasterControlPlaneResource/);
assert.doesNotMatch(app, /path="\/admin\/:section"/);

assert.match(docs, /BASE44 owns the frontend shell/);
assert.match(docs, /Backend Platform owns persistence, RBAC, Stripe webhooks, QR validation, reporting, integrations/);
assert.match(docs, /Release gates not satisfied by this phase/);
assert.match(docs, /51-partner reconciliation/);
assert.match(docs, /Platform Authentication, Password Reset, and Super-Admin Recovery/);
assert.match(docs, /Forgot password\?/);
assert.match(docs, /https:\/\/app\.downtownperks\.com\/reset-password/);
assert.match(docs, /If an account matches this email/);
assert.match(docs, /Password recovery restores account access; it never grants or changes roles/);
assert.match(adminResource, /Authentication and recovery contract/);
assert.match(adminResource, /Documentation-only contract; live behavior must come from authorized backend APIs/);
assert.match(docs, /The Shore resident reference flow/);

console.log("Backend master control plane contract checks passed.");
