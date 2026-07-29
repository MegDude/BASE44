import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const markerRecordSource = await readFile(new URL("../src/lib/map/canonicalMarkerRecords.ts", import.meta.url), "utf8");
const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const leafletShellSource = await readFile(new URL("../src/components/map/unified/UnifiedMapShell.jsx", import.meta.url), "utf8");
const searchHookSource = await readFile(new URL("../src/hooks/useSearchDrivenMapEntities.js", import.meta.url), "utf8");

assert.match(markerRecordSource, /export type CanonicalMarkerRecord = Readonly<\{[\s\S]*?markerId: string;[\s\S]*?entityId: string;[\s\S]*?latitude: number;[\s\S]*?longitude: number;/, "canonical marker record shape is missing required immutable fields");
assert.match(markerRecordSource, /Object\.freeze\(\{[\s\S]*?markerId,[\s\S]*?entityId,[\s\S]*?latitude: coordinate\.latitude,[\s\S]*?longitude: coordinate\.longitude/, "marker records must be frozen after normalized coordinate creation");
assert.match(markerRecordSource, /validateCoordinate\([\s\S]*?entity\.latitude[\s\S]*?entity\.longitude/, "coordinates must be validated before marker creation");
assert.doesNotMatch(markerRecordSource, /30\.2672|-97\.7431|Math\.random|randomUUID|Date\.now\(\).*markerId/, "canonical markers must not use default downtown coordinates, random values, or timestamps");
assert.match(markerRecordSource, /return null;[\s\S]*?invalid-coordinate/, "invalid coordinates must be excluded and diagnosable");
assert.match(markerRecordSource, /property-the-shore[\s\S]*?return "the-shore";/, "The Shore aliases must resolve to canonical the-shore");
assert.match(markerRecordSource, /entityType === "parking"[\s\S]*?resolveParkingParentId[\s\S]*?markerId = childLocationId[\s\S]*?`\$\{entityId\}:\$\{childLocationId\}`/, "parking must be modeled as a child marker of its canonical parent entity");
assert.match(markerRecordSource, /entityType === "listing"[\s\S]*?listing\.mlsNumber/, "listing markers must use a stable child location/listing identifier");
assert.match(markerRecordSource, /const canonicalMarkerRecordCache = new Map<string, CanonicalMarkerRecord>\(\)/, "canonical marker records must be cached by immutable source fields");
assert.match(markerRecordSource, /const cacheKey = \[[\s\S]*?coordinate\.latitude,[\s\S]*?coordinate\.longitude,[\s\S]*?sourceVersion,[\s\S]*?\]\.join\("\\|"\)/, "record cache identity must include canonical ID, immutable coordinates, icon and source version");
assert.match(markerRecordSource, /const cached = canonicalMarkerRecordCache\.get\(cacheKey\);[\s\S]*?if \(cached\) return cached;/, "unchanged sources must preserve the existing frozen marker object");
assert.match(markerRecordSource, /canonicalMarkerRecordCache\.set\(cacheKey, record\)/, "new marker records must only be stored after frozen creation");
assert.doesNotMatch(markerRecordSource, /visibility\.resident !== false && \(!options\.audienceMode/, "audience mode must not reinterpret a shared entity's resident visibility");

assert.match(mapSource, /function getPlaceCoords\(place\) \{[\s\S]*?getCanonicalMarkerRecord\(place\)[\s\S]*?markerRecord\.latitude[\s\S]*?markerRecord\.longitude/, "map coordinates must flow from canonical marker records");
assert.match(mapSource, /const key = `pin:\$\{markerRecord\.markerId\}`;/, "Google markers must use permanent canonical marker IDs as registry keys");
assert.match(mapSource, /data-marker-entity-id", markerRecord\.markerId/, "marker DOM IDs must match canonical marker IDs");
assert.match(mapSource, /data-entity-id", markerRecord\.entityId/, "drawer entity IDs must resolve to the same canonical entity ID");
assert.match(mapSource, /isSelectedMarkerPlace\(place, selectedId\)/, "selection state must resolve through canonical marker identity");
assert.match(mapSource, /selectionRequestedMapFocus/, "ordinary marker selection must not pan or zoom the map");
const googleMarkerLifecycleSource = mapSource.slice(
  mapSource.indexOf("mapItems.forEach((item) =>"),
  mapSource.indexOf("const reconciliation = reconcileMarkerIds"),
);
assert.doesNotMatch(googleMarkerLifecycleSource, /key=\{index\}|key=\{.*Date\.now|Math\.random\(/, "marker rendering must not use indexes, timestamps, or random keys");

assert.doesNotMatch(leafletShellSource, /flyTo\(|<MapFlyTo\b/, "Leaflet map shell must not fly after ordinary center state updates");
assert.match(leafletShellSource, /key=\{item\.markerId \|\| item\.id\}/, "Leaflet markers must prefer stable marker IDs over list indexes or transient state");
assert.match(searchHookSource, /activeRequestRef\.current\.key !== queryKey/, "late search responses must be rejected after async catalog work");

console.log("Map marker stability contract checks passed.");
