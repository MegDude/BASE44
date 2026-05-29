import { categoryImageFallbacks, districtImageFallbacks, perkImageRegistry } from "./perkImageRegistry";

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
  property: [
    "/images/map-entities/properties/INDEPENDANT INFINITY POOL.jpeg",
    "/images/map-entities/properties/BOWIE.jpeg",
    "/images/map-entities/properties/amli-downtown.jpeg",
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
  const direct = entity.image || entity.imageUrl || entity.assetKey;
  return typeof direct === "string" && direct.trim() ? direct : null;
}

export function resolveEntityImage(entity: Record<string, unknown>): string {
  const direct = directImage(entity);
  const text = entityText(entity);
  if (direct && (text.includes("legends") || direct.includes("/images/legends-listings/"))) return direct;

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
