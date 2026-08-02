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
assert.match(switcher, /<AdminScopeSwitcher onScopeResolved=\{onAdminScopeResolved\} \/>/, "admin mode does not use the authorized scope selector");
assert.match(adminScopeClient, /\/api\/admin\/scope/, "admin scope is not sourced from the protected backend contract");
assert.match(adminScopeClient, /Authorization: `Bearer \$\{token\}`/, "admin scope request is missing verified session authorization");
assert.match(adminScope, /DialogPrimitive\.Content/, "organization selection does not use the accessible shared dialog primitive");
assert.match(adminScope, /writePartnerWorkspaceScope\(next\)/, "admin scope does not update the canonical workspace scope");
assert.match(adminScope, /onScopeResolved\?\.\(next\.activeScope\)/, "backend-validated active scope is not propagated to the workspace");
assert.match(adminScope, /onScopeResolved\?\.\(\{\}\)[\s\S]*setStatus\("loading"\)/, "previous organization data is not cleared while a requested scope is authorized");
assert.match(workspace, /\.\.\.authorizedAdminScope[\s\S]*type:/, "workspace content does not use the backend-authorized production scope");
assert.match(workspace, /hasPrivilegedWorkspaceAccess \? <WorkspaceRegistryPanel key="admin-offers"/, "unsafe partner offer mutations remain exposed to admin scope");
assert.match(workspace, /hasPrivilegedWorkspaceAccess \? <WorkspaceRegistryPanel key="admin-governance"/, "partner-only governance actions remain exposed to admin scope");
assert.match(workspace, /hasPrivilegedWorkspaceAccess \? <WorkspaceRegistryPanel key="admin-share-links"/, "partner-only share-link actions remain exposed to admin scope");
assert.match(workspace, /<WorkspaceReports key="reports" scope=\{workspaceScope\}/, "reports do not receive the server-authorized scope");
assert.match(workspace, /onSwitchWorkspace=\{hasPrivilegedAccess \? undefined/, "admin overview still exposes the demo-only workspace switcher");
assert.match(switcher, /\/partner-workspace\/residents/, "admin mode does not link to the in-shell people directory");
assert.doesNotMatch(switcher, /ADMIN_WORKSPACE_URL|downtown-perks-platform\.vercel\.app|downtown-perks-backend\.vercel\.app/, "workspace links to a separate admin application");
assert.match(app, /path="\\/admin" element={<ProtectedAdminStudio \\/>}/, "canonical platform admin route is missing");
assert.match(app, /<AdminMarketingStudio \\/>/, "admin routes do not render the platform command center");
assert.doesNotMatch(app, /ADMIN_STUDIO_DESTINATIONS/, "admin routes still redirect into a partner workspace");
assert.match(app, /\\["admin", "platform_admin", "super_admin"\\]\\.includes\\(role\\).*Navigate to="\\/admin"/s, "platform admins can still inherit partner workspace state");
assert.doesNotMatch(switcher, /accessMode === "partner"[\s\S]{0,300}demoOrganizations\.map/, "partner workspace enumerates all organizations");

console.log("Admin and partner workspace boundary contract passed.");
