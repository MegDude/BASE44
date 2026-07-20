import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const styles = readFileSync("src/styles/search-intent-glass-surface-final.css", "utf8");

assert.match(map, /className="dp-search-intent-top-actions"[\s\S]*className="dp-search-intent-ask-map"[\s\S]*className="dp-search-intent-header-controls"/, "Ask the Map is not the left-most header action");
assert.match(map, /className="dp-search-intent-header-controls"[\s\S]*renderModeSwitch\(\)[\s\S]*className="dp-search-intent-collapse/, "Audience switcher and collapse control are not grouped on the right");
assert.match(map, />\s*Resident\s*<\/button>/);
assert.match(map, />\s*Partner\s*<\/button>/);
assert.match(map, /className="dp-search-intent-ask-map"[\s\S]*?>\s*Ask the Map\s*<\/button>/);
assert.match(map, /inputRef\?\.current\?\.focus\?\.\(\)/, "Ask the Map does not focus the shared search field");
assert.match(map, /id="dp-ask-map-search-input"/, "Shared search field is not addressable");
assert.match(styles, /grid-template-columns:\s*auto minmax\(0, 1fr\)\s*!important;/, "Header does not reserve left and right alignment regions");
assert.match(styles, /\.dp-search-intent-ask-map[\s\S]*?justify-self:\s*start\s*!important;/, "Ask the Map is not aligned to the left margin");
assert.match(styles, /\.dp-search-intent-header-controls[\s\S]*?justify-self:\s*end\s*!important;/, "Switcher and collapse control are not aligned to the right margin");
assert.match(styles, /flex-flow:\s*row nowrap\s*!important;/, "Right-side controls can wrap onto another line");
assert.match(styles, /font:\s*720 10px\/1 Inter[^;]+!important;/, "Utility labels do not use the compact text scale");
assert.match(styles, /text-transform:\s*uppercase\s*!important;/, "Utility labels are not uppercase");
assert.match(styles, /color:\s*#b08a3f\s*!important;/i, "Utility labels do not use the approved gold");
assert.match(styles, /\.dp-search-intent-switch\.dp-search-intent-audience-tabs \{[\s\S]*?border-radius:\s*0\s*!important;/, "Audience switcher restores a pill-shaped container");
assert.match(styles, /\.dp-search-intent-switch\.dp-search-intent-audience-tabs > button \{[\s\S]*?border-radius:\s*0\s*!important;/, "Audience switcher restores pill-shaped controls");

console.log("Search console aligns Ask the Map left and audience controls right on one row: PASS");
