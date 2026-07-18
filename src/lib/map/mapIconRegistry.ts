export type MapIconKey =
  | "coffee"
  | "dining"
  | "restaurant"
  | "venue"
  | "nightlife"
  | "bar"
  | "cocktail"
  | "wellness"
  | "property"
  | "residential"
  | "building"
  | "listing"
  | "hotel"
  | "event"
  | "happy-hour"
  | "civic"
  | "retail"
  | "parking"
  | "mobility"
  | "ev"
  | "transit"
  | "park"
  | "trail"
  | "discovery"
  | "attraction"
  | "culture"
  | "entertainment"
  | "brand"
  | "campaign"
  | "analytics"
  | "offer"
  | "inkind"
  | "dana"
  | "fine-eyewear"
  | "waterloo-greenway"
  | "stay-put"
  | "topo-chico"
  | "yeti"
  | "rivian"
  | "lululemon"
  | "four-seasons"
  | "service"
  | "services"
  | "spark"
  | "district"
  | "guide"
  | "journal"
  | "legends"
  | "default";

export type MapIconDefinition = {
  label: string;
  glyph: string;
  asset?: string;
};

export const LEGENDS_PIN_ASSET = "/pins/downtown-perks/legends-logo.png";
const PARTNER_PIN_ROOT = "/pins/downtown-perks/partners";
export const INKIND_PIN_ASSET = `${PARTNER_PIN_ROOT}/inkind.png`;
export const COFFEE_PIN_ASSET = `${PARTNER_PIN_ROOT}/coffee.png`;
export const BEER_PIN_ASSET = `${PARTNER_PIN_ROOT}/beer.png`;
export const BOOTS_PIN_ASSET = `${PARTNER_PIN_ROOT}/boots.png`;
export const FINE_EYEWEAR_PIN_ASSET = `${PARTNER_PIN_ROOT}/fine-eyewear.png`;
export const DANA_PIN_ASSET = `${PARTNER_PIN_ROOT}/dana.png`;
export const CONDO_BUILDING_PIN_ASSET = `${PARTNER_PIN_ROOT}/condo-building.png`;
export const RIVIAN_PIN_ASSET = `${PARTNER_PIN_ROOT}/rivian.png`;

function icon(paths: string) {
  return `<svg class="dp-pin-svg dp-map-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function artwork(label: string, asset: string, className: string): MapIconDefinition {
  return {
    label,
    asset,
    glyph: `<img class="dp-pin-logo dp-live-pin__premium-art ${className}" src="${asset}" alt="" aria-hidden="true" />`,
  };
}

export const mapIconRegistry: Record<MapIconKey, MapIconDefinition> = {
  coffee: artwork("Coffee", COFFEE_PIN_ASSET, "dp-live-pin__coffee-art"),
  dining: { label: "Dining", glyph: icon('<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h3a3 3 0 0 1 3 3v5h-6"/>') },
  restaurant: { label: "Restaurant", glyph: icon('<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h3a3 3 0 0 1 3 3v5h-6"/>') },
  venue: { label: "Venue", glyph: icon('<path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M17 3v18"/><path d="M14 3h3a3 3 0 0 1 3 3v5h-6"/>') },
  nightlife: artwork("Drinks", BEER_PIN_ASSET, "dp-live-pin__beer-art"),
  bar: artwork("Bar", BEER_PIN_ASSET, "dp-live-pin__beer-art"),
  cocktail: { label: "Cocktail", glyph: icon('<path d="M6 3h12l-5 7v8"/><path d="M9 21h6"/><path d="M8 8h8"/><path d="M18 4l-3 4"/>') },
  wellness: { label: "Wellness", glyph: icon('<path d="M4 14h4l2-8 4 14 2-6h4"/><path d="M7 20h10"/>') },
  property: artwork("Property", CONDO_BUILDING_PIN_ASSET, "dp-live-pin__building-art"),
  residential: artwork("Residential", CONDO_BUILDING_PIN_ASSET, "dp-live-pin__building-art"),
  building: artwork("Building", CONDO_BUILDING_PIN_ASSET, "dp-live-pin__building-art"),
  listing: artwork("Listing", CONDO_BUILDING_PIN_ASSET, "dp-live-pin__building-art"),
  hotel: { label: "Hotel", glyph: icon('<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M7 11h10"/><path d="M7 16h10"/><path d="M9 7h.01M15 7h.01"/>') },
  event: { label: "Event", glyph: icon('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h3M13 14h3M8 17h3"/>') },
  "happy-hour": artwork("Happy Hour", BEER_PIN_ASSET, "dp-live-pin__beer-art"),
  civic: { label: "Civic", glyph: icon('<path d="M3 10h18"/><path d="M5 10l7-6 7 6"/><path d="M6 10v9M10 10v9M14 10v9M18 10v9"/><path d="M4 21h16"/>') },
  retail: artwork("Retail", BOOTS_PIN_ASSET, "dp-live-pin__retail-art"),
  parking: { label: "Parking", glyph: icon('<path d="M6 21V4h8a5 5 0 0 1 0 10H6"/><path d="M6 14h8"/><path d="M10 8h4"/>') },
  mobility: { label: "Mobility", glyph: icon('<path d="M5 16h14"/><path d="M7 16l2-8h6l2 8"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M10 11h4"/>') },
  ev: { label: "EV Charging", glyph: icon('<path d="M7 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16"/><path d="M9 8h5"/><path d="m18 7 2 2-2 2"/><path d="M20 9v7a2 2 0 0 1-2 2h-2"/><path d="m11 12-2 4h3l-1 3 4-5h-3l1-2Z"/>') },
  transit: { label: "Transit", glyph: icon('<path d="M6 17h12"/><path d="M8 21l2-4M16 21l-2-4"/><rect x="5" y="3" width="14" height="14" rx="2"/><path d="M8 7h8M8 11h8"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>') },
  park: { label: "Park", glyph: icon('<path d="M12 21v-8"/><path d="M8 13h8"/><path d="M7 13a5 5 0 1 1 10 0"/><path d="M5 21h14"/>') },
  trail: { label: "Trail", glyph: icon('<path d="M6 18c3-7 9-3 12-10"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M9 9h.01M12 7h.01M14 12h.01M17 10h.01"/>') },
  discovery: { label: "Discovery Trail", glyph: icon('<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/><circle cx="12" cy="11" r="2"/>') },
  attraction: { label: "Attraction", glyph: icon('<path d="M4 7h3l2-3h6l2 3h3v13H4V7Z"/><circle cx="12" cy="13" r="3"/><path d="M17 10h.01"/>') },
  culture: { label: "Arts & Culture", glyph: icon('<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-6h6v6"/><path d="M9 10h6"/>') },
  entertainment: { label: "Entertainment", glyph: icon('<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-6h6v6"/><path d="M9 10h6"/>') },
  brand: { label: "Brand", glyph: icon('<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5Z"/><path d="M9 12h6"/><path d="M12 9v6"/>') },
  campaign: { label: "Campaign", glyph: icon('<path d="M4 13V7l11-3v12L4 13Z"/><path d="M4 13l2 7h4l-2-6"/><path d="M18 8v4"/>') },
  analytics: { label: "Reports", glyph: icon('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/>') },
  offer: { label: "Perk", glyph: icon('<path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5c0 1.5 1 2.5 1 2.5Z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5c0 1.5-1 2.5-1 2.5Z"/>') },
  inkind: artwork("inKind", INKIND_PIN_ASSET, "dp-live-pin__inkind-logo"),
  dana: artwork("DANA", DANA_PIN_ASSET, "dp-live-pin__dana-logo"),
  "fine-eyewear": artwork("Fine Eyewear", FINE_EYEWEAR_PIN_ASSET, "dp-live-pin__fine-eyewear-logo"),
  "waterloo-greenway": { label: "Waterloo Greenway", glyph: icon('<path d="M6 18c3-7 9-3 12-10"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M8 13h8"/><path d="M12 21v-8"/>') },
  "stay-put": { label: "The Stay Put", glyph: icon('<path d="M3 11 12 4l9 7"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/>') },
  "topo-chico": { label: "Topo Chico", glyph: icon('<path d="M9 2h6"/><path d="M10 2v4l-2 3v10a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9l-2-3V2"/><path d="M9 13h6"/><path d="M10 17h4"/>') },
  yeti: { label: "YETI", glyph: icon('<path d="M6 4h12l-1 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 4Z"/><path d="M8 8h8"/><path d="M10 12h4"/>') },
  rivian: artwork("Rivian", RIVIAN_PIN_ASSET, "dp-live-pin__rivian-logo"),
  lululemon: { label: "Lululemon", glyph: icon('<path d="M4 14h4l2-8 4 14 2-6h4"/><path d="M7 20h10"/>') },
  "four-seasons": { label: "Four Seasons", glyph: icon('<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M7 11h10"/><path d="M7 16h10"/><path d="M9 7h.01M15 7h.01"/>') },
  service: { label: "Service", glyph: icon('<path d="M4 21V9l8-5 8 5v12"/><path d="M8 21v-7h8v7"/><path d="M9 11h6"/>') },
  services: { label: "Services", glyph: icon('<path d="M4 21V9l8-5 8 5v12"/><path d="M8 21v-7h8v7"/><path d="M9 11h6"/>') },
  spark: { label: "Highlight", glyph: icon('<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>') },
  district: { label: "District", glyph: icon('<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/><circle cx="12" cy="11" r="2"/>') },
  guide: { label: "Local Guide", glyph: icon('<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/>') },
  journal: { label: "Journal", glyph: icon('<path d="M6 4h11a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h7M8 12h7M8 16h5"/>') },
  legends: {
    label: "Legends",
    glyph: `<img class="dp-pin-logo dp-live-pin__legends-logo" src="${LEGENDS_PIN_ASSET}" alt="" aria-hidden="true" />`,
    asset: LEGENDS_PIN_ASSET,
  },
  default: { label: "Downtown", glyph: icon('<path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>') },
};

export function normalizeMapIconKey(pinKey: string | undefined) {
  return String(pinKey || "default")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getMapIcon(pinKey: string | undefined): MapIconDefinition {
  const rawKey = String(pinKey || "default") as MapIconKey;
  const normalizedKey = normalizeMapIconKey(pinKey) as MapIconKey;
  const direct = mapIconRegistry[rawKey] || mapIconRegistry[normalizedKey];
  const labelMatch = Object.values(mapIconRegistry).find((item) => normalizeMapIconKey(item.label) === normalizedKey);

  if (!direct && !labelMatch && import.meta.env.DEV) {
    console.warn("[MapIconRegistry] Missing mapping", pinKey);
  }

  return direct || labelMatch || mapIconRegistry.default;
}
