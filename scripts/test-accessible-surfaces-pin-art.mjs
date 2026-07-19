import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/styles/accessibility-pin-art-final.css", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const registry = await readFile(new URL("../src/lib/map/mapIconRegistry.ts", import.meta.url), "utf8");
const map = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const markerFactory = await readFile(new URL("../src/components/map/markers/MarkerFactory.jsx", import.meta.url), "utf8");
const markerCss = await readFile(new URL("../src/styles/map-marker-governance-final.css", import.meta.url), "utf8");

assert.match(css, /dp-native-mobile-attention h2[\s\S]*?-webkit-text-fill-color:\s*#ffffff/, "dark attention surfaces must force readable white heading text");
assert.match(css, /dp-native-mobile-attention > span[\s\S]*?-webkit-text-fill-color:\s*rgba\(255, 255, 255, 0\.86\)/, "attention supporting copy must remain readable after global text rules");
assert.doesNotMatch(css, /--dp-premium-pin-(?:width|height):\s*(?:50|66)px/, "selected partner artwork must not change marker size");
assert.match(map, /function getZoomMarkerMetrics[\s\S]*?const pinSize = 32;/, "Google map pins must share the canonical 32px footprint");
assert.match(markerFactory, /default:\s*32,[\s\S]*?building:\s*32,[\s\S]*?selected:\s*1,/, "Leaflet pins must retain the same footprint across entity and selection states");
assert.doesNotMatch(markerFactory, /pin\.asset|createArtworkMarker/, "Leaflet markers must use category glyphs instead of irregular artwork");
assert.match(markerFactory, /getCanonicalMapGlyph\(pin\)/, "uploaded artwork records must resolve to the shared category glyph language");
assert.match(markerCss, /\.dp-live-pin__premium-art[\s\S]*?display:\s*none\s*!important/, "uploaded artwork must not override the shared visual language");
assert.doesNotMatch(workspace, /activity\.map\([\s\S]{0,300}<i\b/, "activity rows must not use unexplained decorative dots");
assert.match(workspace, /activity\.map\(\(\[Icon, title, description, (?:time|status)\]\)/, "activity rows must render meaningful icons");

const assets = [
  "inkind.png",
  "boots.png",
  "coffee.png",
  "beer.png",
  "fine-eyewear.png",
  "dana.png",
  "condo-building.png",
  "rivian.png",
];

await Promise.all(assets.map((asset) => access(new URL(`../public/pins/downtown-perks/partners/${asset}`, import.meta.url))));
for (const asset of assets) {
  assert.match(registry, new RegExp(asset.replace(".", "\\.")), `${asset} must be registered in the canonical marker system`);
}

console.log("Accessible surface and premium pin artwork checks passed.");
