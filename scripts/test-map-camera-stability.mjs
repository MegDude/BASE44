import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");

assert.match(
  source,
  /const markerLayoutContext = useMemo\(\(\) => \(\{[\s\S]*?bounds: scopedResultState\.bounds \|\| viewportBoundsRef\.current \|\| null,[\s\S]*?zoom: getStableMarkerZoom/,
  "marker layout must be captured from the active result context",
);

assert.match(
  source,
  /getViewportBoundedMarkerPlaces\(pinSourcePlaces, \{[\s\S]*?viewportBounds: markerLayoutContext\.bounds,[\s\S]*?zoom: markerLayoutContext\.zoom/,
  "live pan and zoom state must not replace the active marker set",
);

assert.match(
  source,
  /const stableClusterZoom = markerLayoutContext\.zoom;/,
  "cluster layout must remain fixed for the active result set",
);

assert.match(
  source,
  /markerLayoutZoom=\{markerLayoutContext\.zoom\}/,
  "the map canvas must render markers using the frozen result zoom",
);

assert.match(
  source,
  /if \(userNavigatedRef\.current\) return;[\s\S]*?userNavigatedRef\.current = true;/,
  "user navigation notification must be idempotent during a gesture",
);

assert.doesNotMatch(
  source,
  /const \[mapZoom, setMapZoom\] = useState\(\(\) => Number\(zoom\)/,
  "the map canvas must not maintain a second zoom-driven marker layout",
);

console.log("Map camera stability tests passed.");
