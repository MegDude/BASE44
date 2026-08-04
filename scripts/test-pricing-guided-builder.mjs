import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, styles, entry] = await Promise.all([
  readFile(new URL("../src/pages/Pricing.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/pricing-page-finish.css", import.meta.url), "utf8"),
  readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
]);

assert.match(page, /<select value=\{partnerType\} onChange=\{\(event\) => choosePartner\(event\.target\.value\)\}>/, "partner type must use the native select contract");
assert.doesNotMatch(page, /dp-pricing-role-list/, "the superseded role button grid must be removed");
assert.match(page, /dp-pricing-support/, "pricing must provide an interactive support module");
assert.match(page, /to="\/contact\?topic=partner-demo"/, "support must include a working demo route");
assert.match(styles, /\.dp-pricing-guided-layout[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+300px/s, "desktop review rail must remain sticky alongside the journey");
assert.match(styles, /@media \(max-width: 767px\)[\s\S]*\.dp-pricing-guided-layout\s*\{\s*display:\s*block/s, "mobile must collapse to a single column");
assert.match(entry, /pricing-page-finish\.css/, "the final pricing stylesheet must be loaded");

console.log("Pricing guided builder contract passed.");
