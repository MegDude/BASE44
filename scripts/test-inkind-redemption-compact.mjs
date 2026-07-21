import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const css = readFileSync("src/styles/inkind-redemption-compact-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(map, /<li><span aria-hidden="true">1<\/span><h3>Open benefit<\/h3><p>/, "Step one is not a compact horizontal row");
assert.match(map, /<li><span aria-hidden="true">3<\/span><h3>Redeem<\/h3><p>/, "Step three is not a compact horizontal row");
assert.match(map, /dp-inkind-before-you-go-inline/, "Before-you-go guidance is not consolidated");
assert.doesNotMatch(map, /<DestinationSection title="Before you go">/, "The separate Before you go section still increases scrolling");
assert.match(css, /grid-template-columns:\s*24px 82px minmax\(0, 1fr\)/, "Redemption rows are not aligned on one line");
assert.match(css, /li > span[\s\S]*?font-size:\s*17px/, "Step numbers remain too small");
const inKindStyleIndex = main.indexOf('import "@/styles/inkind-redemption-compact-final.css"');
const searchStyleIndex = main.indexOf('import "@/styles/search-input-rail-compact-final.css"');
assert.ok(inKindStyleIndex > 0 && searchStyleIndex > inKindStyleIndex, "Compact inKind authority must remain in the final scoped stylesheet group");

console.log("inKind redemption rows are compact, legible, and consolidated: PASS");
