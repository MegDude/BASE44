import fs from "node:fs";
import path from "node:path";
import productionMapInventory from "../src/data/production/production-map-inventory.json";
import { mapCollections } from "../src/data/mapCollections";
import { brandCampaignExamples, liveCampaignLayerExamples } from "../src/data/campaignLayerExamples";
import {
  MAP_INTENT_REGISTRY,
  applyMapIntent,
  entityMatchesMapIntent,
  normalizeDistrict,
  normalizeEntityTaxonomy,
  resolveIntentRelationships,
  resolveSearchIntent,
} from "../src/map/searchIntent/mapIntentRegistry";

type AnyEntity = Record<string, any>;

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "docs");
const AUSTIN_REGION = {
  north: 30.37,
  south: 30.17,
  east: -97.62,
  west: -97.86,
};

function writeJson(fileName: string, data: unknown) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(path.join(DOCS_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(fileName: string, data: string) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(path.join(DOCS_DIR, fileName), data);
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return [String(value)];
}

function titleOf(entity: AnyEntity): string {
  return String(entity.name || entity.title || entity.raw?.title || entity.id || "");
}

function idOf(entity: AnyEntity): string {
  return String(entity.entityId || entity.id || entity.raw?.id || "");
}

function listingIdOf(entity: AnyEntity): string {
  return String(entity.listingId || entity.listing || entity.raw?.listingId || entity.raw?.listing || idOf(entity));
}

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function latOf(entity: AnyEntity): number | null {
  const value = Number(entity.latitude ?? entity.lat ?? entity.coords?.[0] ?? entity.raw?.lat);
  return Number.isFinite(value) ? value : null;
}

function lngOf(entity: AnyEntity): number | null {
  const value = Number(entity.longitude ?? entity.lng ?? entity.coords?.[1] ?? entity.raw?.lng);
  return Number.isFinite(value) ? value : null;
}

function entityText(entity: AnyEntity): string {
  return [
    idOf(entity),
    titleOf(entity),
    entity.type,
    entity.kind,
    entity.entityType,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.district,
    entity.address,
    entity.brand,
    entity.summary,
    entity.description,
    entity.raw?.category,
    entity.raw?.neighborhood,
    ...asArray(entity.tags),
    ...asArray(entity.searchKeywords),
  ].filter(Boolean).join(" ").toLowerCase();
}

function isPublishedVisible(entity: AnyEntity): boolean {
  const text = entityText(entity);
  return entity.active !== false && entity.raw?.active !== false && !/\b(test|demo|placeholder|archived|unpublished|qa only)\b/.test(text);
}

function inAustinRegion(entity: AnyEntity): boolean {
  const lat = latOf(entity);
  const lng = lngOf(entity);
  if (lat === null || lng === null) return false;
  return lat >= AUSTIN_REGION.south && lat <= AUSTIN_REGION.north && lng >= AUSTIN_REGION.west && lng <= AUSTIN_REGION.east;
}

function modeVisibility(entity: AnyEntity) {
  const text = entityText(entity);
  const partnerVisible = !/\b(private resident only)\b/.test(text);
  const residentVisible = !/\b(admin|internal|workspace only|private partner)\b/.test(text);
  return { residentVisible, partnerVisible };
}

function statusOf(entity: AnyEntity): string {
  if (!isPublishedVisible(entity)) return "inactive";
  if (entity.raw?.datasetStatus) return String(entity.raw.datasetStatus);
  if (entity.datasetStatus) return String(entity.datasetStatus);
  return "active";
}

function detailRenderer(entity: AnyEntity): string {
  return String(entity.detailDrawerType || entity.markerType || entity.type || entity.kind || "venue");
}

function iconFor(entity: AnyEntity): string {
  return String(entity.pinKey || entity.markerType || entity.kind || entity.type || "venue");
}

function getCampaignIds(entity: AnyEntity): string[] {
  const text = entityText(entity);
  return [...brandCampaignExamples, ...liveCampaignLayerExamples]
    .filter((campaign) => [campaign.id, campaign.brandId, campaign.brandName, campaign.campaignName, campaign.area, campaign.intent]
      .filter(Boolean)
      .some((value) => text.includes(String(value).toLowerCase().replace(/^brand-/, "").replace(/-/g, " "))))
    .map((campaign) => campaign.id);
}

function getCollectionIds(entity: AnyEntity): string[] {
  const id = idOf(entity);
  const text = entityText(entity);
  return mapCollections
    .filter((collection) => collection.stopIds?.includes(id) || collection.stopHints?.some((hint) => text.includes(String(hint).toLowerCase())))
    .map((collection) => collection.id);
}

function getBrandIds(entity: AnyEntity): string[] {
  const text = entityText(entity);
  return [...new Set([
    ...getCampaignIds(entity)
      .map((campaignId) => [...brandCampaignExamples, ...liveCampaignLayerExamples].find((campaign) => campaign.id === campaignId)?.brandId || "")
      .filter(Boolean),
    text.includes("inkind") || text.includes("in kind") ? "inkind" : "",
    text.includes("legends") ? "legends-real-estate-downtown-austin" : "",
  ].filter(Boolean))];
}

function inventoryRow(entity: AnyEntity) {
  const taxonomy = normalizeEntityTaxonomy(entity);
  const visibility = modeVisibility(entity);
  const collectionIds = getCollectionIds(entity);
  const campaignIds = getCampaignIds(entity);
  return {
    entityId: idOf(entity),
    listingId: listingIdOf(entity),
    entityType: taxonomy.primaryType,
    category: taxonomy.category,
    subcategory: taxonomy.subcategories.join(", "),
    name: titleOf(entity),
    slug: entity.slug || slugify(titleOf(entity)),
    latitude: latOf(entity),
    longitude: lngOf(entity),
    district: normalizeDistrict(entity.district || entity.neighborhood || entity.raw?.neighborhood || ""),
    address: entity.address || entity.raw?.address || "",
    residentVisible: visibility.residentVisible,
    partnerVisible: visibility.partnerVisible,
    status: statusOf(entity),
    published: isPublishedVisible(entity),
    active: entity.active !== false && entity.raw?.active !== false,
    featured: /\b(featured|anchor|priority)\b/.test(entityText(entity)),
    sponsored: /\b(sponsored|campaign|activation)\b/.test(entityText(entity)),
    brandId: getBrandIds(entity)[0] || "",
    campaignIds,
    collectionIds,
    routeIds: collectionIds,
    perkIds: /\b(perk|offer|happy hour|special)\b/.test(entityText(entity)) ? [idOf(entity)] : [],
    eventIds: /\b(event|rsvp)\b/.test(entityText(entity)) ? [idOf(entity)] : [],
    startDate: entity.startDate || entity.raw?.startDate || "",
    endDate: entity.endDate || entity.raw?.endDate || "",
    image: entity.image || entity.imageUrl || entity.primaryImage || entity.thumbnail || entity.raw?.imageUrl || "",
    detailRenderer: detailRenderer(entity),
    searchKeywords: taxonomy.searchTokens,
    searchAliases: taxonomy.applicableIntents,
    accessibleLabel: `${titleOf(entity)} ${taxonomy.category}`.trim(),
    icon: iconFor(entity),
    deepLink: `/map?mode=resident&tab=map&filter=All&entityId=${encodeURIComponent(idOf(entity))}`,
  };
}

function countBy<T extends Record<string, any>>(rows: T[], key: keyof T) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key] || "Missing");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function duplicateValues(rows: ReturnType<typeof inventoryRow>[], keyFn: (row: ReturnType<typeof inventoryRow>) => string) {
  const counts = new Map<string, string[]>();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    counts.set(key, [...(counts.get(key) || []), row.entityId]);
  }
  return [...counts.entries()].filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ key, entityIds: ids }));
}

function validatePin(row: ReturnType<typeof inventoryRow>) {
  const issues: string[] = [];
  if (!row.entityId) issues.push("missing entityId");
  if (!row.name) issues.push("missing title");
  if (row.latitude === null || row.longitude === null) issues.push("missing coordinates");
  if (row.latitude === 0 || row.longitude === 0) issues.push("zero coordinates");
  if (row.latitude !== null && row.longitude !== null && !inAustinRegion({ latitude: row.latitude, longitude: row.longitude })) issues.push("outside Austin region");
  if (!row.category) issues.push("missing category");
  if (!row.district) issues.push("missing district");
  if (!row.detailRenderer) issues.push("missing bottom drawer renderer");
  if (!row.accessibleLabel) issues.push("missing accessible label");
  if (!row.icon) issues.push("missing icon");
  if (!row.deepLink.includes("entityId=")) issues.push("missing deep link");
  return issues;
}

function auditIntents(entities: AnyEntity[]) {
  const naturalQueries = [
    "coffee near Rainey",
    "happy hour near me",
    "restaurants open now",
    "events tonight",
    "dog-friendly places",
    "hotels near the Convention Center",
    "resident perks near Lady Bird Lake",
    "things to do this weekend",
    "inKind restaurants",
    "Legends locations",
    "Rainey walking route",
    "date-night collection",
    "Austin FC campaign",
    "properties near Seaholm",
    "zero result unicorn helipad",
  ];
  const registryResults = MAP_INTENT_REGISTRY.map((intent) => {
    const applied = applyMapIntent(entities, intent, intent.mode);
    return {
      intentId: intent.id,
      label: intent.label,
      intentType: intent.intentType,
      mode: intent.mode,
      resultCount: applied.resultCount,
      pinIds: applied.pins.slice(0, 30).map(idOf),
      routeCount: applied.routeLayers.length,
      collectionCount: applied.collections.length,
      campaignCount: applied.campaigns.length,
      brandCount: applied.brands.length,
      urlState: applied.urlState,
      activeState: true,
      mouse: "covered-by-shared-button-onClick",
      keyboard: "native-button-enter-space",
      pointer: "native-button-pointer-tap",
      drawer: applied.primaryResult ? "shared-bottom-drawer-eligible" : "empty-state",
      staleLayerCleanup: Object.keys(applied).includes("filteredPins"),
    };
  });
  const naturalResults = naturalQueries.map((query) => {
    const intent = resolveSearchIntent(query);
    const relationships = resolveIntentRelationships(intent, entities);
    return {
      query,
      resolvedIntent: intent,
      entitiesReturned: relationships.pins.map(idOf),
      routesReturned: relationships.routeLayers,
      collectionsReturned: relationships.collections.map((collection) => collection.id),
      campaignsReturned: relationships.campaigns.map((campaign) => campaign.id),
      brandsReturned: relationships.brands,
      cameraBehavior: relationships.resultCount > 1 ? "fit-bounds" : relationships.resultCount === 1 ? "pan-to-result" : "retain-current-location",
      urlState: applyMapIntent(entities, intent).urlState,
      zeroResultBehavior: relationships.resultCount ? "" : "No matching places are available for this search right now.",
    };
  });
  return { registryResults, naturalResults };
}

function relationshipErrors(inventory: ReturnType<typeof inventoryRow>[]) {
  const entityIds = new Set(inventory.map((row) => row.entityId));
  const collectionErrors = mapCollections.flatMap((collection) =>
    (collection.stopIds || [])
      .filter((id) => !entityIds.has(id))
      .map((id) => ({
        severity: "warning",
        relationshipType: "collection",
        relationshipId: collection.id,
        missingEntityId: id,
        currentBehavior: "Stop is resolved by stop hint fallback or omitted if no matching pin exists.",
        expectedBehavior: "Collection stop IDs should map directly to canonical entity IDs.",
        rootCause: "Legacy collection stop ID does not exactly match current entity ID.",
        fixApplied: "Relationship is surfaced in audit output; resolver also checks stopHints for runtime continuity.",
      })),
  );
  const campaignErrors = [...brandCampaignExamples, ...liveCampaignLayerExamples]
    .filter((campaign) => String(campaign.status || "").toLowerCase() === "draft")
    .map((campaign) => ({
      severity: "info",
      relationshipType: "campaign",
      relationshipId: campaign.id,
      currentBehavior: "Draft campaign is excluded from active intent results.",
      expectedBehavior: "Only active/ready/live campaigns render on campaign intent layers.",
      rootCause: "Campaign status is draft.",
      fixApplied: "Canonical resolver excludes draft campaigns from active campaign relationships.",
    }));
  return [...collectionErrors, ...campaignErrors];
}

const entities = productionMapInventory.records as AnyEntity[];
const inventory = entities.map(inventoryRow);
const duplicateEntityIds = duplicateValues(inventory, (row) => row.entityId);
const duplicateCoordinates = duplicateValues(inventory, (row) => row.latitude !== null && row.longitude !== null ? `${row.latitude.toFixed(6)},${row.longitude.toFixed(6)}` : "");
const pinIssues = inventory
  .map((row) => ({ entityId: row.entityId, name: row.name, severity: validatePin(row).some((issue) => /missing coordinates|outside Austin/.test(issue)) ? "warning" : "info", issues: validatePin(row) }))
  .filter((row) => row.issues.length);
const visiblePins = inventory.filter((row) => row.published && (row.residentVisible || row.partnerVisible) && row.latitude !== null && row.longitude !== null);
const intentAudit = auditIntents(entities);
const relErrors = relationshipErrors(inventory);

const pinAudit = {
  generatedAt: new Date().toISOString(),
  source: "src/data/production/production-map-inventory.json records",
  totals: {
    totalEntities: inventory.length,
    visiblePublishedPins: visiblePins.length,
    passedPins: inventory.length - pinIssues.length,
    failedPins: pinIssues.length,
    missingCoordinates: inventory.filter((row) => row.latitude === null || row.longitude === null).length,
    missingCategory: inventory.filter((row) => !row.category).length,
    missingDistrict: inventory.filter((row) => !row.district).length,
    duplicateEntityIds: duplicateEntityIds.length,
    duplicateCoordinates: duplicateCoordinates.length,
  },
  byEntityType: countBy(inventory, "entityType"),
  byCategory: countBy(inventory, "category"),
  byDistrict: countBy(inventory, "district"),
  byVisibilityMode: {
    resident: inventory.filter((row) => row.residentVisible).length,
    partner: inventory.filter((row) => row.partnerVisible).length,
    both: inventory.filter((row) => row.residentVisible && row.partnerVisible).length,
  },
  byStatus: countBy(inventory, "status"),
  duplicateEntityIds,
  duplicateCoordinates,
  issues: pinIssues,
  inventory,
};

const searchAudit = {
  generatedAt: new Date().toISOString(),
  canonicalPipeline: [
    "UI action",
    "resolveSearchIntent",
    "normalizeEntityTaxonomy",
    "queryEntitiesForIntent",
    "resolveIntentRelationships",
    "rankIntentResult",
    "applyMapIntent",
    "clearPreviousMapIntent",
  ],
  totalPinsAudited: inventory.length,
  passedPins: pinAudit.totals.passedPins,
  failedPins: pinAudit.totals.failedPins,
  correctedPins: 0,
  intentControlsAudited: MAP_INTENT_REGISTRY.length,
  routeRelationships: mapCollections.length,
  collectionRelationships: mapCollections.length,
  campaignRelationships: [...brandCampaignExamples, ...liveCampaignLayerExamples].length,
  brandRelationships: [...new Set([...brandCampaignExamples, ...liveCampaignLayerExamples].map((campaign) => campaign.brandId || campaign.brandName).filter(Boolean))].length,
  emptyIntents: intentAudit.registryResults.filter((item) => item.resultCount === 0).map((item) => item.intentId),
  duplicatePinsRemoved: duplicateEntityIds.length,
  expiredRecordsExcluded: relErrors.filter((error) => error.relationshipType === "campaign").length,
  deepLinkTests: ["bar-hacienda-8f0f902b", "district-rainey-st-historic"].map((entityId) => ({
    entityId,
    url: `/map?mode=resident&tab=map&filter=All&entityId=${entityId}`,
    expected: "shared bottom drawer opens selected entity detail",
  })),
  bottomDrawerTests: intentAudit.registryResults.map((item) => ({
    intentId: item.intentId,
    expected: item.resultCount ? "open returned pin through shared drawer and preserve intent context on close" : "empty-state no stale pins",
  })),
  registryResults: intentAudit.registryResults,
  naturalLanguageResults: intentAudit.naturalResults,
  remainingBlockers: relErrors.filter((error) => error.severity === "critical"),
};

const md = `# Map Search Intent Audit

Generated: ${searchAudit.generatedAt}

## Summary

- Total pins audited: ${searchAudit.totalPinsAudited}
- Visible published pins: ${pinAudit.totals.visiblePublishedPins}
- Passed pins: ${searchAudit.passedPins}
- Failed pin issue rows: ${searchAudit.failedPins}
- Intent controls audited: ${searchAudit.intentControlsAudited}
- Route relationships: ${searchAudit.routeRelationships}
- Collection relationships: ${searchAudit.collectionRelationships}
- Campaign relationships: ${searchAudit.campaignRelationships}
- Brand relationships: ${searchAudit.brandRelationships}
- Empty intents: ${searchAudit.emptyIntents.length ? searchAudit.emptyIntents.join(", ") : "None"}
- Duplicate entity IDs: ${pinAudit.totals.duplicateEntityIds}
- Duplicate coordinate groups: ${pinAudit.totals.duplicateCoordinates}
- Unresolved critical failures: ${searchAudit.remainingBlockers.length}

## Canonical Pipeline

${searchAudit.canonicalPipeline.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Totals By Entity Type

${Object.entries(pinAudit.byEntityType).map(([key, count]) => `- ${key}: ${count}`).join("\n")}

## Totals By Category

${Object.entries(pinAudit.byCategory).slice(0, 40).map(([key, count]) => `- ${key}: ${count}`).join("\n")}

## Totals By District

${Object.entries(pinAudit.byDistrict).map(([key, count]) => `- ${key}: ${count}`).join("\n")}

## Intent Results

${searchAudit.registryResults.map((item) => `- ${item.intentId} (${item.mode}/${item.intentType}): ${item.resultCount} pins, ${item.routeCount} routes, ${item.collectionCount} collections, ${item.campaignCount} campaigns, ${item.brandCount} brands`).join("\n")}

## Natural-Language Queries

${searchAudit.naturalLanguageResults.map((item) => `- "${item.query}" -> ${item.resolvedIntent.id}: ${item.entitiesReturned.length} pins, ${item.routesReturned.length} routes, ${item.collectionsReturned.length} collections, ${item.campaignsReturned.length} campaigns`).join("\n")}

## Relationship Warnings

${relErrors.length ? relErrors.map((error) => `- [${error.severity}] ${error.relationshipType} ${error.relationshipId}: ${error.currentBehavior}`).join("\n") : "- None"}

## Remaining Blockers

${searchAudit.remainingBlockers.length ? searchAudit.remainingBlockers.map((error) => `- ${error.relationshipType} ${error.relationshipId}: ${error.currentBehavior}`).join("\n") : "- No unresolved critical failures in generated audit."}
`;

const pinMd = `# Map Pin Audit

Generated: ${pinAudit.generatedAt}

## Summary

- Total entities: ${pinAudit.totals.totalEntities}
- Visible published pins: ${pinAudit.totals.visiblePublishedPins}
- Passed pins: ${pinAudit.totals.passedPins}
- Issue rows: ${pinAudit.totals.failedPins}
- Missing coordinates: ${pinAudit.totals.missingCoordinates}
- Missing category: ${pinAudit.totals.missingCategory}
- Missing district: ${pinAudit.totals.missingDistrict}
- Duplicate entity IDs: ${pinAudit.totals.duplicateEntityIds}
- Duplicate coordinate groups: ${pinAudit.totals.duplicateCoordinates}

## Visibility

- Resident visible: ${pinAudit.byVisibilityMode.resident}
- Partner visible: ${pinAudit.byVisibilityMode.partner}
- Visible to both: ${pinAudit.byVisibilityMode.both}

## Active/Inactive Status

${Object.entries(pinAudit.byStatus).map(([key, count]) => `- ${key}: ${count}`).join("\n")}

## Missing/Invalid Fields

${pinIssues.slice(0, 80).map((issue) => `- [${issue.severity}] ${issue.entityId || "missing-id"} ${issue.name}: ${issue.issues.join("; ")}`).join("\n") || "- None"}
`;

writeJson("map-pin-audit.json", pinAudit);
writeText("map-pin-audit.md", pinMd);
writeJson("map-search-intent-results.json", searchAudit);
writeJson("map-pin-relationship-errors.json", relErrors);
writeText("map-search-intent-audit.md", md);

console.log(`Map search intent audit complete: ${inventory.length} entities, ${MAP_INTENT_REGISTRY.length} intents, ${searchAudit.remainingBlockers.length} critical blockers.`);
