import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [destinationSource, workspaceSource, styles, main] = await Promise.all([
  readFile(new URL("../src/components/partner/workspace/WorkspaceDestinationRoot.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/partner-workspace-deep-polish-final.css", import.meta.url), "utf8"),
  readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
]);

assert.match(destinationSource, /dp-workspace-destination-next/, "destination landing pages need one next action");
assert.match(destinationSource, /dp-workspace-destination-group/, "destination modules must use grouped rows");
assert.match(destinationSource, /People and access/, "workspace tools must be progressively grouped");
assert.match(destinationSource, /MODULE_ICONS/, "workspace rows must use the shared icon registry");

assert.match(workspaceSource, /const WORKSPACE_MEDIA_TABS = \["media"\]/, "media rail must be exclusive to Media");
assert.match(workspaceSource, /return "residents"/, "People route must have a distinct panel");
assert.match(workspaceSource, /return "buildings"/, "Buildings route must have a distinct panel");
assert.match(workspaceSource, /tab === "residents"/, "People detail must render");
assert.match(workspaceSource, /tab === "buildings"/, "Buildings detail must render");
assert.doesNotMatch(workspaceSource, /<Link to="\/map\?mode=partner&tab=map&filter=All">Open map<\/Link>/, "registry headers must not repeat the map action");

assert.match(styles, /white-space:\s*normal\s*!important/, "mobile row descriptions must wrap");
assert.match(styles, /overflow-wrap:\s*anywhere\s*!important/, "long workspace copy must remain readable");
assert.match(styles, /box-shadow:\s*none\s*!important/, "landing surfaces must remain flat");
assert.match(styles, /min-height:\s*44px\s*!important/, "primary actions must retain accessible targets");
assert.match(main, /partner-workspace-deep-polish-final\.css/, "the final workspace surface contract must load last");

console.log("Partner workspace deep-polish regression checks passed.");
