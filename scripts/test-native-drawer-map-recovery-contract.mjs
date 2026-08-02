import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const geometry = readFileSync("src/styles/native-drawer-geometry-final.css", "utf8");
const shell = readFileSync("src/components/map/NativeDrawerShell.jsx", "utf8");
const routeSheet = readFileSync("src/components/map/route/RouteExperienceSheet.tsx", "utf8");

assert.match(geometry, /--dp-safe-top:\s*max\(env\(safe-area-inset-top, 0px\), 12px\);/, "Drawer geometry must define a safe top inset");
assert.match(geometry, /--dp-map-recovery-space:\s*72px;/, "Drawer geometry must reserve 72px of map recovery space");
assert.match(geometry, /--dp-sheet-max-height:\s*calc\(100dvh - var\(--dp-safe-top\) - var\(--dp-map-recovery-space\)\);/, "Drawer max height must preserve map recovery space");
assert.match(geometry, /\.dp-map-page \.dp-native-drawer \{[\s\S]*?inset:\s*auto 0 var\(--dp-safe-bottom\) !important;[\s\S]*?max-height:\s*var\(--dp-sheet-max-height\) !important;/, "Mobile drawer must be bottom-inset and capped by the recovery max height");
assert.match(geometry, /\[data-drawer-state="medium"\][\s\S]*height:\s*min\(calc\(58dvh \+ var\(--dp-bottom-nav-total-height\)\), var\(--dp-sheet-max-height\)\) !important;/, "Medium drawer must stay within the 52-58dvh/recovery envelope");
assert.match(geometry, /\[data-drawer-state="expanded"\][\s\S]*var\(--dp-map-recovery-space\)/, "Expanded drawer must preserve map recovery space");
assert.match(geometry, /\[data-drawer-state="full"\][\s\S]*height:\s*var\(--dp-sheet-max-height\) !important;/, "Full detail must use the same recovery max height, not true fullscreen");
const fullStateBlock = geometry.match(/\.dp-map-page \.dp-native-drawer\[data-drawer-state="full"\] \{[\s\S]*?\n  \}/)?.[0] || "";
assert.ok(fullStateBlock, "Full state block must exist");
assert.doesNotMatch(fullStateBlock, /height:\s*(?:100dvh|100vh|var\(--dp-visual-viewport-height\))/, "Map drawer full state must not use unrestricted fullscreen height");
assert.match(geometry, /\.dp-map-page \.dp-native-drawer-header \{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;[\s\S]*?min-height:\s*56px;[\s\S]*?border-bottom:\s*1px solid rgba\(11, 31, 51, 0\.14\);/, "Drawer header must be fixed/sticky, visible, and divider-led");
assert.match(geometry, /\.dp-map-page \.dp-native-drawer-scroll \{[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior:\s*contain;[\s\S]*?padding-bottom:\s*calc\(88px \+ var\(--dp-safe-bottom\)\);/, "Drawer body must be the single scroll surface with footer clearance");
assert.match(geometry, /\.dp-map-page \.dp-native-drawer-actions \{[\s\S]*?position:\s*sticky;[\s\S]*?bottom:\s*0;[\s\S]*?max-height:\s*72px;[\s\S]*?border-top:\s*1px solid rgba\(11, 31, 51, 0\.14\);/, "Drawer footer must be sticky, bounded, and divider-led");
assert.match(shell, /document\.body\.style\.overflow = "hidden";/, "Native drawer shell must lock background document scroll");
assert.match(shell, /dp-native-drawer-content-viewport[\s\S]*dp-native-drawer-scroll/, "Native drawer shell must expose one content viewport and one scroll body");
assert.match(routeSheet, /scrollRef=\{scrollRef\}/, "Route sheet must own the shared scroll body ref");
assert.match(routeSheet, /previousRouteScrollTopRef\.current = scrollRef\.current\?\.scrollTop \|\| 0;/, "Route stop transition must preserve route scroll position");
assert.match(geometry, /\.dp-map-page \.dp-route-experience-sheet \.dp-route-sheet-scroll \{[\s\S]*padding:\s*0 0 calc\(88px \+ var\(--dp-safe-bottom\)\) !important;/, "Route sheet scroll body must keep footer/safe-area content clearance");

console.log("Native drawer map recovery contract: PASS");
