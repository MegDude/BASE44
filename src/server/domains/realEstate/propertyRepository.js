import { normalizeCanonicalProperty } from "./normalizeProperty.js";

function toPropertyRow(property) {
  return {
    id: property.id,
    slug: property.slug,
    name: property.title,
    description: property.description || property.summary || null,
    address: property.address,
    district: property.metadata?.district || null,
    lat: property.coordinates?.latitude || null,
    lng: property.coordinates?.longitude || null,
    image_url: property.media?.hero || null,
    partner_status: property.partnerId ? "partner" : "prospect",
    status: property.status,
    metadata: property,
  };
}

export function createPropertyRepository(supabase) {
  return {
    async list({ limit = 100 } = {}) {
      if (!supabase) return [];
      const result = await supabase.from("properties").select("*").order("name").limit(limit);
      if (result.error) throw result.error;
      return (result.data || []).map((row) => row.metadata?.provider?.listingId
        ? row.metadata
        : normalizeCanonicalProperty({ ...row, providerListingId: row.id, provider_type: row.metadata?.provider || "stored" }, { providerId: row.metadata?.provider || "stored", stale: true }));
    },

    async get(id) {
      if (!supabase) return null;
      const result = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return null;
      return result.data.metadata?.provider?.listingId
        ? result.data.metadata
        : normalizeCanonicalProperty({ ...result.data, providerListingId: result.data.id, provider_type: result.data.metadata?.provider || "stored" }, { providerId: result.data.metadata?.provider || "stored", stale: true });
    },

    async upsertMany(properties) {
      if (!supabase || !properties.length) return { persisted: 0, status: "storage-unavailable" };
      const result = await supabase.from("properties").upsert(properties.map(toPropertyRow), { onConflict: "id" });
      if (result.error) throw result.error;
      return { persisted: properties.length, status: "persisted" };
    },
  };
}
