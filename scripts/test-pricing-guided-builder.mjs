import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, styles, entry] = await Promise.all([
  readFile(new URL("../src/pages/Pricing.jsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/pricing-page-finish.css", import.meta.url), "utf8"),
  readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
]);

assert.match(page, /className="dp-pricing-role-list" role="radiogroup" aria-label="Partner type"/, "partner types must use the accessible radio-grid contract");
assert.match(page, /role="radio" aria-checked=\{partnerType === value\}/, "each partner type must expose selected state");
assert.match(page, /\{ value: "Civic", label: "Community" \}/, "the civic registry value must use the requested Community label");
assert.doesNotMatch(page, /<select value=\{partnerType\}/, "the superseded partner dropdown must be removed");
assert.match(page, /dp-pricing-support/, "pricing must provide an interactive support module");
assert.match(page, /to="\/contact\?topic=partner-demo"/, "support must include a working demo route");
assert.match(styles, /\.dp-pricing-role-list\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s, "partner types must use three columns on wider screens");
assert.match(styles, /@media \(max-width: 767px\)[\s\S]*\.dp-pricing-role-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s, "partner types must use two columns at the 300px mobile surface");
assert.match(styles, /\.dp-pricing-guided-layout[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+300px/s, "desktop review rail must remain sticky alongside the journey");
assert.match(styles, /@media \(max-width: 767px\)[\s\S]*\.dp-pricing-guided-layout\s*\{\s*display:\s*block/s, "mobile must collapse to a single column");
assert.match(entry, /pricing-page-finish\.css/, "the final pricing stylesheet must be loaded");

console.log("Pricing guided builder contract passed.");
