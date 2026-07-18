import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/surface-containment-final.css", "utf8");

const imports = main.match(/^import "@\/styles\/[^"]+"$/gm) || [];
assert.equal(imports.at(-1), 'import "@/styles/surface-containment-final.css"', "viewport containment must remain the final stylesheet lock");
assert.match(styles, /max-height:calc\(100dvh - var\(--dp-map-native-bottom-nav-height,64px\)/, "medium map panels must remain below the visible safe-area top");
assert.match(styles, /:is\(\[data-drawer-state="full"\],\[data-drawer-state="expanded"\]\)[\s\S]*?height:100dvh!important;[\s\S]*?max-height:100dvh!important;/, "expanded panels must be contained by the dynamic viewport");
assert.match(styles, /\.dp-workspace-sheet,[\s\S]*?\.dp-quick-search-modal,[\s\S]*?\.dp-workspace-upgrade-modal[\s\S]*?max-height:calc\(100dvh/, "workspace and search surfaces must remain inside the viewport");
assert.match(styles, /> :is\([\s\S]*?\.dp-panel-toolbar,[\s\S]*?\.dp-workspace-sheet-header[\s\S]*?position:sticky!important;[\s\S]*?top:0!important;/, "panel controls must remain reachable while content scrolls");
assert.match(styles, /\.dp-workspace-sheet-body,[\s\S]*?overflow-y:auto!important;/, "panel bodies must own overflow instead of extending the shell");

console.log("Viewport-contained panels, sticky controls, and internal scroll ownership: PASS");
