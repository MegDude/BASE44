import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parse } from "csv-parse/sync";
import type { DowntownDistrict, MapEntity, MapEntityKind } from "../src/data/map/mapEntitySchema";
import { inferMapEntityKind, normalizeCategory } from "../src/data/map/categoryMapping";
import { inferDowntownDistrict } from "../src/data/map/neighborhoodMapping";

export const EXPECTED_FULL_LIST_COUNT = 369;
export const BROWSER_SEED_COUNT = 304;
export const TAKEOUT_SEED_COUNT = 22;
export const ROOT = process.cwd();
export const IMPORT_DIR = path.join(ROOT, "data/imports/google-maps");
export const MAP_DATA_DIR = path.join(ROOT, "src/data/map");

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

export function writeCsvFile(filePath: string, rows: Array<Record<string, unknown>>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set<string>()));
  const escape = (value: unknown) => {
    const text = Array.isArray(value) ? value.join("|") : value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  fs.writeFileSync(filePath, `${headers.join(",")}\n${rows.map((row) => headers.map((header) => escape(row[header])).join(",")).join("\n")}\n`);
}

export function readCsvFile<T extends Record<string, string>>(filePath: string): T[] {
  return parse(fs.readFileSync(filePath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export function stableId(title: string, address = "", source = ""): string {
  const base = slugify(title) || "downtown-place";
  const hash = crypto.createHash("sha1").update(`${title}|${address}|${source}`).digest("hex").slice(0, 8);
  return `${base}-${hash}`;
}

function nullableNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  const text = String(value);
  try {
    const parsed = JSON.parse(text.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Fall through to delimiter parsing.
  }
  return text.split(/[|,]/).map((tag) => tag.trim()).filter(Boolean);
}

export function extractCid(googleMapsUrl = ""): string | undefined {
  const match = googleMapsUrl.match(/[?&]cid=(\d+)/i);
  return match?.[1];
}

export function normalizeBrowserEntity(raw: Partial<MapEntity>): MapEntity {
  const title = String(raw.title || "").trim();
  const category = normalizeCategory(raw.category || "", "Downtown Place");
  const address = raw.address || undefined;
  const neighborhood = (raw.neighborhood || inferDowntownDistrict(`${title} ${category} ${address || ""}`)) as DowntownDistrict;
  const tags = Array.from(new Set([
    ...normalizeTags(raw.tags),
    ...(typeof raw.lat === "number" && typeof raw.lng === "number" ? [] : ["needs-google-places-enrichment"]),
  ]));

  return {
    id: raw.id || stableId(title, address, "browser"),
    title,
    kind: (raw.kind || inferMapEntityKind(`${title} ${category}`)) as MapEntityKind,
    category,
    address,
    lat: nullableNumber(raw.lat),
    lng: nullableNumber(raw.lng),
    neighborhood,
    rating: nullableNumber(raw.rating),
    reviewCount: nullableNumber(raw.reviewCount),
    priceLabel: raw.priceLabel || undefined,
    phone: raw.phone || undefined,
    website: raw.website || undefined,
    imageUrl: raw.imageUrl || undefined,
    googleMapsUrl: raw.googleMapsUrl || undefined,
    googlePlaceId: raw.googlePlaceId || undefined,
    googleCid: raw.googleCid || extractCid(raw.googleMapsUrl || ""),
    source: "google_maps_list_browser_extract",
    datasetStatus: "browser_seed",
    expectedFullListCount: EXPECTED_FULL_LIST_COUNT,
    actualSeedCount: BROWSER_SEED_COUNT,
    tags,
    active: raw.active !== false,
    importedAt: raw.importedAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function normalizeTakeoutFeature(feature: any): MapEntity {
  const location = feature?.properties?.location || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const title = String(location.name || "Saved Place").trim();
  const address = location.address || undefined;
  return {
    id: stableId(title, address, "takeout"),
    title,
    kind: inferMapEntityKind(`${title} ${address || ""}`),
    category: normalizeCategory("", "Google Saved Place"),
    address,
    lat: nullableNumber(coordinates[1]),
    lng: nullableNumber(coordinates[0]),
    neighborhood: inferDowntownDistrict(`${address || ""} ${title}`),
    googleMapsUrl: feature?.properties?.google_maps_url || undefined,
    googleCid: extractCid(feature?.properties?.google_maps_url || ""),
    source: "google_takeout_saved_places",
    datasetStatus: "partial_seed",
    expectedFullListCount: EXPECTED_FULL_LIST_COUNT,
    actualSeedCount: TAKEOUT_SEED_COUNT,
    tags: ["google-takeout-partial-seed"],
    active: true,
    importedAt: feature?.properties?.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function mapEntityToLocation(entity: MapEntity) {
  return {
    id: entity.id,
    name: entity.title,
    title: entity.title,
    type: entity.kind,
    kind: entity.kind,
    markerType: entity.kind,
    detailDrawerType: entity.kind === "civic" ? "civic" : entity.kind === "hotel" ? "hotel" : "place",
    category: entity.category,
    category_key: [entity.kind, entity.category, entity.neighborhood, ...entity.tags].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    latitude: entity.lat,
    longitude: entity.lng,
    district: entity.neighborhood,
    address: entity.address,
    summary: entity.category ? `${entity.category} in ${entity.neighborhood}.` : `Downtown place in ${entity.neighborhood}.`,
    description: entity.category ? `${entity.category} in ${entity.neighborhood}.` : `Downtown place in ${entity.neighborhood}.`,
    rating: entity.rating,
    reviewCount: entity.reviewCount,
    priceLabel: entity.priceLabel,
    phone: entity.phone,
    website: entity.website,
    image: entity.imageUrl,
    googleMapsUrl: entity.googleMapsUrl,
    googlePlaceId: entity.googlePlaceId,
    googleCid: entity.googleCid,
    source: "Downtown Perks canonical Google registry",
    registrySource: entity.source,
    registryDatasetStatus: entity.datasetStatus,
    tags: entity.tags,
    active: entity.active,
    raw: entity,
  };
}
