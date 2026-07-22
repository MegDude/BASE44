import { getMapIcon, type MapIconKey } from "./mapIconRegistry";

const CATEGORY_PIN_MAP: Array<[MapIconKey, string[]]> = [
  ["discovery", ["discovery trail", "discovery marker", "discovery_marker", "trail stop"]],
  ["happy-hour", ["happy hour", "happy_hour", "event / happy hour"]],
  ["nightlife", ["bar / nightlife", "nightlife", "bar"]],
  ["culture", ["civic / culture", "culture", "arts"]],
  ["coffee", ["coffee / cafe", "coffee", "cafe"]],
  ["property", ["commercial property", "office / business", "office", "commercial"]],
  ["hotel", ["hotel / hospitality", "hotel", "hospitality"]],
  ["listing", ["real estate listing", "listing", "mls"]],
  ["residential", ["residential property", "residential", "apartment", "condo"]],
  ["dining", ["restaurant / food", "restaurant", "food", "dining"]],
  ["retail", ["retail / business", "retail", "shop", "store"]],
  ["parking", ["parking", "garage", "reservable parking", "resident parking"]],
  ["ev", ["ev charging", "charging", "charger"]],
  ["transit", ["transit", "bus", "train", "rail"]],
  ["wellness", ["wellness / recreation", "wellness", "recreation", "fitness"]],
  ["service", ["local service", "service"]],
  ["guide", ["other relevant listing", "local guide", "guide"]],
];

const PIN_MATCHERS: Array<[MapIconKey, string[]]> = [
  ["discovery", ["discovery trail", "discovery_marker", "see austin differently", "golden hour walk", "photo trail", "waterloo reflection", "design marker"]],
  ["fine-eyewear", ["fine eyewear", "fine eyewear boutique", "see austin differently", "vision partner"]],
  ["waterloo-greenway", ["waterloo greenway", "waterloo park", "waller creek", "moody amphitheater"]],
  ["dana", ["dana", "downtown austin neighborhood association"]],
  ["legends", ["legends", "legends real estate", "legends property", "legends property export"]],
  ["rivian", ["rivian"]],
  ["coffee", ["coffee", "cafe", "espresso"]],
  ["dining", ["dining", "restaurant", "food", "lunch", "dinner", "kitchen", "grill", "taqueria", "pizza", "sushi", "bbq", "bistro", "bakery", "brewery"]],
  ["nightlife", ["bar", "nightlife", "rooftop", "music", "cocktail", "pub", "saloon", "club", "lounge", "speakeasy", "mezcal", "beer garden"]],
  ["wellness", ["wellness", "fitness", "gym", "spa", "yoga", "pilates", "salon", "beauty"]],
  ["property", ["property", "listing", "building", "tower", "condominium", "residence"]],
  ["residential", ["residential", "resident", "apartment", "condo"]],
  ["listing", ["listing", "mls", "for sale", "for rent"]],
  ["hotel", ["hotel", "hospitality", "stay", "guest"]],
  ["event", ["event", "activation", "rsvp", "festival"]],
  ["civic", ["civic", "public", "government", "district"]],
  ["retail", ["retail", "shop", "store", "eyewear", "apparel", "boutique", "market"]],
  ["parking", ["parking", "garage", "reservable parking", "resident parking"]],
  ["ev", ["ev", "charging", "charger"]],
  ["transit", ["transit", "bus", "train", "rail"]],
  ["mobility", ["mobility", "vehicle", "ride", "test drive"]],
  ["park", ["park", "outdoors", "trail", "lake"]],
  ["trail", ["trail", "route", "walk"]],
  ["attraction", ["attraction", "landmark", "photo", "viewpoint"]],
  ["culture", ["art", "culture", "gallery", "museum"]],
  ["brand", ["brand", "sponsor", "partner"]],
  ["campaign", ["campaign", "visibility", "activation"]],
  ["analytics", ["analytics", "insight", "report"]],
  ["offer", ["offer", "perk", "discount", "inkind"]],
  ["service", ["service", "concierge"]],
  ["guide", ["guide", "local guide"]],
  ["journal", ["journal", "story"]],
];

const RESTORED_MASTER_PIN_KEYS: Record<string, MapIconKey> = {
  inkind: "inkind",
  dana: "dana",
  "fine-eyewear": "fine-eyewear",
  "waterloo-greenway": "waterloo-greenway",
  "stay-put": "stay-put",
  "topo-chico": "topo-chico",
  yeti: "brand",
  rivian: "rivian",
  lululemon: "wellness",
  "four-seasons": "hotel",
};

const UPLOADED_BRAND_PIN_KEYS = new Set([
  "dana",
  "dana-logo",
  "dana-logo-gold",
  "dana-pin",
  "fine-eyewear",
  "fine-eyewear-logo",
  "fine-eyewear-pin",
  "stay-put",
  "stay-put-pin",
  "topo-chico",
  "topo-chico-pin",
  "yeti",
  "rivian",
  "lululemon",
]);

function isBrandOrRetailEntity(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  return /\b(brand|brands|brand[_\s-]*activation|sponsor|sponsorship|retail|shop|store|boutique|eyewear|apparel|yeti|rivian|lululemon|topo chico|fine eyewear)\b/.test(text);
}

function entityText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.partnerType,
    entity.partnerNetwork,
    entity.brand,
    entity.source,
    entity.osm_type,
    entity.pinKey,
    entity.pinAsset,
    entity.pin_asset,
    entity.legendsListing ? "legends listing" : "",
    entity.luxuryPresenceListing ? "luxury presence listing" : "",
    raw.type,
    raw.kind,
    raw.name,
    raw.title,
    raw.entityType,
    raw.category,
    raw.category_key,
    raw.subcategory,
    raw.partnerType,
    raw.partnerNetwork,
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

function hasRestaurantSignal(entity: Record<string, unknown>): boolean {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const primaryTypeText = [
    entity.entityType,
    entity.type,
    entity.kind,
    entity.markerType,
    entity.detailDrawerType,
    raw.entityType,
    raw.type,
    raw.kind,
    raw.markerType,
    raw.detailDrawerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const categoryText = [
    entity.category,
    entity.category_key,
    entity.subcategory,
    raw.category,
    raw.category_key,
    raw.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(event|campaign|property|listing|rental|hotel|brand|civic|service)\b/.test(primaryTypeText) && !/\b(restaurant|dining)\b/.test(primaryTypeText)) {
    return false;
  }

  return /\b(restaurant|dining|restaurant[_\s/-]*food|food hall)\b/.test(`${primaryTypeText} ${categoryText}`);
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

function hasLegendsPinSignal(entity: Record<string, unknown>): boolean {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const text = entityText(entity);
  return (
    /\blegends\b/.test(text) ||
    Boolean(
      entity.legendsListing ||
        entity.rentalListing ||
        entity.legendsResidentialContent ||
        entity.legendsResidentialExperience ||
        raw.legendsListing ||
        raw.rentalListing ||
        raw.legendsResidentialContent ||
        raw.legendsResidentialExperience,
    )
  );
}

export function resolveEntityPin(entity: Record<string, unknown>) {
  if (hasLegendsPinSignal(entity)) {
    return getMapIcon("legends");
  }

  const textForPin = entityText(entity);
  if (PIN_MATCHERS.find(([, tokens]) => tokens.some((token) => textForPin.includes(token)))?.[0] === "legends") {
    return getMapIcon("legends");
  }

  // Program membership, search intent, and perks must never replace the
  // restaurant's primary category. Restaurants keep the canonical dining pin
  // and can independently participate in the inKind layer.
  if (hasRestaurantSignal(entity)) {
    return getMapIcon("dining");
  }

  const explicit = explicitPinKey(entity);
  if (explicit) {
    if (explicit === "legends" || explicit.includes("legends-logo") || explicit.includes("legends")) return getMapIcon("legends");
    if (UPLOADED_BRAND_PIN_KEYS.has(explicit) || explicit.includes("/pins/brands/")) {
      if (/\b(dana|downtown austin neighborhood association)\b/.test(textForPin) || explicit.includes("dana")) return getMapIcon("dana");
      if (/\b(fine[_\s-]*eyewear|eyewear|vision partner)\b/.test(textForPin)) return getMapIcon("fine-eyewear");
      if (/\b(waterloo|greenway|trail)\b/.test(textForPin) || explicit.includes("waterloo")) return getMapIcon("waterloo-greenway");
      if (/\b(stay[_\s-]*put|the stay put)\b/.test(textForPin)) return getMapIcon("stay-put");
      if (/\b(topo[_\s-]*chico|topochico)\b/.test(textForPin)) return getMapIcon("topo-chico");
      if (/\b(rivian|mobility|ev|vehicle|charging)\b/.test(textForPin)) return getMapIcon("rivian");
      if (/\b(lululemon|wellness|fitness|run|yoga)\b/.test(textForPin)) return getMapIcon("lululemon");
      return getMapIcon("brand");
    }
    return getMapIcon(RESTORED_MASTER_PIN_KEYS[explicit] || explicit);
  }

  const entityTypeText = [entity.type, entity.entityType, entity.markerType, entity.detailDrawerType, entity.isEvent ? "event" : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (entityTypeText.includes("discovery_marker") || entityTypeText.includes("discovery")) return getMapIcon("discovery");
  if (entityTypeText.includes("happy_hour") || entityTypeText.includes("happy hour")) return getMapIcon("happy-hour");
  if (entityTypeText.includes("parking")) return getMapIcon("parking");
  if (entityTypeText.includes("event")) return getMapIcon("event");
  if (hasResidentialSignal(entity) && /\b(listing|mls|for sale|for rent)\b/.test(textForPin)) return getMapIcon("listing");
  if (hasResidentialSignal(entity)) return getMapIcon("residential");
  if (hasVenueSignal(entity) && /\b(antone'?s|nightclub|live music|music venue|art|culture|gallery|museum)\b/.test(entityText(entity))) return getMapIcon("culture");
  if (hasVenueSignal(entity) && /\b(bar|nightlife|cocktail|pub|club|lounge|beer)\b/.test(entityText(entity))) return getMapIcon("nightlife");
  if (isBrandOrRetailEntity(entity) && /\b(retail|shop|store|boutique|eyewear|apparel|market)\b/.test(textForPin)) return getMapIcon("retail");
  if (isBrandOrRetailEntity(entity)) return getMapIcon("brand");

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
    return getMapIcon("inkind");
  }

  const categoryText = [entity.category, entity.category_key, entity.type].filter(Boolean).join(" ").toLowerCase();
  if (/\b(brand[_\s/-]*activation|campaign|sponsor|visibility)\b/.test(categoryText) || /\b(campaign|brand activation|district activation)\b/.test(text)) {
    return getMapIcon("campaign");
  }

  const categoryMatch = CATEGORY_PIN_MAP.find(([, tokens]) => tokens.some((token) => categoryText.includes(token)));
  if (categoryMatch) return getMapIcon(categoryMatch[0]);

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
    "default";
  return getMapIcon(pinKey);
}
