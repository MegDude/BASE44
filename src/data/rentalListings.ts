export type RentalListing = {
  id: string;
  kind: "rental";
  status: "active";
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  building: string;
  unit: string;
  mls: string;
  neighborhood: string;
  lat: number;
  lng: number;
  description: string;
  highlights: string[];
  amenities: string[];
  nearbyPerks: string[];
};

export const rentalListings: RentalListing[] = [
  {
    id: "rental-48-east-2509",
    kind: "rental",
    status: "active",
    price: 3800,
    priceLabel: "$3.8K",
    beds: 2,
    baths: 2,
    sqft: 982,
    address: "48 East Ave #2509, Austin, TX 78701",
    building: "48 East Avenue / Natiivo Austin",
    unit: "2509",
    mls: "9378249",
    neighborhood: "Rainey / East Downtown",
    lat: 30.2574,
    lng: -97.7384,
    description: "Downtown condo rental positioned near Rainey Street, Lady Bird Lake, and the East Downtown dining circuit.",
    highlights: ["Rainey-adjacent convenience", "Lady Bird Lake edge", "Resident-friendly dining circuit"],
    amenities: ["Concierge", "Rooftop lounge", "Package service", "Maintenance on-site"],
    nearbyPerks: ["Rainey Street nightlife", "Lady Bird Lake edge", "Resident-friendly dining circuit"],
  },
  {
    id: "rental-four-seasons-1502",
    kind: "rental",
    status: "active",
    price: 16500,
    priceLabel: "$16.5K",
    beds: 3,
    baths: 4,
    sqft: 2692,
    address: "98 San Jacinto Blvd #1502, Austin, TX 78701",
    building: "Four Seasons Residences",
    unit: "1502",
    mls: "5638588",
    neighborhood: "Waterfront / Downtown",
    lat: 30.2613,
    lng: -97.7429,
    description: "Luxury waterfront residence connected to Downtown Austin's hotel, dining, lake, and convention core.",
    highlights: ["Waterfront position", "Hotel-connected lifestyle", "Convention and core connectivity"],
    amenities: ["Concierge", "Rooftop lounge", "Resident services", "On-site property management"],
    nearbyPerks: ["Lady Bird Lake trail access", "Ciclo restaurant", "Convention + core connectivity"],
  },
  {
    id: "rental-vesper-1710",
    kind: "rental",
    status: "active",
    price: 3625,
    priceLabel: "$3.6K",
    beds: 1,
    baths: 2,
    sqft: 1058,
    address: "84 East Ave #1710, Austin, TX 78701",
    building: "Vesper Residences",
    unit: "1710",
    mls: "3197441",
    neighborhood: "Rainey / East Downtown",
    lat: 30.2579,
    lng: -97.7377,
    description: "Design-forward Rainey-adjacent condo tower with strong resident lifestyle and social-discovery fit.",
    highlights: ["Design-forward condo tower", "41-story residential building", "Rainey-adjacent convenience"],
    amenities: ["Rooftop pool", "Wellness floor", "Resident lounges", "Pet retreat area", "24/7 staff", "Designer finish palettes"],
    nearbyPerks: ["Rainey Street food + bars", "Convention Center access", "Downtown social density"],
  },
  {
    id: "rental-celias-court-45",
    kind: "rental",
    status: "active",
    price: 2800,
    priceLabel: "$2.8K",
    beds: 1,
    baths: 1,
    sqft: 862,
    address: "908 Nueces St #45, Austin, TX 78701",
    building: "Celia's Court",
    unit: "45",
    mls: "8435712",
    neighborhood: "West Downtown / Market District edge",
    lat: 30.2722,
    lng: -97.7487,
    description: "West Downtown rental near daily errands, dining, books, Capitol access, and Market District convenience.",
    highlights: ["Market District edge", "Walkable daily errands", "Capitol and downtown access"],
    amenities: ["Property manager on-site", "Maintenance on-site", "Package service"],
    nearbyPerks: ["Whole Foods run", "24 Diner + Fixe corridor", "BookPeople + Capitol access"],
  },
];
