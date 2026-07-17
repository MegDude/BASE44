import { getListingProvider, listListingProviders, registerListingProvider } from "./providerRegistry.js";
import { LuxuryPresenceProvider } from "./providers/luxuryPresenceProvider.js";

function ensureDefaultProviders() {
  if (!getListingProvider("luxury-presence")) registerListingProvider(new LuxuryPresenceProvider());
}

export function createRealEstateService({ repository }) {
  ensureDefaultProviders();
  return {
    async listProperties({ providerId, limit = 100, live = false } = {}) {
      const provider = providerId ? getListingProvider(providerId) : null;
      if (live && provider) {
        const items = await provider.listListings({ limit });
        return { items, source: provider.id, live: true, stale: false };
      }
      const items = await repository.list({ limit });
      return { items, source: "canonical-store", live: false, stale: items.some((item) => item.provider?.stale) };
    },

    async getProperty(id, { providerId, live = false } = {}) {
      if (live && providerId) {
        const provider = getListingProvider(providerId);
        if (!provider) throw new Error(`Unknown listing provider: ${providerId}`);
        return provider.getListing(id);
      }
      return repository.get(id);
    },

    async syncProvider(providerId, options = {}) {
      const provider = getListingProvider(providerId);
      if (!provider) throw new Error(`Unknown listing provider: ${providerId}`);
      if (!provider.isConfigured()) return { provider: providerId, status: "configuration-required", synced: 0, persisted: 0 };
      const items = await provider.listListings(options);
      const persistence = await repository.upsertMany(items);
      return { provider: providerId, status: persistence.status, synced: items.length, persisted: persistence.persisted };
    },

    async health() {
      return Promise.all(listListingProviders().map((provider) => provider.health()));
    },
  };
}
