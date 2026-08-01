import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STYLES_DIR = path.join(ROOT, "src", "styles");
const ENTRY_FILE = path.join(ROOT, "src", "main.jsx");

// This is a ratchet, not a claim that the current baseline is acceptable.
// Each consolidation batch lowers these ceilings after its visual suite passes.
const MAX_STATIC_STYLE_IMPORTS = 130;
const MAX_STYLE_SOURCE_BYTES = 7 * 1024 * 1024;

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return cssFiles(target);
    return entry.isFile() && entry.name.endsWith(".css") ? [target] : [];
  }));
  return nested.flat();
}

const [entry, files] = await Promise.all([readFile(ENTRY_FILE, "utf8"), cssFiles(STYLES_DIR)]);
const staticImports = [...entry.matchAll(/(?:import\s+|@import\s+).*?styles\/[^'"`]+\.css/g)].length;
const sizes = await Promise.all(files.map((file) => stat(file)));
const sourceBytes = sizes.reduce((total, item) => total + item.size, 0);
const report = {
  staticStyleImports: staticImports,
  styleSourceBytes: sourceBytes,
  styleSourceMiB: Number((sourceBytes / 1024 / 1024).toFixed(2)),
  limits: {
    staticStyleImports: MAX_STATIC_STYLE_IMPORTS,
    styleSourceBytes: MAX_STYLE_SOURCE_BYTES,
  },
};

console.log(JSON.stringify({ event: "css-entry-budget", ...report }));

if (staticImports > MAX_STATIC_STYLE_IMPORTS || sourceBytes > MAX_STYLE_SOURCE_BYTES) {
  console.error("Global style budget exceeded. Consolidate or route-split CSS before adding more.");
  process.exit(1);
}
