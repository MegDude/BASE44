import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { entityMediaManifest } from "../src/data/media/entityMediaManifest";
import { mapCollections } from "../src/data/mapCollections";

const failures: string[] = [];

const sourceFiles = fs.readdirSync("src", { recursive: true, encoding: "utf8" })
  .filter((file) => /\.(?:[cm]?[jt]sx?|json|csv)$/i.test(file));
const literalImagePattern = /["'`](\/images\/[^"'`?#\s)]+\.(?:png|jpe?g|webp|avif|gif|svg))/gi;
const checkedImagePaths = new Set<string>();

for (const relativeFile of sourceFiles) {
  const sourcePath = path.join("src", relativeFile);
  const source = fs.readFileSync(sourcePath, "utf8");
  for (const match of source.matchAll(literalImagePattern)) {
    const imagePath = match[1];
    if (imagePath.includes("${")) continue;
    checkedImagePaths.add(imagePath);
    if (!fs.existsSync(path.join("public", imagePath))) failures.push(`${sourcePath}: missing ${imagePath}`);
  }
}

let mediaCount = 0;
for (const [entityId, entry] of Object.entries(entityMediaManifest)) {
  for (const item of [entry.hero, ...(entry.gallery || [])]) {
    mediaCount += 1;
    if (!item.src.startsWith("/images/")) failures.push(`${entityId}: invalid public image path ${item.src}`);
    if (!fs.existsSync(`public${item.src}`)) failures.push(`${entityId}: missing ${item.src}`);
    if (!item.alt || /^(image|photo|hotel image|building image|lifestyle image)$/i.test(item.alt.trim())) failures.push(`${entityId}: invalid alt text`);
  }
}

for (const collection of mapCollections) {
  if (new Set(collection.stopIds).size !== collection.stopIds.length) failures.push(`${collection.id}: duplicate stop IDs`);
  if (collection.stopIds.some((id) => !String(id).trim())) failures.push(`${collection.id}: blank stop ID`);
}

const residential = parse(fs.readFileSync("src/data/imports/downtown_perks_residential_mixed_use_copy_deck.csv", "utf8"), { columns: true, skip_empty_lines: true, bom: true });
for (const row of residential) {
  if (!/^proposed:/i.test(row.resident_perk)) failures.push(`${row.entity_id}: proposed perk is not marked proposed`);
  if (/campaign strategy|audience targeting|conversion rate|partner analytics/i.test(row.resident_panel_copy)) failures.push(`${row.entity_id}: partner language leaked into resident copy`);
  if (!row.verification_status) failures.push(`${row.entity_id}: verification status missing`);
}

const hospitality = parse(fs.readFileSync("src/data/imports/downtown_perks_hospitality_map_copy_deck.csv", "utf8"), { columns: true, skip_empty_lines: true, bom: true });
for (const row of hospitality.filter((item: Record<string, string>) => item.record_status === "new_enriched_hospitality_record")) {
  if (row.entity_id.startsWith("hvz-") && row.parent_entity_id !== "brand-hotel-van-zandt") failures.push(`${row.entity_id}: wrong Hotel Van Zandt parent`);
  if (row.entity_id.startsWith("fairmont-") && row.parent_entity_id !== "brand-fairmont-austin") failures.push(`${row.entity_id}: wrong Fairmont parent`);
}

if (failures.length) throw new Error(`Media reconciliation validation failed:\n${failures.join("\n")}`);
console.log(JSON.stringify({ manifestEntities: Object.keys(entityMediaManifest).length, mediaAssignments: mediaCount, checkedImagePaths: checkedImagePaths.size, collections: mapCollections.length, residentialRecords: residential.length, hospitalityRecords: hospitality.length, status: "passed" }, null, 2));
