import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const map = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const perks = await readFile(new URL("../src/components/map/ActivePerksSheet.jsx", import.meta.url), "utf8");
const mobileTabs = await readFile(new URL("../src/components/map/MobileTabDrawerShell.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/components/map/route/RouteExperienceSheet.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/panel-navigation-contract-final.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

assert.match(map, /const returnToMap = onBack \|\| onClose;/, "detail drawers must provide a Back fallback when there is no deeper panel history");
assert.match(map, /data-map-drawer-back="true"/, "detail drawers must expose a stable Back control hook");
assert.match(map, /header=\{<>[\s\S]*?<MapSheetToolbar[\s\S]*?onClose=\{onClose\}[\s\S]*?<\/>\}/, "native sheets must own visible Back/Close controls outside the scrolling content");
assert.doesNotMatch(map, /\{canGoBack \? \([\s\S]*?dp-map-detail-header-spacer/, "detail drawers must not hide Back when opened directly from the map");
assert.match(map, /aria-label="Home"[\s\S]*?navigate\("\/resident\/home"\)/, "resident bottom navigation must retain Home");
assert.match(map, /grid-cols-5/, "resident navigation must remain a five-item dock");
assert.match(perks, /dp-active-perks-back[\s\S]*?Return to map/, "perks drawer must provide Back to map");
assert.match(mobileTabs, /onBack\?: \(\) => void;[\s\S]*?onClick=\{onBack \|\| onClose\}/, "mobile tab drawers must provide Back with a Close fallback");
assert.match(route, /ArrowLeft[\s\S]*?aria-label="Return to map"/, "route drawers must provide Back to map");
assert.match(styles, /width: 44px !important;[\s\S]*?pointer-events: auto !important;/, "panel navigation controls must remain visible and tappable");
assert.match(main, /panel-navigation-contract-final\.css/, "navigation authority must load after earlier panel styles");

console.log("Panel navigation contract checks passed.");
