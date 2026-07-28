import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapSource = readFileSync("src/pages/Map.jsx", "utf8");
const css = readFileSync("src/styles/search-intent-label-contrast-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(mapSource, /const expanded = true;/, "Every primary and secondary intent must render its visible label");
assert.match(mapSource, /dp-compact-intent-chip__icon/, "Intent icon wrapper is missing");
assert.match(mapSource, /dp-compact-intent-chip__label/, "Intent text label is missing");
assert.match(css, /color:\s*#0b1f33\s*!important/, "Intent labels must use readable navy text");
assert.match(css, /stroke:\s*currentColor\s*!important/, "Intent icons must inherit the governed readable color");
assert.match(css, /min-height:\s*44px\s*!important/, "Intent controls must retain a 44px touch target");
assert.match(css, /block-size:\s*44px\s*!important/, "Legacy chip heights must not reduce the 44px touch target");
assert.match(css, /prefers-contrast:\s*more/, "High-contrast users need an explicit icon and label rule");
assert.ok(
  main.indexOf('import "@/styles/search-intent-label-contrast-final.css"')
    > main.indexOf('import "@/styles/universal-entity-drawer-final.css"'),
  "Search intent contrast must load after the universal drawer layer",
);

console.log("Every search intent keeps a readable navy icon and text label: PASS");
