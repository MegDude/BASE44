import assert from "node:assert/strict";
import { normalizeCanonicalProperty } from "../src/server/domains/realEstate/normalizeProperty.js";
import { clearListingProvidersForTests, ListingProvider, registerListingProvider } from "../src/server/domains/realEstate/providerRegistry.js";
import { createRealEstateService } from "../src/server/domains/realEstate/propertyService.js";
import syncHandler from "../api/real-estate/sync.js";

const property = normalizeCanonicalProperty({
  id: "lp-123",
  address: "301 West Ave #4504",
  title: "The Independent Residence 4504",
  mls_number: "1317826",
  status: "active",
  price: "$970,000",
  beds: 1,
  baths: 1,
  sqft: 999,
  latitude: 30.267451,
  longitude: -97.750793,
  images: [{ url: "https://example.test/hero.jpg" }],
}, { providerId: "luxury-presence", workspaceId: "legends" });

assert.equal(property.id, "property:luxury-presence:lp-123");
assert.equal(property.provider.listingId, "lp-123");
assert.equal(property.mlsNumber, "1317826");
assert.equal(property.listing.price, 970000);
assert.equal(property.listing.availability, "available");
assert.equal(property.coordinates.latitude, 30.267451);
assert.equal(property.media.hero, "https://example.test/hero.jpg");

class FakeProvider extends ListingProvider {
  isConfigured() { return true; }
  async listListings() { return [property]; }
  async getListing() { return property; }
}

clearListingProvidersForTests();
registerListingProvider(new FakeProvider({ id: "test-provider" }));
const stored = [];
const service = createRealEstateService({
  repository: {
    list: async () => stored,
    get: async (id) => stored.find((item) => item.id === id) || null,
    upsertMany: async (items) => { stored.splice(0, stored.length, ...items); return { persisted: items.length, status: "persisted" }; },
  },
});

const sync = await service.syncProvider("test-provider");
assert.deepEqual(sync, { provider: "test-provider", status: "persisted", synced: 1, persisted: 1 });
assert.equal((await service.getProperty(property.id)).mlsNumber, "1317826");

let unauthorizedResponse = null;
await syncHandler(
  { method: "POST", headers: {}, body: { provider: "luxury-presence" } },
  {
    status(code) {
      return { json(payload) { unauthorizedResponse = { code, payload }; } };
    },
  },
);
assert.equal(unauthorizedResponse.code, 401);
assert.equal(unauthorizedResponse.payload.error, "Unauthorized");

console.log("real estate platform: provider abstraction and canonical property contract pass");
