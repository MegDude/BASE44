import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = readFileSync("src/styles/platform-tokens.css", "utf8");
const shell = readFileSync("src/components/platform/PlatformShell.jsx", "utf8");
const authReturn = readFileSync("src/lib/authReturnPath.ts", "utf8");
const adminScope = readFileSync("api/admin/scope.js", "utf8");
const adminSwitcher = readFileSync("src/components/admin/AdminScopeSwitcher.tsx", "utf8");
const contract = readFileSync("src/lib/platform/platformSystemContract.ts", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const audit = readFileSync("docs/PLATFORM_SYSTEM_GOVERNANCE_AUDIT.md", "utf8");

for (const token of [
  "--color-navy: #0B1F33",
  "--color-gold: #C8A96A",
  "--color-white: #FFFFFF",
  "--color-border: rgba(11, 31, 51, 0.08)",
  "--font-product: \"Inter\", sans-serif",
  "--radius-control: 6px",
  "--radius-panel: 8px",
  "--control-height: 44px",
  "--page-padding: 20px",
  "--mobile-nav-clearance: 12px",
  "--duration-fast: 120ms",
  "--duration-standard: 180ms",
  "--duration-panel: 220ms",
  "--ease-standard: cubic-bezier(0.2, 0, 0, 1)",
  "--safe-area-top",
  "--safe-area-bottom",
  "--z-drawer",
  "--z-modal",
]) {
  assert.ok(tokens.includes(token), `missing platform token: ${token}`);
}

assert.match(tokens, /\[data-platform-surface="authenticated"\][\s\S]*background: var\(--color-white\)/, "authenticated surface must stay white");
assert.doesNotMatch(tokens, /backdrop-filter|blur\(/i, "platform token layer must not introduce glass or blur");
const nonNoneShadow = tokens.split("\n").find((line) => /box-shadow\s*:/i.test(line) && !/box-shadow\s*:\s*none\s*;?/i.test(line));
assert.equal(nonNoneShadow, undefined, "platform token layer must not introduce shadows");
assert.match(tokens, /\.dp-platform-page[\s\S]*env\(safe-area-inset-top\)[\s\S]*env\(safe-area-inset-bottom\)/, "platform page must include safe-area padding");

assert.match(shell, /data-platform-surface=\{surface\}/, "PlatformShell must mark public/authenticated surfaces");
for (const path of ["/residents", "/resident", "/partner-workspace", "/admin", "/partners/sign-", "/partners/checkout", "/map", "/auth"]) {
  assert.match(shell, new RegExp(path.replace(/[/-]/g, (match) => match === "/" ? "\\/" : "-")), `PlatformShell missing authenticated path ${path}`);
}

for (const param of ["returnTo", "entityId", "partnerType", "plan", "sku", "checkoutKey", "billingMode", "modules", "organizationId", "portfolioId", "listingId", "utm_source", "utm_medium", "utm_campaign"]) {
  assert.match(contract, new RegExp(`"${param}"`), `handoff contract missing ${param}`);
}

assert.match(authReturn, /isSafeFirstPartyPath[\s\S]*!value\.startsWith\("\/\/"\)[\s\S]*!\/\^\[a-z\]/, "returnTo must reject external and protocol URLs");
assert.match(authReturn, /PRESERVED_MAP_KEYS[\s\S]*entityId[\s\S]*listingId[\s\S]*campaignId/, "resident map handoff must preserve explicit map intent");
assert.match(app, /preserveIntentParams\(location\.search\)/, "Admin Studio redirect must preserve allowed intent params");

assert.match(adminScope, /requireAuthenticatedUser\(req\)/, "admin scope endpoint must require auth");
assert.match(adminScope, /ADMIN_ACCESS_REQUIRED/, "admin scope endpoint must deny non-admin users");
assert.match(adminScope, /role !== "super_admin"[\s\S]*partner_users/, "standard admins must be scoped through partner membership");
assert.match(adminScope, /requestedOrganizationId[\s\S]*requestedPortfolioId[\s\S]*requestedListingId/, "admin scope endpoint must revalidate organization/portfolio/listing URL params");
assert.match(adminScope, /Cache-Control", "private, no-store"/, "admin scope response must be private no-store");

assert.match(adminSwitcher, /getAuthorizedAdminScope\(requested/, "Admin scope selector must request server-authorized scope");
assert.match(adminSwitcher, /DialogPrimitive\.Content/, "Admin mobile selector must use a sheet/dialog primitive");
assert.match(adminSwitcher, /Search organization, portfolio, or listing/, "Admin scope selector must be searchable");
assert.match(adminSwitcher, /sessionStorage\.setItem\("dp_admin_workspace:scope"/, "Admin scope selector must retain scope state after server validation");

for (const primitive of ["PublicHeader", "AppHeader", "MobileTopBar", "BottomNavigation", "WorkspaceSidebar", "ScopeSelector", "Button", "Input", "Drawer", "BottomSheet", "Modal", "Toast"]) {
  assert.match(contract, new RegExp(`"${primitive}"`), `primitive registry missing ${primitive}`);
}

for (const gate of ["visual-continuity", "functional-wiring", "intent-persistence", "iphone-15-mobile-acceptance", "authorization-negative-tests", "preview-before-production"]) {
  assert.match(contract, new RegExp(`"${gate}"`), `release gate missing ${gate}`);
}

assert.match(audit, /Unified Product-System Refactor/, "audit must review the unified refactor attachment");
assert.match(audit, /Two Builds, One Downtown Perks Product/, "audit must review the two-build attachment");
assert.match(audit, /does not claim platform-wide completion/i, "audit must avoid claiming full completion for a governance slice");

console.log("Platform system governance contract checks passed.");
