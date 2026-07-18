import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const map = read("src/pages/Map.jsx");
const perks = read("src/components/map/ActivePerksSheet.jsx");
const canonical = read("src/styles/canonical-surface-system.css");
const fullscreen = read("src/styles/ios-fullscreen-map-panels-final.css");
const activePerks = read("src/styles/active-perks-sheet.css");
const workspaceLock = read("src/styles/interface-density-regression-lock.css");

assert.match(map, /\["peek", "medium", "full"\]\.includes\(savedState\)/);
assert.match(map, /\["peek", "medium", "full"\]\.includes\(nextState\)/);
assert.match(map, /window\.sessionStorage\.setItem\("dp-detail-drawer-state", safeState\)/);
assert.match(map, /data-drawer-state=\{detailDrawerState\}/);
assert.match(map, /Panel size: \$\{panelState\}\. Activate to \$\{panelState === "full" \? "collapse" : "expand"\}/);
assert.match(map, /className="dp-map-bottom-nav-shell[^\n]+fixed inset-x-0 bottom-0/);

assert.match(map, /\["collapsed", "medium", "expanded"\]\.includes\(savedState\)/);
assert.match(map, /window\.sessionStorage\.setItem\("dp-active-perks-drawer-state", safeState\)/);
assert.match(perks, /data-drawer-state=\{drawerState\}/);
assert.match(perks, /className=\{`dp-active-perks-sheet is-\$\{drawerState\}`\}/);
assert.match(perks, /aria-label="Close active perks"/);
assert.match(activePerks, /\.dp-active-perks-sheet\.is-medium/);

assert.match(canonical, /\.dp-map-bottom-nav-shell\.dp-map-bottom-nav-shell[\s\S]*?inset: auto 0 0 !important/);
assert.match(canonical, /width: 100vw !important/);
assert.match(fullscreen, /grid-template-columns: 44px minmax\(0, 1fr\) 44px !important/);
assert.match(fullscreen, /overscroll-behavior-y: contain !important/);

const workspaceControlBlock = workspaceLock.slice(workspaceLock.indexOf("Every workspace page and temporary surface"));
assert.ok(workspaceControlBlock.length > 0, "workspace surface control contract is missing");
assert.doesNotMatch(workspaceControlBlock, /\.dp-map-page/);
assert.doesNotMatch(workspaceControlBlock, /\.dp-detail-drawer/);
assert.doesNotMatch(workspaceControlBlock, /\.dp-active-perks-sheet/);

console.log("Polished map panel states, controls, persistence, and bottom navigation: PASS");
