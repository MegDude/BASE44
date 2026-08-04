import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const mapCollections = readFileSync("src/data/mapCollections.ts", "utf8");
const waterlooInventory = readFileSync("src/data/waterlooParkInventory.ts", "utf8");
const routeSheet = readFileSync("src/components/map/route/RouteExperienceSheet.tsx", "utf8");
const mapPage = readFileSync("src/pages/Map.jsx", "utf8");
const importReport = JSON.parse(readFileSync("data/imports/waterloo-greenway-import-report.json", "utf8"));

const expectedStops = [
  "waterloo-park",
  "moody-amphitheater",
  "great-lawn",
  "waller-creek-trail",
  "hill-country-garden",
  "family-pavilion",
];
const expectedDeepLink = "/map?mode=resident&tab=map&filter=Civic&query=Waterloo+Greenway+Walk&intent=civic&collection=waterloo-greenway&routeId=waterloo-greenway";

assert.match(mapCollections, /id: "waterloo-greenway"[\s\S]*title: "Waterloo Greenway Walk"/, "Waterloo route must use the canonical id and title");
assert.match(mapCollections, /id: "waterloo-greenway"[\s\S]*category: "civic"/, "Waterloo route must stay civic");
assert.match(mapCollections, /id: "waterloo-greenway"[\s\S]*format: "Self-guided walk"/, "Waterloo route must expose the canonical format");
assert.match(mapCollections, /id: "waterloo-greenway"[\s\S]*attribution: "Presented with Waterloo Greenway"/, "Waterloo route attribution is missing");
assert.match(mapCollections, /relatedRouteIds: \["daa-art-walk", "downtown-stories-walk"\]/, "Waterloo related routes must remain canonical");
for (const stopId of expectedStops) assert.match(waterlooInventory, new RegExp(`"${stopId}"`), `${stopId} is missing from canonical Waterloo inventory`);
const stopPositions = expectedStops.map((stopId) => waterlooInventory.indexOf(`"${stopId}"`));
assert.deepEqual([...stopPositions].sort((a, b) => a - b), stopPositions, "Waterloo canonical stop order changed");
assert.match(waterlooInventory, /id: "waterloo-park"[\s\S]*lat: 30\.27356,[\s\S]*lng: -97\.73568,/, "Waterloo Park must have route coordinates");
for (const key of ["created", "updated", "merged", "skipped", "rejected", "duplicatePrevented"]) {
  assert.ok(Array.isArray(importReport[key]), `Import report missing ${key} array`);
}
assert.equal(importReport.idempotent, true, "Import report must mark the merge idempotent");
assert.equal(importReport.rejected.length, 0, "Import report should not reject approved Waterloo records");
assert.equal(importReport.merged.filter((item) => item.startsWith("route-stop:waterloo-greenway:")).length, 6, "Import report must include six canonical route-stop relationships");
for (const [index, stopId] of expectedStops.entries()) {
  assert.ok(importReport.merged.includes(`route-stop:waterloo-greenway:${stopId}:${index + 1}`), `${stopId} route-stop relation is missing or out of sequence`);
}
assert.match(routeSheet, /data-sheet-view=\{isStopDetail \? "stop-detail" : "route"\}/, "RouteExperienceSheet must expose route vs stop-detail view state");
assert.match(routeSheet, /previousRouteScrollTopRef/, "RouteExperienceSheet must preserve route scroll before stop detail");
assert.match(routeSheet, /previousRouteSheetStateRef/, "RouteExperienceSheet must preserve prior route sheet height");
assert.match(routeSheet, /<RouteStopList[\s\S]*onSelectStop=\{enterStopDetail\}/, "Route stop rows must enter in-sheet stop detail");
assert.match(routeSheet, /aria-label=\{`Back to \$\{route\.shortTitle \|\| route\.title\}`\}/, "Stop detail must render an in-sheet route Back control");
assert.doesNotMatch(routeSheet, /onClick=\{\(\) => onOpenStop\(activeStop\)\}>View stop/, "Route active stop must not open the standalone entity drawer");
assert.doesNotMatch(mapPage, /searchParams\.get\("entityId"\) \|\| searchParams\.get\("entity"\) \|\| stopId/, "Route stopId must not automatically open the standalone entity drawer");
assert.match(mapPage, /urlState\.update\(\{ collection: urlState\.collection, routeId: urlState\.collection, stop: "", stopId: stop\.id, entityId: "", drawerClosed: "true" \}\)/, "Route stop selection must keep durable stopId without opening entityId");
assert.match(mapPage, /onBackToRoute=\{\(\) => \{[\s\S]*stopId: ""[\s\S]*entityId: ""/, "Sheet Back must clear stop selection without leaving route context");
assert.match(mapPage, /selected=\{activeRouteMapSelection\}/, "Map selection must focus route stops without opening a second drawer");
assert.match(mapPage, /navigateMapJourney\([\s\S]*collection: urlState\.collection \|\| ""[\s\S]*routeState: urlState\.routeState \|\| ""/, "Close must preserve useful route/filter context while clearing detail state");
assert.equal(importReport.productionDeepLink, expectedDeepLink, "Import report must retain the production Waterloo deep-link contract");

console.log("Waterloo native sheet contract: PASS");
