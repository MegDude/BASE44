import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const aliasesSource = await readFile(new URL("../src/data/production/canonicalEntityAliasRegistry.ts", import.meta.url), "utf8");
const resolverSource = await readFile(new URL("../src/lib/mapEntityAliases.js", import.meta.url), "utf8");
const panelCss = await readFile(new URL("../src/styles/map-detail-panel-live-final.css", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

assert.match(aliasesSource, /"partner-bangers": "map-7-banger-s-sausage-house-and-beer-garden"/, "the partner\/demo Banger's identifier must resolve to the canonical venue");
assert.match(resolverSource, /const canonicalMatch = canonicalId[\s\S]*?if \(canonicalMatch\) return canonicalMatch;[\s\S]*?const exactMatch/, "canonical aliases must be resolved before an exact demo-record match");

const genericDrawerStart = mapSource.indexOf("<DestinationHero place={selected} mode={urlState.mode} />", mapSource.indexOf("return (\n                  <motion.div"));
const heroIndex = genericDrawerStart;
const identityIndex = mapSource.indexOf("<EntityIdentityPanel", genericDrawerStart);
const actionIndex = mapSource.indexOf("{standardActionPanel}", genericDrawerStart);
const detailsIndex = mapSource.indexOf("<HappyHourDetails", genericDrawerStart);
const nearbyIndex = mapSource.indexOf("<NearbyContext", genericDrawerStart);
assert.ok(heroIndex > -1 && heroIndex < identityIndex && identityIndex < actionIndex && actionIndex < detailsIndex && detailsIndex < nearbyIndex, "drawer DOM order must be hero, identity, actions, details, then nearby");

assert.doesNotMatch(mapSource.slice(mapSource.indexOf("function HappyHourDetails"), mapSource.indexOf("function ParkingBookingDetails")), /happyHour\.offer \|\| "Food and drink specials nearby"/, "generic descriptive copy must never be labeled as an offer");
assert.match(mapSource, /if \(!isVerifiedOffer\)[\s\S]*?title="Venue details"/, "unverified Banger's content must render as neutral venue details");
assert.match(mapSource, /title=\{isBangersVenue\(place\) \? "Verified resident offer"/, "Banger's perk language must be explicitly verified");
assert.match(mapSource, /isHappyHourEntity\(selected\) \|\| isBangersVenue\(selected\)/, "Banger's must use the verified-offer gate and neutral venue-details fallback");
assert.match(mapSource, /!isHappyHourEntity\(selected\) && !isBangersVenue\(selected\)/, "Banger's must never fall through to the generic resident-perk module");

assert.match(panelCss, /#root(?:#root){15}[\s\S]*?#dp-active-map-drawer(?:#dp-active-map-drawer){3}[\s\S]*?\.dp-map-panel-content\.dp-destination-content\.dp-detail-content[\s\S]*?display: block !important/, "the final visual-layout boundary must outrank legacy flex rules and follow DOM order");
assert.match(panelCss, /#dp-active-map-drawer\.dp-map-detail-sheet[\s\S]*?overflow: hidden !important/, "the drawer shell must clip to its viewport");
assert.match(panelCss, /\.dp-map-detail-scroll[\s\S]*?min-height: 0 !important;[\s\S]*?flex: 1 1 auto !important;[\s\S]*?overflow-y: auto !important/, "the content viewport must be the single scroll owner");
assert.match(panelCss, /@media \(min-width: 768px\)[\s\S]*?inset: 0 0 0 auto !important;[\s\S]*?width: min\(460px, 42vw\) !important/, "desktop must use a standard right-side detail panel");
assert.match(panelCss, /@media \(max-width: 767px\)[\s\S]*?width: 100vw !important/, "mobile must retain the full-width sheet");
assert.ok(mainSource.lastIndexOf('import "@/styles/map-detail-panel-live-final.css"') > mainSource.lastIndexOf('import "@/styles/map-drawer-scroll-footer-final.css"'), "the panel cohesion lock must load after earlier drawer rules");

console.log("Banger's drawer contract checks passed.");
