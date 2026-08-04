import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const extensions = new Set([".js", ".jsx", ".ts", ".tsx", ".css"]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return extensions.has(path.extname(entry.name)) ? [absolute] : [];
  });
}

for (const file of walk(ROOT)) {
  const source = readFileSync(file, "utf8");
  assert.doesNotMatch(source, /\brounded-full\b/, `Pill utility is forbidden: ${file}`);
  assert.doesNotMatch(source, /border(?:-(?:top-left|top-right|bottom-right|bottom-left))?-radius\s*:\s*(?:9999px|999px|50%|100%)/i, `Fully circular CSS radius is forbidden: ${file}`);
}

const containment = readFileSync(path.join(ROOT, "styles/phase-two-native-containment-final.css"), "utf8");
assert.match(containment, /height:\s*min\(85dvh, 760px\)\s*!important/);
assert.match(containment, /max-height:\s*85dvh\s*!important/);
assert.match(containment, /flex-direction:\s*column\s*!important/);
assert.match(containment, /overflow:\s*hidden\s*!important/);
assert.match(containment, /\.dp-native-drawer-scroll[\s\S]*overflow-y:\s*auto\s*!important/);
assert.match(containment, /overscroll-behavior:\s*contain\s*!important/);
assert.match(containment, /\.dp-native-detail-grabber[\s\S]*width:\s*96px\s*!important/, "The drag affordance must not cover Back or Close controls");

const map = readFileSync(path.join(ROOT, "pages/Map.jsx"), "utf8");
assert.match(map, /data-map-drawer-close/);
assert.match(map, /data-map-drawer-back/);
assert.match(map, /data-drawer-state/);

console.log("panel geometry and radius contract passed");
