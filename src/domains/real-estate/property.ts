import type { CanonicalEntity } from "@/domains/entities/entity";

export const REAL_ESTATE_PROVIDER_IDS = ["luxury-presence", "mls", "manual"] as const;
export type RealEstateProviderId = (typeof REAL_ESTATE_PROVIDER_IDS)[number] | (string & {});

export type PropertyAvailability = "available" | "pending" | "under-contract" | "sold" | "lease" | "coming-soon" | "unknown";

export type CanonicalProperty = CanonicalEntity & {
  entityType: "property";
  provider: {
    id: RealEstateProviderId;
    listingId: string;
    authoritative: true;
    canonicalUrl: string | null;
    lastSyncedAt: string | null;
    lastSuccessfulSyncAt: string | null;
    stale: boolean;
  };
  brokerageId: string | null;
  partnerId: string | null;
  agentId: string | null;
  mlsNumber: string | null;
  listing: {
    price: number | null;
    priceDisplay: string | null;
    beds: number | null;
    baths: number | null;
    area: number | null;
    hoa: number | null;
    tax: number | null;
    parking: string | null;
    yearBuilt: number | null;
    propertyType: string | null;
    ownership: string | null;
    availability: PropertyAvailability;
    daysOnMarket: number | null;
    openHouse: Array<{ startsAt: string; endsAt: string | null }>;
  };
  building: {
    name: string | null;
    developer: string | null;
    architect: string | null;
    amenities: string[];
    petPolicy: string | null;
  };
  integrations: {
    analyticsId: string | null;
    seoId: string | null;
    qrId: string | null;
  };
};
