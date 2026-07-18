import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const markerSource = await readFile(new URL("../src/map/MarkerManager.ts", import.meta.url), "utf8");
const markerCss = await readFile(new URL("../src/styles/map-marker-governance-final.css", import.meta.url), "utf8");
const iconRegistry = await readFile(new URL("../src/lib/map/mapIconRegistry.ts", import.meta.url), "utf8");
const pinResolver = await readFile(new URL("../src/lib/map/entityPinResolver.ts", import.meta.url), "utf8");

assert.match(mapSource, /clusterPlaces\(activeCollectionRoute\.stops, stableClusterZoom, selectedId\)/, "route stops must use collision-safe clustering");
assert.match(mapSource, /clusterPlaces\(mappablePlaces, stableClusterZoom, selectedId\)/, "focused results must use collision-safe clustering");
assert.doesNotMatch(mapSource, /shouldShowIndividualPins\s*\?\s*mappablePlaces\.map/, "focused searches must not bypass clustering");
assert.match(markerSource, /OPTIONAL_AND_HIDES_LOWER_PRIORITY/, "advanced markers must hide lower-priority collisions");
assert.match(markerSource, /zIndex/, "selected and approved brand markers must have stable priority");
assert.match(markerCss, /\.dp-map-pin[\s\S]*?border:\s*0\s*!important;[\s\S]*?background:\s*transparent\s*!important;/, "marker buttons must be borderless and transparent");
assert.match(markerCss, /dp-live-pin--inkind-logo/, "inKind must use the approved direct logo treatment");
assert.match(markerCss, /dp-live-pin--legends-logo/, "Legends must retain its approved direct logo treatment");
const legacyMarkerSource = mapSource.slice(
  mapSource.indexOf("function legacyDowntownMarkerIcon"),
  mapSource.indexOf("function legacyDowntownClusterIcon"),
);
assert.doesNotMatch(legacyMarkerSource, /<circle\b/, "legacy listing pins must not restore a circular plate or number badge");
assert.match(legacyMarkerSource, /pin\.asset/, "legacy markers must render canonical uploaded pin artwork");
assert.match(iconRegistry, /INKIND_PIN_ASSET = `\$\{PARTNER_PIN_ROOT\}\/inkind\.png`/, "all map adapters must share the approved inKind pin artwork");
assert.doesNotMatch(iconRegistry, /coffee:\s*artwork\(/, "ordinary coffee places must use the canonical map glyph, not campaign artwork");
assert.doesNotMatch(iconRegistry, /nightlife:\s*artwork\(/, "ordinary drinks places must use the canonical map glyph, not campaign artwork");
assert.doesNotMatch(iconRegistry, /property:\s*artwork\(/, "ordinary properties must use the canonical map glyph, not campaign artwork");
assert.doesNotMatch(iconRegistry, /retail:\s*artwork\(/, "ordinary retail places must use the canonical map glyph, not campaign artwork");
assert.match(iconRegistry, /inkind:\s*artwork\(/, "approved inKind campaign entities must retain their supplied artwork");
assert.match(iconRegistry, /dana:\s*artwork\(/, "approved DANA campaign entities must retain their supplied artwork");
assert.match(iconRegistry, /"fine-eyewear":\s*artwork\(/, "approved Fine Eyewear campaign entities must retain their supplied artwork");
assert.match(iconRegistry, /RIVIAN_PIN_ASSET/, "Rivian entities must use the uploaded Rivian pin artwork");
assert.doesNotMatch(pinResolver, /Math\.random|crypto\.getRandomValues|randomUUID/, "map icon selection must never be random");
assert.match(pinResolver, /\(fallbackByType\.includes\("civic"\) \? "civic" : ""\) \|\|\s*"default";/, "unknown entities must use the neutral canonical map pin");
assert.doesNotMatch(pinResolver, /\|\|\s*"guide";/, "unknown entities must not receive an unrelated guide icon");

console.log("Borderless map marker checks passed.");
