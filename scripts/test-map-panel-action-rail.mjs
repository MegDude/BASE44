import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const perkVisibility = readFileSync("src/styles/perk-action-visibility-final.css", "utf8");
const marker = "Every map listing, perk, event, campaign, and route drawer uses one compact";
const railStart = styles.indexOf(marker);
const railEnd = styles.indexOf("Partner workspace governance", railStart);
const railLock = styles.slice(railStart, railEnd);
const styleImports = main.match(/^import "@\/styles\/[^\"]+"$/gm) || [];

assert.ok(railLock.startsWith(marker), "Shared map-panel action rail lock is missing");
assert.equal(
  styleImports.at(-1),
  'import "@/styles/perk-action-visibility-final.css"',
  "Perk visibility correction must remain the final stylesheet",
);
assert.ok(
  main.indexOf('import "@/styles/interface-density-regression-lock.css"') <
    main.indexOf('import "@/styles/perk-action-visibility-final.css"'),
  "Perk visibility correction must load after the shared density lock",
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

assert.match(perkVisibility, /\.dp-perk-action-row\s*\{[\s\S]*?display:\s*grid\s*!important;/, "Perk actions are not restored to a visible grid");
assert.match(perkVisibility, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)\s*!important;/, "Perk actions do not use the two-column desktop layout");
assert.match(perkVisibility, /overflow:\s*visible\s*!important;/, "Perk actions can still hide the QR control off-canvas");
assert.match(perkVisibility, /\.dp-perk-cta\.is-secondary\s*\{[\s\S]*?grid-column:\s*1 \/ -1\s*!important;/, "Secondary Show QR action is not guaranteed a visible full-width row");
assert.match(perkVisibility, /@media \(max-width: 440px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)\s*!important;/, "Perk actions do not collapse safely on narrow screens");

const railSpecificity = Math.max(...[...railLock.matchAll(/([^{}]+)\{/g)].map((match) => (match[1].match(/#root/g) || []).length));
const correctionSpecificity = Math.max(...[...perkVisibility.matchAll(/([^{}]+)\{/g)].map((match) => (match[1].match(/#root/g) || []).length));
assert.ok(railSpecificity >= 101, "Panel action rail can be overridden by legacy high-specificity styles");
assert.ok(correctionSpecificity > railSpecificity, "Perk visibility correction cannot override the high-specificity rail lock");

console.log("Map actions keep the compact rail while resident Show QR remains visibly discoverable: PASS");
