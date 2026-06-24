import path from "node:path";
import { EXPECTED_FULL_LIST_COUNT, IMPORT_DIR, readJsonFile, writeJsonFile } from "./map-registry-utils";

const reportPath = path.join(IMPORT_DIR, "import-report.json");
const existingReport = readJsonFile<Record<string, unknown>>(reportPath);
const report = {
  ...existingReport,
  googleMapsListUrl: process.env.GOOGLE_MAPS_LIST_URL || "https://maps.app.goo.gl/XW1pvU9PyCt8pbve9",
  expectedFullListCount: EXPECTED_FULL_LIST_COUNT,
  syncStatus: process.env.APIFY_TOKEN && process.env.APIFY_GOOGLE_LIST_ACTOR_ID ? "ready_for_apify_sync" : "seed_only_missing_apify_credentials",
  note: "Google Maps is source material only. Runtime product uses the Downtown Perks canonical registry.",
  syncedAt: new Date().toISOString(),
};

writeJsonFile(reportPath, report);
console.log(`Updated Google Maps list sync report: ${report.syncStatus}`);
