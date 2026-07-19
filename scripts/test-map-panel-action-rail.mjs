import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Every map listing, perk, event, campaign, and route drawer uses one compact";
const railStart = styles.indexOf(marker);
const railEnd = styles.indexOf("Partner workspace governance", railStart);
const railLock = styles.slice(railStart, railEnd);

assert.ok(railLock.startsWith(marker), "Shared map-panel action rail lock is missing");
assert.equal(
  (main.match(/^import "@\/styles\/[^"]+"$/gm) || []).at(-1),
  'import "@/styles/interface-density-regression-lock.css"',
  "Map-panel action rail must remain in the final stylesheet",
);
for (const selector of [".dp-perk-action-row", ".dp-entity-action-row", ".dp-primary-action-row", ".dp-route-primary-actions", ".dp-stop-actions"]) {
  assert.ok(railLock.includes(selector), `Shared action rail does not cover ${selector}`);
}
assert.match(railLock, /flex-flow:\s*row nowrap\s*!important;/, "Panel actions are allowed to wrap");
assert.match(railLock, /overflow-x:\s*auto\s*!important;/, "Panel action rail cannot safely scroll on narrow screens");
assert.match(railLock, /font:\s*680 11px\/1/, "Panel actions do not use the compact label scale");
assert.match(railLock, /text-transform:\s*uppercase\s*!important;/, "Panel actions are not consistently uppercase");
assert.match(railLock, /text-decoration:\s*none\s*!important;/, "Panel actions can still show underlines");
assert.match(railLock, /color:\s*#b08a3f\s*!important;/, "Panel interaction state does not use the approved gold");
assert.match(railLock, /:focus-visible[\s\S]*?outline:\s*2px solid rgba\(200, 169, 106, 0\.72\)/, "Panel actions do not retain visible keyboard focus");
const actionSelectorSpecificity = Math.max(...[...railLock.matchAll(/([^{}]+)\{/g)].map((match) => (match[1].match(/#root/g) || []).length));
assert.ok(actionSelectorSpecificity >= 101, "Panel action rail can be overridden by legacy high-specificity styles");

console.log("Map listing and drawer actions use one compact uppercase gold-feedback rail: PASS");
