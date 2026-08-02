import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const workspace = readFileSync(join(root, "src/pages/PartnerWorkspace.jsx"), "utf8");
const stylesFile = readFileSync(join(root, "src/styles/workspace-profile-editor.css"), "utf8");
const marker = "/* Backend workspace IA reference surface */";
assert.ok(stylesFile.includes(marker), "workspace IA CSS marker must exist");
const styles = stylesFile.slice(stylesFile.indexOf(marker));

for (const group of ["Today", "Build", "Measure", "Operate", "Account", "Platform admin"]) {
  assert.match(workspace, new RegExp(`label: "${group}"`), `${group} navigation group must exist`);
}

assert.match(workspace, /adminOnly: true/, "Admin Studio navigation must be gated as admin-only");
assert.match(workspace, /hasPrivilegedWorkspaceAccess/, "Admin navigation visibility must be tied to privileged access");
assert.match(workspace, /visibleItems = group\.items\.filter\(\(item\) => !item\.adminOnly \|\| hasPrivilegedWorkspaceAccess\)/, "admin-only items must be filtered from standard partner navigation");

for (const section of ["Identity", "Organization", "Active scope", "Public presence", "Notifications", "Security", "Account actions"]) {
  assert.match(workspace, new RegExp(`title: "${section}"|>${section}<`), `${section} profile section must be represented`);
}

assert.match(workspace, /id="workspace-profile-form"/, "profile save action must target one canonical form");
assert.match(workspace, /className="dp-workspace-ia-context"/, "active scope must render as a full-width context row");
assert.doesNotMatch(workspace, /campaign metrics|map data|analytics charts/i, "profile must not pull campaign metrics or analytics charts into account settings copy");

assert.match(styles, /background: #fff;/, "workspace IA surface must stay pure white");
assert.match(styles, /border-radius: 2px;/, "controls must be square or nearly square");
assert.match(styles, /min-height: 44px;/, "interactive controls must enforce 44px touch targets");
assert.doesNotMatch(styles, /backdrop-filter|blur\(|gradient|rounded-full|border-radius:\s*999/i, "workspace IA reference must not use glass, blur, gradients, or pill geometry");

console.log("Workspace IA refactor contract checks passed.");
