import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const publicPath = path.join(repoRoot, "src/data/imports/launchMapPins.generated.json");
const adminPath = path.join(repoRoot, "src/data/imports/launchMapPins.admin.generated.json");
const publicPayload = JSON.parse(fs.readFileSync(publicPath, "utf8"));
const adminPayload = JSON.parse(fs.readFileSync(adminPath, "utf8"));

const internalOnlyFields = new Set([
  "source_file",
  "source_sheet",
  "source_id",
  "launch_note",
  "internal_source_note",
  "partner_positioning_copy",
  "activation_idea",
  "content_status",
  "launch_readiness",
  "launch_priority",
  "status",
  "launchTier",
  "publicVisibility",
  "contentApprovalStatus",
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findInternalKeys(value, pathParts = []) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findInternalKeys(item, [...pathParts, String(index)]));
  }
  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPath = [...pathParts, key];
    const hits = internalOnlyFields.has(key) ? [nextPath.join(".")] : [];
    return hits.concat(findInternalKeys(nested, nextPath));
  });
}

const pins = publicPayload.pins || [];
const adminPins = adminPayload.pins || [];
const adminById = new Map(adminPins.map((pin) => [pin.normalizedPinId, pin]));
const leakedKeys = findInternalKeys(pins);
const civicStories = pins.filter((pin) => pin.publicCategory === "Civic" && pin.collection === "downtown-stories-walk");
const hotelPins = pins.filter((pin) => pin.pinType === "hotel_guest_pin" || pin.publicCategory === "Hotels");
const buildingPins = pins.filter((pin) => pin.pinType === "building_entry_pin" || pin.publicCategory === "Residential Buildings");
const exactMarkersWithoutCoordinates = pins.filter((pin) => pin.hasExactMarker && (!Number.isFinite(pin.latitude) || !Number.isFinite(pin.longitude)));
const draftOffersExposed = pins.filter((pin) => {
  const adminPin = adminById.get(pin.pinId);
  return pin.offer && adminPin && !["approved", "published"].includes(adminPin.contentApprovalStatus);
});
const searchablePins = pins.filter((pin) => (pin.searchKeywords || []).length || (pin.recommendedTags || []).length);

assert(publicPayload.sourceSummary?.launchPinRows === 576, `Expected 576 source launch rows, got ${publicPayload.sourceSummary?.launchPinRows}`);
assert(pins.length > 0, "Expected generated public launch pins");
assert(leakedKeys.length === 0, `Public payload leaked internal fields: ${leakedKeys.slice(0, 10).join(", ")}`);
assert(civicStories.length > 0, "Expected Civic Downtown Stories Walk pins");
assert(hotelPins.length > 0, "Expected hotel guest pins");
assert(buildingPins.length > 0, "Expected building-entry pins");
assert(exactMarkersWithoutCoordinates.length === 0, "Exact markers must include valid coordinates");
assert(draftOffersExposed.length === 0, `Draft offers exposed publicly: ${draftOffersExposed.map((pin) => pin.pinId).slice(0, 10).join(", ")}`);
assert(searchablePins.length === pins.length, "Every public pin should include tags or search keywords");
assert((adminPayload.campaignMatrix || []).length === 96, `Expected 96 campaign matrix rows, got ${(adminPayload.campaignMatrix || []).length}`);
assert((adminPayload.missingVerifyPartners || []).length === 27, `Expected 27 missing/verify campaign partners, got ${(adminPayload.missingVerifyPartners || []).length}`);

console.log(JSON.stringify({
  launchPinRows: publicPayload.sourceSummary.launchPinRows,
  publicPins: pins.length,
  civicStories: civicStories.length,
  hotelPins: hotelPins.length,
  buildingPins: buildingPins.length,
  campaignMatrixRows: adminPayload.campaignMatrix.length,
  missingVerifyPartners: adminPayload.missingVerifyPartners.length,
}, null, 2));
