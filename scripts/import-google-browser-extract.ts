import path from "node:path";
import { IMPORT_DIR, MAP_DATA_DIR, normalizeBrowserEntity, readJsonFile, writeJsonFile } from "./map-registry-utils";

const inputPath = path.join(IMPORT_DIR, "downtown-perks-google-map-browser-extract.json");
const rawEntities = readJsonFile<any[]>(inputPath);
const entities = rawEntities.map(normalizeBrowserEntity);

writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.browserExtract.json"), entities);

console.log(`Imported ${entities.length} browser-extracted Google Maps list entities.`);
