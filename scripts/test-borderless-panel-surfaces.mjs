import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/borderless-panel-content-final.css", "utf8");

assert.match(main, /borderless-panel-content-final\.css/, "the final borderless surface contract must be loaded");
assert.ok(main.lastIndexOf("borderless-panel-content-final.css") > main.lastIndexOf("search-intent-glass-surface-final.css"), "the surface contract must load after legacy locks");
for (const root of [".dp-map-panel", ".dp-resident-home", ".dp-partner-workspace-page", ".dp-admin-shell"]) {
  assert.ok(styles.includes(root), `missing panel root: ${root}`);
}
for (const rule of [
  "border-color: transparent !important;",
  "background-color: var(--dp-panel-white) !important;",
  "background-image: none !important;",
  "box-shadow: none !important;",
  "outline: 2px solid #c8a96a !important;",
]) assert.ok(styles.includes(rule), `missing surface rule: ${rule}`);
assert.match(styles, /\.dp-resident-qr-frame/, "QR structure must be explicitly protected");
assert.match(styles, /:focus-visible/, "keyboard focus must remain visible");

console.log("Borderless bright-white panel surface contract: PASS");
