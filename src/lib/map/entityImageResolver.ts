import { categoryImageFallbacks, districtImageFallbacks, perkImageRegistry } from "./perkImageRegistry";

export const BUILDING_IMAGE_FALLBACK: Record<string, string> = {
  austonian: "/buildings/austonian.webp",
  independent: "/images/map-pins/property/301-west-ave.jpg",
  seaholm: "/buildings/seaholm.webp",
  "360": "/buildings/360.webp",
  shore: "/buildings/shore.webp",
  quincy: "/images/map-pins/property/the-quincy.jpg",
  rainey70: "/images/map-pins/property/70-rainey.webp",
  east44: "/images/map-pins/property/44-east.jpg",
  natiivo: "/buildings/natiivo.webp",
  waterline: "/buildings/waterline.webp",
  block185: "/buildings/block-185.webp",
  catherine: "/buildings/catherine.webp",
  waller3: "/images/map-pins/property/3-waller.webp",
  rio404: "/images/map-pins/property/404-rio-grande.jpeg",
  river700: "/images/map-pins/property/700-river.jpg",
  fivefiftyfive: "/buildings/five-fifty-five.webp",
  monarch: "/buildings/monarch.webp",
  spring: "/buildings/spring.webp",
  milago: "/images/map-pins/property/milago.webp",
  bowie: "/buildings/bowie.webp",
  "hanover-republic-square": "/buildings/hanover-republic-square.jpg",
  "gables-republic-square": "/images/map-pins/property/gables-republic-square.jpg",
  "modern-austin-residences": "/images/map-pins/property/paseo.webp",
  "residential-west-avenue-300": "/images/map-pins/property/residential-property-west-avenue-300.webp",
  "millenium-rainey": "/images/map-pins/property/millenium-rainey.jpg",
  "towers-of-town-lake": "/images/map-pins/property/towers-of-town-lake.jpeg",
  "vesper-atx": "/images/map-pins/property/vesper-atx.jpg",
  "windsor-on-the-lake": "/images/map-pins/property/windsor-on-the-lake.avif",
};

const curatedBuildingImageOverrides: Record<string, string> = {
  austonian: "/buildings/austonian.webp",
  independent: "/images/map-pins/property/301-west-ave.jpg",
  seaholm: "/buildings/seaholm.webp",
  "360": "/buildings/360.webp",
  quincy: "/images/map-pins/property/the-quincy.jpg",
  rainey70: "/images/map-pins/property/70-rainey.webp",
  east44: "/images/map-pins/property/44-east.jpg",
  natiivo: "/buildings/natiivo.webp",
  waterline: "/buildings/waterline.webp",
  block185: "/buildings/block-185.webp",
  river700: "/images/map-pins/property/700-river.jpg",
  waller3: "/images/map-pins/property/3-waller.webp",
  rio404: "/images/map-pins/property/404-rio-grande.jpeg",
  monarch: "/buildings/monarch.webp",
  milago: "/images/map-pins/property/milago.webp",
  bowie: "/buildings/bowie.webp",
  "hanover-republic-square": "/buildings/hanover-republic-square.jpg",
  "gables-republic-square": "/images/map-pins/property/gables-republic-square.jpg",
  "modern-austin-residences": "/images/map-pins/property/paseo.webp",
  "residential-west-avenue-300": "/images/map-pins/property/residential-property-west-avenue-300.webp",
  "millenium-rainey": "/images/map-pins/property/millenium-rainey.jpg",
  "towers-of-town-lake": "/images/map-pins/property/towers-of-town-lake.jpeg",
  "vesper-atx": "/images/map-pins/property/vesper-atx.jpg",
  "windsor-on-the-lake": "/images/map-pins/property/windsor-on-the-lake.avif",
};

export const HOTEL_IMAGE_FALLBACK: Record<string, string> = {
  hotelVanZandt: "/images/map-pins/property/hotel-van-zandt.webp",
  austinProper: "/hotels/austin-proper.webp",
  fourSeasons: "/hotels/four-seasons.webp",
  hyattCentric: "/hotels/hyatt-centric.webp",
  stephenFAustin: "/hotels/stephen-f-austin.webp",
  fairmontAustin: "/images/map-pins/property/fairmont-austin.jpg",
  jwMarriott: "/hotels/jw-marriott.webp",
  thompsonAustin: "/hotels/thompson-austin.webp",
  cambriaAustin: "/images/map-pins/property/cambria-hotel-austin-downtown.jpg",
  westinAustinDowntown: "/hotels/westin-austin-downtown.webp",
  fairfieldInnSuitesAustinDowntown: "/images/map-pins/property/fairfield-inn-and-suites-austin-downtown.jpg",
  holidayInnTownLake: "/images/map-pins/property/holiday-inn-austin-town-lake.webp",
};

const curatedHotelImageOverrides: Record<string, string> = {
  hotelVanZandt: "/images/map-pins/property/hotel-van-zandt.webp",
  austinProper: "/hotels/austin-proper.webp",
  fourSeasons: "/hotels/four-seasons.webp",
  fairmontAustin: "/images/map-pins/property/fairmont-austin.jpg",
  hyattCentric: "/hotels/hyatt-centric.webp",
  jwMarriott: "/hotels/jw-marriott.webp",
  cambriaAustin: "/images/map-pins/property/cambria-hotel-austin-downtown.jpg",
  westinAustinDowntown: "/hotels/westin-austin-downtown.webp",
  fairfieldInnSuitesAustinDowntown: "/images/map-pins/property/fairfield-inn-and-suites-austin-downtown.jpg",
  holidayInnTownLake: "/images/map-pins/property/holiday-inn-austin-town-lake.webp",
};

const buildingImageRules = [
  { key: "austonian", terms: ["the austonian", "austonian", "200 congress"] },
  { key: "independent", terms: ["the independent", "independent", "jenga tower", "301 west ave"] },
  { key: "seaholm", terms: ["seaholm residences", "seaholm", "222 west ave"] },
  { key: "360", terms: ["360 condominiums", "360 condos", "360 condo", "360 nueces"] },
  { key: "shore", terms: ["the shore", "shore austin", "shore condos"] },
  { key: "quincy", terms: ["the quincy", "quincy"] },
  { key: "rainey70", terms: ["70 rainey", "70 rainey st", "rainey 70"] },
  { key: "east44", terms: ["44 east", "44 east ave"] },
  { key: "natiivo", terms: ["natiivo"] },
  { key: "waterline", terms: ["waterline", "98 red river"] },
  { key: "block185", terms: ["block 185", "google tower", "601 w 2nd"] },
  { key: "catherine", terms: ["the catherine", "catherine"] },
  { key: "waller3", terms: ["3 waller", "three waller"] },
  { key: "rio404", terms: ["404 rio grande", "404 rio"] },
  { key: "river700", terms: ["700 river", "700 river street"] },
  { key: "fivefiftyfive", terms: ["five fifty five", "555", "five-fifty-five"] },
  { key: "monarch", terms: ["the monarch", "monarch"] },
  { key: "spring", terms: ["spring condominiums", "spring condos", "spring austin"] },
  { key: "milago", terms: ["milago"] },
  { key: "bowie", terms: ["the bowie", "bowie"] },
  { key: "hanover-republic-square", terms: ["hanover republic square", "303 w 5th", "305, west 5th", "west 5th street"] },
  { key: "gables-republic-square", terms: ["gables republic square", "401 guadalupe"] },
  { key: "modern-austin-residences", terms: ["modern austin residences", "paseo", "80 rainey", "90 rainey"] },
  { key: "residential-west-avenue-300", terms: ["residential property west avenue 300", "300 west avenue"] },
  { key: "millenium-rainey", terms: ["millenium rainey", "millennium rainey", "91 rainey"] },
  { key: "towers-of-town-lake", terms: ["towers of town lake", "40 north interstate 35"] },
  { key: "vesper-atx", terms: ["vesper atx", "84 east avenue"] },
  { key: "windsor-on-the-lake", terms: ["windsor on the lake", "43 rainey"] },
];

const hotelImageRules = [
  { key: "hotelVanZandt", terms: ["hotel van zandt", "van zandt"] },
  { key: "austinProper", terms: ["austin proper", "proper hotel"] },
  { key: "fourSeasons", terms: ["four seasons", "four seasons hotel"] },
  { key: "hyattCentric", terms: ["hyatt centric", "hyatt centric congress"] },
  { key: "stephenFAustin", terms: ["stephen f austin", "stephen f. austin", "intercontinental stephen"] },
  { key: "fairmontAustin", terms: ["fairmont austin", "fairmont"] },
  { key: "jwMarriott", terms: ["jw marriott", "jw marriott austin"] },
  { key: "thompsonAustin", terms: ["thompson austin", "thompson hotel"] },
  { key: "cambriaAustin", terms: ["cambria austin", "cambria hotel"] },
  { key: "westinAustinDowntown", terms: ["westin austin downtown", "westin downtown"] },
  { key: "fairfieldInnSuitesAustinDowntown", terms: ["fairfield inn", "fairfield inn & suites austin downtown"] },
  { key: "holidayInnTownLake", terms: ["holiday inn austin town lake", "holiday inn town lake"] },
];

const entityImageSets: Record<string, string[]> = {
  rivian: [
    "/images/map-entities/brand-rivian/Fe7UiHhkFFkEKvIic-YpLhYlNj9bRL-6Bj9Qm4J0-6xZJq-U2KBQ80Ctv8hYwkNVDB16JXVSX5T_lq-H7U4xOpOsyynFmRePiHbfsuY8slgQhlq5xnIrbzYeYWvErFyPoE1i9yYtkRjDpU0c_cezRm1YxDXZHHRXciChV_UKYyRUXa-subEVD4VY61beuZlZ.jpeg",
    "/images/map-entities/brand-rivian/8J5L62CIianOYc2pGK7bnSfPHVKIfXD5f2L1WtaTz8q1zatxBiIjQFc9ZTuyRKp9PlKp8gfvhxjcO310jjX8CUNmqQpi6FHS9GciwhJxC953o58_YOMskbnF-WVNCiaTxcL3LQ8uCvfpnWUnJqs57UOf5lyhZgP6kS7WAvH3yrk0qzA-dlHBBWDn2WEpKA_c.jpeg",
    "/images/map-entities/brand-rivian/BGqpkO6Agt-wJ57gkrmlZbLcha8Oa2iEBxFsSy9sgM7MVFiowUQLd7NLSiqDULIWfZwwGX5kBG42ADeCmTLrvh3qsiDCc4JPAsBmSGLoYwsd-pIfR4jC1cW8NXXPDLT_fdRjShqkq0GDa2WNLB7onU3u7mBLZewkh4WLZUBu8a5OkPSMMEsQuI11zqo538Hw.jpeg",
  ],
  yeti: [
    "/images/map-entities/brand-yeti/0r31kYEbtKDgVnuTk4MM9IY9I2m0UJcz16kdnOLizTIoiID-mH23GB6hOW9tR0cND6PQW8Ydzk0v7nYPPAgEDZiO6AKzBhgbMohIKyCKKBXB-KuS-wY6-gpPEcZY3sG2pd2m_uZk1S9N0XS8hLaWVFAvRLBpC2mtnb2CqjhktjP0z-n9nUfJtLj6yt67tsA2.jpeg",
    "/images/map-entities/brand-yeti/18jUQczpkw9VEXy7XTbIZuJ0dTzty0_oBHG31LrEeKkCzgOTo_7tvcZ9ym7g711P_BiLXIR3Tv9EVHE17CYD4lWpL3rDUzLu3hGcTPAHJYPV9nxqumot8ugOR_CdjTrvpAe9GPwYSME2cBx9jrk4aHZCavUrzWdo2ox0Zb_nzjV2MBL1b8iKNd_n2R6tCTno.jpeg",
    "/images/map-entities/brand-yeti/XFiQD7Z2-C5yC_7I6tHI6SfGWMZz5Rhr32GG06KHKQB6F1a6r1C_63MOSo2wwokPOov6nGnSrpF3-oHjCAWtQDxWbeIMfojkxWnPmFogPbgVJYrqqWycK9T3A6otVw8_3tlwEch73Cbqt0k7hEE8-2jTuHbNflrocRleIJ94YgplQTgldDN7KEo6mFNJxnBA.jpeg",
  ],
  "topo-chico": [
    "/images/map-entities/brand-topo-chico/b1g2sfUyEIlTZ9VEepoCGMqVCLXHb0D-kzHHHFUwYqO_q2dw0vkhg5cFGV7ogZYYcoKjYrSIf3UPg1CFBvs9oenhBSpjg-PcikVcaoO-kcZ3YyPdpTt5PSc6cs24NuetCoYLC1FmPT9Pj0o099AbIU7lTkr_h4fDMlotA0ZA-GaBzWODjOtsGnjWkhciQqIR.jpeg",
    "/images/map-entities/brand-topo-chico/pY2OKGdMlKsBrbk_PXgTqTr8MWqVyOENfCgwhPk8gIDqcRa77Rty1G1ckUw71k40VsjMCCxK5qYCthVrOTlYMcPoBhqlY_QZQhDG4duxU2_wIFIDHmisbVQMOn8nqWk3YLdDCan7L3xZF2qpVdaw-Optii2gViGtyC1_mZLEsJseVXMJC8k2sLhMvN_z0_pN.jpeg",
  ],
  "kendra-scott": [
    "/images/map-entities/brand-kendra-scott/kendra_scott_lifestyle_reference.png",
    "/images/map-entities/brand-kendra-scott/225a8873-e308-477c-9089-022cea139bbe.png",
  ],
  lululemon: [
    "/images/map-entities/brand-lululemon/YOga-Fashion-China-1.jpg",
    "/images/map-entities/brand-lululemon/l.jpg",
    "/images/map-entities/brand-lululemon/istockphoto-458869903-612x612.jpg",
  ],
  "heritage-boots": [
    "/images/map-entities/brand-heritage-boots/made-in-texas-opener-Nevena-christi-el-paso.jpg",
    "/images/map-entities/brand-heritage-boots/Boot-wars.jpg",
    "/images/map-entities/brand-heritage-boots/nyI2DFGiqYSfYQQAIbr1ZCQoAW4AEnOoUlUEmtQ8lLBG-RRxJa7PlZ-bzhaqeqDl0sCMJ6IZ1J2xsaoP_BHaeS8z74xNCxxTGPD6XYnvHzVkc0TBqiH-9zagzXtFtSjjS-YzMsymv14CX2KM2NHHXFhsdrXV1yPOtzXE6uZ2urJrzhyhnKYTSJlu8FAW6lZV.jpeg",
  ],
  tecovas: ["/images/map-entities/brand-tecovas/Chilis_Tecovas_Booth_Boots_2.jpg"],
  "fine-eyewear": [
    "/images/map-entities/brand-fine-eyewear/ochialli.webp",
    "/images/map-entities/brand-fine-eyewear/Lindberg+2023+(6).webp",
    "/images/map-entities/brand-fine-eyewear/Oversized-Eyewear-1920w.webp",
  ],
  "stay-put": [
    "/images/map-entities/rainey-bars/stay-put.jpg",
    "/images/map-entities/rainey-bars/stay-put-pool.jpeg",
    "/images/map-entities/rainey-bars/stay-put-jazz.jpeg",
  ],
  property: [
    "/images/map-entities/properties/INDEPENDANT INFINITY POOL.jpeg",
    "/images/map-entities/properties/BOWIE.jpeg",
    "/images/map-entities/properties/amli-downtown.jpeg",
  ],
  hotel: [
    "/images/map-entities/perks/partner_hotel_rooftop_1779052803267.png",
    "/images/map-entities/perks/waustin_pool_1779052756806.png",
    "/images/map-entities/perks/commercial_lobby_arrival_1779052774111.png",
  ],
  coffee: [
    "/images/map-entities/perks/partner_coffee_shop_1779052868356.png",
    "/images/map-entities/perks/commercial_street_level_1779052788888.png",
  ],
  event: [
    "/images/map-entities/perks/neon_night_market_1779052637850.png",
    "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
    "/images/map-entities/perks/downtown_art_walk_1779052670656.png",
  ],
  dining: [
    "/images/map-entities/perks/partner_dining_patio_1779052819620.png",
    "/images/map-entities/perks/partner_coffee_shop_1779052868356.png",
    "/images/map-entities/perks/neon_night_market_1779052637850.png",
  ],
  wellness: [
    "/images/map-entities/perks/rooftop_yoga_1779052654323.png",
    "/images/map-entities/perks/partner_wellness_1779052883675.png",
    "/images/map-entities/perks/civic_lake_trail_1779052853070.png",
  ],
  civic: [
    "/images/map-entities/perks/civic_republic_square_1779052838327.png",
    "/images/map-entities/perks/civic_lake_trail_1779052853070.png",
  ],
  commercial: [
    "/images/map-entities/perks/commercial_street_level_1779052788888.png",
    "/images/map-entities/perks/commercial_lobby_arrival_1779052774111.png",
  ],
};

const contentImageRules = [
  { key: "rivian", terms: ["rivian"] },
  { key: "yeti", terms: ["yeti"] },
  { key: "kendra-scott", terms: ["kendra scott"] },
  { key: "lululemon", terms: ["lululemon"] },
  { key: "topo-chico", terms: ["topo chico", "topochico"] },
  { key: "heritage-boots", terms: ["heritage boots"] },
  { key: "tecovas", terms: ["tecovas", "teacoves"] },
  { key: "fine-eyewear", terms: ["fine eyewear", "optique", "eyewear", "frame adjustment", "styling offer"] },
  { key: "stay-put", terms: ["stay put", "brewery", "house brew"] },
  { key: "hotel", terms: ["hotel", "hospitality", "guest", "four seasons", "van zandt", "rooftop access", "spa"] },
  { key: "coffee", terms: ["coffee", "cafe", "espresso", "morning", "jo's"] },
  { key: "property", terms: ["bowie", "amli", "the independent", "austonian", "residential", "condo", "apartment", "property", "building", "leasing", "real estate"] },
  { key: "wellness", terms: ["yoga", "fitness", "wellness", "run club", "trail", "workout"] },
  { key: "civic", terms: ["waterloo", "republic square", "greenway", "lady bird", "civic", "museum"] },
  { key: "event", terms: ["event", "activation", "live music", "music", "night market", "show", "rsvp"] },
  { key: "dining", terms: ["bar", "nightlife", "restaurant", "dining", "coffee", "happy hour", "pizza", "cocktail", "venue", "lobby hour"] },
  { key: "commercial", terms: ["retail", "business", "service", "office", "commercial", "restoration"] },
];

function slug(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function entityText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const legendsListing = raw.legendsListing && typeof raw.legendsListing === "object" ? raw.legendsListing as Record<string, unknown> : {};
  return [
    entity.id,
    entity.name,
    entity.brand,
    entity.category,
    entity.category_key,
    entity.type,
    entity.partnerType,
    entity.address,
    entity.source,
    entity.summary,
    entity.description,
    raw.id,
    raw.name,
    raw.address,
    raw.summary,
    raw.description,
    legendsListing.address,
    legendsListing.buildingName,
    legendsListing.neighborhood,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function pickFrom(images: string[], seed: unknown): string {
  if (images.length === 1) return images[0];
  const value = String(seed || "");
  const index = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % images.length;
  return images[index];
}

function matchingImageSet(entity: Record<string, unknown>): string[] | null {
  const text = entityText(entity);
  for (const rule of contentImageRules) {
    if (rule.terms.some((term) => text.includes(term))) return entityImageSets[rule.key] || null;
  }
  return null;
}

function directImage(entity: Record<string, unknown>): string | null {
  const direct =
    entity.image ||
    entity.imageUrl ||
    entity.primaryImage ||
    entity.panelImage ||
    entity.mobileCardImage ||
    entity.thumbnail ||
    entity.assetKey;
  return typeof direct === "string" && direct.trim() ? direct : null;
}

function looksResidential(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  return /\b(property|residential|condo|condominium|apartment|listing|tower|building|real estate|mls)\b/.test(text);
}

function looksHotel(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  return /\b(hotel|hospitality|guest|stay|lodging)\b/.test(text);
}

function buildingImageKey(entity: Record<string, unknown>): string | null {
  if (!looksResidential(entity)) return null;
  const text = entityText(entity);
  const match = buildingImageRules.find((rule) => rule.terms.some((term) => text.includes(term)));
  return match?.key || null;
}

export function resolveBuildingImage(entity: Record<string, unknown>): string | null {
  const key = buildingImageKey(entity);
  if (!key) return null;
  return curatedBuildingImageOverrides[key] || null;
}

function hotelImageKey(entity: Record<string, unknown>): string | null {
  if (!looksHotel(entity)) return null;
  const text = entityText(entity);
  const match = hotelImageRules.find((rule) => rule.terms.some((term) => text.includes(term)));
  return match?.key || null;
}

export function resolveHotelImage(entity: Record<string, unknown>): string | null {
  const key = hotelImageKey(entity);
  if (!key) return null;
  return curatedHotelImageOverrides[key] || null;
}

export function resolveEntityImage(entity: Record<string, unknown>): string {
  const direct = directImage(entity);
  if (direct && direct.includes("/images/map-pins/")) return direct;
  if (direct && direct.includes("/images/legends-listings/")) return direct;

  const buildingImage = resolveBuildingImage(entity);
  if (buildingImage) return buildingImage;
  const hotelImage = resolveHotelImage(entity);
  if (hotelImage) return hotelImage;

  if (direct && direct.includes("/images/map-entities/brand-fine-eyewear/ochialli.webp")) return direct;

  const keys = [
    slug(entity.id),
    slug(entity.name),
    slug(entity.brand),
    slug(entity.source),
  ].filter(Boolean);

  for (const key of keys) {
    if (perkImageRegistry[key]) return perkImageRegistry[key];
  }

  const matchedSet = matchingImageSet(entity);
  if (matchedSet?.length) return pickFrom(matchedSet, entity.id || entity.name);

  if (direct) return direct;

  const district = String(entity.district || "").toLowerCase();
  if (district && districtImageFallbacks[district]) return districtImageFallbacks[district];

  const category = slug(entity.category || entity.type || entity.partnerType);
  const categoryKey = Object.keys(categoryImageFallbacks).find((key) => category.includes(key) || key.includes(category));
  const fallback = categoryImageFallbacks[category] || (categoryKey ? categoryImageFallbacks[categoryKey] : undefined) || categoryImageFallbacks.default;

  if (import.meta.env.DEV && !fallback) {
    console.warn("[ImageResolver] Missing image", entity);
  }

  return fallback;
}

export function resolveEntityGallery(entity: Record<string, unknown>): string[] {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const rawGallery = Array.isArray(raw.gallery) ? raw.gallery : [];
  const explicitGallery = Array.isArray(entity.gallery) ? entity.gallery : [];
  const matchedSet = matchingImageSet(entity) || [];
  const primary = resolveEntityImage(entity);
  return [primary, ...explicitGallery, ...rawGallery, ...matchedSet]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .filter((item, index, list) => list.indexOf(item) === index);
}
