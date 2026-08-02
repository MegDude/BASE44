import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const app = read("src/App.jsx");
const workspace = read("src/pages/PartnerWorkspace.jsx");
const campaigns = read("src/pages/partners/Campaigns.jsx");
const access = read("src/pages/partners/Access.jsx");
const auth = read("src/lib/AuthContext.jsx");
const admin = read("src/pages/AdminMarketingStudio.jsx");
const registry = read("src/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry.ts");
const vercel = read("vercel.json");

const requiredRoutes = [
  "/map", "/pricing", "/partners", "/partners/apply", "/partners/sign-in", "/partners/sign-up",
  "/partners/campaigns", "/resident/home", "/residents/login", "/residents/membership", "/auth/callback",
  "/partner-workspace/overview", "/partner-workspace/map", "/partner-workspace/campaigns",
  "/partner-workspace/offers", "/partner-workspace/events", "/partner-workspace/surveys",
  "/partner-workspace/broadcasts", "/partner-workspace/sources", "/partner-workspace/audience",
  "/partner-workspace/media", "/partner-workspace/reports", "/partner-workspace/analytics",
  "/partner-workspace/profile", "/partner-workspace/team", "/partner-workspace/billing",
  "/partner-workspace/residents", "/admin-studio/approval-queue",
];
for (const route of requiredRoutes) assert.ok(app.includes(`path=\"${route}\"`), `missing application route: ${route}`);

const workspaceModules = {
  overview: "WorkspaceOverview", launch: "WorkspaceAgent", publish: "WorkspaceDestinationRoot",
  performance: "WorkspaceDestinationRoot", map: "WorkspaceRegistryPanel", campaigns: "WorkspaceExperienceSystem",
  offers: "PerksManager", events: "EventsManager", surveys: "WorkspaceExperienceSystem",
  broadcasts: "WorkspaceRegistryPanel", sources: "WorkspaceConnections", audience: "WorkspaceRegistryPanel",
  media: "WorkspaceRegistryPanel", reports: "WorkspaceReports", analytics: "WorkspaceAnalytics",
  assistant: "WorkspaceAgent", profile: "ProfileSection", team: "WorkspaceRegistryPanel",
  billing: "WorkspaceRegistryPanel", residents: "WorkspaceRegistryPanel",
};
for (const [tab, moduleName] of Object.entries(workspaceModules)) {
  assert.match(workspace, new RegExp(`tab === [\"']${tab}[\"'][\\s\\S]{0,260}${moduleName}`), `workspace tab ${tab} is not wired to ${moduleName}`);
}

for (const href of [
  "/partner-workspace/overview", "/partner-workspace/assistant", "/partner-workspace/map",
  "/partner-workspace/offers", "/partner-workspace/events", "/partner-workspace/surveys",
  "/partner-workspace/broadcasts", "/partner-workspace/sources", "/partner-workspace/campaigns",
  "/partner-workspace/audience", "/partner-workspace/media", "/partner-workspace/reports",
  "/partner-workspace/analytics", "/partner-workspace/profile", "/partner-workspace/team",
  "/partner-workspace/billing",
]) assert.ok(registry.includes(href), `workspace registry is missing ${href}`);

for (const target of [
  "/partner-workspace/campaigns?intent=new", "/partner-workspace/audience", "/partner-workspace/media",
  "/partner-workspace/publish", "/partner-workspace/broadcasts", "/partner-workspace/performance",
  "/partner-workspace/analytics", "/partner-workspace/residents",
]) assert.ok(admin.includes(target), `admin operating action is missing ${target}`);

assert.doesNotMatch(admin, /<button[^>]*type=\"button\"[^>]*>\s*\{route\.primaryCta\}/, "admin primary CTA is still a dead button");
assert.doesNotMatch(admin, /<button\s+key=\{card\}\s+type=\"button\"/, "admin module rows are still dead buttons");
assert.match(access, /Send sign-in link/, "partner magic-link action is missing");
assert.match(access, /Request team access/, "partner recovery action is missing");
assert.match(auth, /signInWithPassword/, "password authentication is missing");
assert.match(auth, /signInWithOtp/, "magic-link authentication is missing");
assert.match(auth, /signInWithOAuth/, "social authentication is missing");
assert.match(auth, /resetPasswordForEmail/, "password reset is missing");
assert.match(auth, /super_admin/, "super-admin role hydration is missing");
assert.match(campaigns, /fetch\("\/api\/campaign-requests"/, "campaign request CTA is not connected to its API");
assert.match(access, /fetch\("\/api\/contact"/, "partner registration is not connected to its API");

for (const apiFile of [
  "api/campaign-requests.js", "api/contact.js", "api/resident/saved.js", "api/resident/qr-session.js",
  "api/partner/published-content.js", "api/stripe/create-checkout-session-local.js",
]) assert.ok(existsSync(apiFile), `missing API module: ${apiFile}`);

assert.match(vercel, /\"source\":\s*\"\/resident-app\"/, "legacy resident CTA does not have a canonical redirect");
assert.match(vercel, /mode=resident&tab=map/, "resident CTA redirect does not enter the resident map");

console.log("Platform interaction completeness: routes, tabs, CTAs, auth, admin actions, workspace modules, and API boundaries are wired.");
