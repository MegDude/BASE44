import fs from "node:fs";
import { supplementalMapEntities } from "../src/data/supplementalMapEntities.js";
import { legendsListingPlaces } from "../src/data/legendsListings.js";

const data = JSON.parse(fs.readFileSync("src/data/locations.json", "utf8"));

const DOWNTOWN_78701_BOUNDS = {
  north: 30.286,
  south: 30.25,
  west: -97.766,
  east: -97.729,
};

const CORE_LOCATION_CATEGORY_KEYS = new Set([
  "bar_nightlife",
  "coffee_cafe",
  "hotel_hospitality",
  "other_relevant",
  "residential_property",
  "restaurant_food",
  "retail_business",
  "wellness_recreation",
]);

const EVENT_PLACES = [
  {
    id: "event-lobby-hour",
    name: "Lobby Hour",
    type: "event",
    category: "Event / Happy Hour",
    category_key: "event_happy_hour",
    latitude: 30.26698,
    longitude: -97.74562,
    district: "2nd Street",
    address: "The Paseo Lobby, Austin, TX 78701",
    summary:
      "A casual meet-up a couple blocks away. Drop in, meet a few neighbors, grab a drink, and let the night figure itself out.",
    rsvp_count: 34,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-run-club",
    name: "Run Club",
    type: "event",
    category: "Event / Fitness",
    category_key: "event_fitness",
    latitude: 30.27166,
    longitude: -97.75029,
    district: "Seaholm",
    address: "Shoal Creek Trailhead, Austin, TX 78701",
    summary:
      "Start nearby, finish with coffee after. Built for residents who want movement without another app or group thread.",
    rsvp_count: 28,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-rooftop-social",
    name: "Rooftop Social",
    type: "event",
    category: "Event / Access",
    category_key: "event_access",
    latitude: 30.26491,
    longitude: -97.74375,
    district: "Congress",
    address: "Downtown Rooftop, Austin, TX 78701",
    summary: "Resident rooftop access with enough nearby places to keep the night easy.",
    rsvp_count: 46,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-morning-yoga-waterloo",
    name: "Morning Yoga at Waterloo Park",
    type: "event",
    category: "Event / Wellness",
    category_key: "event_wellness",
    latitude: 30.27439,
    longitude: -97.73533,
    district: "Red River",
    address: "Waterloo Park, Austin, TX 78701",
    summary:
      "Start your morning with a community yoga session in Waterloo Park. Bring a mat, water, and a neighbor.",
    rsvp_count: 28,
    source: "Downtown Perks event layer",
  },
];

const BRAND_PARTNER_PLACES = [
  {
    id: "rivian-downtown-austin-activation",
    name: "Rivian Downtown Activation",
    type: "brand",
    partnerType: "brand",
    brand: "Rivian",
    category: "Brand / Activation",
    category_key: "brand_activation",
    latitude: 30.26972,
    longitude: -97.75382,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    summary:
      "A downtown brand moment tied to resident movement, test-drive interest, and nearby lifestyle stops.",
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "yeti-congress-district-activation",
    name: "YETI Congress Activation",
    type: "brand",
    partnerType: "brand",
    brand: "YETI",
    category: "Brand / Activation",
    category_key: "brand_activation",
    latitude: 30.26724,
    longitude: -97.74276,
    district: "Congress",
    address: "Congress Avenue, Austin, TX 78701",
    summary:
      "A useful brand placement for downtown residents moving between work, events, and weekend plans.",
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "legends-real-estate-downtown-austin",
    name: "Legends Real Estate",
    type: "brand",
    partnerType: "brand",
    brand: "Legends Real Estate",
    pinKey: "legends",
    category: "Brand / Real Estate",
    category_key: "brand_real_estate",
    latitude: 30.2655,
    longitude: -97.74618,
    district: "2nd Street",
    address: "2nd Street District, Austin, TX 78701",
    summary:
      "Want to live here? Browse downtown listings, see what is nearby, and ask Legends Real Estate for showing options when an address feels like a fit.",
    source: "Downtown Perks brand partner layer",
  },
];

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function slug(value, fallback = "place") {
  const cleaned = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function text(entity) {
  return [
    entity.id,
    entity.name,
    entity.brand,
    entity.type,
    entity.category,
    entity.category_key,
    entity.partnerType,
    entity.address,
    entity.summary,
    entity.description,
    entity.source,
    entity.deals_offers,
    entity.specials,
    entity.alignment_to_downtown_perks,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inDowntownScope(entity) {
  const lat = finite(entity.latitude);
  const lng = finite(entity.longitude);
  if (lat === null || lng === null) return false;
  if (
    lat < DOWNTOWN_78701_BOUNDS.south ||
    lat > DOWNTOWN_78701_BOUNDS.north ||
    lng < DOWNTOWN_78701_BOUNDS.west ||
    lng > DOWNTOWN_78701_BOUNDS.east ||
    lng > -97.7289
  ) return false;

  const haystack = [entity.address, entity.osm_id, entity.name, entity.summary, entity.description, entity.zip, entity.postalCode, entity.postal_code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const sourceText = [entity.source, entity.brand, entity.category_key].filter(Boolean).join(" ").toLowerCase();
  return (sourceText.includes("legends") && sourceText.includes("verified listing")) || haystack.includes("78701");
}

function isCoreMapLocation(entity) {
  const source = String(entity.source || "").toLowerCase();
  return !source.includes("openstreetmap") || CORE_LOCATION_CATEGORY_KEYS.has(String(entity.category_key || "").toLowerCase());
}

function inferDistrict(entity) {
  const haystack = [entity.name, entity.address, entity.category, entity.source].filter(Boolean).join(" ").toLowerCase();
  if (haystack.includes("rainey")) return "Rainey";
  if (haystack.includes("seaholm")) return "Seaholm";
  if (haystack.includes("6th")) return "West 6th";
  if (haystack.includes("congress")) return "Congress";
  if (haystack.includes("red river")) return "Red River";
  if (haystack.includes("warehouse")) return "Warehouse District";
  if (haystack.includes("2nd")) return "2nd Street";
  if (haystack.includes("lake")) return "Lady Bird Lake";
  return "Downtown Austin";
}

function inferType(entity) {
  const haystack = [entity.type, entity.category, entity.category_key, entity.partnerType, entity.name].filter(Boolean).join(" ").toLowerCase();
  if (haystack.includes("hotel") || haystack.includes("hospitality")) return "hotel";
  if (haystack.includes("property") || haystack.includes("building")) return "property";
  if (haystack.includes("resident") || haystack.includes("apartment")) return "residential";
  if (haystack.includes("event") || haystack.includes("activation")) return "event";
  if (haystack.includes("offer") || haystack.includes("perk") || haystack.includes("inkind")) return "offer";
  if (haystack.includes("brand")) return "brand";
  if (haystack.includes("civic") || haystack.includes("public")) return "civic";
  if (haystack.includes("service")) return "service";
  return "venue";
}

function pinLabel(entity) {
  const haystack = text(entity);
  if (haystack.includes("legends")) return "Legends";
  if (haystack.includes("happy hour")) return "Happy hour";
  if (haystack.includes("coffee") || haystack.includes("cafe")) return "Coffee";
  if (haystack.includes("restaurant") || haystack.includes("dining") || haystack.includes("pizza") || haystack.includes("brewery")) return "Dining";
  if (haystack.includes("bar") || haystack.includes("nightlife") || haystack.includes("cocktail") || haystack.includes("beer garden")) return "Nightlife";
  if (haystack.includes("hotel")) return "Hotel";
  if (haystack.includes("residential") || haystack.includes("apartment") || haystack.includes("condo")) return "Residential";
  if (haystack.includes("property") || haystack.includes("building")) return "Property";
  if (haystack.includes("brand") || haystack.includes("activation")) return "Campaign";
  if (haystack.includes("event") || haystack.includes("rsvp")) return "Event";
  if (haystack.includes("civic") || haystack.includes("public")) return "Civic";
  if (haystack.includes("retail") || haystack.includes("store")) return "Retail";
  if (haystack.includes("wellness") || haystack.includes("fitness") || haystack.includes("yoga")) return "Wellness";
  if (haystack.includes("service")) return "Service";
  return "Downtown";
}

function stableRawLocationId(entity, index) {
  if (entity.id) return entity.id;
  const name = slug(entity.name, `place-${index}`);
  if (entity.osm_id) return `${name}-${entity.osm_type || "osm"}-${entity.osm_id}`;
  const lat = finite(entity.latitude);
  const lng = finite(entity.longitude);
  if (lat !== null && lng !== null) return `${name}-${lat.toFixed(5)}-${lng.toFixed(5)}`;
  return `${name}-${index}`;
}

function normalize(entity, index) {
  const lat = finite(entity.latitude);
  const lng = finite(entity.longitude);
  if (lat === null || lng === null) return null;
  const type = String(entity.type || inferType(entity));
  return {
    ...entity,
    id: slug(entity.id, `entity-${index}`),
    name: String(entity.name || "Downtown place"),
    type,
    category: String(entity.category || type),
    district: String(entity.district || inferDistrict(entity)),
    partnerType: String(entity.partnerType || type),
    latitude: lat,
    longitude: lng,
    address: typeof entity.address === "string" ? entity.address : "",
    phone: entity.contact_phone || entity.phone || "",
    email: entity.contact_email || entity.email || "",
    website: entity.website || "",
    image: entity.image || "",
    raw: entity,
  };
}

function cleanDisplayCopy(value) {
  const result = String(value || "").trim().replace(/\s+/g, " ");
  if (!result || /^(no active offer listed.*|no public deal listed.*|listed:\s*n\/a.*|n\/a)$/i.test(result)) return "";
  return result;
}

function getLegendsListing(place) {
  const listing = place.raw?.legendsListing || place.legendsListing;
  return listing && typeof listing === "object" ? listing : null;
}

function isInKind(place) {
  const haystack = text(place);
  return haystack.includes("inkind") || haystack.includes("in kind") || haystack.includes("dining credit") || haystack.includes("restaurant credit");
}

function fallbackOffer(place) {
  const haystack = text(place);
  const name = place.name || "This place";
  const district = place.district || "Downtown Austin";
  if (haystack.includes("grocery") || haystack.includes("royal blue")) return ["Resident Grocery Discount", "Resident shopping value", `${name} is a nearby grocery stop for coffee, snacks, pantry basics, wine, and quick errands.`, "Show your Downtown Perks Card at checkout when the resident offer is active."];
  if (haystack.includes("property") || haystack.includes("residential")) return ["Property Discovery", "Ask about availability", `Want to live here? ${name} is included so residents can compare the building with what is walkable nearby.`, "Use the contact option to ask about availability, showings, or similar downtown homes."];
  if (haystack.includes("hotel")) return ["Local Guest Guide", "Neighborhood access", `${name} helps residents and guests find nearby dining, events, and easy downtown plans.`, "Save it, get directions, or ask about resident access when available."];
  if (haystack.includes("coffee")) return ["Coffee Stop", "Resident card access", `${name} is a nearby coffee stop for everyday downtown routines.`, "Show your Downtown Perks Card when a resident offer is active."];
  if (haystack.includes("restaurant") || haystack.includes("dining") || haystack.includes("pizza")) return ["Dining Perk", "Resident card access", `${name} is a nearby dining option residents can save for an easy plan around ${district}.`, "Show your Downtown Perks Card when a resident offer is active."];
  if (haystack.includes("bar") || haystack.includes("nightlife")) return ["Night Out Nearby", "Resident card access", `${name} is a nearby option for drinks, music, or an after-dinner plan around ${district}.`, "Show your Downtown Perks Card when a resident offer is active."];
  if (haystack.includes("event")) return ["Event RSVP", "Save or RSVP", `${name} is an event residents can save, RSVP to, and find on the map.`, "Save it to your card and check the event details before you go."];
  if (haystack.includes("brand")) return ["Resident Access", "Local partner moment", `${name} is included so residents can find useful local offers and downtown activations.`, "Save it, get directions, or check the panel for resident access."];
  return ["Nearby Downtown Option", "Save it or go now", `${name} is in the map so residents can quickly decide whether it fits the moment near ${district}.`, "Save it, get directions, or show your Downtown Perks Card if access is available."];
}

function residentPerk(place) {
  const listing = getLegendsListing(place);
  if (listing) {
    const value = [listing.priceDisplay, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqftDisplay].filter(Boolean).join(" · ");
    return {
      offer: "Exclusive Property Access",
      value: value || "Resident listing access",
      description: `${place.name || listing.address} is available through Legends Real Estate. Downtown Perks residents can contact Legends to discover availability, showing options, and property opportunities that may not always be easy to find on other listing sites.`,
      terms: "Use the contact form to ask about availability, showing times, private tour options, and similar downtown properties.",
      category: "Residential Property",
    };
  }
  const [title, value, description, terms] = fallbackOffer(place);
  const listed = cleanDisplayCopy(place.raw?.deals_offers || place.deals_offers);
  return {
    offer: listed || title,
    value: listed || value,
    description: isInKind(place)
      ? cleanDisplayCopy(place.raw?.alignment_to_downtown_perks) || `${place.name} gives residents a simple dining reason to choose a nearby restaurant: easy value, a walkable plan, and a place worth saving for dinner or drinks.`
      : cleanDisplayCopy(place.raw?.alignment_to_downtown_perks) || cleanDisplayCopy(place.raw?.summary) || description,
    terms: isInKind(place) ? "Save it to your card, open it when you are nearby, and redeem when the inKind offer is active." : terms,
    category: place.category || "Downtown place",
  };
}

function partnerCopy(place) {
  const haystack = text(place);
  const district = place.district || "Downtown Austin";
  const name = place.name || "this partner";
  if (isInKind(place)) return ["Lead with a simple dining perk", "Residents and hotel guests nearby are choosing where to eat, drink, or start the night. inKind works here because the value is immediate and tied to restaurants people can actually walk to.", `Best fit: verified residents, nearby buildings, hotel guests, and dinner groups already moving through ${district}.`, `Use ${name} as a dining perk that can turn map intent into saves, scans, redemptions, and repeat visits.`, "Strongest window: 4 PM to 9 PM"];
  if (haystack.includes("hotel")) return ["Create Guest Guide", "Guests and residents nearby are looking for dinner, events, and easy walkable plans.", "Best fit: hotel guests, nearby residents, and visitors already walking through the area.", "Promote a concierge-style local guide or resident rate during late afternoon planning windows.", "Strongest window: 3 PM to 8 PM"];
  if (haystack.includes("property") || haystack.includes("residential") || getLegendsListing(place)) return ["Create Property Plan", "Residents and prospects use this area to understand what daily life feels like around the building.", "Best fit: current residents, people looking at the building, brokers, and nearby businesses.", "Attach nearby perks, events, and walkable recommendations to the property story.", "Strongest window: weekday lunch and after-work planning"];
  if (haystack.includes("brand")) return ["Plan Brand Moment", "People nearby are choosing what to do, where to go, and what feels useful today.", `Best fit: residents, visitors, and event-goers moving through ${district}.`, `Place ${name} near the moments where the brand is useful, not just visible.`, "Strongest window: event days, weekends, and after-work planning"];
  if (haystack.includes("event")) return ["Promote Event", "Residents are looking for nearby things to do without switching apps.", "Best fit: residents, guests, and groups already near the venue.", "Make the RSVP and directions path immediate from the map.", "Strongest window: day-of and two hours before start"];
  return ["Create Map Plan", "People nearby are deciding where to go next.", `Best fit: residents, guests, and visitors already close to ${district}.`, `Make ${name} easy to save, find, and act on from the map.`, "Strongest window: lunch, after work, and weekend planning"];
}

function enrichSpecialCases(entity) {
  const lower = String(entity.name || "").toLowerCase();
  if (lower.includes("via 313")) return { ...entity, category: "Pizza / Dining", category_key: "pizza_dining", summary: "Detroit-style pizza spot in downtown Austin." };
  if (lower.includes("royal blue grocery")) return { ...entity, category: "Local Grocery", category_key: "local_grocery retail_business", summary: "Local downtown grocery stop for coffee, snacks, pantry basics, wine, and quick errands.", alignment_to_downtown_perks: "Resident grocery discounts and neighborhood shopping value for everyday downtown errands.", deals_offers: "Resident grocery discount when shopping in-store", specials: "Show your Downtown Perks Card at checkout for resident shopping value." };
  return entity;
}

const rawSources = [
  ...data.filter(isCoreMapLocation),
  ...EVENT_PLACES,
  ...BRAND_PARTNER_PLACES,
  ...legendsListingPlaces,
  ...supplementalMapEntities,
]
  .filter(inDowntownScope)
  .map((entity, index) => enrichSpecialCases({ ...entity, id: stableRawLocationId(entity, index) }));

const byId = new Map();
for (const [index, raw] of rawSources.entries()) {
  const normalized = normalize(raw, index);
  if (normalized && !byId.has(normalized.id)) byId.set(normalized.id, normalized);
}

const pins = [...byId.values()].sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name));
const rows = [];

for (const pin of pins) {
  const perk = residentPerk(pin);
  const [nextMove, intent, audience, opportunity, timing] = partnerCopy(pin);
  const meta = getLegendsListing(pin) ? `Legends Real Estate · Residential Property · ${pin.district}` : `${pin.category} · ${pin.district}`;
  const panelBody = cleanDisplayCopy(pin.raw?.summary) || cleanDisplayCopy(pin.summary) || perk.description;
  const base = {
    id: pin.id,
    name: pin.name,
    district: pin.district,
    category: pin.category,
    type: pin.type,
    pin: pinLabel(pin),
    address: pin.address,
    image: pin.image,
    source: pin.source || pin.raw?.source || "",
  };
  rows.push({
    view: "Resident",
    ...base,
    listingOrPerk: perk.offer,
    panelMeta: meta,
    panelHeadline: pin.name,
    panelBody,
    detailCopy: `Resident perk: ${perk.offer}. Value: ${perk.value}. ${perk.description} Use it: ${perk.terms}`,
    primaryActions: "Call / Website / Email when available; Show Card; Save to Card; Directions",
  });
  rows.push({
    view: "Partner",
    ...base,
    listingOrPerk: nextMove,
    panelMeta: meta,
    panelHeadline: pin.name,
    panelBody,
    detailCopy: `Partner view: ${intent} Audience: ${audience} Opportunity: ${opportunity} Best timing: ${timing} Next move: ${nextMove}`,
    primaryActions: `${nextMove}; Reports; Contact`,
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const header = ["view", "id", "name", "district", "category", "type", "pin", "address", "listingOrPerk", "panelMeta", "panelHeadline", "panelBody", "detailCopy", "primaryActions", "image", "source"];
fs.writeFileSync(
  "tmp/map-pin-inventory.csv",
  [header.join(","), ...rows.map((row) => header.map((key) => csvCell(row[key])).join(","))].join("\n"),
);

const counts = pins.reduce((acc, pin) => {
  acc[pin.category] = (acc[pin.category] || 0) + 1;
  return acc;
}, {});

let md = `# Downtown Perks Map Pin Inventory\n\nGenerated from map source data and current panel copy rules.\n\n- Unique map pins: ${pins.length}\n- Resident rows: ${pins.length}\n- Partner rows: ${pins.length}\n- CSV rows: ${rows.length}\n\n## Category Counts\n\n| Category | Pins |\n|---|---:|\n`;
for (const [category, count] of Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  md += `| ${category.replace(/\|/g, "/")} | ${count} |\n`;
}
md += "\n## Inventory Preview\n\n| Name | District | Category | Pin | Resident perk/listing | Partner next move |\n|---|---|---|---|---|---|\n";
for (const pin of pins.slice(0, 180)) {
  md += `| ${pin.name.replace(/\|/g, "/")} | ${pin.district} | ${pin.category.replace(/\|/g, "/")} | ${pinLabel(pin)} | ${residentPerk(pin).offer.replace(/\|/g, "/")} | ${partnerCopy(pin)[0].replace(/\|/g, "/")} |\n`;
}
md += "\nThe full panel-copy inventory is in `tmp/map-pin-inventory.csv`.\n";
fs.writeFileSync("tmp/map-pin-inventory.md", md);

console.log(JSON.stringify({ uniquePins: pins.length, rows: rows.length, csv: "tmp/map-pin-inventory.csv", markdown: "tmp/map-pin-inventory.md" }, null, 2));
