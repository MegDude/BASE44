export type LegendsProperty = {
  id: string;
  buildingName: string;
  address: string;
  neighborhood: string;
  propertyType: string;
  style: string;
  walkability: string;
  residentExperience: string;
  summary: string;
  whyItMatters: string;
  coffee: string[];
  dining: string[];
  drinks: string[];
  wellness: string[];
  groceries: string[];
  nearbyLocations: string[];
  listings: string[];
  goodToKnow: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  imageAsset: string;
  pinAsset: string;
  entityAliases: string[];
};

const property = (
  id: string,
  buildingName: string,
  address: string,
  neighborhood: string,
  listings: string[] = [],
  imageAsset = "/images/property-listings-premium/the-austonian.jpeg",
): LegendsProperty => ({
  id,
  buildingName,
  address,
  neighborhood,
  propertyType: "Residential Tower",
  style: "Downtown residential building",
  walkability: `Strong access to ${neighborhood}, downtown dining, coffee, errands, and daily routines.`,
  residentExperience: "Walkable downtown living with useful places close enough to become part of the week.",
  summary: `${buildingName} gives residents a practical downtown home base with nearby dining, coffee, services, events, and lake or district access.`,
  whyItMatters: "The neighborhood becomes part of the amenity when everyday plans are close, useful, and easy to act on.",
  coffee: ["Jo's Coffee", "Merit Coffee", "Codependent"],
  dining: ["True Food Kitchen", "Qi Austin", "La Condesa"],
  drinks: ["Garage", "The Roosevelt Room", "Codependent"],
  wellness: ["CorePower Yoga", "Life Time", "Love Cycling"],
  groceries: ["Whole Foods Market", "Trader Joe's"],
  nearbyLocations: ["Lady Bird Lake", "Austin Central Library", "Seaholm District", "Downtown Core"],
  listings,
  goodToKnow: ["Walkable errands", "Nearby dining", "Resident perks", "Downtown access"],
  ctaPrimary: "View Nearby Perks",
  ctaSecondary: "Explore Neighborhood",
  imageAsset,
  pinAsset: "/pins/downtown-perks/legends-logo-gold.svg",
  entityAliases: [buildingName, address, id],
});

export const legendsPropertyContent: LegendsProperty[] = [
  {
    ...property("spring-condominiums", "Spring Condominiums", "300 Bowie St", "Seaholm", ["222 West Ave #1404", "301 West Ave #4808"], "/buildings/spring-condominiums.png"),
    style: "Modern downtown condominium",
    walkability: "Excellent walkability to Seaholm, Whole Foods, Central Library, and Lady Bird Lake.",
    residentExperience: "Everyday downtown living with coffee, groceries, lake access, fitness, and dinner plans close by.",
    summary: "Spring places residents in one of Austin's most useful downtown pockets with strong access to everyday essentials and neighborhood experiences.",
    whyItMatters: "The neighborhood becomes part of the amenity. Spring is ideal for resident discovery because daily routines and social plans are already within a short walk.",
    coffee: ["Manana", "Merit Coffee", "Jo's Coffee"],
    dining: ["True Food Kitchen", "Sweetgreen", "Flower Child", "Qi Austin"],
    drinks: ["Wax Myrtle's", "Codependent", "Garage Bar"],
    wellness: ["CorePower Yoga", "Life Time", "Barry's"],
    groceries: ["Whole Foods Market", "Trader Joe's"],
    nearbyLocations: ["Lady Bird Lake", "Austin Central Library", "Seaholm District", "West 6th"],
    goodToKnow: ["Rooftop pool", "Concierge", "Lake access", "Whole Foods nearby"],
    entityAliases: ["Spring Condominiums", "Spring", "300 Bowie", "300 Bowie St", "300 Bowie ST", "luxury-building-spring-condominiums"],
  },
  property("the-independent", "The Independent", "301 West Ave", "Seaholm", ["301 West Ave #4808", "301 West Ave #3402"], "/images/map/listings/301-west-ave.jpg"),
  property("seaholm-residences", "Seaholm Residences", "222 West Ave", "Seaholm", ["222 West Ave #1404"], "/images/map/listings/seaholm-residences-222-west.jpg"),
  property("5-fifty-five", "5 Fifty Five", "555 E 5th St", "Downtown Core"),
  property("the-catherine", "The Catherine", "214 Barton Springs Rd", "South Shore", [], "/buildings/catherine.webp"),
  property("70-rainey", "70 Rainey", "70 Rainey St", "Rainey", [], "/images/map/panels/70-rainey-austin.jpg"),
  property("44-east-avenue", "44 East Avenue", "44 East Ave", "Rainey", [], "/images/map/panels/44-east-austin.jpg"),
  property("milago", "Milago", "54 Rainey St", "Rainey", [], "/images/map/panels/milago-austin.jpg"),
  property("villas-on-rainey", "Villas on Rainey", "80 Red River St", "Rainey"),
  property("the-shore", "The Shore", "603 Davis St", "Rainey", ["603 Davis Street #2011", "603 Davis Street #1704", "603 Davis Street #1409", "603 Davis Street #907", "603 Davis Street #2007"], "/images/map/panels/the-shore-austin.jpg"),
  property("natiivo-austin", "Natiivo Austin", "48 East Ave", "Rainey", [], "/images/reports/natiivo-building.jpg"),
  property("waterline", "Waterline", "98 Red River St", "Rainey", [], "/images/reports/waterline-building.jpg"),
  property("the-austonian", "The Austonian", "200 Congress Ave", "Congress", ["200 Congress Ave #15E"], "/images/reports/austonian-building.jpg"),
  property("360-condominiums", "360 Condominiums", "360 Nueces St", "Market District", [], "/images/map/listings/360-nueces-austin.jpg"),
  property("fifth-and-west", "Fifth & West", "501 West Ave", "Market District", [], "/images/map/panels/fifth-and-west-austin.jpg"),
  property("residences-at-w-austin", "Residences at W Austin", "210 Lavaca St", "2nd Street", [], "/images/map/listings/w-austin-residences-210-lavaca.jpg"),
  property("four-seasons-residences", "Four Seasons Residences", "98 San Jacinto Blvd", "Waterfront", [], "/images/reports/four-seasons-austin.jpg"),
  property("the-travis", "The Travis", "80 Red River St", "Rainey", [], "/images/property-listings-premium/the-travis.jpeg"),
  property("residences-at-hotel-zaza", "Residences at Hotel ZaZa", "400 Lavaca St", "Warehouse District"),
  property(
    "the-modern-austin-residences",
    "The Modern Austin Residences",
    "610 Davis St",
    "Rainey",
    ["610 Davis ST #4301", "610 Davis ST #5003"],
    "/images/reports/paseo-building.webp",
  ),
  property("riversouth", "RiverSouth", "401 S 1st St", "South Shore"),
  property("bridges-on-the-park", "Bridges on the Park", "210 Lee Barton Dr", "South Shore"),
  property("bartonplace", "BartonPlace", "1600 Barton Springs Rd", "Zilker"),
];

function normalizeLegendsPropertyKey(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function legendsPropertyCandidates(input: unknown): string[] {
  if (!input || typeof input !== "object") return [normalizeLegendsPropertyKey(input)].filter(Boolean);
  const record = input as Record<string, any>;
  const raw = (record.raw || {}) as Record<string, any>;
  const rental = (record.rentalListing || raw.rentalListing || {}) as Record<string, any>;
  const legendsListing = (record.legendsListing || raw.legendsListing || {}) as Record<string, any>;
  return [
    record.id,
    record.name,
    record.title,
    record.building,
    record.buildingName,
    record.address,
    raw.id,
    raw.name,
    raw.title,
    raw.building,
    raw.buildingName,
    raw.address,
    rental.id,
    rental.building,
    rental.address,
    legendsListing.id,
    legendsListing.building,
    legendsListing.buildingName,
    legendsListing.address,
  ].map(normalizeLegendsPropertyKey).filter(Boolean);
}

export function getLegendsPropertyContent(idOrName: unknown): LegendsProperty | undefined {
  const keys = legendsPropertyCandidates(idOrName);
  return legendsPropertyContent.find((item) => {
    const itemKeys = [
      item.id,
      item.buildingName,
      item.address,
      ...item.entityAliases,
    ].map(normalizeLegendsPropertyKey);
    return itemKeys.some((itemKey) => keys.some((key) => key === itemKey || key.includes(itemKey) || itemKey.includes(key)));
  });
}
