import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Search console utility rail: Resident, Partner, and Ask the Map";
const start = styles.indexOf(marker);
const end = styles.indexOf("Platform overlay surface terminal authority", start);
const lock = styles.slice(start, end);

assert.ok(lock.startsWith(marker), "Search console utility rail style lock is missing");
assert.match(map, /className="dp-search-intent-utility-rail"/);
assert.match(map, />\s*Resident\s*<\/button>/);
assert.match(map, />\s*Partner\s*<\/button>/);
assert.match(map, /className="dp-search-intent-ask-map"[\s\S]*?>\s*Ask the Map\s*<\/button>/);
assert.match(map, /inputRef\?\.current\?\.focus\?\.\(\)/, "Ask the Map does not focus the shared search field");
assert.match(map, /id="dp-ask-map-search-input"/, "Shared search field is not addressable");
assert.match(lock, /justify-content:\s*flex-end\s*!important;/, "Utility rail is not aligned to the top right");
assert.match(lock, /flex-flow:\s*row nowrap\s*!important;/, "Utility actions can wrap onto another line");
assert.match(lock, /font-size:\s*10px\s*!important;/, "Utility labels do not use the compact text scale");
assert.match(lock, /text-transform:\s*uppercase\s*!important;/, "Utility labels are not uppercase");
assert.match(lock, /color:\s*#b08a3f\s*!important;/i, "Utility labels do not use the approved gold");
const radii = [...lock.matchAll(/border-radius:\s*([^;]+)!important/g)].map((match) => match[1].trim());
assert.ok(radii.length > 0, "Utility rail does not explicitly lock control radii");
assert.ok(radii.every((value) => value === "0"), "Utility rail restores pill-shaped controls");

console.log("Search console shows Resident, Partner, and Ask the Map in one compact gold utility rail: PASS");
