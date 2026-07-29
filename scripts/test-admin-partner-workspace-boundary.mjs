import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workspace = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const switcher = readFileSync("src/components/partner/workspace/WorkspaceScopeSwitcher.tsx", "utf8");
const auth = readFileSync("src/lib/auth/session.ts", "utf8");

assert.match(auth, /session\.role === "platform_admin"/, "platform admins are not recognized as admins");
assert.match(workspace, /accessMode=\{hasPrivilegedWorkspaceAccess \? "admin" : "partner"\}/, "workspace does not distinguish admin and partner scope");
assert.match(switcher, /accessMode === "admin" \? \(/, "all-organization selector is not admin-gated");
assert.match(switcher, /to="\/admin-studio\/residents"/, "admin workspace does not link to registered users");
assert.doesNotMatch(switcher, /accessMode === "partner"[\s\S]{0,300}demoOrganizations\.map/, "partner workspace enumerates all organizations");

console.log("Admin and partner workspace boundary contract passed.");
