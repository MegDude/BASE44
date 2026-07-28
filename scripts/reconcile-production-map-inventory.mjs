#!/usr/bin/env node

import fs from "node:fs/promises";

const inventoryUrl = new URL("../src/data/production/production-map-inventory.json", import.meta.url);
const aliasRegistryUrl = new URL("../src/data/production/canonicalEntityAliasRegistry.ts", import.meta.url);

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validCoordinates(record) {
  return record.lat != null
    && record.lng != null
    && record.lat !== ""
    && record.lng !== ""
    && Number.isFinite(Number(record.lat))
    && Number.isFinite(Number(record.lng));
}

function distanceMeters(left, right) {
  if (!validCoordinates(left) || !validCoordinates(right)) return Number.POSITIVE_INFINITY;
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(Number(right.lat) - Number(left.lat));
  const dLng = radians(Number(right.lng) - Number(left.lng));
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(Number(left.lat))) * Math.cos(radians(Number(right.lat))) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function family(record) {
  if (["restaurant", "bar", "coffee", "retail", "wellness", "venue"].includes(record.entityType)) return "place";
  return record.entityType;
}

function completeness(record) {
  return [
    record.address,
    record.description,
    record.primaryImage,
    record.searchText,
    validCoordinates(record),
  ].filter(Boolean).length + (record.entityType === "listing" ? 0 : 1);
}

function mergeRecord(primary, secondary) {
  const aliases = new Set([...(primary.aliases || []), ...(secondary.aliases || [])]);
  if (secondary.id !== primary.id) aliases.add(secondary.id);
  const richer = completeness(secondary) > completeness(primary) ? secondary : primary;
  return {
    ...secondary,
    ...primary,
    address: richer.address || primary.address || secondary.address,
    description: richer.description || primary.description || secondary.description,
    primaryImage: richer.primaryImage || primary.primaryImage || secondary.primaryImage,
    galleryImages: [...new Set([...(primary.galleryImages || []), ...(secondary.galleryImages || [])])],
    aliases: [...aliases],
  };
}

const inventory = JSON.parse(await fs.readFile(inventoryUrl, "utf8"));
const originalRecords = inventory.records || [];
const placeRecords = originalRecords.filter((record) => !String(record.id || "").startsWith("happy-hour-"));

const normalizedRecords = originalRecords.map((record) => {
  if (!String(record.id || "").startsWith("happy-hour-")) return { ...record };
  const parent = placeRecords
    .filter((candidate) => slug(candidate.name) === slug(record.name) && family(candidate) === "place")
    .sort((left, right) => distanceMeters(left, record) - distanceMeters(right, record))[0];
  return {
    ...record,
    entityType: "perk",
    category: "Perks",
    parentEntityId: parent?.id || record.parentEntityId || "",
  };
});

const canonicalRecords = [];
for (const record of normalizedRecords) {
  const duplicateIndex = canonicalRecords.findIndex((candidate) => {
    if (candidate.id === record.id) return true;
    if (candidate.entityType === "perk" || record.entityType === "perk") return false;
    const compatibleFamily = family(candidate) === family(record)
      || (["place", "listing"].includes(family(candidate)) && ["place", "listing"].includes(family(record)));
    return compatibleFamily && slug(candidate.name) === slug(record.name) && distanceMeters(candidate, record) <= 35;
  });
  if (duplicateIndex === -1) canonicalRecords.push(record);
  else canonicalRecords[duplicateIndex] = mergeRecord(canonicalRecords[duplicateIndex], record);
}

const sortedRecords = canonicalRecords.sort((left, right) => String(left.slug || left.name).localeCompare(String(right.slug || right.name)));
const aliases = Object.fromEntries(
  sortedRecords.flatMap((record) => (record.aliases || []).map((alias) => [alias, record.id])),
);

inventory.records = sortedRecords;
inventory.coverage = {
  ...inventory.coverage,
  normalizedProductionRecords: sortedRecords.length,
  reconciliation: {
    originalRecordCount: originalRecords.length,
    canonicalRecordCount: sortedRecords.length,
    aliasCount: Object.keys(aliases).length,
    rule: "Exact IDs and co-located same-name identities resolve to one canonical record; happy-hour records remain child perks.",
  },
};

await fs.writeFile(inventoryUrl, `${JSON.stringify(inventory, null, 2)}\n`);
await fs.writeFile(
  aliasRegistryUrl,
  `export const canonicalEntityAliasRegistry = ${JSON.stringify(aliases, null, 2)} as const;\n`,
);

console.log(JSON.stringify({
  originalRecordCount: originalRecords.length,
  canonicalRecordCount: sortedRecords.length,
  aliasCount: Object.keys(aliases).length,
}, null, 2));
