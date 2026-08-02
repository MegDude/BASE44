import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const authReturnPath = readFileSync(new URL("../src/lib/authReturnPath.ts", import.meta.url), "utf8");
const studio = readFileSync(new URL("../src/pages/AdminMarketingStudio.jsx", import.meta.url), "utf8");
const workspaceScope = readFileSync(new URL("../src/components/partner/workspace/WorkspaceScopeSwitcher.tsx", import.meta.url), "utf8");
const profileActions = readFileSync(new URL("../src/styles/workspace-profile-save-final.css", import.meta.url), "utf8");

assert.match(app, /const AdminMarketingStudio = lazy/);
assert.match(app, /path="\/admin" element={<ProtectedAdminStudio \/>}/);
assert.match(app, /\["admin", "platform_admin", "super_admin"\]\.includes\(role\).*Navigate to="\/admin"/s);
assert.match(app, /function ProtectedAdminStudio\(\)[\s\S]*?<AdminMarketingStudio \/>/);
assert.doesNotMatch(app, /ADMIN_STUDIO_DESTINATIONS/);
assert.match(authReturnPath, /DEFAULT_ADMIN_RETURN_PATH = "\/admin"/);
assert.doesNotMatch(studio, /ADMIN_ACTION_TARGETS[\s\S]*?partner-workspace/);
assert.match(workspaceScope, /aria-expanded=\{adminScopeOpen\}/);
assert.match(workspaceScope, /Choose scope/);
assert.doesNotMatch(profileActions, /position:fixed!important/);
assert.doesNotMatch(profileActions, /position:sticky!important/);

console.log("Platform admin command-center routing contract: PASS");
