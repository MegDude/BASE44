import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { CONTENT_BANNED_PHRASES, CONTENT_GENERIC_ACTIONS } from "../src/content/contentGovernance";

const root = path.resolve("src");
const extensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const excluded = [
  `${path.sep}data${path.sep}imports${path.sep}`,
  `${path.sep}content${path.sep}contentGovernance.ts`,
];

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(fullPath);
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  }));
  return nested.flat();
}

const files = (await collectFiles(root)).filter((file) => !excluded.some((part) => file.includes(part)));
const violations: Array<{ file: string; line: number; phrase: string }> = [];
const genericActionPattern = new RegExp(`(?:>\\s*(${CONTENT_GENERIC_ACTIONS.join("|")})\\s*<|(?:label|actionLabel|cta|buttonText|primaryCTA|secondaryCTA|submitLabel|emptyAction|meta)\\s*[:=]\\s*["'](${CONTENT_GENERIC_ACTIONS.join("|")})["'])`, "i");

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    for (const phrase of CONTENT_BANNED_PHRASES) {
      if (lower.includes(phrase)) violations.push({ file: path.relative(process.cwd(), file), line: index + 1, phrase });
    }
    const genericMatch = line.match(genericActionPattern);
    if (genericMatch) violations.push({ file: path.relative(process.cwd(), file), line: index + 1, phrase: String(genericMatch[1] || genericMatch[2]).toLowerCase() });
  });
}

if (violations.length) {
  console.error("Content governance violations:");
  for (const violation of violations) console.error(`${violation.file}:${violation.line} — ${violation.phrase}`);
  process.exit(1);
}

console.log(`Content governance passed across ${files.length} application source files.`);
