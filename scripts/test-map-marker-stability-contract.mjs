import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const markerRecordSource = await readFile(new URL("../src/lib/map/canonicalMarkerRecords.ts", import.meta.url), "utf8");
const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const coordinateAnchorCss = await readFile(new URL("../src/styles/map-pin-coordinate-anchor-lock.css", import.meta.url), "utf8");
const leafletShellSource = await readFile(new URL("../src/components/map/unified/UnifiedMapShell.jsx", import.meta.url), "utf8");
const sharedLeafletShellSource = await readFile(new URL("../src/components/map/MapShell.jsx", import.meta.url), "utf8");
const searchHookSource = await readFile(new URL("../src/hooks/useSearchDrivenMapEntities.js", import.meta.url), "utf8");

assert.match(markerRecordSource, /export type CanonicalMarkerRecord = Readonly<\{[\s\S]*?markerId: string;[\s\S]*?entityId: string;[\s\S]*?latitude: number;[\s\S]*?longitude: number;/, "canonical marker record shape is missing required immutable fields");
assert.match(markerRecordSource, /Object\.freeze\(\{[\s\S]*?markerId,[\s\S]*?entityId,[\s\S]*?latitude: coordinate\.latitude,[\s\S]*?longitude: coordinate\.longitude/, "marker records must be frozen after normalized coordinate creation");
assert.match(markerRecordSource, /validateCoordinate\([\s\S]*?entity\.latitude[\s\S]*?entity\.longitude/, "coordinates must be validated before marker creation");
assert.doesNotMatch(markerRecordSource, /30\.2672|-97\.7431|Math\.random|randomUUID|Date\.now\(\).*markerId/, "canonical markers must not use default downtown coordinates, random values, or timestamps");
assert.match(markerRecordSource, /return null;[\s\S]*?invalid-coordinate/, "invalid coordinates must be excluded and diagnosable");
assert.match(markerRecordSource, /property-the-shore[\s\S]*?return "the-shore";/, "The Shore aliases must resolve to canonical the-shore");
assert.match(markerRecordSource, /entityType === "parking"[\s\S]*?resolveParkingParentId[\s\S]*?markerId = childLocationId[\s\S]*?`\$\{entityId\}:\$\{childLocationId\}`/, "parking must be modeled as a child marker of its canonical parent entity");
assert.match(markerRecordSource, /entityType === "listing"[\s\S]*?listing\.mlsNumber/, "listing markers must use a stable child location/listing identifier");

assert.match(mapSource, /function getPlaceCoords\(place\) \{[\s\S]*?getCanonicalMarkerRecord\(place\)[\s\S]*?markerRecord\.latitude[\s\S]*?markerRecord\.longitude/, "map coordinates must flow from canonical marker records");
assert.match(mapSource, /const key = `pin:\$\{markerRecord\.markerId\}`;/, "Google markers must use permanent canonical marker IDs as registry keys");
assert.match(mapSource, /data-marker-entity-id", markerRecord\.markerId/, "marker DOM IDs must match canonical marker IDs");
assert.match(mapSource, /data-entity-id", markerRecord\.entityId/, "drawer entity IDs must resolve to the same canonical entity ID");
assert.match(mapSource, /wrapper\.dataset\.canonicalLatitude = String\(markerRecord\.latitude\)/, "marker DOM shells must expose canonical latitude for interaction stability tests");
assert.match(mapSource, /wrapper\.dataset\.canonicalLongitude = String\(markerRecord\.longitude\)/, "marker DOM shells must expose canonical longitude for interaction stability tests");
assert.match(mapSource, /wrapper\.dataset\.coordinateKey = markerPositionKey\(\{ lat: markerRecord\.latitude, lng: markerRecord\.longitude \}\)/, "marker DOM shells must expose the canonical coordinate key");
assert.match(mapSource, /button\?\.setAttribute\("data-canonical-latitude", String\(markerRecord\.latitude\)\)/, "marker controls must expose canonical latitude for automated interaction tests");
assert.match(mapSource, /data-accessible-marker-entity-id=\{item\.place\.id\}/, "visible provider markers need a canonical accessible control");
assert.match(mapSource, /data-marker-entity-id=\{markerId\}/, "accessible marker controls must expose canonical marker IDs");
assert.match(mapSource, /data-canonical-latitude=\{markerRecord \? String\(markerRecord\.latitude\) : ""\}/, "accessible marker controls must expose canonical latitude");
assert.match(mapSource, /data-canonical-longitude=\{markerRecord \? String\(markerRecord\.longitude\) : ""\}/, "accessible marker controls must expose canonical longitude");
assert.match(mapSource, /data-coordinate-key=\{coordinateKey\}/, "accessible marker controls must expose canonical coordinate keys");
assert.match(mapSource, /markerSnapshots: Array\.from\(registry\.entries\(\)\)\.map/, "development marker lifecycle snapshots must expose stable marker identity and coordinates");
assert.match(mapSource, /lastPositionKey: entry\.marker\?\.__dpLastPositionKey/, "marker snapshots must include the provider marker's last coordinate key");
assert.match(mapSource, /markerPositionKey = \(position\) => `\$\{Number\(position\?\.lat\)\.toFixed\(7\)\}:\$\{Number\(position\?\.lng\)\.toFixed\(7\)\}`/, "marker lifecycle must compare exact normalized coordinate keys before moving provider markers");
assert.match(mapSource, /const positionChanged = marker\.__dpLastPositionKey !== nextPositionKey/, "marker lifecycle must detect unchanged coordinates before updating provider position");
assert.match(mapSource, /if \(positionChanged\) marker\.position = position;/, "advanced markers must not reset position when canonical coordinates are unchanged");
assert.match(mapSource, /if \(positionChanged\) marker\.setPosition\?\.\(position\);/, "legacy markers must not reset position when canonical coordinates are unchanged");
assert.match(mapSource, /entry\.marker\.__dpLastPositionKey = markerPositionKey\(markerOptions\.position\)/, "new marker instances must store their first canonical coordinate key");
assert.match(mapSource, /isSelectedMarkerPlace\(place, selectedId\)/, "selection state must resolve through canonical marker identity");
assert.match(mapSource, /selectionRequestedMapFocus/, "ordinary marker selection must not pan or zoom the map");
const googleMarkerLifecycleSource = mapSource.slice(
  mapSource.indexOf("mapItems.forEach((item) =>"),
  mapSource.indexOf("const reconciliation = reconcileMarkerIds"),
);
assert.doesNotMatch(googleMarkerLifecycleSource, /key=\{index\}|key=\{.*Date\.now|Math\.random\(/, "marker rendering must not use indexes, timestamps, or random keys");

assert.doesNotMatch(leafletShellSource, /flyTo\(|<MapFlyTo\b/, "Leaflet map shell must not fly after ordinary center state updates");
assert.match(leafletShellSource, /key=\{item\.markerId \|\| item\.id\}/, "Leaflet markers must prefer stable marker IDs over list indexes or transient state");
assert.doesNotMatch(sharedLeafletShellSource, /flyTo\(|<MapFlyTo\b/, "Shared Leaflet map shell must not move the camera after selection");
assert.match(sharedLeafletShellSource, /const markerId = item\.markerId \|\| item\.id;/, "Shared Leaflet markers must resolve a stable marker ID");
assert.match(sharedLeafletShellSource, /key=\{markerId\}/, "Shared Leaflet markers must use the stable marker ID as their React key");
assert.match(searchHookSource, /activeRequestRef\.current\.key !== queryKey/, "late search responses must be rejected after async catalog work");

assert.match(mainSource, /map-pin-coordinate-anchor-lock\.css["'];?\s*\n\s*inject\(\)/, "final coordinate anchor lock must be the last stylesheet imported before instrumentation");
assert.match(coordinateAnchorCss, /Final marker coordinate anchor lock/, "coordinate anchor lock stylesheet must document its stability purpose");
assert.match(coordinateAnchorCss, /\.dp-google-map-marker-shell[\s\S]*?transition: none !important;[\s\S]*?transform-origin: center center !important;/, "provider marker shells must not animate or shift their anchor");
assert.match(coordinateAnchorCss, /\.dp-map-pin\.is-pulsing::before[\s\S]*?animation: none !important;/, "pulsing marker pseudo-elements must be disabled");
assert.match(coordinateAnchorCss, /\.dp-map-pin--legends[\s\S]*?transform: none !important;/, "custom logo markers must keep a fixed visual anchor");
assert.match(coordinateAnchorCss, /\.dp-pin-logo[\s\S]*?transition: none !important;/, "marker assets must not load or transition in a way that shifts anchor geometry");

console.log("Map marker stability contract checks passed.");
