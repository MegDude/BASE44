import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const markerSource = await readFile(new URL("../src/map/MarkerManager.ts", import.meta.url), "utf8");
const markerCss = await readFile(new URL("../src/styles/map-marker-governance-final.css", import.meta.url), "utf8");

assert.match(mapSource, /clusterPlaces\(activeCollectionRoute\.stops, stableClusterZoom, selectedId\)/, "route stops must use collision-safe clustering");
assert.match(mapSource, /clusterPlaces\(mappablePlaces, stableClusterZoom, selectedId\)/, "focused results must use collision-safe clustering");
assert.doesNotMatch(mapSource, /shouldShowIndividualPins\s*\?\s*mappablePlaces\.map/, "focused searches must not bypass clustering");
assert.match(markerSource, /OPTIONAL_AND_HIDES_LOWER_PRIORITY/, "advanced markers must hide lower-priority collisions");
assert.match(markerSource, /zIndex/, "selected and approved brand markers must have stable priority");
assert.match(markerCss, /\.dp-map-pin[\s\S]*?border:\s*0\s*!important;[\s\S]*?background:\s*transparent\s*!important;/, "marker buttons must be borderless and transparent");
assert.match(markerCss, /dp-live-pin--inkind-logo/, "inKind must use the approved direct logo treatment");
assert.match(markerCss, /dp-live-pin--legends-logo/, "Legends must retain its approved direct logo treatment");

console.log("Borderless map marker checks passed.");
