import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_ADMIN_RETURN_PATH,
  DEFAULT_PARTNER_RETURN_PATH,
  DEFAULT_RESIDENT_MAP_PATH,
  getAuthenticatedDestination,
  normalizeAuthReturnPath,
} from "../src/lib/authReturnPath.ts";

const [app, worker, wrangler, envExample, map, adminScope] = await Promise.all([
  readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  readFile(new URL("../workers/app-shell.js", import.meta.url), "utf8"),
  readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  readFile(new URL("../.env.example", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/admin/AdminScopeSwitcher.tsx", import.meta.url), "utf8"),
]);

for (const route of ["/map", "/auth/callback", "/residents/login", "/partners/sign-in", "/partner-workspace/reports", "/admin-studio/command-center"]) {
  assert.ok(app.includes(`path="${route}"`), `missing direct-load route ${route}`);
}

assert.equal(normalizeAuthReturnPath("https://attacker.example", DEFAULT_PARTNER_RETURN_PATH), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(normalizeAuthReturnPath("//attacker.example", DEFAULT_PARTNER_RETURN_PATH), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(normalizeAuthReturnPath("/\\attacker.example", DEFAULT_PARTNER_RETURN_PATH), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(normalizeAuthReturnPath("/auth/callback", DEFAULT_PARTNER_RETURN_PATH), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(normalizeAuthReturnPath("/partner-workspace/reports", DEFAULT_PARTNER_RETURN_PATH), "/partner-workspace/reports");
assert.equal(getAuthenticatedDestination({ role: "resident" }), DEFAULT_RESIDENT_MAP_PATH);
assert.equal(getAuthenticatedDestination({ role: "partner" }), DEFAULT_PARTNER_RETURN_PATH);
assert.equal(getAuthenticatedDestination({ role: "super_admin" }), DEFAULT_ADMIN_RETURN_PATH);

assert.match(worker, /url\.pathname === "\/api" \|\| url\.pathname\.startsWith\(API_PREFIX\)/);
assert.match(worker, /Authorization|new Headers\(request\.headers\)/);
assert.match(wrangler, /"run_worker_first": \["\/api", "\/api\/\*", "\/resident-app"\]/);
assert.match(wrangler, /"not_found_handling": "single-page-application"/);
assert.match(envExample, /^BACKEND_ORIGIN=/m);
assert.doesNotMatch(envExample, /^VITE_.*(?:SECRET|PASSWORD|PRIVATE|SERVICE_ROLE|AUTH_TOKEN)=/m);
assert.match(map, /const title = navigationTitle \|\| place\?\.name \|\| "Details"/);
assert.match(map, /aria-hidden="true">\{title\}<\/span>/);
assert.match(adminScope, /"loading" \| "ready" \| "empty" \| "error"/);
assert.match(adminScope, /no organization or listing has been assigned/i);

console.log("Cloudflare route and role readiness contract passed.");
