import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { DAA_TOUR_STOP_COUNT, daaTourStops } from "../src/data/daaArtParksTour.js";

const hospitalityCsvRows = parse(fs.readFileSync(new URL("../src/data/imports/downtown_perks_hospitality_map_copy_deck.csv", import.meta.url), "utf8"), {
  bom: true,
  columns: true,
  skip_empty_lines: true,
});

assert.equal(daaTourStops.length, DAA_TOUR_STOP_COUNT, "DAA stop count must match the declared tour count");
assert.equal(new Set(daaTourStops.map((stop) => stop.id)).size, DAA_TOUR_STOP_COUNT, "DAA stop ids must be unique");

const stopIds = new Set(daaTourStops.map((stop) => stop.id));
for (const stop of daaTourStops) {
  assert.ok(Number.isFinite(stop.coordinates?.lat) && Number.isFinite(stop.coordinates?.lng), `${stop.id} needs valid coordinates`);
  assert.equal(stop.checkInEnabled, true, `${stop.id} must allow check-in`);
  assert.ok(stop.imageUrl, `${stop.id} needs a map image`);
  for (const relationshipId of [...(stop.nearbyStops || []), ...(stop.relatedStops || [])]) {
    assert.ok(stopIds.has(relationshipId), `${stop.id} references missing stop ${relationshipId}`);
  }
}

assert.equal(hospitalityCsvRows.length, 142, "Expected the complete canonical CSV inventory");
const currentEntities = hospitalityCsvRows.filter((row) => row.record_status === "current_map_entity");
const hospitalityChildren = hospitalityCsvRows.filter((row) => row.record_status === "new_enriched_hospitality_record");
assert.equal(currentEntities.length, 127, "Expected all current map entities to remain represented");
assert.equal(hospitalityChildren.length, 15, "Expected all new Hotel Van Zandt and Fairmont child records");
assert.equal(new Set(hospitalityCsvRows.map((row) => row.entity_id)).size, hospitalityCsvRows.length, "Hospitality entity ids must be unique");
for (const row of hospitalityChildren) {
  assert.ok(row.parent_entity_id, `${row.entity_id} needs a canonical parent hotel`);
  assert.ok(row.source_url, `${row.entity_id} needs an official source URL`);
  assert.ok(row.verification_status, `${row.entity_id} needs verification status`);
}

console.log(JSON.stringify({
  daaStops: daaTourStops.length,
  csvRows: hospitalityCsvRows.length,
  currentEntities: currentEntities.length,
  hospitalityChildren: hospitalityChildren.length,
  status: "passed",
}, null, 2));
