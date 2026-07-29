import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const map = read("src/pages/Map.jsx");
const perks = read("src/components/map/ActivePerksSheet.jsx");
const routeSheet = read("src/components/map/route/RouteExperienceSheet.tsx");
const mobileTabSheet = read("src/components/map/MobileTabDrawerShell.tsx");
const workspaceSheet = read("src/components/partner/workspace/WorkspaceSheetSystem.jsx");
const legendsSheet = read("src/components/map/drawers/LegendsPropertyDrawer.tsx");
const canonical = read("src/styles/canonical-surface-system.css");
const fullscreen = read("src/styles/ios-fullscreen-map-panels-final.css");
const activePerks = read("src/styles/active-perks-sheet.css");
const workspaceLock = read("src/styles/interface-density-regression-lock.css");
const drawerState = read("src/lib/map/nativeDrawerState.js");

assert.match(map, /normalizeDrawerState\(savedState, "list"\)/);
assert.match(drawerState, /DETAIL_DRAWER_STATES = \["medium", "expanded", "full"\]/);
assert.match(map, /normalizeDrawerState\(nextState, "detail"\)/);
assert.match(map, /window\.sessionStorage\.setItem\("dp-detail-drawer-state", safeState\)/);
assert.match(map, /data-drawer-state=\{detailDrawerState\}/);
assert.match(map, /const stateOrder = \["medium", "expanded", "full"\]/);
assert.match(map, /className="dp-native-bottom-nav dp-map-bottom-nav-shell[^\n]+fixed inset-x-0 bottom-0/);

assert.match(drawerState, /LIST_DRAWER_STATES = \["peek", "expanded"\]/);
assert.match(map, /window\.sessionStorage\.setItem\("dp-active-perks-drawer-state", safeState\)/);
assert.match(perks, /drawerState=\{safeState\}/);
assert.match(perks, /onRequestClose=\{onClose\}/);
assert.match(perks, /className=\{`dp-active-perks-sheet is-\$\{safeState\}`\}/);
assert.match(perks, /aria-label="Close active perks"/);
assert.doesNotMatch(perks, /className="dp-active-perks-back"/);
assert.match(activePerks, /\.dp-active-perks-sheet\.is-medium/);

assert.match(routeSheet, /onDrawerStateChange=\{setSheetState\}/);
assert.match(routeSheet, /onRequestClose=\{onExit\}/);
assert.match(routeSheet, /aria-label="Close route"/);
assert.doesNotMatch(routeSheet, /aria-label="Return to map"/);

assert.match(mobileTabSheet, /if \(stateRef\.current === "full"\) stateChangeRef\.current\?\.\("expanded"\)/);
assert.match(mobileTabSheet, /else if \(stateRef\.current === "expanded"\) stateChangeRef\.current\?\.\("medium"\)/);
assert.match(mobileTabSheet, /else closeRef\.current\(\)/);
assert.match(mobileTabSheet, /document\.body\.style\.overflow = "hidden"/);
assert.match(mobileTabSheet, /previousFocusRef\.current\?\.focus\?/);
assert.match(mobileTabSheet, /\{onBack \? <button[^\n]+onClick=\{onBack\}/);
assert.doesNotMatch(mobileTabSheet, /onClick=\{onBack \|\| onClose\}/);

assert.match(workspaceSheet, /typeof sheet\.onBack === "function" \? <button/);
assert.doesNotMatch(workspaceSheet, /else context\.closeSheet\(\)/);
assert.match(workspaceSheet, /aria-label=\{`Close \$\{sheet\.title\}`\}/);
assert.match(legendsSheet, /onClose: \(\) => void/);
assert.match(legendsSheet, /<button type="button" onClick=\{onClose\}>Close<\/button>/);

assert.match(canonical, /\.dp-map-bottom-nav-shell\.dp-map-bottom-nav-shell[\s\S]*?inset: auto 0 0 !important/);
assert.match(canonical, /width: 100vw !important/);
assert.match(fullscreen, /grid-template-columns: 44px minmax\(0, 1fr\) 44px !important/);
assert.match(fullscreen, /overscroll-behavior-y: contain !important/);

const workspaceControlStart = workspaceLock.indexOf("Every workspace page and temporary surface");
const workspaceControlEnd = workspaceLock.indexOf("Search console utility rail", workspaceControlStart);
const workspaceControlBlock = workspaceLock.slice(workspaceControlStart, workspaceControlEnd);
assert.ok(workspaceControlBlock.length > 0, "workspace surface control contract is missing");
assert.doesNotMatch(workspaceControlBlock, /\.dp-map-page/);
assert.doesNotMatch(workspaceControlBlock, /\.dp-detail-drawer/);
assert.doesNotMatch(workspaceControlBlock, /\.dp-active-perks-sheet/);

console.log("Polished map panel states, controls, persistence, dismissal, and bottom navigation: PASS");
