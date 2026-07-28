import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/universal-entity-drawer-final.css", "utf8");
const mapSource = readFileSync("src/pages/Map.jsx", "utf8");

assert.match(main, /import "@\/styles\/universal-entity-drawer-final\.css"/, "Universal action-rail stylesheet is not loaded");
assert.ok(
  main.lastIndexOf("styles/universal-entity-drawer-final.css") > main.lastIndexOf("styles/detail-panel-fixed-actions-final.css"),
  "Universal action rail must load after legacy fixed-action rules",
);
for (const selector of [".dp-perk-action-row", ".dp-entity-action-row", ".dp-primary-action-row", ".dp-map-detail-actions", ".dp-partner-destination-actions"]) {
  assert.ok(styles.includes(selector), `Shared action rail does not suppress duplicate ${selector}`);
}
assert.match(styles, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, "Action rail must cap persistent actions at three");
assert.match(styles, /min-height:\s*48px/, "Panel actions must exceed the 44px touch target");
assert.match(styles, /env\(safe-area-inset-bottom,\s*0px\)/, "Action footer must respect the iPhone safe area");
assert.match(styles, /overflow-x:\s*hidden/, "The action architecture must not introduce a horizontal scrollbar");
assert.match(styles, /:focus-visible[\s\S]*?outline:/, "Panel actions must retain visible keyboard focus");
assert.match(mapSource, /function UniversalEntityActionRail/, "The shared audience-aware action component is missing");
assert.match(mapSource, /mode === "partner"/, "Partner action presentation is missing");
assert.match(mapSource, /Show QR/, "Perk actions must keep redemption separate from saving");
assert.match(mapSource, /Explore property/, "Property actions must use property language");
assert.match(mapSource, /<NativeDrawerShell[\s\S]*id="dp-active-map-drawer"/, "The selected entity must use the shared native drawer shell");

console.log("Map entity drawers use one fixed, three-action, audience-aware rail: PASS");
