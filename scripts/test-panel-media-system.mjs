import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/panel-media-system-final.css", "utf8");
const map = readFileSync("src/pages/Map.jsx", "utf8");
const canonicalPanel = readFileSync("src/components/map/CanonicalDetailPanel.jsx", "utf8");
const routeSheet = readFileSync("src/components/map/route/RouteExperienceSheet.tsx", "utf8");

assert.match(main, /panel-media-system-final\.css/, "the canonical media contract must be loaded");
assert.ok(
  main.lastIndexOf("panel-media-system-final.css") > main.lastIndexOf("global-back-control-final.css"),
  "the media contract must load after legacy panel styles",
);

for (const selector of [
  ".dp-destination-hero-media",
  ".dp-native-detail-panel__hero",
  ".dp-partner-drawer-media",
  ".dp-route-hero",
  ".dp-active-perk-media",
  ".dp-nearby-image-media",
  ".dp-tab-discovery-media",
  ".dp-saved-card-media",
  ".dp-daa-video-card",
]) {
  assert.ok(styles.includes(selector), `missing media surface: ${selector}`);
}

for (const rule of [
  "background: #fff !important;",
  "object-fit: cover !important;",
  "vertical-align: middle !important;",
  "transform: translateZ(0);",
  "aspect-ratio: 16 / 9 !important;",
]) {
  assert.ok(styles.includes(rule), `missing polished media rule: ${rule}`);
}

assert.match(canonicalPanel, /onError=\{handlePanelMediaError\}/, "canonical detail media needs a fallback");
assert.match(routeSheet, /onError=\{handlePanelMediaError\}/, "route media needs a fallback");
assert.match(map, /dp-daa-art-image-card[\s\S]{0,320}onError=\{handlePanelImageError\}/, "editorial image rails need a fallback");

console.log("Panel media system: shared crop, white surface, seam prevention, and fallbacks verified");
