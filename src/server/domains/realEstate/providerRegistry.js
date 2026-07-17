export class ListingProvider {
  constructor({ id, authoritative = true } = {}) {
    if (!id) throw new Error("Provider ID is required");
    this.id = id;
    this.authoritative = authoritative;
  }

  isConfigured() {
    return false;
  }

  async listListings() {
    throw new Error(`${this.id} does not implement listListings`);
  }

  async getListing() {
    throw new Error(`${this.id} does not implement getListing`);
  }

  async health() {
    return { provider: this.id, configured: this.isConfigured(), status: this.isConfigured() ? "ready" : "configuration-required" };
  }
}

const providers = new Map();

export function registerListingProvider(provider) {
  if (!provider?.id || typeof provider.listListings !== "function") throw new Error("A valid listing provider is required");
  providers.set(provider.id, provider);
  return provider;
}

export function getListingProvider(id) {
  return providers.get(id) || null;
}

export function listListingProviders() {
  return Array.from(providers.values());
}

export function clearListingProvidersForTests() {
  providers.clear();
}
