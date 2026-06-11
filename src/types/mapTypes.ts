import type { HappyHourVenue } from "@/data/happyHourInventory";
import type { WaterlooParkPin } from "@/data/waterlooParkInventory";

export type DowntownPerksMapInventorySource =
  | { type: "production"; records: unknown[] }
  | { type: "happy-hour"; records: HappyHourVenue[] }
  | { type: "waterloo"; records: WaterlooParkPin[] }
  | { type: "waterloo-campaign"; records: unknown[] };

export type MapInventoryPinKind = "venue" | "destination" | "experience" | "event" | "partner-placement";

export type DowntownPerksInventoryType =
  | "Residential Building"
  | "Residential Listing"
  | "Venue"
  | "Hotel"
  | "Event"
  | "Brand"
  | "Civic"
  | "Service"
  | "Retail"
  | "Perk"
  | "Campaign";

export type DowntownPerksInventoryCategory =
  | "Coffee"
  | "Dining"
  | "Drinks"
  | "Hotel"
  | "Retail"
  | "Grocery"
  | "Wellness"
  | "Fitness"
  | "Services"
  | "Residential"
  | "Property"
  | "Events"
  | "Brands"
  | "Civic"
  | "Music"
  | "Entertainment"
  | "Perks"
  | "Campaigns";

export type DowntownPerksInventoryAction = {
  label: string;
  href?: string;
  kind?: "save" | "directions" | "website" | "reserve" | "rsvp" | "tour" | "listings" | "campaign";
};

export type DowntownPerksInventoryRecord = {
  id: string;
  type: DowntownPerksInventoryType;
  category: DowntownPerksInventoryCategory;
  district: string;
  name: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  primaryImage?: string;
  galleryImages?: string[];
  description: string;
  actions: DowntownPerksInventoryAction[];
  status: "active" | "draft" | "needs-review" | "archived";
  source: string;
  updatedAt: string;
};
