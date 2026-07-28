import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/map-drawer-single-line-titles-final.css", "utf8");
const identity = readFileSync("src/components/map/unified/EntityIdentityPanel.tsx", "utf8");
const canonical = readFileSync("src/components/map/CanonicalDetailPanel.jsx", "utf8");

const titleContractIndex = main.indexOf('import "@/styles/map-drawer-single-line-titles-final.css"');
const broadPanelContractIndex = main.indexOf('import "@/styles/platform-panel-mobile-cohesion-final.css"');
assert.ok(titleContractIndex > broadPanelContractIndex, "The universal title contract must load after broad panel typography");

for (const selector of [
  ".dp-map-detail-navigation-title",
  ".dp-entity-title",
  ".dp-destination-title",
  ".dp-detail-title",
  ".dp-map-panel-title",
  ".dp-native-detail-panel__summary > h2",
  ".dp-entity-panel-header > h2",
  ".dp-entity-summary > h2",
  ".dp-panel-detail-identity > h2",
]) {
  assert.ok(styles.includes(selector), `Universal title contract does not cover ${selector}`);
}

assert.match(styles, /white-space:\s*nowrap\s*!important/, "Primary drawer titles can still wrap");
assert.match(styles, /text-overflow:\s*ellipsis\s*!important/, "Long drawer titles do not fail gracefully");
assert.match(styles, /font-size:\s*clamp\(15px,\s*4\.6vw,\s*23px\)/, "Mobile-first responsive title sizing is missing");
assert.match(styles, /@media \(min-width:\s*768px\)/, "Desktop title adaptation is missing");
assert.match(identity, /title=\{identity\.displayTitle\}/, "Unified entity titles do not expose their full value");
assert.match(canonical, /title=\{model\.title\}/, "Canonical panel titles do not expose their full value");

console.log("Every map drawer primary title uses the shared one-line responsive contract: PASS");
