import path from "node:path";
import { IMPORT_DIR, MAP_DATA_DIR, normalizeTakeoutFeature, readJsonFile, writeCsvFile, writeJsonFile } from "./map-registry-utils";

const inputPath = path.join(IMPORT_DIR, "downtown-perks-takeout-seed.json");
const geoJson = readJsonFile<any>(inputPath);
const entities = (geoJson.features || []).map(normalizeTakeoutFeature);

writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.seed.json"), entities);
writeCsvFile(path.join(IMPORT_DIR, "downtown-perks-takeout-seed.csv"), entities);

console.log(`Imported ${entities.length} Google Takeout saved places into mapEntityRegistry.seed.json`);
