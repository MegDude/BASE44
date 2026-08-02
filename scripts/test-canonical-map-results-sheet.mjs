import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const css = readFileSync("src/styles/canonical-map-results-sheet.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");
const drawer = map.slice(
  map.indexOf('{clusterDrawer && urlState.tab === "map"'),
  map.indexOf("{selected && !selectedDrawerClosed", map.indexOf('{clusterDrawer && urlState.tab === "map"')),
);

assert.match(map, /function hasCanonicalMapResultIdentity/, "results must require a canonical ID and coordinates");
assert.match(map, /places\.filter\(hasCanonicalMapResultIdentity\)/, "cluster rows must exclude non-canonical records");
assert.match(map, /function getCanonicalMapResultRow/, "rows must expose the canonical result presentation contract");
assert.match(drawer, /data-canonical-entity-id=\{resultRow\.entityId\}/, "visible rows must expose a canonical entity ID");
assert.match(drawer, /data-source-updated-at=\{resultRow\.sourceUpdatedAt/, "visible rows must expose their source freshness when available");
assert.match(drawer, /<ChevronRight/, "rows must use disclosure, not a generic Open action");
assert.doesNotMatch(drawer, /\{listing \? "Contact" : "Open"\}/, "rows cannot restore generic actions");
assert.match(css, /overflow-y:\s*auto\s*!important/, "the sheet must retain one internal scroll surface");
assert.match(css, /env\(safe-area-inset-bottom/, "mobile clearance must include the safe area");
assert.match(css, /@media \(min-width: 768px\)/, "desktop must use a side results rail");
assert.match(main, /canonical-map-results-sheet\.css/, "the canonical results stylesheet must load last");

console.log("Canonical map results sheet contract: PASS");
