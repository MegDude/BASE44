import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapSource = readFileSync("src/pages/Map.jsx", "utf8");
const shellSource = readFileSync("src/components/map/NativeDrawerShell.jsx", "utf8");
const stateSource = readFileSync("src/lib/map/nativeDrawerState.js", "utf8");
const navigationSource = readFileSync("src/hooks/useMapPanelNavigation.ts", "utf8");
const css = readFileSync("src/styles/universal-entity-drawer-final.css", "utf8");

for (const state of ["peek", "medium", "expanded", "full"]) {
  assert.match(stateSource, new RegExp(`"${state}"`), `Missing ${state} drawer state`);
  assert.match(css, new RegExp(`data-drawer-state="${state}"`), `Missing ${state} responsive geometry`);
}

assert.match(mapSource, /<NativeDrawerShell[\s\S]*id="dp-active-map-drawer"/, "Selected entities bypass the shared drawer");
assert.match(mapSource, /actions=\{<UniversalEntityActionRail/, "Selected entities do not use the shared fixed action rail");
assert.match(mapSource, /scrollClassName="dp-map-detail-scroll dp-map-panel-scroll dp-destination-scroll dp-drawer-scroll"/, "Drawer must own one scroll region");
assert.match(shellSource, /data-has-drawer-actions/, "Drawer does not expose action ownership");
assert.match(shellSource, /document\.body\.style\.overflow = "hidden"/, "Body scroll is not locked while the drawer is active");
assert.match(shellSource, /onRequestClose/, "Escape cannot close the base drawer state");
assert.match(shellSource, /focusTarget\.focus/, "Drawer close does not restore focus");
assert.match(navigationSource, /window\.sessionStorage/, "Nested drawer navigation history is not persisted");
assert.match(css, /45dvh/, "Medium state must target 45dvh");
assert.match(css, /85dvh/, "Expanded state must target 85dvh");
assert.match(css, /height:\s*100dvh/, "Full state must use the dynamic viewport");
assert.match(css, /@media \(min-width:\s*768px\)/, "Desktop right-panel behavior is missing");
assert.match(css, /font-family:\s*Inter/, "Drawer does not use Inter");
assert.match(css, /prefers-reduced-motion/, "Reduced-motion support is missing");
assert.doesNotMatch(css, /gradient\(/i, "Decorative gradients are forbidden");
for (const value of [...css.matchAll(/box-shadow:\s*([^;!]+)/gi)].map((match) => match[1].trim())) {
  assert.equal(value, "none", "The canonical drawer must not add heavy elevation");
}

console.log("Universal entity drawer structure, states, actions, navigation, and responsive geometry: PASS");
