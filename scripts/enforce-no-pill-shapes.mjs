import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("src");
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".css"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function normalizeSource(source) {
  return source
    .replace(/\brounded-full\b/g, "rounded-xl")
    .replace(/border-radius\s*:\s*(?:9999px|999px|50%|100%)(\s*!important)?/gi, "border-radius: 12px$1")
    .replace(/border-(top-left|top-right|bottom-right|bottom-left)-radius\s*:\s*(?:9999px|999px|50%|100%)(\s*!important)?/gi, "border-$1-radius: 12px$2");
}

let changed = 0;
for (const file of await walk(ROOT)) {
  const source = await readFile(file, "utf8");
  const next = normalizeSource(source);
  if (next !== source) {
    await writeFile(file, next);
    changed += 1;
  }
}

console.log(`Updated ${changed} source files.`);
