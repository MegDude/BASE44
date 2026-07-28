import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, "src", "data", "production");

function generate() {
  const result = spawnSync(process.execPath, ["scripts/generate-production-content-system.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || "Production content generation failed");
}

async function outputHashes() {
  const files = (await readdir(outputDir)).sort();
  return Object.fromEntries(await Promise.all(files.map(async (file) => {
    const contents = await readFile(path.join(outputDir, file));
    return [file, createHash("sha256").update(contents).digest("hex")];
  })));
}

generate();
const firstHashes = await outputHashes();
generate();
const secondHashes = await outputHashes();
assert.deepEqual(secondHashes, firstHashes, "Production content generation is not deterministic");

const production = JSON.parse(await readFile(path.join(outputDir, "production-map-inventory.json"), "utf8"));
const records = Array.isArray(production.records) ? production.records : [];
assert.equal(records.length, 1473, "Published canonical entity count changed");
assert.equal(new Set(records.map((record) => record.id)).size, 1473, "Published inventory contains duplicate canonical IDs");

console.log("Production content generation: deterministic, 1,473 canonical entities, 0 duplicate IDs");
