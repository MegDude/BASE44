import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [workspace, sheets, destinations, experiences, quickSearch, styles] = await Promise.all([
  readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/partner/workspace/WorkspaceSheetSystem.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/partner/workspace/WorkspaceDestinationRoot.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/partner/workspace/WorkspaceExperienceSystem.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/navigation/QuickSearchModal.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/interface-density-regression-lock.css", import.meta.url), "utf8"),
]);

assert.match(workspace, /className="dp-workspace-history-controls"/, "workspace pages must expose shared page controls");
assert.match(workspace, /aria-label="Go back"/, "workspace pages must expose Back");
assert.match(workspace, /aria-label="Close workspace"/, "workspace pages must expose Close");
assert.match(workspace, /window\.history\.state\?\.idx > 0/, "Back must preserve browser history when it exists");
assert.match(workspace, /navigate\("\/map\?mode=partner&tab=map&filter=All"\)/, "Close must return to the partner map");
assert.doesNotMatch(workspace, />Cancel</, "workspace forms must use Back instead of an ambiguous Cancel action");

assert.match(sheets, /Go back from \$\{sheet\.title\}/, "shared sheets must expose Back");
assert.match(sheets, /Close \$\{sheet\.title\}/, "shared sheets must expose Close");
assert.match(destinations, /Go back from workspace search/, "workspace search must expose Back");
assert.match(destinations, /aria-label="Close search"/, "workspace search must expose Close");
assert.match(experiences, /Close experience builder/, "experience builders must expose Close alongside Back");
assert.match(quickSearch, /Go back from search/, "the shared search opened from workspace must expose Back");
assert.match(quickSearch, /aria-label="Close search"/, "the shared search opened from workspace must expose Close");

assert.match(styles, /\.dp-workspace-history-controls/, "page controls must use the shared visual contract");
assert.match(styles, /min-height:\s*44px\s*!important/, "Back and Close controls must retain accessible touch targets");
assert.match(styles, /border-radius:\s*0\s*!important/, "navigation controls must remain square");

console.log("Workspace Back and Close navigation contract checks passed.");
