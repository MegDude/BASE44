import path from "node:path";
import { dedupeMapEntities } from "../src/data/map/entityDedupe";
import type { MapEntity } from "../src/data/map/mapEntitySchema";
import { classifyDowntownPerksEntity, MAP_DATA_DIR, readJsonFile, writeJsonFile } from "./map-registry-utils";

const enrichedPath = path.join(MAP_DATA_DIR, "mapEntityRegistry.enriched.json");
const entities = readJsonFile<MapEntity[]>(enrichedPath);
const raw = entities.map((entity) => ({
  ...entity,
  updatedAt: new Date().toISOString(),
}));
const { entities: deduped, manualReview } = dedupeMapEntities(raw);
const classified = deduped.map((entity) => classifyDowntownPerksEntity({
  ...entity,
  datasetStatus: entity.datasetStatus === "enriched" ? "canonical" : entity.datasetStatus,
  active: entity.active !== false,
  updatedAt: new Date().toISOString(),
}));
const curated = classified.map((entity) => ({
  ...entity,
  active: entity.entityTier !== "hidden" && entity.experienceScore >= 32 && entity.active !== false,
}));
const production = curated.map((entity) => ({
  ...entity,
  active: entity.entityTier !== "hidden" && entity.experienceScore >= 50 && entity.active !== false,
}));

writeJsonFile(path.join(MAP_DATA_DIR, "mapRegistry.raw.json"), raw);
writeJsonFile(path.join(MAP_DATA_DIR, "mapRegistry.classified.json"), classified);
writeJsonFile(path.join(MAP_DATA_DIR, "mapRegistry.curated.json"), curated);
writeJsonFile(path.join(MAP_DATA_DIR, "mapRegistry.production.json"), production);
writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.full.json"), production);
writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.manualReview.json"), manualReview);
writeJsonFile(path.join(MAP_DATA_DIR, "imageManifest.json"), {
  generatedAt: new Date().toISOString(),
  strategy: "Downtown Perks-owned imagery first; Google photos are fallback enrichment only.",
  entities: production.reduce<Record<string, { heroImage?: string; galleryImage?: string; cardImage?: string; drawerImage?: string; fallbackGooglePhoto?: string }>>((manifest, entity) => {
    manifest[entity.id] = {
      heroImage: entity.imageUrl,
      cardImage: entity.imageUrl,
      drawerImage: entity.imageUrl,
      fallbackGooglePhoto: entity.imageUrl,
    };
    return manifest;
  }, {}),
});

console.log(`Built registry stages: raw ${raw.length}, classified ${classified.length}, curated ${curated.length}, production ${production.length}. Manual review duplicates: ${manualReview.length}.`);
