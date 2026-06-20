import { getPinAsset, type PinVariant } from "./pinAssetRegistry";

const CATEGORY_PIN_MAP: Array<[PinVariant, string[]]> = [
  ["happy-hour", ["happy hour", "happy_hour", "event / happy hour"]],
  ["nightlife", ["bar / nightlife", "nightlife", "bar"]],
  ["culture", ["civic / culture", "culture", "arts"]],
  ["coffee", ["coffee / cafe", "coffee", "cafe"]],
  ["property", ["commercial property", "office / business", "office", "commercial"]],
  ["hotel", ["hotel / hospitality", "hotel", "hospitality"]],
  ["residential", ["residential property", "residential", "apartment", "condo"]],
  ["dining", ["restaurant / food", "restaurant", "food", "dining"]],
  ["retail", ["retail / business", "retail", "shop", "store"]],
  ["parking", ["parking", "garage", "reservable parking", "resident parking"]],
  ["wellness", ["wellness / recreation", "wellness", "recreation", "fitness"]],
  ["guide", ["other relevant listing", "local guide", "guide"]],
];

const PIN_MATCHERS: Array<[PinVariant, string[]]> = [
  ["fine-eyewear", ["fine eyewear", "fine eyewear boutique", "see austin differently", "vision partner"]],
  ["waterloo-greenway", ["waterloo greenway", "waterloo park", "waller creek", "moody amphitheater"]],
  ["dana", ["dana", "downtown austin neighborhood association"]],
  ["legends", ["legends", "legends real estate", "legends property", "legends property export"]],
  ["coffee", ["coffee", "cafe", "espresso"]],
  ["dining", ["dining", "restaurant", "food", "lunch", "dinner", "kitchen", "grill", "taqueria", "pizza", "sushi", "bbq", "bistro", "bakery", "brewery"]],
  ["nightlife", ["bar", "nightlife", "rooftop", "music", "cocktail", "pub", "saloon", "club", "lounge", "speakeasy", "mezcal", "beer garden"]],
  ["wellness", ["wellness", "fitness", "gym", "spa", "yoga", "pilates", "salon", "beauty"]],
  ["property", ["property", "listing", "building", "tower", "condominium", "residence"]],
  ["residential", ["residential", "resident", "apartment", "condo"]],
  ["hotel", ["hotel", "hospitality", "stay", "guest"]],
  ["event", ["event", "activation", "rsvp", "festival"]],
  ["civic", ["civic", "public", "government", "district"]],
  ["retail", ["retail", "shop", "store", "eyewear", "apparel", "boutique", "market"]],
  ["parking", ["parking", "garage", "reservable parking", "resident parking"]],
  ["mobility", ["mobility", "transit"]],
  ["park", ["park", "outdoors", "trail", "lake"]],
  ["culture", ["art", "culture", "gallery", "museum"]],
  ["brand", ["brand", "sponsor", "partner"]],
  ["campaign", ["campaign", "visibility", "activation"]],
  ["analytics", ["analytics", "insight", "report"]],
  ["offer", ["offer", "perk", "discount", "inkind"]],
  ["service", ["service", "concierge"]],
  ["guide", ["guide", "local guide"]],
  ["journal", ["journal", "story"]],
];

const RESTORED_MASTER_PIN_KEYS: Record<string, PinVariant> = {
  inkind: "inkind",
  dana: "dana",
  "fine-eyewear": "fine-eyewear",
  "waterloo-greenway": "waterloo-greenway",
  "stay-put": "stay-put",
  "topo-chico": "topo-chico",
  yeti: "brand",
  rivian: "mobility",
  lululemon: "wellness",
  "four-seasons": "hotel",
};

function entityText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.entityType,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.partnerType,
    entity.brand,
    entity.source,
    entity.osm_type,
    entity.pinKey,
    entity.pinAsset,
    entity.pin_asset,
    entity.legendsListing ? "legends listing" : "",
    entity.luxuryPresenceListing ? "luxury presence listing" : "",
    raw.type,
    raw.name,
    raw.title,
    raw.entityType,
    raw.category,
    raw.category_key,
    raw.partnerType,
    raw.source,
    raw.pinKey,
    raw.pinAsset,
    raw.pin_asset,
    raw.legendsListing ? "legends listing" : "",
    raw.luxuryPresenceListing ? "luxury presence listing" : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function explicitPinKey(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return String(entity.pinKey || entity.pinAsset || entity.pin_asset || raw.pinKey || raw.pinAsset || raw.pin_asset || "")
    .toLowerCase()
    .trim();
}

function hasVenueSignal(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  return /\b(venue|restaurant|bar|nightlife|coffee|retail|store|shop|antone'?s|nightclub|live music|music venue|cocktail|dining|pizza|brewery|beer|cafe)\b/.test(text);
}

function hasResidentialSignal(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  if (hasVenueSignal(entity) && !/\b(residential property|property|listing|mls|luxury[_\s-]*presence|legends)\b/.test(text)) return false;
  return (
    /\b(property|residential|listing|legends|luxury[_\s-]*presence|mls|condominium|condo|apartment|for sale|for rent)\b/.test(text) ||
    Boolean(raw.luxuryPresenceBuilding || raw.luxuryPresenceListing || raw.legendsListing || entity.legendsListing)
  );
}

export function resolveEntityPin(entity: Record<string, unknown>) {
  const textForPin = entityText(entity);
  if (PIN_MATCHERS.find(([, tokens]) => tokens.some((token) => textForPin.includes(token)))?.[0] === "legends") {
    return getPinAsset("legends");
  }

  const explicit = explicitPinKey(entity);
  if (explicit) {
    if (explicit === "legends" || explicit.includes("legends-logo") || explicit.includes("legends")) return getPinAsset("legends");
    return getPinAsset(RESTORED_MASTER_PIN_KEYS[explicit] || explicit);
  }

  const entityTypeText = [entity.type, entity.entityType, entity.markerType, entity.detailDrawerType, entity.isEvent ? "event" : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (entityTypeText.includes("happy_hour") || entityTypeText.includes("happy hour")) return getPinAsset("happy-hour");
  if (entityTypeText.includes("parking")) return getPinAsset("parking");
  if (entityTypeText.includes("event")) return getPinAsset("event");
  if (hasResidentialSignal(entity)) return getPinAsset("residential");
  if (hasVenueSignal(entity) && /\b(antone'?s|nightclub|live music|music venue|art|culture|gallery|museum)\b/.test(entityText(entity))) return getPinAsset("culture");
  if (hasVenueSignal(entity) && /\b(bar|nightlife|cocktail|pub|club|lounge|beer)\b/.test(entityText(entity))) return getPinAsset("nightlife");

  const text = [
    entity.id,
    entity.name,
    entity.type,
    entity.entityType,
    entity.category,
    entity.category_key,
    entity.partnerType,
    entity.brand,
    entity.source,
    entity.osm_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(in[\s-]?kind|dining credit|restaurant credit|dining perk)\b/.test(text)) {
    return getPinAsset("inkind");
  }

  const categoryText = [entity.category, entity.category_key, entity.type].filter(Boolean).join(" ").toLowerCase();
  if (/\b(brand[_\s/-]*activation|campaign|sponsor|visibility)\b/.test(categoryText) || /\b(campaign|brand activation|district activation)\b/.test(text)) {
    return getPinAsset("campaign");
  }

  const categoryMatch = CATEGORY_PIN_MAP.find(([, tokens]) => tokens.some((token) => categoryText.includes(token)));
  if (categoryMatch) return getPinAsset(categoryMatch[0]);

  const match = PIN_MATCHERS.find(([, tokens]) => tokens.some((token) => text.includes(token)));
  const fallbackByType = String(entity.type || entity.category || "").toLowerCase();
  const pinKey =
    match?.[0] ||
    (fallbackByType.includes("venue") ? "dining" : "") ||
    (fallbackByType.includes("property") ? "property" : "") ||
    (fallbackByType.includes("hotel") ? "hotel" : "") ||
    (fallbackByType.includes("event") ? "event" : "") ||
    (fallbackByType.includes("offer") ? "offer" : "") ||
    (fallbackByType.includes("brand") ? "brand" : "") ||
    (fallbackByType.includes("civic") ? "civic" : "") ||
    "guide";
  return getPinAsset(pinKey);
}
