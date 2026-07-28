import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const markerSource = await readFile(new URL("../src/map/MarkerManager.ts", import.meta.url), "utf8");
const markerCss = await readFile(new URL("../src/styles/map-marker-governance-final.css", import.meta.url), "utf8");
const markerFactory = await readFile(new URL("../src/components/map/markers/MarkerFactory.jsx", import.meta.url), "utf8");
const iconRegistry = await readFile(new URL("../src/lib/map/mapIconRegistry.ts", import.meta.url), "utf8");
const pinResolver = await readFile(new URL("../src/lib/map/entityPinResolver.ts", import.meta.url), "utf8");

assert.match(mapSource, /clusterPlaces\(activeCollectionRoute\.stops, stableClusterZoom, selectedId\)/, "route stops must use collision-safe clustering");
assert.match(mapSource, /clusterPlaces\(mappablePlaces, stableClusterZoom, selectedId\)/, "focused results must use collision-safe clustering");
assert.doesNotMatch(mapSource, /shouldShowIndividualPins\s*\?\s*mappablePlaces\.map/, "focused searches must not bypass clustering");
assert.match(markerSource, /OPTIONAL_AND_HIDES_LOWER_PRIORITY/, "advanced markers must hide lower-priority collisions");
assert.match(markerSource, /zIndex/, "selected markers must retain stable priority");
assert.match(markerSource, /gmpClickable:\s*true/, "advanced markers must be provider-level clickable");
assert.match(markerSource, /addEventListener\("gmp-click"[\s\S]*?content\.querySelector<HTMLElement>\("\.dp-map-pin"\)\?\.click\(\)/, "advanced markers must bridge provider clicks to their canonical pin control");
assert.match(markerSource, /marker\.addListener\("click", onClick\)/, "legacy markers must preserve the same click contract");
assert.match(mapSource, /data-accessible-marker-entity-id=\{item\.place\.id\}/, "visible provider markers need a canonical accessible control");
assert.match(mapSource, /aria-label=\{`Open \$\{item\.place\.name\}`\}/, "accessible marker controls need the canonical entity name");
assert.match(mapSource, /markerActionHandlersRef\.current\.onSelect\?\.\(item\.place\)/, "accessible marker controls must use the shared selection pipeline");

assert.match(markerCss, /--dp-canonical-pin-size:\s*32px/, "all map pins must share the canonical 32px footprint");
assert.match(markerCss, /--dp-canonical-pin-navy:\s*#0B1F33/i, "map pins must use the canonical navy");
assert.match(markerCss, /--dp-canonical-pin-gold:\s*#C8A96A/i, "map pins must use the canonical gold");
assert.match(markerCss, /border-radius:\s*999px\s*!important/, "the polished circular pin silhouette is missing");
assert.match(markerCss, /\.dp-map-pin\.is-selected[\s\S]*?width:\s*var\(--dp-canonical-pin-size\)\s*!important/, "selected pins must retain the canonical footprint");
assert.match(markerCss, /\.dp-live-pin__premium-art[\s\S]*?display:\s*none\s*!important/, "brand artwork must not break the shared map-pin language");

const markerButtonSource = mapSource.slice(
  mapSource.indexOf("function mapPinButtonHtml"),
  mapSource.indexOf("function getMarkerDataKind"),
);
assert.match(markerButtonSource, /const iconSvg = getCanonicalMapGlyph\(pin\);/, "advanced markers must use the canonical category glyph");
assert.doesNotMatch(markerButtonSource, /<img\b|priceLabel/, "advanced markers must not restore brand-art or price-badge outliers");

const legacyMarkerSource = mapSource.slice(
  mapSource.indexOf("function legacyDowntownMarkerIcon"),
  mapSource.indexOf("function legacyDowntownClusterIcon"),
);
assert.match(legacyMarkerSource, /<circle\b/, "legacy markers must retain the polished circular plate");
assert.doesNotMatch(legacyMarkerSource, /pin\.asset|<img\b/, "legacy markers must use the same glyph language as advanced markers");

assert.match(markerFactory, /default:\s*32,[\s\S]*?building:\s*32,[\s\S]*?selected:\s*1,/, "Leaflet pins must retain the same footprint in every state");
assert.doesNotMatch(markerFactory, /pin\.asset|createArtworkMarker|iconSize:\s*\[200, 32\]/, "Leaflet pins must not restore artwork or expanded-pill variants");
assert.match(markerFactory, /getCanonicalMapGlyph\(pin\)/, "Leaflet pins must resolve artwork records to the shared glyph language");
assert.match(markerFactory, /function createPillMarker\(entity\)[\s\S]*?return createSelectedMarker\(entity\);/, "expanded markers must reuse the same canonical footprint");
assert.match(iconRegistry, /inkind:\s*"dining"[\s\S]*?dana:\s*"civic"[\s\S]*?"fine-eyewear":\s*"retail"[\s\S]*?rivian:\s*"mobility"[\s\S]*?legends:\s*"listing"/, "brand artwork records must map to meaningful category glyphs");

assert.doesNotMatch(pinResolver, /Math\.random|crypto\.getRandomValues|randomUUID/, "map icon selection must never be random");
assert.match(pinResolver, /\(fallbackByType\.includes\("civic"\) \? "civic" : ""\) \|\|\s*"default";/, "unknown entities must use the neutral canonical map pin");
assert.doesNotMatch(pinResolver, /\|\|\s*"guide";/, "unknown entities must not receive an unrelated guide icon");

console.log("Unified polished map marker checks passed.");
