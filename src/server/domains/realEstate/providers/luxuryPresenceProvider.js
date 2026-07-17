import { fetchLuxuryPresenceListing, fetchLuxuryPresenceListings } from "../../../integrations/luxuryPresence/client.js";
import { normalizeCanonicalProperty } from "../normalizeProperty.js";
import { ListingProvider } from "../providerRegistry.js";

export class LuxuryPresenceProvider extends ListingProvider {
  constructor(context = {}) {
    super({ id: "luxury-presence", authoritative: true });
    this.context = context;
  }

  isConfigured() {
    return Boolean(process.env.LUXURY_PRESENCE_API_KEY);
  }

  async listListings(options = {}) {
    const payload = await fetchLuxuryPresenceListings(options);
    const records = Array.isArray(payload) ? payload : payload?.listings || payload?.properties || payload?.results || [];
    const syncedAt = new Date().toISOString();
    return records.map((record) => normalizeCanonicalProperty(record, { ...this.context, providerId: this.id, syncedAt }));
  }

  async getListing(listingId) {
    const record = await fetchLuxuryPresenceListing(listingId);
    return normalizeCanonicalProperty(record?.listing || record?.property || record, {
      ...this.context,
      providerId: this.id,
      syncedAt: new Date().toISOString(),
    });
  }
}
