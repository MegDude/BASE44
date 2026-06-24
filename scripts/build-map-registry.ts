import path from "node:path";
import { dedupeMapEntities } from "../src/data/map/entityDedupe";
import type { MapEntity } from "../src/data/map/mapEntitySchema";
import { MAP_DATA_DIR, readJsonFile, writeJsonFile } from "./map-registry-utils";

const enrichedPath = path.join(MAP_DATA_DIR, "mapEntityRegistry.enriched.json");
const entities = readJsonFile<MapEntity[]>(enrichedPath);
const { entities: deduped, manualReview } = dedupeMapEntities(entities);
const canonical = deduped.map((entity) => ({
  ...entity,
  datasetStatus: entity.datasetStatus === "enriched" ? "canonical" : entity.datasetStatus,
  active: entity.active !== false,
  updatedAt: new Date().toISOString(),
}));

writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.full.json"), canonical);
writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.manualReview.json"), manualReview);

console.log(`Built canonical registry with ${canonical.length} entities. Manual review duplicates: ${manualReview.length}.`);
