import path from "node:path";
import { buildQaReport } from "../src/data/map/entityValidation";
import type { MapEntity } from "../src/data/map/mapEntitySchema";
import { EXPECTED_FULL_LIST_COUNT, MAP_DATA_DIR, readJsonFile, writeJsonFile } from "./map-registry-utils";

const fullRegistryPath = path.join(MAP_DATA_DIR, "mapEntityRegistry.full.json");
const entities = readJsonFile<MapEntity[]>(fullRegistryPath);
const report = buildQaReport(entities, EXPECTED_FULL_LIST_COUNT);

writeJsonFile(path.join(MAP_DATA_DIR, "mapEntityRegistry.qa.json"), report);
console.log(`QA complete: ${report.actualEntityCount} entities, ${report.issueCount} total issue flags.`);
