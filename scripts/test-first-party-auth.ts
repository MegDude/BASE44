import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildResidentMapPath, getSafeReturnPath, isSafeFirstPartyPath } from "../src/lib/authReturnPath";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/App.jsx"), "utf8");
const authSource = readFileSync(join(root, "src/lib/AuthContext.jsx"), "utf8");
const residentSignInSource = readFileSync(join(root, "src/pages/ResidentSignIn.jsx"), "utf8");
const residentAccessSource = readFileSync(join(root, "src/pages/ResidentAccess.jsx"), "utf8");
const residentAccessApiSource = readFileSync(join(root, "api/resident-access.js"), "utf8");
const layoutSource = readFileSync(join(root, "src/components/Layout.jsx"), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(jsx?|tsx?)$/.test(name) ? [path] : [];
  });
}

const statePath = buildResidentMapPath(
  "?mode=resident&tab=perks&filter=Dining&intent=eat_drink&entityId=comedor&perkId=perk-1&eventId=event-1&collectionId=collection-1&routeId=route-1&district=Congress&query=date+night&radius=1200",
  "/app/map",
);

for (const expected of ["mode=resident", "tab=perks", "filter=Dining", "intent=eat_drink", "entityId=comedor", "perkId=perk-1", "eventId=event-1", "collectionId=collection-1", "routeId=route-1", "district=Congress", "query=date+night", "radius=1200"]) {
  assert.ok(statePath.includes(expected), `missing preserved map state: ${expected}`);
}

assert.equal(isSafeFirstPartyPath("/app/map?filter=Dining"), true);
assert.equal(isSafeFirstPartyPath("//attacker.example/path"), false);
assert.equal(isSafeFirstPartyPath("https://attacker.example/path"), false);
assert.equal(getSafeReturnPath("?returnTo=https%3A%2F%2Fattacker.example"), "/app/map?mode=resident&tab=map&filter=All");
assert.equal(getSafeReturnPath("?returnTo=%2Fapp%2Fmap%3Ffilter%3DCoffee"), "/app/map?filter=Coffee");

assert.match(appSource, /path="\/map" element=\{<PublicMapGateway/);
assert.match(appSource, /path="\/app\/map" element=\{<AuthenticatedResidentMap/);
assert.match(appSource, /path="\/auth\/callback"/);
assert.match(appSource, /path="\/sign-in"/);
assert.match(authSource, /signInWithPassword\(\{ email, password \}\)/);
assert.match(authSource, /auth\.signUp\(\{/);
assert.match(authSource, /auth\.resend\(\{/);
assert.match(authSource, /email_not_confirmed/);
assert.match(authSource, /skipBrowserRedirect:\s*true/);
assert.match(authSource, /window\.top\?\.location\.assign/);
assert.match(residentSignInSource, /Create resident account/);
assert.match(residentSignInSource, /Resend confirmation email/);
assert.match(residentSignInSource, /"current-password"/);
assert.doesNotMatch(residentAccessSource, /dp-resident-access-topbar/);
assert.match(residentAccessSource, /payload\.persisted/);
assert.match(residentAccessSource, /href=\{href\}/);
assert.match(residentAccessSource, /href=\{place\.href\}/);
assert.doesNotMatch(residentAccessApiSource, /hasBuildingMatch/);
assert.match(residentAccessApiSource, /accepted_local/);
assert.match(layoutSource, /pathname === "\/card" \|\|/);

for (const file of sourceFiles(join(root, "src"))) {
  const source = readFileSync(file, "utf8");
  assert.equal(/<iframe\b/i.test(source), false, `cross-origin iframe remains in ${file}`);
}

console.log("First-party map and authentication routing checks passed.");
