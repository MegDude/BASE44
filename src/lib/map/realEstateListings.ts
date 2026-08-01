export type RealEstateListingEntity = {
  id: string;
  entityType: "real_estate";
  detailKind: "real_estate";
  iconKey: "property";
  organizationId: string;
  portfolioId?: string;
  listingId: string;
  externalId?: string;
  displayAddress: string;
  streetAddress?: string;
  unit?: string;
  district?: string;
  propertyType?: string;
  listingStatus?: "active" | "pending" | "under_contract" | "off_market" | "unknown";
  price?: number;
  priceLabel?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  brokerName: string;
  partnerLabel: string;
  summary?: string;
  features?: string[];
  sourceUrl?: string;
  lastVerifiedAt?: string;
};

const LEGENDS_ORGANIZATION_ID = "legends-real-estate";
const LEGENDS_PORTFOLIO_ID = "legends-downtown-austin";
const LEGENDS_BROKER_NAME = "Legends Real Estate";
const LEGENDS_PARTNER_LABEL = "Founding Real Estate Partner";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function numberValue(value: unknown): number | undefined {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function coordinateValue(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function unitFromAddress(address: string): string | undefined {
  return address.match(/(?:#|unit\s+|unit:\s*)([A-Za-z0-9-]+)/i)?.[1];
}

function streetFromAddress(address: string): string {
  return address
    .replace(/,\s*Austin\s*TX,?\s*\d{5}.*/i, "")
    .replace(/\s+#\s*/i, ", Unit ")
    .replace(/\bST\b/g, "St")
    .trim();
}

export function isRealEstateListingEntity(entity: Record<string, any> | null | undefined): boolean {
  if (!entity) return false;
  const raw = entity.raw || {};
  const listing = entity.legendsListing || raw.legendsListing || entity.luxuryPresenceListing || raw.luxuryPresenceListing;
  const haystack = [
    entity.id,
    entity.name,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.detailKind,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.brand,
    entity.source,
    raw.id,
    raw.name,
    raw.entityType,
    raw.detailKind,
    raw.category,
    raw.category_key,
    raw.brand,
    raw.source,
    listing?.address,
    listing?.mlsNumber,
    listing?.mls_number,
  ].filter(Boolean).join(" ").toLowerCase();
  return Boolean(listing) || (/\blegends real estate\b/.test(haystack) && /\b(listing|for sale|for rent|mls|unit|#|residence|residential)\b/.test(haystack));
}

export function toRealEstateListingEntity(entity: Record<string, any> | null | undefined): RealEstateListingEntity | null {
  if (!entity || !isRealEstateListingEntity(entity)) return null;
  const raw = entity.raw || {};
  const listing = entity.legendsListing || raw.legendsListing || entity.luxuryPresenceListing || raw.luxuryPresenceListing || {};
  const id = text(entity.id || listing.id || listing.listingId || listing.listing_id);
  if (!id) return null;
  const address = text(listing.address || entity.address || entity.name || entity.title);
  const displayAddress = id === "legends-real-estate-210-lavaca-st-1910"
    ? "210 Lavaca St, Unit 1910"
    : streetFromAddress(address);
  const unit = text(listing.unit || entity.unit || unitFromAddress(address));
  const district = text(entity.district || entity.neighborhood || listing.neighborhood || "2nd Street District");
  const priceLabel = text(listing.priceDisplay || listing.priceLabel || listing.price);
  const bedrooms = numberValue(listing.beds || entity.beds);
  const bathrooms = numberValue(listing.baths || entity.baths);
  const squareFeet = numberValue(listing.sqft || entity.sqft);
  const features = [
    text(entity.propertyType || listing.propertyType || "Downtown residence"),
    text(listing.status || listing.listingTypeLabel),
  ].filter(Boolean);

  return {
    id,
    entityType: "real_estate",
    detailKind: "real_estate",
    iconKey: "property",
    organizationId: text(entity.organizationId || raw.organizationId || LEGENDS_ORGANIZATION_ID),
    portfolioId: text(entity.portfolioId || raw.portfolioId || LEGENDS_PORTFOLIO_ID),
    // TODO: replace this internal map ID with the confirmed partner_listings ID after official Legends records are approved.
    listingId: text(listing.listingId || listing.listing_id || entity.listingId || raw.listingId || id),
    externalId: text(listing.mlsNumber || listing.mls_number || entity.mls || raw.mls),
    displayAddress,
    streetAddress: streetFromAddress(address),
    unit,
    district,
    propertyType: text(entity.propertyType || listing.propertyType || "Downtown residence"),
    listingStatus: text(listing.status || entity.listingStatus) ? "unknown" : "unknown",
    priceLabel: priceLabel && !/^contact for pricing$/i.test(priceLabel) ? priceLabel : "Pricing available from the listing agent",
    bedrooms,
    bathrooms,
    squareFeet,
    latitude: coordinateValue(entity.latitude || entity.lat || raw.latitude || raw.lat),
    longitude: coordinateValue(entity.longitude || entity.lng || raw.longitude || raw.lng),
    imageUrl: text(entity.panelImage || entity.primaryImage || entity.heroImage || entity.image || listing.image),
    brokerName: LEGENDS_BROKER_NAME,
    partnerLabel: LEGENDS_PARTNER_LABEL,
    summary: "Explore this downtown residence with local context from Legends Real Estate. Review the property, understand what is nearby and request current availability or a private tour directly from the map.",
    features,
    sourceUrl: text(listing.sourceUrl || listing.listing_url || entity.sourceUrl),
    lastVerifiedAt: text(listing.lastVerifiedAt || listing.updated_at || entity.updatedAt),
  };
}

export function realEstateTrackingMetadata(listing: RealEstateListingEntity, sourceSurface = "resident_map_listing") {
  return {
    listingId: listing.listingId,
    organizationId: listing.organizationId,
    portfolioId: listing.portfolioId || undefined,
    district: listing.district || undefined,
    sourceSurface,
  };
}
