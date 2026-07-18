#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const generated = path.join(root, "inventory", "generated");
const required = [
  "partner-app-pages.csv", "entity-content-register.csv", "relationship-matrix.csv",
  "copy-link-register.csv", "seo-ai-search-index.csv", "routes-and-collections.csv",
  "perks-and-events.csv", "campaign-register.csv", "workspace-register.csv",
  "map-layer-register.csv", "media-register.csv", "redirect-register.csv",
  "content-inventory.json", "inventory-metadata.json", "inventory-summary.md",
  "inventory-errors.json", "orphan-report.csv", "duplicate-report.csv", "broken-links.csv",
];

for (const name of required) {
  const stat = await fs.stat(path.join(generated, name));
  if (!stat.isFile() || stat.size === 0) throw new Error(`${name} was not generated.`);
}

const inventoryText = await fs.readFile(path.join(generated, "content-inventory.json"), "utf8");
const inventory = JSON.parse(inventoryText);
const metadata = JSON.parse(await fs.readFile(path.join(generated, "inventory-metadata.json"), "utf8"));

if (metadata.routeCount < 100) throw new Error(`Expected the complete router, found ${metadata.routeCount} routes.`);
if (metadata.entityCount < 1000) throw new Error(`Expected the production entity registry, found ${metadata.entityCount} entities.`);
if (!metadata.redirectCount) throw new Error("Redirect inventory is empty.");
if (!metadata.qualityGates.workspacePagesNoindex || !metadata.qualityGates.adminPagesNoindex) throw new Error("Private routes must be noindex.");
if (metadata.qualityGates.serviceRoleExported) throw new Error("A service-role credential must never be exported.");
if (/SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][^"']+/i.test(inventoryText)) throw new Error("Generated inventory appears to contain a service-role credential.");

const pagePaths = new Set(inventory.pages.map((row) => row.canonicalPath));
for (const requiredPath of ["/map", "/partners", "/partner-workspace/overview", "/admin-studio"]) {
  if (!pagePaths.has(requiredPath)) throw new Error(`Required route missing from inventory: ${requiredPath}`);
}
for (const entity of inventory.entities) {
  if (entity.visibility === "Public" && !entity.residentLink) throw new Error(`Public entity lacks resident link: ${entity.objectId}`);
  if (!entity.embeddingText) throw new Error(`Entity lacks embedding text: ${entity.objectId}`);
}

console.log(JSON.stringify({ requiredOutputs: required.length, routeCount: metadata.routeCount, entityCount: metadata.entityCount, redirectCount: metadata.redirectCount }, null, 2));
