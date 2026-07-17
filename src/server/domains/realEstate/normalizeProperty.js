function value(...values) {
  return values.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");
}

function numberValue(...values) {
  const candidate = value(...values);
  if (candidate === undefined) return null;
  const parsed = Number(String(candidate).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(input) {
  return String(input || "property")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringList(input) {
  if (Array.isArray(input)) return input.map((item) => String(item).trim()).filter(Boolean);
  if (!input) return [];
  return String(input).split(/[,|]/).map((item) => item.trim()).filter(Boolean);
}

function mediaUrls(record) {
  const media = record.media || record.images || record.photos || record.gallery || [];
  const list = Array.isArray(media) ? media : media.items || media.images || [];
  return list
    .map((item) => typeof item === "string" ? item : value(item?.url, item?.src, item?.original_url, item?.image_url))
    .filter(Boolean);
}

function availability(record) {
  const status = String(value(record.availability, record.listing_status, record.listingStatus, record.status) || "unknown").toLowerCase();
  if (/under.?contract/.test(status)) return "under-contract";
  if (/coming.?soon/.test(status)) return "coming-soon";
  if (/pending/.test(status)) return "pending";
  if (/sold|closed/.test(status)) return "sold";
  if (/lease|rent/.test(status)) return "lease";
  if (/active|available|for.?sale/.test(status)) return "available";
  return "unknown";
}

export function normalizeCanonicalProperty(record = {}, context = {}) {
  const providerId = context.providerId || record.provider || record.provider_type || "unknown";
  const providerListingId = String(value(record.providerListingId, record.provider_listing_id, record.external_listing_id, record.id, record.mls_number, record.mlsNumber) || "");
  if (!providerListingId) throw new Error("Provider listing ID is required");

  const address = String(value(record.address, record.full_address, record.displayAddress, record.location?.address) || "");
  const title = String(value(record.title, record.name, record.property_name, address) || "Property");
  const gallery = mediaUrls(record);
  const hero = value(record.hero, record.hero_image, record.image_url, gallery[0]) || null;
  const updatedAt = value(record.updated_at, record.updatedAt, record.modified_at, record.modifiedAt) || null;
  const syncedAt = context.syncedAt || new Date().toISOString();
  const canonicalId = `property:${providerId}:${providerListingId}`;

  return {
    id: canonicalId,
    entityType: "property",
    slug: slugify(value(record.canonical_slug, record.slug, address, `${providerId}-${providerListingId}`)),
    title,
    status: availability(record) === "sold" ? "inactive" : "active",
    visibility: record.visibility || "public",
    workspaceId: value(record.workspace_id, record.workspaceId, context.workspaceId) || null,
    ownerId: value(record.owner_id, record.ownerId) || null,
    createdAt: value(record.created_at, record.createdAt) || null,
    updatedAt,
    summary: value(record.summary, record.short_description, record.description) || null,
    description: value(record.description, record.long_description) || null,
    tags: stringList(value(record.tags, record.features)),
    categories: stringList(value(record.categories, record.property_type, record.propertyType)),
    coordinates: Number.isFinite(numberValue(record.latitude, record.lat)) && Number.isFinite(numberValue(record.longitude, record.lng))
      ? { latitude: numberValue(record.latitude, record.lat), longitude: numberValue(record.longitude, record.lng) }
      : null,
    address: address || null,
    media: { hero, gallery },
    provider: {
      id: providerId,
      listingId: providerListingId,
      authoritative: true,
      canonicalUrl: value(record.canonical_url, record.canonicalUrl, record.url, record.listing_url) || null,
      lastSyncedAt: syncedAt,
      lastSuccessfulSyncAt: context.lastSuccessfulSyncAt || syncedAt,
      stale: Boolean(context.stale),
    },
    brokerageId: value(record.brokerage_id, record.brokerageId, context.brokerageId) || null,
    partnerId: value(record.partner_id, record.partnerId, context.partnerId) || null,
    agentId: value(record.agent_id, record.agentId, record.agent?.id) || null,
    mlsNumber: value(record.mls_number, record.mlsNumber, record.mls) || null,
    listing: {
      price: numberValue(record.price, record.list_price, record.listPrice),
      priceDisplay: value(record.price_display, record.priceDisplay, typeof record.price === "string" ? record.price : null) || null,
      beds: numberValue(record.beds, record.bedrooms),
      baths: numberValue(record.baths, record.bathrooms),
      area: numberValue(record.area, record.sqft, record.square_feet, record.squareFeet),
      hoa: numberValue(record.hoa, record.hoa_fee, record.hoaFee),
      tax: numberValue(record.tax, record.property_tax, record.propertyTax),
      parking: value(record.parking, record.parking_details) || null,
      yearBuilt: numberValue(record.year_built, record.yearBuilt),
      propertyType: value(record.property_type, record.propertyType) || null,
      ownership: value(record.ownership, record.ownership_type) || null,
      availability: availability(record),
      daysOnMarket: numberValue(record.days_on_market, record.daysOnMarket),
      openHouse: Array.isArray(record.open_houses || record.openHouses) ? (record.open_houses || record.openHouses).map((item) => ({
        startsAt: value(item.starts_at, item.startsAt, item.start) || "",
        endsAt: value(item.ends_at, item.endsAt, item.end) || null,
      })).filter((item) => item.startsAt) : [],
    },
    building: {
      name: value(record.building_name, record.buildingName, record.building?.name) || null,
      developer: value(record.developer, record.building?.developer) || null,
      architect: value(record.architect, record.building?.architect) || null,
      amenities: stringList(value(record.amenities, record.building?.amenities)),
      petPolicy: value(record.pet_policy, record.petPolicy, record.building?.pet_policy) || null,
    },
    integrations: {
      analyticsId: value(record.analytics_id, record.analyticsId) || canonicalId,
      seoId: value(record.seo_id, record.seoId) || canonicalId,
      qrId: value(record.qr_id, record.qrId) || canonicalId,
    },
    metadata: {
      sourceUpdatedAt: updatedAt,
      rawProviderType: record.provider_type || null,
    },
  };
}
