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
  ["wellness", ["wellness / recreation", "wellness", "recreation", "fitness"]],
  ["guide", ["other relevant listing", "local guide", "guide"]],
];

const PIN_MATCHERS: Array<[PinVariant, string[]]> = [
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
  ["mobility", ["mobility", "transit", "parking"]],
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

export function resolveEntityPin(entity: Record<string, unknown>) {
  if (typeof entity.pinKey === "string" && entity.pinKey) return getPinAsset(entity.pinKey);

  const entityTypeText = [entity.type, entity.markerType, entity.detailDrawerType, entity.isEvent ? "event" : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (entityTypeText.includes("happy_hour") || entityTypeText.includes("happy hour")) return getPinAsset("happy-hour");
  if (entityTypeText.includes("event")) return getPinAsset("event");

  const text = [
    entity.id,
    entity.name,
    entity.type,
    entity.category,
    entity.partnerType,
    entity.brand,
    entity.source,
    entity.osm_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (PIN_MATCHERS.find(([, tokens]) => tokens.some((token) => text.includes(token)))?.[0] === "legends") {
    return getPinAsset("legends");
  }

  const categoryText = [entity.category, entity.category_key, entity.type].filter(Boolean).join(" ").toLowerCase();
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
