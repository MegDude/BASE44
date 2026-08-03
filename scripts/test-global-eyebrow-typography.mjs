import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");
const canonical = "text-[11px] font-bold uppercase tracking-[0.15em]";
const semanticPattern = /className=["'][^"']*(?:eyebrow|kicker|overline|section-label|section-kicker|panel-label|workspace-label|access-label|dp-label)[^"']*["']/gi;
const forbiddenTracking = /tracking-(?:wide|wider|widest|\[(?!(?:-)|0\.15em\])[^\]]+\])/g;
const positiveLetterSpacing = /letter-spacing\s*:\s*(?!-)(?:\d*\.?\d+)(?:em|rem|px)?/gi;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
}

let eyebrowCount = 0;
for (const file of await walk(root)) {
  const extension = path.extname(file);
  if (![".js", ".jsx", ".ts", ".tsx", ".css"].includes(extension)) continue;
  const source = await readFile(file, "utf8");
  if (extension === ".css") {
    if (!file.endsWith("phase-two-native-containment-final.css")) {
      assert.doesNotMatch(source, positiveLetterSpacing, `Expanded CSS letter spacing is forbidden: ${file}`);
    }
    continue;
  }
  assert.doesNotMatch(source, forbiddenTracking, `Non-eyebrow expanded tracking is forbidden: ${file}`);
  for (const match of source.matchAll(semanticPattern)) {
    eyebrowCount += 1;
    assert.ok(match[0].includes(canonical), `Eyebrow is missing the canonical utilities: ${file}`);
  }
}

const terminalCss = await readFile(path.join(root, "styles/phase-two-native-containment-final.css"), "utf8");
assert.match(terminalCss, /letter-spacing: 0\.15em !important;/);
assert.ok(eyebrowCount > 0, "Expected canonical eyebrows to be present.");
console.log(`Global eyebrow typography contract passed for ${eyebrowCount} semantic eyebrows.`);
