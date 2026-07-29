import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workspace = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const switcher = readFileSync("src/components/partner/workspace/WorkspaceScopeSwitcher.tsx", "utf8");
const auth = readFileSync("src/lib/auth/session.ts", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const adminScope = readFileSync("src/components/admin/AdminScopeSwitcher.tsx", "utf8");
const adminScopeClient = readFileSync("src/lib/admin/adminScopeClient.ts", "utf8");

assert.match(auth, /session\.role === "platform_admin"/, "platform admins are not recognized as admins");
assert.match(workspace, /accessMode=\{hasPrivilegedWorkspaceAccess \? "admin" : "partner"\}/, "workspace does not distinguish admin and partner scope");
assert.match(workspace, /useAuth\(\)/, "workspace does not use the verified application session");
assert.match(workspace, /\.\.\.authenticatedUser/, "verified session claims do not take precedence in the workspace");
assert.match(switcher, /if \(accessMode === "admin"\)/, "all-organization selector is not admin-gated");
assert.match(switcher, /Admin workspace/, "admin mode is not explicitly identified");
assert.match(switcher, /<AdminScopeSwitcher \/>/, "admin mode does not use the authorized scope selector");
assert.match(adminScopeClient, /\/api\/admin\/scope/, "admin scope is not sourced from the protected backend contract");
assert.match(adminScopeClient, /Authorization: `Bearer \$\{token\}`/, "admin scope request is missing verified session authorization");
assert.match(adminScope, /DialogPrimitive\.Content/, "organization selection does not use the accessible shared dialog primitive");
assert.match(switcher, /\/partner-workspace\/residents/, "admin mode does not link to the in-shell people directory");
assert.doesNotMatch(switcher, /ADMIN_WORKSPACE_URL|downtown-perks-platform\.vercel\.app|downtown-perks-backend\.vercel\.app/, "workspace links to a separate admin application");
assert.match(app, /<Navigate to="\/partner-workspace\/overview" replace \/>/, "legacy admin routes do not converge on the canonical workspace");
assert.doesNotMatch(switcher, /accessMode === "partner"[\s\S]{0,300}demoOrganizations\.map/, "partner workspace enumerates all organizations");

console.log("Admin and partner workspace boundary contract passed.");
