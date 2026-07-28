import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapSource = readFileSync("src/pages/Map.jsx", "utf8");
const shellSource = readFileSync("src/components/map/NativeDrawerShell.jsx", "utf8");
const stateSource = readFileSync("src/lib/map/nativeDrawerState.js", "utf8");
const navigationSource = readFileSync("src/hooks/useMapPanelNavigation.ts", "utf8");
const css = readFileSync("src/styles/universal-entity-drawer-final.css", "utf8");
const finalCss = readFileSync("src/styles/map-drawer-scroll-footer-final.css", "utf8");
const fourSeasonsSource = readFileSync("src/data/fourSeasonsExperience.js", "utf8");
const launchPinsSource = readFileSync("src/data/imports/launchMapPins.js", "utf8");

for (const state of ["peek", "medium", "expanded", "full"]) {
  assert.match(stateSource, new RegExp(`"${state}"`), `Missing ${state} drawer state`);
  assert.match(css, new RegExp(`data-drawer-state="${state}"`), `Missing ${state} responsive geometry`);
}

assert.match(mapSource, /<NativeDrawerShell[\s\S]*id="dp-active-map-drawer"/, "Selected entities bypass the shared drawer");
assert.match(mapSource, /getCanonicalClusterDrawerPlaces\(clusterDrawer\?\.places \|\| \[\]\)/, "Grouped results do not resolve presentation duplicates");
assert.match(mapSource, /data-panel-layout="context-list"/, "Grouped map results bypass the shared contextual drawer");
assert.match(fourSeasonsSource, /id:\s*FOUR_SEASONS_HOSPITALITY_ACCESS\.id/, "Four Seasons child records do not resolve to the canonical hotel");
assert.match(fourSeasonsSource, /relatedCampaignName/, "Four Seasons campaign context is discarded instead of retained as child metadata");
assert.match(launchPinsSource, /const canonicalDisplayName = clean\(pin\.name\)/, "Launch anchors still expose internal presentation suffixes as entity titles");
assert.match(mapSource, /actions=\{<UniversalEntityActionRail/, "Selected entities do not use the shared fixed action rail");
assert.match(mapSource, /entityType=\{getCanonicalDetailEntityType\(selected, Boolean\(urlState\.perkId\)\)\}/, "The fixed action rail is not driven by the canonical drawer identity");
assert.match(mapSource, /if \(explicitDetailType === "perk"\)[\s\S]*?return "perk"/, "Explicit perk identity can still be misclassified as an event");
assert.match(mapSource, /aria-label="Saved"[\s\S]*?tab=saved&filter=Saved/, "Resident Saved access is missing from the map navigation");
assert.match(mapSource, /function selectPlace[\s\S]*?navigateMapJourney\([\s\S]*?entityId: nextEntityId/, "map selections do not write the canonical entity ID through the shared URL state pipeline");
assert.doesNotMatch(mapSource, /entityId: isPropertySelection \? publicPropertyId/, "map selections can still substitute a presentation/property identifier for the canonical selected entity");
assert.match(mapSource, /if \(!urlState\.perkId \|\| !selected\) return;[\s\S]*?selectedPlaceOverride[\s\S]*?return;/, "stale perk cleanup can still overwrite a newly selected canonical entity URL");
assert.match(mapSource, /scrollClassName="dp-map-detail-scroll dp-map-panel-scroll dp-destination-scroll dp-drawer-scroll"/, "Drawer must own one scroll region");
assert.match(shellSource, /data-has-drawer-actions/, "Drawer does not expose action ownership");
assert.doesNotMatch(shellSource, /style\.setProperty/, "Shared drawer geometry must be owned by CSS, not injected inline styles");
assert.match(shellSource, /token !== "dp-native-drawer"/, "Shared drawer must remove duplicate root class tokens");
assert.match(shellSource, /document\.body\.style\.overflow = "hidden"/, "Body scroll is not locked while the drawer is active");
assert.match(shellSource, /onRequestClose/, "Escape cannot close the base drawer state");
assert.match(shellSource, /focusTarget\.focus/, "Drawer close does not restore focus");
assert.match(navigationSource, /window\.sessionStorage/, "Nested drawer navigation history is not persisted");
assert.match(css, /45dvh/, "Medium state must target 45dvh");
assert.match(css, /85dvh/, "Expanded state must target 85dvh");
assert.match(css, /inset:\s*auto 0 var\(--dp-entity-drawer-nav-clearance\)/, "Mobile drawer must sit above bottom navigation");
assert.match(css, /margin-bottom:\s*0/, "Fixed action rail must not double-count bottom navigation clearance");
assert.match(finalCss, /dp-context-list-scroll/, "Shared drawer does not style contextual results");
assert.match(finalCss, /grid-template-columns:\s*44px minmax\(0,\s*1fr\) auto/, "Contextual rows do not preserve mobile touch and text geometry");
assert.match(css, /height:\s*100dvh/, "Full state must use the dynamic viewport");
assert.match(css, /@media \(min-width:\s*768px\)/, "Desktop right-panel behavior is missing");
assert.match(css, /font-family:\s*Inter/, "Drawer does not use Inter");
assert.match(css, /prefers-reduced-motion/, "Reduced-motion support is missing");
assert.doesNotMatch(css, /gradient\(/i, "Decorative gradients are forbidden");
for (const value of [...css.matchAll(/box-shadow:\s*([^;!]+)/gi)].map((match) => match[1].trim())) {
  assert.equal(value, "none", "The canonical drawer must not add heavy elevation");
}

console.log("Universal entity drawer structure, states, actions, navigation, and responsive geometry: PASS");
