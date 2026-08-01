import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sheet = readFileSync("src/components/map/route/RouteExperienceSheet.tsx", "utf8");
const stops = readFileSync("src/components/map/route/RouteStopList.tsx", "utf8");
const details = readFileSync("src/components/map/route/RouteDetails.tsx", "utf8");
const styles = readFileSync("src/styles/route-native-map-sheet-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(sheet, /useState<SheetState>\("medium"\)/, "Route sheet must open at medium height by default");
assert.doesNotMatch(sheet, /actions=\{\(/, "Route sheet must not use the shared fixed NativeDrawerShell footer before route start");
assert.match(sheet, /hasInternalActions=\{isStarted\}/, "Active route actions must be internal and active-state gated");
assert.match(sheet, /className="dp-route-active-action-bar"/, "Active route mode needs a compact internal action bar");
assert.match(sheet, /collapseToMap/, "Route sheet must provide a collapse-to-map behavior");
assert.match(sheet, /visibleRelatedRoutes = sheetState === "expanded" \|\| sheetState === "full" \? relatedRoutes : \[\]/, "Related routes must appear only after the core route content in expanded states");
assert.doesNotMatch(sheet, /handlePanelMediaError|heroImageUrl \? <img/, "Route sheet must not render large hero media in the first-screen decision surface");
assert.match(sheet, /className="dp-route-primary-action" onClick=\{\(\) => onPrimaryAction\(activeStop\)\}/, "Starting a route must call the route-start handler, not directions");

assert.match(stops, /<h3 id="route-stop-list-title">Stops<\/h3>/, "Stop list heading should be concise");
assert.doesNotMatch(stops, /Route stops|total|Continue along the route|Selected stop" :/, "Stop list must remove repetitive and generic route copy");
assert.match(stops, /started = false/, "Stop selection state must be gated by started route state");
assert.match(stops, /String\(stop\.routeStopNumber \|\| index \+ 1\)\.padStart\(2, "0"\)/, "Stop rows must use sharp numbered rows");

assert.doesNotMatch(details, /partner-workspace|Manage route|Attach event|View engagement|<details><summary>About this/, "Resident route details must not contain partner links or accordion-only route details");
assert.match(details, /dp-route-details__plain/, "Route detail copy should render as a plain section");

assert.match(styles, /Final native route sheet authority/, "Final route-sheet stylesheet must document purpose");
assert.match(styles, /\.dp-route-experience-sheet \.dp-native-drawer-actions[\s\S]*?display: none !important;/, "Route sheet must remove the oversized shared fixed footer");
assert.match(styles, /\.dp-route-experience-sheet\.is-peek[\s\S]*?height: 132px !important;/, "Collapsed route dock must be compact");
assert.match(styles, /\.dp-route-experience-sheet\.is-expanded,[\s\S]*?height: calc\(100dvh - env\(safe-area-inset-top,0px\)\) !important;/, "Expanded route sheet must use safe viewport height");
assert.match(styles, /\.dp-route-active-action-bar[\s\S]*?min-height: 56px !important;/, "Active route action bar must be compact");
assert.doesNotMatch(styles, /border-radius:\s*(1[2-9]|[2-9][0-9])px|box-shadow:\s*var\(--dp-shadow|blur\(/, "Final route sheet must avoid rounded card, heavy shadow, or blur treatment");

assert.match(main, /route-native-map-sheet-final\.css/, "Final route-sheet stylesheet must be loaded by the app");

console.log("native route sheet contract passed");
