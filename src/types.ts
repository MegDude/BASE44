export type SearchResultKind =
  | "property"
  | "partner"
  | "venue"
  | "event"
  | "perk"
  | "hotel"
  | "brand"
  | "civic"
  | "listing";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  address?: string;
  neighborhood?: string;
  timeLabel?: string;
  category?: string;
  badge?: string;
  lat?: number;
  lng?: number;
  route?: string;
};
