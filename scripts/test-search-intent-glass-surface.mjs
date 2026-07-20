import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/search-intent-glass-surface-final.css", "utf8");

assert.match(map, /data-has-results=\{showCatalogResults \? "true" : "false"\}/, "Result-aware surface state is missing");
assert.match(main, /interface-density-regression-lock\.css"[\s\S]*search-intent-glass-surface-final\.css"/, "Glass surface must load after global density locks");
assert.match(styles, /background:\s*rgba\(255, 255, 255, 0\.945\)\s*!important/, "Focused glass surface is not opaque enough");
assert.match(styles, /backdrop-filter:\s*blur\(28px\) saturate\(140%\)\s*!important/, "Result state lacks the stronger blur");
assert.match(styles, /\.dp-platform-search-results\.dp-platform-search-results[\s\S]*background:\s*rgba\(255, 255, 255, 0\.78\)\s*!important/, "Results do not own an opaque-enough surface");
assert.match(styles, /\.dp-platform-search-group > h3[\s\S]*text-transform:\s*none\s*!important/, "Result headings still permit uppercase treatment");
assert.match(styles, /\.dp-search-intent-input-row\.dp-search-intent-input-row[\s\S]*background:\s*rgba\(255, 255, 255, 0\.985\)\s*!important/, "Search field is not the strongest internal surface");
assert.match(styles, /\.dp-search-intent-switch\.dp-search-intent-audience-tabs[\s\S]*display:\s*inline-flex\s*!important/, "Audience switcher is not restored in the final cascade");
assert.doesNotMatch(styles, /linear-gradient|radial-gradient/, "Search console introduces a prohibited gradient");

console.log("Search console uses one legible glass surface with protected results: PASS");
