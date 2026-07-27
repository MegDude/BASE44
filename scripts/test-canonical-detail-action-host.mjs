import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const panel = readFileSync(new URL("../src/components/map/CanonicalDetailPanel.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/detail-panel-fixed-actions-final.css", import.meta.url), "utf8");

assert.match(panel, /closest\?\.\("#dp-active-map-drawer"\)/, "canonical actions must resolve the active drawer shell");
assert.match(panel, /createPortal\(actions, drawerActionHost\)/, "canonical actions must render outside the scroll container");
assert.match(css, /:has\(> \.dp-canonical-detail-actions\)[\s\S]*grid-template-rows:\s*auto minmax\(0, 1fr\) auto/, "drawer shell must reserve a footer row");
assert.match(css, /\.dp-native-detail-panel__actions\s*\{[\s\S]*position:\s*relative !important/, "ported actions must participate in the drawer grid");
assert.doesNotMatch(css, /\.dp-native-detail-panel__actions\s*\{[\s\S]{0,180}position:\s*fixed !important/, "canonical actions must not rely on transformed fixed positioning");

console.log("Canonical detail actions render in the fixed drawer footer: PASS");
