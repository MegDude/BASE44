import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_ADMIN_RETURN_PATH,
  DEFAULT_PARTNER_RETURN_PATH,
  DEFAULT_RESIDENT_MAP_PATH,
  buildResidentMapPath,
  getAuthenticatedAccountRole,
  getAuthenticatedDestination,
  getSafeReturnPath,
  isSafeFirstPartyPath,
  normalizeResidentReturnPath,
} from "../src/lib/authReturnPath";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/App.jsx"), "utf8");
const authSource = readFileSync(join(root, "src/lib/AuthContext.jsx"), "utf8");
const residentSignInSource = readFileSync(join(root, "src/pages/ResidentSignIn.jsx"), "utf8");
const authCallbackSource = readFileSync(join(root, "src/pages/AuthCallbackPage.jsx"), "utf8");
const residentAccessSource = readFileSync(join(root, "src/pages/ResidentAccess.jsx"), "utf8");
const residentAccessApiSource = readFileSync(join(root, "api/resident-access.js"), "utf8");
const layoutSource = readFileSync(join(root, "src/components/Layout.jsx"), "utf8");
const supabaseClientSource = readFileSync(join(root, "src/lib/supabase/client.ts"), "utf8");
const productionGuardSource = readFileSync(join(root, "src/lib/productionGuards.ts"), "utf8");
const adminStudioSource = readFileSync(join(root, "src/pages/AdminMarketingStudio.jsx"), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(jsx?|tsx?)$/.test(name) ? [path] : [];
  });
}

const statePath = buildResidentMapPath(
  "?mode=resident&tab=perks&filter=Dining&intent=eat_drink&entityId=comedor&perkId=perk-1&eventId=event-1&collectionId=collection-1&routeId=route-1&district=Congress&query=date+night&radius=1200",
  "/map",
);

for (const expected of ["mode=resident", "tab=perks", "filter=Dining", "intent=eat_drink", "entity=comedor", "perkId=perk-1", "eventId=event-1", "collectionId=collection-1", "routeId=route-1", "district=Congress", "query=date+night", "radius=1200"]) {
  assert.ok(statePath.includes(expected), `missing preserved map state: ${expected}`);
}

assert.equal(isSafeFirstPartyPath("/app/map?filter=Dining"), true);
assert.equal(isSafeFirstPartyPath("//attacker.example/path"), false);
assert.equal(isSafeFirstPartyPath("https://attacker.example/path"), false);
assert.equal(getSafeReturnPath("?returnTo=https%3A%2F%2Fattacker.example"), "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured");
assert.equal(getSafeReturnPath("?returnTo=%2Fapp%2Fmap%3Ffilter%3DCoffee"), "/map?mode=resident&tab=map&filter=Coffee");
assert.equal(normalizeResidentReturnPath("/resident/home"), "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured");
assert.equal(normalizeResidentReturnPath("/resident/onboarding"), "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured");
assert.match(normalizeResidentReturnPath("/resident/card"), /tab=pass/);
assert.match(normalizeResidentReturnPath("/resident/saved"), /tab=saved/);
assert.match(normalizeResidentReturnPath("/resident/events"), /tab=events/);
assert.match(normalizeResidentReturnPath("/resident/perks"), /tab=perks/);
assert.equal(normalizeResidentReturnPath("/resident/unknown"), "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured");
assert.equal(getAuthenticatedAccountRole({ role: "authenticated", user_metadata: { partner_type: "resident" } }), "resident");
assert.equal(getAuthenticatedDestination({ role: "resident" }, "/map?mode=resident&tab=events&filter=Events"), "/map?mode=resident&tab=events&filter=Events&collection=events-nearby");
assert.equal(getAuthenticatedDestination({ role: "partner" }, "/map?mode=resident&tab=events"), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(getAuthenticatedDestination({ app_metadata: { role: "super_admin" } }), DEFAULT_ADMIN_RETURN_PATH);
assert.equal(getAuthenticatedDestination({ role: "resident" }, "https://attacker.example"), DEFAULT_RESIDENT_MAP_PATH);

assert.match(appSource, /path="\/map" element=\{<MapPage/);
assert.match(appSource, /path="\/app\/map" element=\{<RedirectWithSearch to="\/map"/);
assert.doesNotMatch(appSource, /function AuthenticatedResidentMap/);
assert.doesNotMatch(appSource, /PublicMapGateway/);
assert.match(appSource, /path="\/auth\/callback"/);
assert.match(appSource, /path="\/sign-in"/);
assert.match(appSource, /path="\/resident\/\*".*DEFAULT_RESIDENT_MAP_PATH/s);
assert.match(appSource, /path="\/resident\/home" element=\{<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>\}/);
assert.match(appSource, /path="\/resident\/civic" element=\{<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>\}/);
assert.match(appSource, /path="\/residents\/governance" element=\{<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>\}/);
assert.doesNotMatch(appSource, /<ResidentHome|<ResidentGovernance/);
assert.match(appSource, /path="\/residents\/register".*\/residents\/login/s);
assert.match(appSource, /path="\/partner-workspace\/overview".*ProtectedRoute/s);
assert.doesNotMatch(appSource, /canBootstrapWorkspace|hasWorkspaceActivation/);
assert.match(appSource, /function ProtectedAdminStudio\(\)[\s\S]*?<AdminProtectedRoute>/);
for (const adminPath of [
  "/admin-studio",
  "/admin-studio/command-center",
  "/admin-studio/campaign-builder",
  "/admin-studio/audience-builder",
  "/admin-studio/content-library",
  "/admin-studio/approval-queue",
  "/admin-studio/distribution",
  "/admin-studio/performance",
  "/admin-studio/partner-intelligence",
  "/admin-studio/residents",
]) {
  assert.ok(appSource.includes(`path="${adminPath}" element={<ProtectedAdminStudio />}`), `${adminPath} must use the admin guard`);
}
assert.match(authSource, /signInWithPassword\(\{ email, password \}\)/);
assert.match(authSource, /signInWithOtp\(\{[\s\S]*?shouldCreateUser:\s*false/);
assert.doesNotMatch(adminStudioSource, /dp_admin_resident_records|sample-resident|resident@example\.com/);
assert.match(adminStudioSource, /getPartnerContentApiBaseUrl\(\).*\/api\/admin\/accounts/);
assert.match(adminStudioSource, /Authorization: `Bearer \$\{token\}`/);
assert.match(adminStudioSource, /cache: "no-store"/);
assert.match(supabaseClientSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.match(productionGuardSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.match(authSource, /auth\.signUp\(\{/);
assert.match(authSource, /auth\.resend\(\{/);
assert.match(authSource, /email_not_confirmed/);
assert.match(authSource, /skipBrowserRedirect:\s*true/);
assert.match(authSource, /window\.top\?\.location\.assign/);
assert.doesNotMatch(residentSignInSource, /Create account|Create resident account|registerResidentWithPassword|Resend confirmation email/);
assert.match(residentSignInSource, /autoComplete="current-password"/);
assert.match(residentSignInSource, /navigate\(getAuthenticatedDestination\(user\), \{ replace: true \}\)/);
assert.match(residentSignInSource, /navigate\(getAuthenticatedDestination\(result\.user, returnTo\), \{ replace: true \}\)/);
assert.match(authCallbackSource, /getAuthenticatedDestination\(user, residentReturnPath\)/);
assert.match(authCallbackSource, /partner_access_required/);
assert.doesNotMatch(residentAccessSource, /dp-resident-access-topbar/);
assert.match(residentAccessSource, /payload\.persisted/);
assert.match(residentAccessSource, /href=\{href\}/);
assert.match(residentAccessSource, /href=\{place\.href\}/);
assert.doesNotMatch(residentAccessSource, /["`]\/app\?mode=resident/);
assert.doesNotMatch(residentAccessApiSource, /hasBuildingMatch/);
assert.match(residentAccessApiSource, /accepted_local/);
assert.match(layoutSource, /pathname === "\/card" \|\|/);

for (const file of sourceFiles(join(root, "src"))) {
  const source = readFileSync(file, "utf8");
  assert.equal(/<iframe\b/i.test(source), false, `cross-origin iframe remains in ${file}`);
}

console.log("First-party map and authentication routing checks passed.");
