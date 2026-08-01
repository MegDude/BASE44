import type { EntityType } from "@/types/mapEntity";

function collectEntityText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return [
    entity.entityType,
    entity.type,
    entity.kind,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.markerType,
    entity.detailDrawerType,
    entity.partnerType,
    entity.sourceType,
    entity.source,
    entity.name,
    entity.title,
    raw.entityType,
    raw.type,
    raw.kind,
    raw.category,
    raw.category_key,
    raw.subcategory,
    raw.markerType,
    raw.detailDrawerType,
    raw.partnerType,
    raw.sourceType,
    raw.source,
    raw.name,
    raw.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function collectDeclaredEntityTypeText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return [
    entity.entityType,
    entity.type,
    entity.kind,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.markerType,
    entity.detailDrawerType,
    raw.entityType,
    raw.type,
    raw.kind,
    raw.category,
    raw.category_key,
    raw.subcategory,
    raw.markerType,
    raw.detailDrawerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function resolveEntityType(entity: Record<string, unknown>): EntityType {
  const text = collectEntityText(entity);
  const declaredTypeText = collectDeclaredEntityTypeText(entity);
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const name = String(entity.name || entity.title || raw.name || raw.title || "").toLowerCase();

  if (entity.entityType === "real_estate" || raw.entityType === "real_estate" || entity.detailKind === "real_estate" || raw.detailKind === "real_estate") return "real_estate";
  if (entity.isLegendsListing || raw.isLegendsListing || raw.legendsListing || text.includes("legends listing")) return "real_estate";
  if (raw.rentalListing || text.includes("rental") || text.includes("leasing") || text.includes("for rent")) return "rental";
  if (text.includes("hotel")) return "hotel";
  if (text.includes("campaign")) return "campaign";
  if (text.includes("event")) return "event";

  // A perk or partner program is secondary membership. Preserve the declared
  // place type so inKind restaurants continue to use restaurant drawers,
  // restaurant filtering, and restaurant map presentation.
  if (/\b(coffee|cafe|café)\b/.test(declaredTypeText)) return "coffee";
  if (/\b(restaurant|dining|restaurant[_\s/-]*food|food hall)\b/.test(declaredTypeText)) return "restaurant";
  if (/\b(venue|bar|nightlife|music venue)\b/.test(declaredTypeText) && !/\b(perk|offer)\b/.test(declaredTypeText)) return "venue";

  if (text.includes("perk") || text.includes("offer") || text.includes("inkind")) return "perk";
  if (text.includes("brand")) return "brand";
  if (text.includes("civic") || text.includes("public")) return "civic";
  if (name.includes("antone") || name.includes("st. augustine") || name.includes("st augustine") || name.includes("saint augustine")) return "venue";
  if (text.includes("farmers market") || text.includes("farmer's market") || text.includes("farmers' market")) return "event";
  if (text.includes("coffee") || text.includes("cafe")) return "coffee";
  if (text.includes("restaurant") || text.includes("dining")) return "restaurant";
  if (text.includes("beer garden") || text.includes("sausage house")) return "restaurant";
  if (text.includes("retail") || text.includes("store") || text.includes("shop")) return "retail";
  if (text.includes("wellness") || text.includes("fitness") || text.includes("spa") || text.includes("bathhouse")) return "wellness";
  if (text.includes("service")) return "service";
  if (text.includes("commercial") || text.includes("office")) return "commercial";

  if (
    name.includes("antone") ||
    name.includes("banger") ||
    text.includes("venue") ||
    text.includes("nightlife") ||
    text.includes("music") ||
    text.includes("bar")
  ) {
    return "venue";
  }

  if (
    name.includes("sixth and guadalupe") ||
    name.includes("6th and guadalupe") ||
    text.includes("property") ||
    text.includes("residential") ||
    text.includes("condo") ||
    text.includes("condominium") ||
    text.includes("apartment") ||
    text.includes("building") ||
    raw.luxuryPresenceBuilding ||
    raw.luxuryPresenceListing
  ) {
    return "property";
  }

  if (name.includes("pleblab")) return "commercial";

  return "property";
}

export function resolveDrawer(entityType: EntityType): string {
  const drawerByType: Record<EntityType, string> = {
    property: "PropertyDrawer",
    listing: "LegendsListingDrawer",
    real_estate: "LegendsListingDrawer",
    rental: "RentalListingDrawer",
    hotel: "HotelDrawer",
    venue: "VenueDrawer",
    restaurant: "DiningDrawer",
    coffee: "CoffeeDrawer",
    retail: "RetailDrawer",
    wellness: "WellnessDrawer",
    perk: "PerkDrawer",
    campaign: "EventDrawer",
    event: "EventDrawer",
    brand: "BrandDrawer",
    civic: "CivicDrawer",
    service: "ServiceDrawer",
    commercial: "CommercialDrawer",
  };
  return drawerByType[entityType];
}
