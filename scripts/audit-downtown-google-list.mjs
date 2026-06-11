import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const csvPath = "/Users/megdude/Downloads/LOCATIONS/downtown_perks_current_map_check_188.csv";
const outputDir = path.join(repoRoot, "data");
const srcOutputDir = path.join(repoRoot, "src/data");
const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
const googlePlacesEnabled = Boolean(googlePlacesApiKey);
const GOOGLE_PHOTO_KEY_PLACEHOLDER = "GOOGLE_PLACES_API_KEY";

const fallbackImages = {
  hotel: "/images/fallbacks/hotel.jpg",
  restaurant: "/images/fallbacks/dining.jpg",
  dining: "/images/fallbacks/dining.jpg",
  dessert: "/images/fallbacks/dining.jpg",
  bar: "/images/fallbacks/drinks.jpg",
  drinks: "/images/fallbacks/drinks.jpg",
  coffee: "/images/fallbacks/coffee.jpg",
  wellness: "/images/fallbacks/wellness.jpg",
  fitness: "/images/fallbacks/wellness.jpg",
  retail: "/images/fallbacks/retail.jpg",
  residential: "/images/fallbacks/residential.jpg",
  civic: "/images/fallbacks/civic.jpg",
  culture: "/images/fallbacks/civic.jpg",
  district: "/images/fallbacks/civic.jpg",
  landmark: "/images/fallbacks/civic.jpg",
  default: "/images/splash/walkable-map.png",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === "\"" && next === "\"") {
        value += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === "\"") quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(austin|downtown|atx)\b/g, "")
    .replace(/\b(the)\b/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value, fallback = "google-list-place") {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

function bigrams(value) {
  const normalized = normalizeName(value);
  if (normalized.length < 2) return new Set([normalized]);
  const out = new Set();
  for (let i = 0; i < normalized.length - 1; i += 1) out.add(normalized.slice(i, i + 2));
  return out;
}

function similarity(a, b) {
  const aSet = bigrams(a);
  const bSet = bigrams(b);
  const union = new Set([...aSet, ...bSet]);
  if (!union.size) return 0;
  let intersection = 0;
  aSet.forEach((item) => {
    if (bSet.has(item)) intersection += 1;
  });
  return Math.round((intersection / union.size) * 100);
}

function cleanRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.replace(/^\uFEFF/, ""), String(value || "").trim()]),
  );
}

function mapCategory(row) {
  const category = String(row.dp_category || row.google_type || "").toLowerCase();
  if (category.includes("hotel")) return "Hotel";
  if (category.includes("coffee")) return "Coffee";
  if (category.includes("bar") || category.includes("nightlife") || category.includes("cocktail")) return "Drinks";
  if (category.includes("fitness") || category.includes("pilates") || category.includes("gym")) return "Fitness";
  if (category.includes("wellness") || category.includes("spa")) return "Wellness";
  if (category.includes("retail") || category.includes("store") || category.includes("jewelry") || category.includes("clothing")) return "Retail";
  if (category.includes("residential") || category.includes("apartment") || category.includes("condo")) return "Residential";
  if (category.includes("civic") || category.includes("park")) return "Civic";
  if (category.includes("out of market")) return "Out of Market";
  if (category.includes("district")) return "District";
  if (category.includes("dessert")) return "Dining";
  return "Dining";
}

function fallbackImageFor(row) {
  const category = mapCategory(row).toLowerCase();
  return fallbackImages[category] || fallbackImages.default;
}

function googlePlacesTextQuery(row) {
  const name = row.current_map_name || row.name;
  const district = row.dp_district && !/charlottesville|out of market/i.test(row.dp_district) ? row.dp_district : "Downtown Austin";
  return `${name}, ${district}, Austin, TX`;
}

function googlePhotoUrl(photoReference) {
  if (!photoReference) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(photoReference)}&key=${GOOGLE_PHOTO_KEY_PLACEHOLDER}`;
}

async function fetchGooglePlace(row) {
  if (!googlePlacesEnabled) return null;
  if (/charlottesville|out of market/i.test(`${row.dp_district} ${row.qa_notes} ${row.dp_category}`)) return null;

  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "geometry",
    "photos",
    "rating",
    "user_ratings_total",
    "price_level",
    "types",
  ].join(",");
  const params = new URLSearchParams({
    input: googlePlacesTextQuery(row),
    inputtype: "textquery",
    fields,
    key: googlePlacesApiKey,
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Google Places request failed for ${row.current_map_name}: ${response.status}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  if (!candidate) return null;

  const photo = candidate.photos?.[0];
  return {
    placeId: candidate.place_id || "",
    name: candidate.name || "",
    address: candidate.formatted_address || "",
    lat: candidate.geometry?.location?.lat ?? "",
    lng: candidate.geometry?.location?.lng ?? "",
    rating: candidate.rating ?? "",
    reviewCount: candidate.user_ratings_total ?? "",
    priceRange: candidate.price_level ? "$".repeat(Number(candidate.price_level)) : "",
    googleCategory: Array.isArray(candidate.types) ? candidate.types[0] : "",
    photoReference: photo?.photo_reference || "",
    photoAttribution: Array.isArray(photo?.html_attributions) ? photo.html_attributions.join(" ") : "Photo via Google Places",
    photoUrl: photo?.photo_reference ? googlePhotoUrl(photo.photo_reference) : "",
  };
}

async function enrichRowsWithGooglePlaces(rows) {
  if (!googlePlacesEnabled) {
    return rows.map((row) => ({
      ...row,
      _googlePlacesStatus: "skipped_no_api_key",
    }));
  }

  const enriched = [];
  for (const row of rows) {
    try {
      const place = await fetchGooglePlace(row);
      enriched.push({
        ...row,
        google_place_id: row.google_place_id || place?.placeId || "",
        address: row.address || place?.address || "",
        lat: row.lat || place?.lat || "",
        lng: row.lng || place?.lng || "",
        google_rating: row.google_rating || place?.rating || "",
        review_count: row.review_count || place?.reviewCount || "",
        price_range: row.price_range || place?.priceRange || "",
        google_type: row.google_type || place?.googleCategory || "",
        image_url: row.image_url || place?.photoUrl || "",
        image_attribution: row.image_attribution || place?.photoAttribution || "",
        image_source: row.image_source || (place?.photoUrl ? "google_places" : ""),
        google_photo_reference: row.google_photo_reference || place?.photoReference || "",
        _googlePlacesStatus: place ? "matched_google_places" : "not_found_google_places",
      });
    } catch (error) {
      enriched.push({
        ...row,
        _googlePlacesStatus: "google_places_error",
        _googlePlacesError: error.message,
      });
    }
  }
  return enriched;
}

function currentRecordFromLocation(item, source) {
  return {
    id: item.id || item.slug || item.dp_id || item.osm_id || slugify(item.name),
    name: item.name || item.current_map_name,
    district: item.district || item.dp_district,
    category: item.category || item.dp_category,
    lat: item.latitude ?? item.lat ?? item.coordinates?.lat,
    lng: item.longitude ?? item.lng ?? item.coordinates?.lng,
    image: item.image || item.primaryImage || item.imageUrl || item.heroImage,
    source,
  };
}

async function loadCurrentMapListings() {
  const records = [];
  const locations = JSON.parse(await fs.readFile(path.join(repoRoot, "src/data/locations.json"), "utf8"));
  records.push(...locations.map((item) => currentRecordFromLocation(item, item.source || "locations.json")));

  const production = JSON.parse(await fs.readFile(path.join(repoRoot, "src/data/production/production-map-inventory.json"), "utf8"));
  records.push(...(production.records || []).map((item) => currentRecordFromLocation({
    ...item,
    latitude: item.lat,
    longitude: item.lng,
    image: item.primaryImage,
  }, "production-map-inventory")));

  const supplementalText = await fs.readFile(path.join(repoRoot, "src/data/supplementalMapEntities.js"), "utf8");
  for (const match of supplementalText.matchAll(/id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?latitude:\s*([-0-9.]+)[\s\S]*?longitude:\s*([-0-9.]+)/g)) {
    records.push(currentRecordFromLocation({
      id: match[1],
      name: match[2],
      latitude: Number(match[3]),
      longitude: Number(match[4]),
    }, "supplementalMapEntities"));
  }

  const happyHoursText = await fs.readFile(path.join(repoRoot, "src/lib/happyHours.js"), "utf8");
  for (const match of happyHoursText.matchAll(/venueName:\s*"([^"]+)"[\s\S]*?latitude:\s*([-0-9.]+)[\s\S]*?longitude:\s*([-0-9.]+)/g)) {
    records.push(currentRecordFromLocation({
      id: `happy-hour-${slugify(match[1])}`,
      name: match[1],
      latitude: Number(match[2]),
      longitude: Number(match[3]),
      category: "Happy Hour",
    }, "happyHours"));
  }

  return records.filter((item) => item.name);
}

function findBestMatch(row, currentMap) {
  const exactKey = normalizeName(row.current_map_name);
  const exact = currentMap.byName.get(exactKey);
  if (exact) return { match: exact, confidence: 100, method: "exact_name" };

  let best = null;
  for (const candidate of currentMap.records) {
    const score = similarity(row.current_map_name, candidate.name);
    const districtBonus = row.dp_district && candidate.district && normalizeName(row.dp_district) === normalizeName(candidate.district) ? 5 : 0;
    const finalScore = Math.min(100, score + districtBonus);
    if (!best || finalScore > best.confidence) {
      best = { match: candidate, confidence: finalScore, method: "fuzzy_name_category" };
    }
  }

  return best && best.confidence >= 85 ? best : { match: best?.match || null, confidence: best?.confidence || 0, method: "needs_manual_review" };
}

function enrichedSeed(row, matchResult) {
  const matched = matchResult.match && matchResult.confidence >= 85;
  const outOfMarket = /charlottesville|out of market/i.test(`${row.dp_district} ${row.qa_notes} ${row.dp_category}`);
  const lat = row.lat || (matched ? matchResult.match.lat : "");
  const lng = row.lng || (matched ? matchResult.match.lng : "");
  const hasImage = Boolean(row.image_url || matchResult.match?.image);
  const imageUrl = row.image_url || matchResult.match?.image || fallbackImageFor(row);

  return {
    id: row.dp_id || slugify(row.current_map_name),
    name: row.current_map_name,
    google_category: row.google_type,
    rating: row.google_rating || null,
    review_count: row.review_count || null,
    price_range: row.price_range || null,
    address: row.address || "",
    lat,
    lng,
    google_place_id: row.google_place_id || "",
    district: row.dp_district,
    downtown_perks_category: mapCategory(row),
    pin_type: row.pin_type,
    resident_description: row.resident_short_description,
    recommended_perk: row.recommended_perk,
    partner_opportunity: row.partner_opportunity,
    image: {
      url: imageUrl,
      source: row.image_source || (row.image_url ? "google_places" : hasImage ? "existing_map" : "fallback"),
      attribution: row.image_attribution || (row.image_url ? "Photo via Google Places" : hasImage ? "Existing Downtown Perks map image" : "Downtown Perks fallback image"),
      googlePhotoReference: row.google_photo_reference || "",
      alt: `${row.current_map_name} in downtown Austin`,
    },
    image_url: imageUrl,
    image_attribution: row.image_attribution || "",
    image_source: row.image_source || (row.image_url ? "google_places" : hasImage ? "existing_map" : "fallback"),
    map_status: outOfMarket ? "needs_review_out_of_market" : matched ? "matched_current_map" : "needs_review_missing_coordinates",
    verified: false,
    needsPartnerApproval: !matched,
    source: "google_list_import",
    googlePlacesStatus: row._googlePlacesStatus || "not_attempted",
    googlePlacesError: row._googlePlacesError || "",
    match: {
      currentMapId: matched ? matchResult.match.id : "",
      currentMapName: matchResult.match?.name || "",
      confidence: matchResult.confidence,
      method: matchResult.method,
    },
    qa_notes: [
      row.qa_notes,
      outOfMarket ? "Out of market: do not import to Downtown Austin production map." : "",
      !matched && !lat && !lng ? "Missing from current map or below 85% match confidence. CSV does not include lat/lng or Google Place ID, so pin import is blocked until Google Places enrichment/geocoding is run." : "",
      !row.google_place_id ? "Missing Google Place ID." : "",
      !row.image_url ? "Missing Google Places photo URL/reference in source CSV." : "",
      row._googlePlacesStatus === "skipped_no_api_key" ? "Google Places enrichment skipped because GOOGLE_PLACES_API_KEY / GOOGLE_MAPS_API_KEY is not configured." : "",
      row._googlePlacesError ? `Google Places error: ${row._googlePlacesError}` : "",
    ].filter(Boolean),
  };
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, "\"\"")}"`;
  return stringValue;
}

async function main() {
  const csvText = (await fs.readFile(csvPath, "utf8")).replace(/^\uFEFF/, "");
  const [header, ...rawRows] = parseCsv(csvText);
  const csvRows = rawRows
    .filter((row) => row.some(Boolean))
    .map((row) => cleanRecord(Object.fromEntries(header.map((key, index) => [key, row[index] || ""]))));
  const rows = await enrichRowsWithGooglePlaces(csvRows);

  const currentRecords = await loadCurrentMapListings();
  const currentMap = {
    records: currentRecords,
    byName: new Map(currentRecords.map((record) => [normalizeName(record.name), record])),
  };

  const enriched = rows.map((row) => enrichedSeed(row, findBestMatch(row, currentMap)));
  const matched = enriched.filter((item) => item.match.confidence >= 85 && item.map_status !== "needs_review_out_of_market");
  const needsReview = enriched.filter((item) => item.map_status.includes("needs_review") || item.match.confidence < 85);
  const missing = enriched.filter((item) => item.map_status === "needs_review_missing_coordinates");
  const importable = enriched.filter((item) => item.lat && item.lng && item.map_status !== "needs_review_out_of_market" && item.map_status !== "matched_current_map");

  const audit = {
    generatedAt: new Date().toISOString(),
    sourceCsv: csvPath,
    googlePlacesEnabled,
    googlePlacesPhotoUrlPolicy: "Photo URLs use a GOOGLE_PLACES_API_KEY placeholder so secrets are not written to repository files. Replace server-side or proxy through an API route before public rendering.",
    sourceCount: rows.length,
    currentMapListingsCount: currentRecords.length,
    matchedCount: matched.length,
    missingFromCurrentMapCount: missing.length,
    needsReviewCount: needsReview.length,
    importableCount: importable.length,
    note: googlePlacesEnabled
      ? "Google Places enrichment was attempted before matching. New records are exported only when they have coordinates and are not duplicate current-map matches."
      : "The provided CSV does not include lat/lng, Google Place IDs, photo references, image URLs, or attribution columns. Google Places enrichment requires GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY before missing coordinate-less records can be rendered as map pins.",
    flaggedImmediately: enriched.filter((item) => /north downtown|charlottesville/i.test(`${item.name} ${item.district} ${item.qa_notes.join(" ")}`)),
    currentMapListings: currentRecords,
    matched,
    missing_from_current_map: missing,
    needs_review: needsReview,
  };

  const imageAuditHeader = [
    "id",
    "name",
    "map_status",
    "image_source",
    "image_url",
    "image_attribution",
    "google_place_id",
    "google_photo_reference",
    "google_places_status",
    "qa_notes",
  ];
  const imageAuditRows = [imageAuditHeader.join(",")].concat(
    enriched.map((item) => imageAuditHeader.map((key) => csvEscape(
      key === "google_photo_reference"
        ? item.image.googlePhotoReference
        : key === "google_places_status"
          ? item.googlePlacesStatus
          : key === "qa_notes"
            ? item.qa_notes.join(" | ")
            : item[key] || "",
    )).join(",")),
  );

  const mapImportRecords = importable.map((item) => ({
    id: `google-list-${item.id}`,
    name: item.name,
    type: item.downtown_perks_category === "Residential" ? "property" : item.downtown_perks_category === "Hotel" ? "hotel" : "venue",
    partnerType: item.downtown_perks_category === "Residential" ? "properties" : item.downtown_perks_category === "Hotel" ? "hotels" : "venues",
    category: item.downtown_perks_category,
    category_key: `${slugify(item.downtown_perks_category, "place")} google_list_import ${slugify(item.pin_type, "pin")}`.replace(/-/g, "_"),
    markerType: item.pin_type || "standard",
    detailDrawerType: "google-list-place",
    latitude: Number(item.lat),
    longitude: Number(item.lng),
    district: item.district,
    address: item.address || `${item.district || "Downtown Austin"}, Austin, TX`,
    summary: item.resident_description,
    description: item.resident_description,
    resident_panel: {
      title: item.name,
      subtitle: item.district,
      body: item.resident_description,
      recommendedPerk: item.recommended_perk,
      cta: item.resident_cta || "View Perk",
    },
    partner_opportunity: item.partner_opportunity,
    deals_offers: item.recommended_perk,
    specials: item.recommended_perk,
    image: item.image,
    imageUrl: item.image.url,
    imageMeta: item.image,
    googlePlaceId: item.google_place_id,
    source: "google_list_import",
    verified: false,
    needsPartnerApproval: true,
    tags: ["Google List Import", item.district, item.downtown_perks_category, item.pin_type].filter(Boolean),
  }));

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(srcOutputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "downtownPerksMapAudit.json"), `${JSON.stringify(audit, null, 2)}\n`);
  await fs.writeFile(path.join(outputDir, "downtownPerksGoogleSeed.enriched.json"), `${JSON.stringify(enriched, null, 2)}\n`);
  await fs.writeFile(path.join(outputDir, "downtownPerksMissingLocations.json"), `${JSON.stringify(missing, null, 2)}\n`);
  await fs.writeFile(path.join(outputDir, "downtownPerksImageAudit.csv"), `${imageAuditRows.join("\n")}\n`);
  await fs.writeFile(
    path.join(srcOutputDir, "downtownPerksGoogleListImport.js"),
    `// Generated by scripts/audit-downtown-google-list.mjs\n// Only coordinate-backed records are exported for rendering. Coordinate-less rows remain in /data/downtownPerksMissingLocations.json.\nexport const downtownPerksGoogleListImport = ${JSON.stringify(mapImportRecords, null, 2)};\n`,
  );

  console.log(JSON.stringify({
    sourceCount: rows.length,
    currentMapListingsCount: currentRecords.length,
    googlePlacesEnabled,
    matchedCount: matched.length,
    missingFromCurrentMapCount: missing.length,
    needsReviewCount: needsReview.length,
    importableCount: importable.length,
    flaggedImmediately: audit.flaggedImmediately.map((item) => item.name),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
