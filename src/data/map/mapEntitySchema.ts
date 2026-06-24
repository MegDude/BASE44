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

export type MapVisibilityMode =
  | "default"
  | "utility"
  | "parking"
  | "perks"
  | "partners"
  | "admin";

export type MapEntityTier =
  | "anchor"
  | "featured"
  | "core"
  | "extended"
  | "hidden";

export type MapUtilityType =
  | "parking"
  | "printing"
  | "cleaning"
  | "pharmacy"
  | "charging"
  | "bike_share"
  | "visitor_info"
  | "shipping"
  | "coworking"
  | "repair"
  | "wellness";

export type MapOfferType =
  | "happy_hour"
  | "resident_perk"
  | "event_offer"
  | "validation"
  | "service_discount";

export type MapPerkStatus = "active" | "candidate" | "inactive";

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
  visibilityMode?: MapVisibilityMode;
  utilityType?: MapUtilityType;
  perkEligible?: boolean;
  perkStatus?: MapPerkStatus;
  offerType?: MapOfferType;
  offerWindow?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  experienceScore?: number;
  entityTier?: MapEntityTier;
  restaurantType?: Array<"breakfast" | "lunch" | "dinner" | "cocktails" | "coffee" | "late-night" | "wellness" | "brunch">;
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
