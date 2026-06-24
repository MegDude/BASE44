import path from "node:path";
import { MAP_DATA_DIR, readJsonFile, writeJsonFile } from "./map-registry-utils";
import type { MapEntity } from "../src/data/map/mapEntitySchema";
import { enrichMapEntities } from "../src/server/map/mapEntitySyncService";

const browserPath = path.join(MAP_DATA_DIR, "mapEntityRegistry.browserExtract.json");
const seedPath = path.join(MAP_DATA_DIR, "mapEntityRegistry.seed.json");
const browserEntities = readJsonFile<MapEntity[]>(browserPath);
const seedEntities = readJsonFile<MapEntity[]>(seedPath);
const sourceEntities = [...browserEntities, ...seedEntities];

const enriched = process.env.GOOGLE_MAPS_API_KEY
  ? await enrichMapEntities(sourceEntities)
  : sourceEntities.map((entity) => ({
      ...entity,
      datasetStatus: entity.datasetStatus || "manual_review",
      tags: Array.from(new Set([...(entity.tags || []), "needs-google-places-enrichment"])),
      updatedAt: new Date().toISOString(),
    }));

writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.enriched.json"), enriched);
console.log(`Wrote ${enriched.length} entities to mapEntityRegistry.enriched.json${process.env.GOOGLE_MAPS_API_KEY ? "" : " without live Places enrichment (missing GOOGLE_MAPS_API_KEY)"}.`);
