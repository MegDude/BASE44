import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workspace = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const switcher = readFileSync("src/components/partner/workspace/WorkspaceScopeSwitcher.tsx", "utf8");
const auth = readFileSync("src/lib/auth/session.ts", "utf8");
const app = readFileSync("src/App.jsx", "utf8");

assert.match(auth, /session\.role === "platform_admin"/, "platform admins are not recognized as admins");
assert.match(workspace, /accessMode=\{hasPrivilegedWorkspaceAccess \? "admin" : "partner"\}/, "workspace does not distinguish admin and partner scope");
assert.match(workspace, /useAuth\(\)/, "workspace does not use the verified application session");
assert.match(workspace, /\.\.\.authenticatedUser/, "verified session claims do not take precedence in the workspace");
assert.match(switcher, /accessMode === "admin" \? \(/, "all-organization selector is not admin-gated");
assert.match(switcher, /Admin workspace/, "admin mode is not explicitly identified");
assert.match(switcher, /Search organizations, portfolios, and listings/, "admin scope is not searchable");
assert.match(switcher, /dp-workspace-scope-sheet/, "organization selection does not use the canonical sheet pattern");
assert.match(switcher, /\/partner-workspace\/residents/, "admin mode does not link to the in-shell people directory");
assert.doesNotMatch(switcher, /ADMIN_WORKSPACE_URL|downtown-perks-platform\.vercel\.app|downtown-perks-backend\.vercel\.app/, "workspace links to a separate admin application");
assert.match(app, /<Navigate to="\/partner-workspace\/overview" replace \/>/, "legacy admin routes do not converge on the canonical workspace");
assert.doesNotMatch(switcher, /accessMode === "partner"[\s\S]{0,300}demoOrganizations\.map/, "partner workspace enumerates all organizations");

console.log("Admin and partner workspace boundary contract passed.");
