import legendsPropertyContentCsv from "../../data/legendsPropertyContent.csv?raw";

const IMAGE_BASE = "/images";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value || "").trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => String(value || "").trim())) rows.push(row);
  }

  return rows;
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitPipe(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitPairs(value) {
  return splitPipe(value).map((item) => {
    const [label, ...rest] = item.split("—").map((part) => part.trim());
    return {
      label: label || item,
      value: rest.join(" — ") || "",
    };
  });
}

function imagePath(asset) {
  const value = String(asset || "").trim();
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return "";
  if (value === "seaholm_coworking_1779052742037.png") return "/buildings/spring-condominiums.png";
  return `${IMAGE_BASE}/${value}`;
}

function pinPath(asset) {
  const value = String(asset || "").trim();
  if (!value || /legends/i.test(value)) return "/pins/downtown-perks/legends-logo.png";
  if (value.startsWith("/")) return value;
  return `/pins/${value}`;
}

const parsedRows = parseCsv(legendsPropertyContentCsv);
const headers = parsedRows[0] || [];

export const legendsPropertyContent = parsedRows.slice(1).map((row) => {
  const record = headers.reduce((output, header, index) => {
    output[header] = String(row[index] || "").replace(/Legends\s+Fine\s+Eyewear/g, "Fine Eyewear").trim();
    return output;
  }, {});

  const id = slug(record.id || record.listing_id || `${record.building_name}-${record.unit}`);
  const buildingSlug = slug(record.building_name);
  const addressSlug = slug(record.address);

  return {
    ...record,
    id,
    buildingSlug,
    addressSlug,
    image: imagePath(record.image_asset),
    pin: pinPath(record.pin_asset),
    benefits: splitPipe(record.benefit_matrix),
    walkableNearby: splitPairs(record.walkable_nearby),
    coffee: splitPipe(record.coffee),
    dining: splitPipe(record.dining),
    drinks: splitPipe(record.drinks),
    wellness: splitPipe(record.wellness),
    groceries: splitPipe(record.groceries),
    placesNearby: splitPairs(record.places_nearby),
    goodToKnow: splitPipe(record.good_to_know),
    listingsText: splitPipe(record.listings),
    entityAliases: splitPipe(record.entity_aliases),
    snapshot: [
      ["Address", record.address],
      ["Neighborhood", record.neighborhood],
      ["Property Type", record.property_type],
      ["Style", record.style],
      ["Walkability", record.walkability],
      ["Resident Experience", record.resident_experience],
    ].filter(([, value]) => value),
  };
});

function contentKeys(record) {
  return [
    record.id,
    record.listing_id,
    record.buildingSlug,
    record.addressSlug,
    ...(record.entityAliases || []).map(slug),
    slug(`${record.building_name}-${record.unit}`),
    slug(`${record.address}-${record.unit}`),
  ].filter(Boolean);
}

export const legendsPropertyContentByKey = legendsPropertyContent.reduce((map, record) => {
  contentKeys(record).forEach((key) => {
    map[key] = record;
  });
  return map;
}, {});

export function getLegendsPropertyContent(value) {
  if (!value) return null;
  const keys = Array.isArray(value)
    ? value
    : [
        value?.id,
        value?.listing_id,
        value?.listingId,
        value?.building_name,
        value?.buildingName,
        value?.name,
        value?.address,
        value?.raw?.id,
        value?.raw?.listing_id,
        value?.raw?.building_name,
        value?.raw?.address,
      ];

  for (const key of keys) {
    const match = legendsPropertyContentByKey[slug(key)];
    if (match) return match;
  }

  return null;
}
