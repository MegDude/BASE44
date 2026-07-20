import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const styles = readFileSync("src/styles/search-intent-glass-surface-final.css", "utf8");
const marker = "MAP DRAWERS AND POPUPS — SHARED DENSE-WHITE GLASS";
const contract = styles.slice(styles.indexOf(marker));
const configureStart = map.indexOf("const configureMobilePanelSurface");
const configureEnd = map.indexOf("useEffect(() => {", configureStart);
const configureContract = map.slice(configureStart, configureEnd);
const geometryStart = configureContract.indexOf("const panelGeometry = {");
const geometryEnd = configureContract.indexOf("};", geometryStart);
const geometryContract = configureContract.slice(geometryStart, geometryEnd);

assert.ok(contract.startsWith(marker), "Shared drawer glass contract must remain in the final glass stylesheet");

for (const selector of [
  ".dp-map-detail-sheet",
  ".dp-active-perks-sheet",
  ".dp-route-experience-sheet",
  ".dp-collection-route-panel",
  ".dp-map-list-drawer",
  ".dp-cluster-drawer",
  ".dp-map-popup",
  ".dp-pin-popover",
  '[data-mobile-panel-surface="true"]',
]) {
  assert.ok(contract.includes(selector), `Shared glass contract must cover ${selector}`);
}

for (const declaration of [
  "background: rgba(255, 255, 255, 0.92) !important;",
  "border: 1px solid rgba(11, 31, 51, 0.1) !important;",
  "backdrop-filter: blur(26px) saturate(135%) !important;",
  "0 -18px 48px rgba(11, 31, 51, 0.13)",
  "background: rgba(255, 255, 255, 0.98) !important;",
]) {
  assert.ok(contract.includes(declaration), `Shared drawer glass contract must preserve ${declaration}`);
}

assert.doesNotMatch(contract, /linear-gradient|radial-gradient/, "Drawer glass must not introduce a gradient");
assert.doesNotMatch(configureContract, /setProperty\("border(?:-radius)?"|setProperty\("box-shadow"/, "Runtime geometry must not erase the governed drawer glass");
assert.doesNotMatch(geometryContract, /^\s*(?:border|"border-radius"|"box-shadow"):\s*"/m, "Panel geometry must not own glass surface properties");
assert.match(configureContract, /background:\s*"transparent"/, "Panel headers must reveal the shared glass shell");

console.log("Map drawers and popups share the dense-white glass surface: PASS");
