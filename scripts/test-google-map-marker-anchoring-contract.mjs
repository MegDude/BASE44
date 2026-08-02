import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapPage = readFileSync("src/pages/Map.jsx", "utf8");
const markerManager = readFileSync("src/map/MarkerManager.ts", "utf8");
const mapProvider = readFileSync("src/map/MapProvider.ts", "utf8");
const canonicalMarkers = readFileSync("src/lib/map/canonicalMarkerRecords.ts", "utf8");
const streetView = readFileSync("src/lib/map/streetViewAvailability.js", "utf8");
const mapCollections = readFileSync("src/data/mapCollections.ts", "utf8");
const waterlooInventory = readFileSync("src/data/waterlooParkInventory.ts", "utf8");

assert.match(mapPage, /const MAP_MAX_ZOOM = 22;/, "Google map must support high-detail street zoom");
assert.match(mapPage, /const MAP_STREET_FOCUS_ZOOM = 21;/, "Entity focus must allow street-level detail");
assert.match(mapPage, /const googleMapId = import\.meta\.env\.VITE_GOOGLE_MAP_ID \|\| import\.meta\.env\.VITE_GOOGLE_MAPS_MAP_ID \|\| undefined;/, "Google vector map ID must be preferred when configured");
assert.match(mapPage, /maxZoom:\s*MAP_MAX_ZOOM/, "Google map maxZoom must use the high-detail map constant");
assert.match(mapPage, /const markerRegistryRef = useRef\(new Map\(\)\);/, "Map must maintain a marker registry across renders");
assert.match(mapPage, /const key = `pin:\$\{markerRecord\.markerId\}`;/, "Pin marker keys must be stable canonical marker IDs");
assert.match(mapPage, /wrapper\.dataset\.markerEntityId = markerRecord\.markerId;[\s\S]*wrapper\.dataset\.entityId = markerRecord\.entityId;/, "Rendered marker DOM must expose canonical marker and entity IDs");
assert.match(mapPage, /const coords = markerRecord \? \[markerRecord\.latitude, markerRecord\.longitude\] : null;/, "Marker coordinates must derive from canonical marker records");
assert.match(mapPage, /position:\s*\{ lat: coords\[0\], lng: coords\[1\] \}/, "Marker position must use canonical latitude and longitude");
assert.match(mapPage, /const routeStopNumberById = new Map\(\(collectionRoute\?\.stops \|\| \[\]\)\.map\(\(stop, index\) => \[stop\.id, index \+ 1\]\)\);/, "Route stops must reuse the same canonical stop IDs before marker rendering");
assert.match(mapPage, /const place = routeStopNumberById\.has\(item\.place\?\.id\)[\s\S]*: item\.place;/, "Route stop decoration must not create replacement marker coordinates");
assert.match(mapPage, /if \(existing\) \{[\s\S]*updateMarker\(existing\.marker, markerOptions\);[\s\S]*\} else \{[\s\S]*createDowntownMarker/, "Existing markers must be updated in place rather than recreated on selection");
assert.match(mapPage, /const reconciliation = reconcileMarkerIds\(registry\.keys\(\), nextKeys\);/, "Marker set must be diffed by ID before removals");
assert.match(mapPage, /reconciliation\.release\.forEach[\s\S]*removeGoogleMapMarker\(entry\.marker\);[\s\S]*registry\.delete\(key\);/, "Only released marker IDs should be removed");
assert.doesNotMatch(mapPage, /markerRegistryRef\.current\s*=\s*new Map/, "Marker registry must not be replaced during normal rendering");
assert.match(mapPage, /mapRef\.current = createDowntownGoogleMap/, "Google Map instance must be created once and preserved through drawer updates");
assert.doesNotMatch(mapPage, /selectedId[\s\S]{0,120}createDowntownGoogleMap/, "Changing selected marker must not recreate the Google Map instance");
assert.match(mapPage, /selectionRequestedMapFocus[\s\S]*map\.panTo\(\{ lat: coords\[0\], lng: coords\[1\] \}\);/, "Entity focus must use smooth Google Maps camera panTo, not remounting");
assert.match(markerManager, /new maps\.marker\.AdvancedMarkerElement\(\{[\s\S]*position,[\s\S]*gmpDraggable:\s*false,[\s\S]*zIndex,/, "Advanced markers must be coordinate-positioned, non-draggable, and z-indexed");
assert.match(markerManager, /new maps\.Marker\(\{[\s\S]*position,[\s\S]*draggable:\s*false,[\s\S]*zIndex,/, "Legacy markers must be coordinate-positioned, non-draggable, and z-indexed");
assert.match(mapProvider, /gestureHandling:\s*"greedy"[\s\S]*draggable:\s*true[\s\S]*scrollwheel:\s*true[\s\S]*keyboardShortcuts:\s*true/, "Google map must support pan, touch, wheel, and keyboard interactions");
assert.match(canonicalMarkers, /validateCoordinate\([\s\S]*entity\.latitude \?\? entity\.lat[\s\S]*entity\.longitude \?\? entity\.lng/, "Canonical marker records must validate real latitude and longitude fields");
assert.match(canonicalMarkers, /const markerId = childLocationId && childLocationId !== entityId \? `\$\{entityId\}:\$\{childLocationId\}` : entityId;/, "Aliases and child locations must resolve to stable canonical marker IDs");
assert.match(canonicalMarkers, /latitude:\s*coordinate\.latitude,[\s\S]*longitude:\s*coordinate\.longitude,/, "Canonical marker records must store exact validated coordinates");
assert.doesNotMatch(canonicalMarkers, /30\.2672|-97\.7431|centroid|bounds/i, "Canonical marker records must not use district centroid fallback coordinates");
assert.match(streetView, /new maps\.StreetViewService\(\)/, "Street View availability must use Google StreetViewService");
assert.match(streetView, /service\.getPanorama\(request, \(data, status\) => \{[\s\S]*StreetViewStatus\?\.OK[\s\S]*data\?\.location\?\.pano/, "Street View action must be gated by confirmed Google coverage");
assert.match(streetView, /map_action:\s*"pano"/, "Street View URL must open explicit panorama mode");
assert.match(mapPage, /getStreetViewCoverage\(maps, \{ lat: coords\[0\], lng: coords\[1\] \}\)/, "Destination action rail must request Street View coverage for the selected canonical coordinates");
assert.ok(mapPage.includes("const streetViewAction = streetViewCoverage?.url ? ("), "Street View action must be gated by confirmed coverage state");
assert.ok(mapPage.includes("Street View →"), "Street View action label must be explicit");
assert.ok(mapPage.includes("track(\"street_view_opened\")"), "Street View entry must be tracked explicitly");
assert.ok(mapPage.includes("{streetViewAction || <button type=\"button\" onClick={share}>Share</button>}"), "When Street View coverage is absent, the rail must fall back to Share rather than implying coverage");
for (const stopId of ["waterloo-park", "moody-amphitheater", "great-lawn", "waller-creek-trail", "hill-country-garden", "family-pavilion"]) {
  assert.match(waterlooInventory, new RegExp(`"${stopId}"`), `${stopId} must stay in the canonical Waterloo inventory used by the route stop list`);
}

console.log("Google map marker anchoring contract: PASS");
