import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [destinationSource, workspaceSource, analyticsSource, analyticsPageSource, registrySource, styles, compactStyles, densityStyles, main] = await Promise.all([
  readFile(new URL("../src/components/partner/workspace/WorkspaceDestinationRoot.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/analytics/PartnerAnalyticsExperience.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/components/analytics/PartnerAnalyticsPage.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/config/workspaceModuleRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/partner-workspace-deep-polish-final.css", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/workspace-compact-media-final.css", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/interface-density-regression-lock.css", import.meta.url), "utf8"),
  readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
]);

assert.match(destinationSource, /dp-workspace-destination-next/, "destination landing pages need one next action");
assert.match(destinationSource, /dp-workspace-destination-group/, "destination modules must use grouped rows");
assert.match(destinationSource, /People and access/, "workspace tools must be progressively grouped");
assert.match(destinationSource, /Connected services/, "technical services must use a plain-language group label");
assert.match(destinationSource, /MODULE_ICONS/, "workspace rows must use the shared icon registry");

assert.match(workspaceSource, /const WORKSPACE_MEDIA_TABS = \["media"\]/, "media rail must be exclusive to Media");
assert.match(workspaceSource, /return "residents"/, "People route must have a distinct panel");
assert.match(workspaceSource, /return "buildings"/, "Buildings route must have a distinct panel");
assert.match(workspaceSource, /tab === "residents"/, "People detail must render");
assert.match(workspaceSource, /tab === "buildings"/, "Buildings detail must render");
assert.doesNotMatch(workspaceSource, /<Link to="\/map\?mode=partner&tab=map&filter=All">Open map<\/Link>/, "registry headers must not repeat the map action");
assert.match(workspaceSource, /POTENTIAL_REACH_SOURCES/, "potential reach must name its source records");
assert.match(workspaceSource, /DANA.*The Shore.*Legends/s, "potential reach must use DANA, The Shore, and Legends");
assert.match(workspaceSource, /Verified audience totals are not connected yet/, "missing audience totals must be disclosed");
assert.doesNotMatch(workspaceSource, /Residents reached today/, "unverified reach must never be presented as measured");
assert.doesNotMatch(workspaceSource, /Residents who saved a dining perk were 38% more likely/, "unsupported behavioral claims must not render");
assert.doesNotMatch(workspaceSource, /\["426", "Map views"/, "fixture map activity must not render as current workspace data");
assert.doesNotMatch(analyticsSource, /buildFixture|function seed\(/, "analytics must not generate fixture performance");
assert.match(analyticsSource, /No generated performance data/, "analytics must disclose its source-safe state");
assert.match(analyticsSource, /DANA, The Shore, and Legends/, "analytics must identify potential reach sources");
assert.doesNotMatch(workspaceSource, /record connected to this workspace/, "the overview must not expose database language");
assert.doesNotMatch(analyticsSource, /Canonical records|Connected record/, "analytics must not expose data-model language");
assert.doesNotMatch(analyticsPageSource, /Interpreted insight|Canonical partner map|shared map layer and entity records/, "analytics copy must describe the user's decision, not the system");
assert.doesNotMatch(registrySource, /feed-owned inventory|Organization identity|People and CRM|Integrations|Automations|AI tools|connected systems|workflow triggers|diagnostics/, "workspace destinations must use plain language");

assert.match(styles, /white-space:\s*normal\s*!important/, "mobile row descriptions must wrap");
assert.match(styles, /overflow-wrap:\s*anywhere\s*!important/, "long workspace copy must remain readable");
assert.match(styles, /box-shadow:\s*none\s*!important/, "landing surfaces must remain flat");
assert.match(styles, /min-height:\s*44px\s*!important/, "primary actions must retain accessible targets");
assert.doesNotMatch(compactStyles, /background:\s*#f7f4ed|border-radius:\s*(14|20)px/, "mobile overview must not restore beige, pill, or card geometry");
assert.match(densityStyles, /Partner workspace governance/, "shared workspace surfaces need a final release lock");
assert.match(densityStyles, /table,[\s\S]*?box-shadow:\s*none\s*!important/, "tables and rows must remain free of shadows");
assert.match(main, /partner-workspace-deep-polish-final\.css/, "the workspace surface contract must remain registered");
assert.match(main, /interface-density-regression-lock\.css/, "the cross-product density lock must follow workspace polish");
assert.doesNotMatch(workspaceSource, /import\s+["']@\/styles\//, "workspace styles must load through main before the final release locks");

console.log("Partner workspace deep-polish regression checks passed.");
