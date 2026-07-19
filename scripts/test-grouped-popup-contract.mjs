import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const sharedStyles = readFileSync("src/styles/partner-activity-drawer-final.css", "utf8");
const residentStyles = readFileSync("src/styles/map-drawer-containment-final.css", "utf8");

const drawer = map.slice(
  map.indexOf('{clusterDrawer && urlState.tab === "map"'),
  map.indexOf("{selected && !selectedDrawerClosed", map.indexOf('{clusterDrawer && urlState.tab === "map"')),
);

assert.ok(drawer.length > 0, "Grouped places drawer is missing");
assert.doesNotMatch(drawer, /dp-panel-eyebrow/, "Grouped drawer restores the repetitive eyebrow");
assert.match(drawer, /getClusterTitle\(clusterDrawer, urlState\.mode\)/, "Grouped drawer title is missing");
assert.match(drawer, /getClusterSubtitle\(clusterDrawer, urlState\.mode\)/, "Grouped drawer guidance is missing");
assert.match(map, /return `\$\{count\} \$\{count === 1 \? "result" : "results"\} · Tap one to see details`;/, "Nearby result copy is repetitive or unclear");
assert.match(map, /dangerouslySetInnerHTML=\{\{ __html: getCanonicalMapGlyph\(pin\) \}\}/, "Grouped rows do not use the canonical pin language");

assert.match(sharedStyles, /\[aria-label="Grouped map places"\][\s\S]*?\.dp-panel-title[\s\S]*?font-size:\s*16px\s*!important;/, "Grouped header title is oversized");
assert.match(sharedStyles, /\.dp-grouped-status[\s\S]*?color:\s*#B08A3F\s*!important;[\s\S]*?font-size:\s*10px\s*!important;[\s\S]*?text-decoration:\s*none\s*!important;[\s\S]*?text-transform:\s*uppercase\s*!important;/, "Grouped row actions do not use the compact gold action style");
assert.match(residentStyles, /grid-template-columns:\s*24px minmax\(0, 1fr\) auto\s*!important;/, "Mobile grouped rows do not keep their action on one line");
assert.doesNotMatch(residentStyles, /\.dp-grouped-status\s*\{[\s\S]{0,180}grid-column:\s*2\s*!important;/, "Mobile grouped actions drop below the row copy");

console.log("Grouped nearby popup uses concise copy, compact type, canonical icons, and gold actions: PASS");
