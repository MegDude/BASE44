import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mobileTabsByMode, normalizeMobileTab } from "../src/components/map/mobileTabRegistry";
import { createMobileTabState, rememberTabScroll, transitionMobileTabState } from "../src/components/map/mobileTabState";

const root = process.cwd();
const mapSource = readFileSync(join(root, "src/pages/Map.jsx"), "utf8");
const nativeDrawerStyles = readFileSync(join(root, "src/styles/map-native-ios-polish-final.css"), "utf8");
const nativeDrawerAuthority = readFileSync(join(root, "src/styles/map-native-drawer-authority-final.css"), "utf8");
const mapStyleEntry = readFileSync(join(root, "src/pages/legacyMapStyles.js"), "utf8");
const intentStyles = readFileSync(join(root, "src/styles/search-intent-chip-expansion-final.css"), "utf8");
const typographyStyles = readFileSync(join(root, "src/styles/typography-governance.css"), "utf8");
const drawerContainmentStyles = readFileSync(join(root, "src/styles/map-drawer-containment-final.css"), "utf8");
const partnerToolsStyles = readFileSync(join(root, "src/styles/partner-tools-polish-final.css"), "utf8");

assert.deepEqual(mobileTabsByMode.resident.map((tab) => tab.label), ["Home", "Map", "Perks", "Events", "Card"]);
assert.deepEqual(mobileTabsByMode.partner.map((tab) => tab.label), ["Home", "Publish", "Map", "Insights", "Workspace"]);
assert.equal(normalizeMobileTab("resident", "pass"), "card");
assert.equal(normalizeMobileTab("partner", "campaigns"), "publish");
assert.equal(normalizeMobileTab("partner", "audience"), "insights");
assert.equal(normalizeMobileTab("partner", "reports"), "insights");
assert.ok(mobileTabsByMode.resident.every((tab) => tab.emptyTitle && tab.emptyAction && tab.sections.length));
assert.ok(mobileTabsByMode.partner.every((tab) => tab.emptyTitle && tab.emptyAction && tab.sections.length));
assert.ok(mobileTabsByMode.resident.every((tab) => !/campaign|audience|performance/i.test(tab.purpose)));
assert.ok(mobileTabsByMode.partner.every((tab) => !/show your card|redeem/i.test(`${tab.purpose} ${tab.sections.join(" ")}`)));

const initial = createMobileTabState("resident", "map");
const scrolled = rememberTabScroll(initial, "map", 318);
assert.equal(scrolled.scrollPositions["resident:map"], 318);
const switched = transitionMobileTabState({ ...scrolled, selectedEntityId: "venue-1", searchIntent: "coffee" }, { mode: "partner", activeTab: "map" });
assert.equal(switched.selectedEntityId, undefined);
assert.equal(switched.searchIntent, undefined);
assert.equal(switched.scrollPositions["resident:map"], 318);
assert.match(mapSource, /function NativeDrawerHandle/);
assert.ok((mapSource.match(/dp-native-drawer-shell/g) || []).length >= 5);
assert.match(mapSource, /data-drawer-state=\{nativeDrawerState\}/);
assert.doesNotMatch(nativeDrawerStyles, /bottom:\s*calc\([^;]+\+\s*8px\)/);
assert.match(intentStyles, /--dp-panel-mobile-edge:\s*0px/);
assert.match(typographyStyles, /--dp-map-drawer-edge:\s*max\(0px/);
assert.match(drawerContainmentStyles, /Release lock: legacy pill and oversized action rules cannot win the cascade/);
assert.match(drawerContainmentStyles, /border-radius:\s*10px !important;/);
assert.match(partnerToolsStyles, /\.dp-partner-lifecycle-hero-actions a \{[\s\S]*?min-height:\s*44px !important;[\s\S]*?border-radius:\s*10px !important;/);
assert.match(nativeDrawerAuthority, /touch-action:\s*pan-y !important;/);
assert.match(nativeDrawerAuthority, /\.dp-collection-route-panel__actions/);
assert.match(nativeDrawerAuthority, /\.dp-partner-ask-rail/);
assert.ok(
  mapStyleEntry.lastIndexOf("map-native-drawer-authority-final.css") > mapStyleEntry.lastIndexOf("route-collection-product-final.css") &&
    mapStyleEntry.lastIndexOf("map-native-drawer-authority-final.css") > mapStyleEntry.lastIndexOf("map-detail-panel-product-final.css"),
  "native drawer authority must be the final map style import",
);

console.log(`mobile tab system: ${mobileTabsByMode.resident.length} resident tabs, ${mobileTabsByMode.partner.length} partner tabs`);
