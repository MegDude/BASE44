import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sheet = await readFile(new URL("../src/components/partner/workspace/WorkspaceSheetSystem.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/workspace-campaign-drawer-contract.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

assert.match(sheet, /data-workspace-drawer="true"/);
assert.match(main, /workspace-campaign-drawer-contract\.css/);
assert.match(styles, /\.dp-workspace-sheet\[data-workspace-drawer="true"\]/);
assert.match(styles, /\.dp-workspace-sheet-layer[\s\S]*z-index:\s*2200 !important/);
assert.match(styles, /grid-template-rows: auto auto minmax\(0, 1fr\) auto/);
assert.match(styles, /\.dp-workspace-sheet-body[\s\S]*overflow: auto/);
assert.match(styles, /@media \(max-width: 767px\)/);
assert.match(styles, /\.dp-experience-builder \{[\s\S]*display: block !important/);
assert.doesNotMatch(styles, /border-radius:\s*(?:10px|18px|22px)/);
console.log("Workspace campaign drawer contract: PASS");
