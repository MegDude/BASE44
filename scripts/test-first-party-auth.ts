import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildResidentMapPath, getSafeReturnPath, isSafeFirstPartyPath, normalizeResidentReturnPath } from "../src/lib/authReturnPath";

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
assert.match(normalizeResidentReturnPath("/resident/card"), /tab=card/);
assert.match(normalizeResidentReturnPath("/resident/saved"), /tab=saved/);
assert.match(normalizeResidentReturnPath("/resident/events"), /tab=events/);
assert.match(normalizeResidentReturnPath("/resident/perks"), /tab=perks/);
assert.equal(normalizeResidentReturnPath("/resident/unknown"), "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured");

assert.match(appSource, /path="\/map" element=\{<MapPage/);
assert.match(appSource, /path="\/app\/map" element=\{<RedirectWithSearch to="\/map"/);
assert.doesNotMatch(appSource, /function AuthenticatedResidentMap/);
assert.doesNotMatch(appSource, /PublicMapGateway/);
assert.match(appSource, /path="\/auth\/callback"/);
assert.match(appSource, /path="\/sign-in"/);
assert.match(appSource, /path="\/resident\/\*".*DEFAULT_RESIDENT_MAP_PATH/s);
assert.match(appSource, /path="\/resident\/home".*DEFAULT_RESIDENT_MAP_PATH/s);
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
  assert.ok(
    appSource.includes(`path="${adminPath}" element={<ProtectedAdminStudio />}`),
    `${adminPath} must use the admin authorization guard`,
  );
}
assert.match(authSource, /signInWithPassword\(\{ email, password \}\)/);
assert.match(authSource, /signInWithOtp\(\{[\s\S]*?shouldCreateUser:\s*false/);
assert.match(supabaseClientSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.match(productionGuardSource, /VITE_SUPABASE_PUBLISHABLE_KEY/);
assert.match(authSource, /auth\.signUp\(\{/);
assert.match(authSource, /auth\.resend\(\{/);
assert.match(authSource, /email_not_confirmed/);
assert.match(authSource, /skipBrowserRedirect:\s*true/);
assert.match(authSource, /window\.top\?\.location\.assign/);
assert.doesNotMatch(residentSignInSource, /Create account|Create resident account|registerResidentWithPassword|Resend confirmation email/);
assert.match(residentSignInSource, /autoComplete="current-password"/);
assert.match(residentSignInSource, /navigate\(DEFAULT_RESIDENT_MAP_PATH, \{ replace: true \}\)/);
assert.match(authCallbackSource, /\["admin", "platform_admin", "super_admin"\]/);
assert.match(authCallbackSource, /partner-workspace\/overview/);
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
