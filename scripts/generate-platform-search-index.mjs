import { readFile, writeFile } from "node:fs/promises";
import { buildPlatformSearchCatalog } from "../src/lib/search/platformSearchCatalog.js";

const inventoryUrl = new URL("../src/data/production/production-map-inventory.json", import.meta.url);
const outputUrl = new URL("../src/data/production/platform-search-index.json", import.meta.url);
const inventory = JSON.parse(await readFile(inventoryUrl, "utf8"));
const records = Array.isArray(inventory?.records) ? inventory.records : [];
const documents = buildPlatformSearchCatalog(records);

await writeFile(outputUrl, `${JSON.stringify(documents)}\n`);

console.log(`Platform search index generated: ${documents.length} searchable documents from ${records.length} canonical records.`);
