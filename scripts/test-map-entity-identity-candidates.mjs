import assert from "node:assert/strict";
import {
  entityHasMapIdentity,
  getMapEntityIdentityCandidates,
  resolveMapEntityByIdentityCandidates,
} from "../src/lib/mapEntityIdentityCandidates.js";

const canonicalHotel = {
  id: "partner-hotel-example",
  entityId: "hotel-example",
  slug: "example-hotel",
  raw: {
    launch_pin_id: "launch-dp-pin-e4046742f9",
    aliases: ["legacy-example-hotel"],
  },
  metadata: {
    markerId: "marker-example-hotel",
  },
};

const identities = getMapEntityIdentityCandidates(canonicalHotel);
assert.ok(identities.includes("partner-hotel-example"));
assert.ok(identities.includes("hotel-example"));
assert.ok(identities.includes("launch-dp-pin-e4046742f9"));
assert.ok(identities.includes("legacy-example-hotel"));
assert.ok(identities.includes("marker-example-hotel"));

assert.equal(entityHasMapIdentity(canonicalHotel, "launch-dp-pin-e4046742f9"), true);
assert.equal(entityHasMapIdentity(canonicalHotel, "PARTNER-HOTEL-EXAMPLE"), true);
assert.equal(entityHasMapIdentity(canonicalHotel, "missing-pin"), false);

const otherHotel = {
  id: "partner-hotel-other",
  raw: { launchPinId: "launch-dp-pin-other" },
};

const resolved = resolveMapEntityByIdentityCandidates(
  "launch-dp-pin-e4046742f9",
  [otherHotel, canonicalHotel],
);
assert.strictEqual(resolved, canonicalHotel);
assert.equal(resolved.id, "partner-hotel-example");
assert.equal(
  resolveMapEntityByIdentityCandidates("missing-pin", [otherHotel, canonicalHotel]),
  null,
);

console.log("map entity identity candidate contract passed");
