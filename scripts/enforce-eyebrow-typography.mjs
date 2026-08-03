import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");
const codeExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const eyebrowTokens = ["eyebrow", "kicker", "overline", "section-label", "section-kicker", "panel-label", "workspace-label", "access-label", "dp-label"];
const expandedTracking = /\btracking-(?:wide|wider|widest|\[(?!(?:-)|0\.15em\])[^\]]+\])/g;
const sizeUtility = /\btext-(?:xs|sm|base|lg|xl|\d+xl|\[(?:\d+(?:\.\d+)?)(?:px|rem|em)\])\b/g;
const weightUtility = /\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g;

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
}

function cleanClasses(value) {
  return value.replace(/\s+/g, " ").trim();
}

function standardizeOpeningTag(match, tag, before, quote, classes, after) {
  if (!expandedTracking.test(classes)) {
    expandedTracking.lastIndex = 0;
    const semantic = eyebrowTokens.some((token) => classes.toLowerCase().includes(token)) || classes.includes("tracking-[0.15em]");
    if (!semantic) return match;
  }
  expandedTracking.lastIndex = 0;
  const semantic = eyebrowTokens.some((token) => classes.toLowerCase().includes(token)) || classes.includes("tracking-[0.15em]");
  const microLabel = /\buppercase\b/.test(classes) && /^(p|span|div|small)$/i.test(tag);
  const isEyebrow = semantic || microLabel;
  let next = classes.replace(expandedTracking, "tracking-normal");
  if (isEyebrow) {
    next = next
      .replace(sizeUtility, "")
      .replace(weightUtility, "")
      .replace(/\bnormal-case\b/g, "")
      .replace(/\blowercase\b/g, "")
      .replace(/\btracking-normal\b/g, "");
    next = `${next} dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]`;
  }
  return `<${tag}${before}className=${quote}${cleanClasses(next)}${quote}${after}>`;
}

const files = await filesUnder(root);
let changed = 0;
for (const file of files) {
  const extension = path.extname(file);
  if (!codeExtensions.has(extension) && extension !== ".css") continue;
  const source = await readFile(file, "utf8");
  let next = source;
  if (codeExtensions.has(extension)) {
    next = source.replace(/<([A-Za-z][\w.]*)((?:[^>"']|"[^"]*"|'[^']*')*?)className=(['"])([^'"]*)\3((?:[^>"']|"[^"]*"|'[^']*')*)>/g, standardizeOpeningTag);
    next = next.replace(expandedTracking, "tracking-normal");
  } else if (!file.endsWith("phase-two-native-containment-final.css")) {
    next = source.replace(/letter-spacing\s*:\s*(?!-)(?:\d*\.?\d+)(?:em|rem|px)?(\s*!important)?(?=\s*[;}])/gi, "letter-spacing: normal$1");
  }
  if (next !== source) {
    await writeFile(file, next);
    changed += 1;
  }
}
console.log(`Updated ${changed} source files.`);
