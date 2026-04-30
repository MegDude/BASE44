export type SharedMapEntityType =
  | "venue"
  | "event"
  | "perk"
  | "building"
  | "property"
  | "hotel"
  | "brand"
  | "civic"
  | "campaign"
  | "insight";

export type MapMode = "resident" | "partner";

export interface SharedMapItemContract {
  id: string;
  entity_id: string;
  entity_type: SharedMapEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  district?: string;
  category?: string;
  latitude: number;
  longitude: number;
  status?: string;
  image?: string;
  icon?: string;
  source_ref?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface SharedMapFeedRequest {
  query?: string;
  search?: string;
  district?: string;
  filters?: {
    districts?: string[];
    categories?: string[];
    types?: string[];
    statuses?: string[];
  };
  limit?: number;
}

export interface SharedMapFeedResponse {
  items: SharedMapItemContract[];
  source: "base44" | "fallback";
  query?: string;
  generated_at: string;
}

export interface PartnerInsightContract {
  id: string;
  title: string;
  insightType: "engagement" | "campaign" | "opportunity" | "coverage" | "performance";
  latitude: number;
  longitude: number;
  value?: number;
  label?: string;
  summary?: string;
  partnerType?: "property" | "venue" | "brand" | "hospitality" | "civic" | "dashboard";
  linkedEntityIds?: string[];
  metadata?: Record<string, any>;
}
