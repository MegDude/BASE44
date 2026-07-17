export type PartnerTier = 1 | 2 | 3 | null;
export type DowntownPerksSourceProvider =
  | "google-maps-saved-list"
  | "google-places"
  | "manual-import"
  | "partner-import"
  | "cms"
  | "eventbrite"
  | "calendar"
  | "api"
  | "future";

export interface DowntownPerksEntitySource {
  provider: DowntownPerksSourceProvider;
  sourceName: string;
  sourceUrl?: string;
  importedAt: string;
  importedBy: string;
  sourceRecordId?: string;
  confidence?: number;
}

export interface DowntownPerksSourceHistoryEntry extends DowntownPerksEntitySource {
  action: "created" | "updated" | "verified" | "merged" | "archived";
  note?: string;
}

export interface DowntownPerksImportedPlace {
  id: string;
  canonicalName: string;
  googlePlaceId?: string;
  entityType: string;
  canonicalCategory: string;
  district?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operationalStatus: "active" | "temporarily-closed" | "permanently-closed" | "unknown";
  publicVisibility: boolean;
  curatedVisibility: boolean;
  launchPriority: boolean;
  partnerTarget: boolean;
  partnerTier: PartnerTier;
  partnerScore?: number;
  relationshipOwner?: string;
  warmIntroductionSource?: string;
  routeMemberships: string[];
  collectionMemberships: string[];
  audienceRelevance: string[];
  primaryUseCase?: string;
  website?: string;
  lastVerifiedAt?: string;
  duplicateGroup?: string;
  sources: DowntownPerksEntitySource[];
  sourceHistory: DowntownPerksSourceHistoryEntry[];
  source: DowntownPerksEntitySource;
}
