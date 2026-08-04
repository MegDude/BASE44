import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/partner-destination-drawer-final.css", import.meta.url), "utf8");

assert.match(mapSource, /\.filter\(\(item\) => Boolean\(item\.place\?\.id\)\)/, "nearby destinations must omit unresolved entities");
assert.doesNotMatch(mapSource, /onClick=\{\(\) => item\.place && onSelect\(item\.place\)\} disabled=\{!item\.place\}/, "nearby cards must not expose disabled dead ends");
assert.match(mapSource, /aria-label=\{`Open \$\{item\.title\}`\}/, "nearby destination cards must have descriptive labels");
assert.match(styles, /\.dp-partner-nearby-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s, "nearby destinations must render as a two-column grid");
assert.match(styles, /\.dp-partner-nearby-list button\s*\{[^}]*grid-template-rows:\s*92px\s+minmax\(0,\s*1fr\)/s, "nearby cards must use image-first card geometry");

console.log("Nearby destination grid regression checks passed.");
