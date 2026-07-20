import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Resident Home surface selectors are the platform-wide overlay contract";
const lockStart = styles.indexOf(marker);
const lockEnd = styles.indexOf("Resident Home owns one continuous bright-white plane", lockStart);
const sharedOverlayLock = styles.slice(lockStart, lockEnd);

assert.ok(sharedOverlayLock.startsWith(marker), "Shared white overlay-surface lock is missing");
assert.equal(
  (main.match(/^import "@\/styles\/[^\"]+"$/gm) || []).at(-1),
  'import "@/styles/borderless-panel-content-final.css"',
  "The borderless panel content lock must remain the final surface authority",
);

assert.match(
  main,
  /interface-density-regression-lock\.css"[\s\S]*search-intent-glass-surface-final\.css"[\s\S]*borderless-panel-content-final\.css"/,
  "The borderless content authority must follow the shared overlay and search console locks",
);

for (const selector of [
  ".dp-panel-shell",
  ".dp-map-drawer-shell",
  ".dp-mobile-tab-drawer",
  ".dp-active-perks-sheet",
  ".dp-route-experience-sheet",
  ".dp-collection-route-panel",
  ".dp-map-popup",
  ".dp-pin-popover",
  ".leaflet-popup-content-wrapper",
  ".dp-workspace-sheet",
  ".dp-workspace-search-sheet",
]) {
  assert.ok(sharedOverlayLock.includes(selector), `Shared white surface does not cover ${selector}`);
}

assert.match(sharedOverlayLock, /background:\s*#ffffff\s*!important;/, "Overlay shells do not own a bright-white plane");
assert.match(sharedOverlayLock, /background:\s*transparent\s*!important;/, "Nested content does not collapse into the parent plane");
assert.match(sharedOverlayLock, /\[data-radix-popper-content-wrapper\][\s\S]*?box-shadow:\s*none\s*!important;/, "Portal popovers can still render elevated chrome");
assert.match(sharedOverlayLock, /\.leaflet-popup-tip[\s\S]*?background:\s*#ffffff\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/, "Pin popup tip does not match the shared surface");
const shadowValues = [...sharedOverlayLock.matchAll(/box-shadow:\s*([^;]+)!important/g)].map((match) => match[1].trim());
assert.ok(shadowValues.length > 0 && shadowValues.every((value) => value === "none"), "Shared overlay lock introduces a shadow or glow");
assert.match(styles, /Platform overlay surface terminal authority[\s\S]*?\.dp-workspace-sheet\.dp-workspace-sheet :is\([\s\S]*?background:\s*transparent\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;[\s\S]*?filter:\s*none\s*!important;\s*\}\s*$/, "Shared overlay authority is not the final CSS rule");

console.log("Resident and partner panels, drawers, pin details, and popovers share one bright-white surface: PASS");
