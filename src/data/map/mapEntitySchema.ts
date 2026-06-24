export type MapEntityKind =
  | "restaurant"
  | "cafe"
  | "bar"
  | "hotel"
  | "property"
  | "retail"
  | "wellness"
  | "civic"
  | "mobility"
  | "experience"
  | "service"
  | "venue";

export type DowntownDistrict =
  | "Rainey"
  | "Seaholm"
  | "West 6th"
  | "Congress"
  | "Downtown Core"
  | "Red River"
  | "Waterloo"
  | "2nd Street"
  | "Warehouse"
  | "East Austin"
  | "Outside Austin / Review"
  | "Unknown";

export interface MapEntity {
  id: string;
  title: string;
  kind: MapEntityKind;
  category: string;
  address?: string;
  lat?: number;
  lng?: number;
  neighborhood: DowntownDistrict;
  rating?: number;
  reviewCount?: number;
  priceLabel?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  googleCid?: string;
  source:
    | "google_takeout_saved_places"
    | "google_maps_list_browser_extract"
    | "google_maps_shared_list"
    | "google_places"
    | "manual"
    | "partner";
  datasetStatus?:
    | "partial_seed"
    | "browser_seed"
    | "enriched"
    | "canonical"
    | "manual_review";
  expectedFullListCount?: number;
  actualSeedCount?: number;
  tags: string[];
  active: boolean;
  importedAt: string;
  updatedAt: string;
}

export interface MapEntityQaIssue {
  entityId: string;
  title: string;
  issues: string[];
}

export interface MapEntityQaReport {
  generatedAt: string;
  expectedFullListCount: number;
  actualEntityCount: number;
  activeEntityCount: number;
  issueCount: number;
  issues: MapEntityQaIssue[];
}
