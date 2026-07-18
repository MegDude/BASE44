import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const map = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const registry = await readFile(new URL("../src/lib/map/mapIconRegistry.ts", import.meta.url), "utf8");
const recoveryStyles = await readFile(new URL("../src/styles/dp-recovery-final.css", import.meta.url), "utf8");
const canonicalDetailStyles = await readFile(new URL("../src/styles/canonical-detail-panel-final.css", import.meta.url), "utf8");
const canonicalSurfaceStyles = await readFile(new URL("../src/styles/canonical-surface-system.css", import.meta.url), "utf8");

assert.doesNotMatch(map, /className="dp-map-detail-share"/, "detail headers must keep Share out of the Back/Close control rail");
assert.match(canonicalDetailStyles, /grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;/, "detail headers must reserve only Back, title, and Close columns");
assert.match(canonicalSurfaceStyles, /grid-template-columns:\s*44px minmax\(0, 1fr\) 44px !important;/, "the shared surface lock must preserve the three-column detail header");
assert.match(recoveryStyles, /\.dp-inkind-resident-drawer > \* \{\s*order:\s*initial !important;/, "inKind venue drawers must preserve their canonical DOM order");

for (const key of ["coffee", "nightlife", "property", "residential", "building", "listing", "retail"]) {
  assert.doesNotMatch(registry, new RegExp(`${key}:\\s*artwork\\(`), `${key} must use the canonical place-pin glyph`);
}
for (const key of ["inkind", "dana", '"fine-eyewear"', "rivian"]) {
  assert.match(registry, new RegExp(`${key}:\\s*artwork\\(`), `${key} must retain its approved campaign artwork`);
}

console.log("Via 313 panel order and canonical campaign pin scope: PASS");
