import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const archiveRoot = process.argv[2] || "/private/tmp/dp-archive2/LOCATIONS";
const outputPath = path.join(repoRoot, "src/data/archiveLocationReferences.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => String(value || "").trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => String(value || "").trim())) rows.push(row);
  }

  const [headers = [], ...dataRows] = rows;
  const cleanHeaders = headers.map((header) => String(header || "").replace(/^\uFEFF/, "").trim());

  return dataRows.map((values) =>
    Object.fromEntries(cleanHeaders.map((header, index) => [header, String(values[index] || "").trim()])),
  );
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function compact(value) {
  const text = String(value || "").trim();
  if (!text || /^no public/i.test(text)) return undefined;
  return text;
}

const currentMapRows = parseCsv(
  fs.readFileSync(path.join(archiveRoot, "downtown_perks_current_map_check_188.csv"), "utf8"),
);
const imageAuditRows = parseCsv(
  fs.readFileSync(path.join(archiveRoot, "map_entity_icon_image_audit.csv"), "utf8"),
);

const imageById = new Map();
const imageByName = new Map();

for (const row of imageAuditRows) {
  const ref = {
    currentPinKey: compact(row.currentPinKey),
    currentPinAsset: compact(row.currentPinAsset),
    recommendedPinKey: compact(row.recommendedPinKey),
    recommendedPinAsset: compact(row.recommendedPinAsset),
    pinStatus: compact(row.pinStatus),
    imageSource: compact(row.imageSource),
    currentImage: compact(row.currentImage),
    imageStatus: compact(row.imageStatus),
    imageNotes: compact(row.imageNotes),
    imageDirection: compact(row.imageDirection),
    recommendedPanelCopy: compact(row.recommendedPanelCopy),
    sourceNotes: compact(row.sourceNotes),
    priority: compact(row.priority),
  };
  if (row.id) imageById.set(row.id, ref);
  if (row.name) imageByName.set(slug(row.name), ref);
}

const references = currentMapRows.map((row) => {
  const id = slug(row.dp_id || row.current_map_name);
  const nameKey = slug(row.current_map_name);
  const imageRef = imageById.get(id) || imageByName.get(nameKey) || {};

  return {
    id,
    nameKey,
    sourceName: compact(row.current_map_name),
    googleRating: compact(row.google_rating),
    googleType: compact(row.google_type),
    category: compact(row.dp_category),
    district: compact(row.dp_district),
    pinType: compact(row.pin_type),
    mapStatus: compact(row.map_status),
    residentCardTitle: compact(row.resident_card_title),
    residentShortDescription: compact(row.resident_short_description),
    whyPeopleGo: compact(row.why_people_go),
    recommendedPerk: compact(row.recommended_perk),
    residentCta: compact(row.resident_cta),
    partnerOpportunity: compact(row.partner_opportunity),
    tags: compact(row.tags),
    priority: compact(row.priority),
    qaNotes: compact(row.qa_notes),
    ...imageRef,
  };
}).filter((item) => item.id && item.sourceName);

const sourceSummary = JSON.parse(
  fs.readFileSync(path.join(archiveRoot, "downtown_austin_dataset_summary.json"), "utf8"),
);

const payload = {
  source: "Archive 2.zip / LOCATIONS",
  generatedFrom: [
    "downtown_perks_current_map_check_188.csv",
    "map_entity_icon_image_audit.csv",
    "downtown_austin_dataset_summary.json",
  ],
  generatedAt: new Date().toISOString(),
  summary: sourceSummary,
  references,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${references.length} archive location references to ${outputPath}`);
