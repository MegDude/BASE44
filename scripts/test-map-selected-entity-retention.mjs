import assert from "node:assert/strict";
import { retainSelectedMapEntity } from "../src/lib/mapSelectedEntityRetention.js";

const selectedHotel = {
  id: "partner-hotel-example",
  raw: { launch_pin_id: "launch-dp-pin-e4046742f9" },
};
const hotels = Array.from({ length: 39 }, (_, index) => ({
  id: `hotel-${index + 1}`,
  category: "Hotel",
}));
const visible = hotels.slice(0, 8);

const retained = retainSelectedMapEntity({
  selectedEntityId: "launch-dp-pin-e4046742f9",
  visibleEntities: visible,
  allEntities: [...hotels, selectedHotel],
  limit: 8,
});

assert.equal(retained.length, 8);
assert.strictEqual(retained[0], selectedHotel);
assert.equal(retained.filter((entity) => entity.id === selectedHotel.id).length, 1);
assert.equal(retained.some((entity) => entity.id === "hotel-1"), true);

const alreadyVisible = retainSelectedMapEntity({
  selectedEntity,
  visibleEntities: [hotels[0], selectedHotel, hotels[1]],
  allEntities: [...hotels, selectedHotel],
  limit: 3,
});
assert.equal(alreadyVisible.length, 3);
assert.strictEqual(alreadyVisible[0], selectedHotel);
assert.equal(alreadyVisible.filter((entity) => entity.id === selectedHotel.id).length, 1);

const unchanged = retainSelectedMapEntity({
  selectedEntityId: "missing-hotel",
  visibleEntities: visible,
  allEntities: hotels,
  limit: 8,
});
assert.deepEqual(unchanged, visible);

console.log("map selected entity retention contract passed");
