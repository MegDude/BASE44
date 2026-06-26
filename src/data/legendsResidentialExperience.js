import { getGeneratedLegendsListingsForRecord } from "./legendsGeneratedListings";

const RESIDENTIAL_ANALYTICS = [
  "Building Views",
  "Listing Views",
  "Save Rate",
  "Tour Requests",
  "Neighborhood Opens",
  "Nearby Entity Clicks",
  "Collection Opens",
  "Comparison Opens",
  "Walkability Interest",
  "Dining Interest",
  "Wellness Interest",
  "Lifestyle Benefit Engagement",
];

const PARTNER_SECTIONS = [
  ["Building Interest", "Views, saves, and return visits around this building."],
  ["Neighborhood Interest", "Which nearby districts and places residents open after viewing."],
  ["Lifestyle Interest", "Dining, wellness, waterfront, coffee, and walkability patterns."],
  ["Tour Requests", "Residents who move from discovery into active inquiry."],
  ["Showing Requests", "Signals that should route to the Legends follow-up flow."],
  ["Inquiry Volume", "New requests generated from map, listing, and neighborhood surfaces."],
  ["Most Viewed Lifestyle Benefits", "The daily advantages creating the strongest pull."],
  ["Most Viewed Nearby Destinations", "Restaurants, parks, hotels, venues, and civic places driving interest."],
  ["Resident Intent Signals", "Saved buildings, comparisons, directions, and listing opens."],
  ["Building Comparison Trends", "Where this building is being compared against other downtown options."],
];

const INDEPENDENT_PROFILE = {
  id: "the-independent",
  buildingName: "The Independent",
  neighborhood: "Seaholm",
  district: "Seaholm",
  address: "301 West Ave, Austin, TX 78701",
  heroImage: "/images/property-listings-premium/the-independent.jpeg",
  headline: "Live where downtown feels effortless.",
  propertyOverview: [
    "The Independent sits at the intersection of Republic Square, Seaholm, Second Street, and Lady Bird Lake.",
    "More than almost any other building downtown, it places residents within walking distance of the destinations they use most often.",
    "Coffee before work.",
    "Fitness after work.",
    "Dinner without planning.",
    "Events without driving.",
    "Weekend mornings on the trail.",
    "For many residents, the building changes how often they use downtown because everything becomes easier to reach.",
  ],
  whyLivingHereMatters: [
    "Most luxury buildings offer amenities.",
    "The Independent offers access.",
    "The value comes from what happens outside the building as much as what happens inside it.",
    "Residents spend less time commuting between experiences and more time enjoying them.",
    "The city becomes part of the amenity package.",
  ],
  buildingHighlights: ["Skyline-facing residences", "Seaholm address", "Downtown views", "Amenity deck", "Concierge-supported living"],
  lifestyleBenefits: [
    "Republic Square outside your door",
    "Lady Bird Lake within walking distance",
    "Seaholm District access",
    "Waterloo Greenway nearby",
    "Coffee-first neighborhood",
    "Strong fitness ecosystem",
    "Walkable dining scene",
    "Car-light lifestyle",
  ],
  dayLivingHere: [
    ["Morning", ["Coffee at Merit.", "Walk through Republic Square.", "Grab breakfast before work."]],
    ["Afternoon", ["Lunch at Comedor.", "Quick workout nearby.", "Walk meetings downtown."]],
    ["Evening", ["Dinner at Uchiba.", "Live music.", "Waterfront sunset walk.", "Cocktails without needing a rideshare."]],
  ],
  whoLivesHere: [
    "Urban professionals",
    "Entrepreneurs",
    "Remote workers",
    "Downtown-first residents",
    "People who value convenience over commuting",
  ],
  nearby: [
    ["Republic Square", "Park, markets, and daily downtown rhythm"],
    ["Merit Coffee", "Coffee-first routine nearby"],
    ["Comedor", "Architecture-forward dinner close to home"],
    ["Uchiba", "Second Street dinner and cocktails"],
    ["Lady Bird Lake", "Trail access for mornings and weekends"],
  ],
  questions: [
    "Can I realistically live without driving?",
    "How often do residents use the trail?",
    "What restaurants become regular spots?",
    "How connected does downtown feel?",
    "What makes Seaholm different?",
  ],
  relatedCollections: ["Seaholm Living", "Downtown Date Night", "Coffee Before Work", "Waterfront Weekends"],
};

const FOUR_SEASONS_PROFILE = {
  id: "four-seasons-residences",
  buildingName: "Four Seasons Residences",
  neighborhood: "Waterfront",
  district: "Waterfront",
  address: "98 San Jacinto Blvd, Austin, TX 78701",
  heroImage: "/images/property-listings-premium/four-seasons-residences.jpeg",
  headline: "Live on the water. Stay connected to the city.",
  propertyOverview: [
    "Four Seasons Residences combines waterfront living, hotel hospitality, and downtown access into one of Austin's most distinctive residential experiences.",
    "Residents wake up beside Lady Bird Lake while remaining steps from Congress Avenue, the Convention Center, and the city's hospitality core.",
    "The result is a lifestyle built around convenience, service, and connection.",
  ],
  whyLivingHereMatters: [
    "Many luxury buildings offer views.",
    "Few offer experiences.",
    "Living here means immediate access to waterfront recreation, hotel hospitality, destination dining, cultural programming, and one of the most connected parts of downtown.",
    "The neighborhood becomes part of everyday life.",
  ],
  buildingHighlights: ["Waterfront address", "Hotel hospitality adjacency", "Lake and trail access", "Congress Avenue connection", "Service-led living"],
  lifestyleBenefits: [
    "Waterfront trail access",
    "Hotel hospitality adjacency",
    "Dining experiences nearby",
    "Convention district access",
    "Walkable entertainment",
    "Concierge-supported lifestyle",
    "Visitor-friendly location",
    "Car-light living",
  ],
  dayLivingHere: [
    ["Morning", ["Trail walk along Lady Bird Lake.", "Coffee overlooking the water."]],
    ["Afternoon", ["Meetings downtown.", "Lunch at Ciclo.", "Quick walk home."]],
    ["Evening", ["Cocktails at Live Oak.", "Dinner nearby.", "Events downtown.", "Waterfront sunset walk before heading upstairs."]],
  ],
  whoLivesHere: [
    "Executives",
    "Frequent travelers",
    "Second-home owners",
    "People prioritizing service and convenience",
    "Residents who entertain frequently",
  ],
  localInsight: "The biggest luxury here isn't the residence. It's removing friction from daily life.",
  nearby: [
    ["Lady Bird Lake", "Waterfront trail access outside the routine"],
    ["Ciclo", "Hotel dining and brunch close to home"],
    ["Live Oak", "Cocktails with waterfront energy"],
    ["Congress Avenue", "Cultural and hospitality core"],
    ["Waterloo Greenway", "Events, parks, and walking connections nearby"],
  ],
  questions: [
    "How often do residents use the trail?",
    "What hotel experiences are available nearby?",
    "Where should we take visitors?",
    "What makes waterfront living different?",
    "Can daily life stay walkable here?",
  ],
  relatedCollections: ["Waterfront Experiences", "Staycation Collection", "Best Hotel Dining", "Downtown Hosting"],
};

export const legendsResidentialProfiles = [
  INDEPENDENT_PROFILE,
  FOUR_SEASONS_PROFILE,
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function valuesFromRecord(record) {
  if (!record || typeof record !== "object") return [record];
  const raw = record.raw || {};
  const rental = record.rentalListing || raw.rentalListing || {};
  const legendsListing = record.legendsListing || raw.legendsListing || {};
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
  ];
}

export function getLegendsResidentialExperience(record) {
  const recordId = normalize(record?.id || record?.raw?.id || record?.slug || record?.raw?.slug);
  if (recordId === "partner-four-seasons" || recordId === "four-seasons-austin") return null;

  const haystack = valuesFromRecord(record).map(normalize).filter(Boolean);
  if (!haystack.length) return null;

  const curatedProfile = legendsResidentialProfiles.find((profile) => {
    const profileKeys = [
      profile.id,
      profile.buildingName,
      profile.address,
      profile.buildingName.replace(/\s+residences?$/i, ""),
    ].map(normalize);
    return profileKeys.some((key) => key && haystack.some((value) => value === key || value.includes(key) || key.includes(value)));
  });
  if (curatedProfile) return curatedProfile;

  const [generated] = getGeneratedLegendsListingsForRecord(record);
  if (!generated) return null;
  return createGenericLegendsResidentialExperience({
    id: generated.id,
    buildingName: generated.buildingName,
    address: generated.address,
    neighborhood: generated.neighborhood,
    imageAsset: generated.imageAsset,
    summary: generated.summary,
    whyItMatters: generated.whyItMatters,
    goodToKnow: generated.goodToKnow,
    walkability: generated.walkableNearby || generated.walkability,
    nearbyLocations: generated.placesNearby,
    coffee: generated.coffee,
    dining: generated.dining,
    drinks: generated.drinks,
    wellness: generated.wellness,
    listings: [generated.listingFacts].filter(Boolean),
  });
}

export function createGenericLegendsResidentialExperience(content) {
  if (!content) return null;
  const buildingDisplayName =
    content.buildingName ||
    content.name ||
    content.title ||
    content.address ||
    "70 Rainey";

  return {
    id: content.id,
    buildingName: buildingDisplayName,
    neighborhood: content.neighborhood,
    district: content.neighborhood,
    address: content.address,
    heroImage: content.imageAsset,
    headline: "See what daily life feels like here.",
    propertyOverview: [
      `${buildingDisplayName} gives residents a walkable downtown home base close to Rainey, the lake, hotel dining, and everyday routines.`,
      content.summary,
    ].filter(Boolean),
    whyLivingHereMatters: [
      content.whyItMatters,
      "The listing matters, but the neighborhood is what turns a building into a daily routine.",
    ].filter(Boolean),
    buildingHighlights: content.goodToKnow || [],
    lifestyleBenefits: [
      content.walkability,
      ...(content.nearbyLocations || []),
    ].filter(Boolean),
    dayLivingHere: [
      ["Morning", (content.coffee || []).slice(0, 3)],
      ["Afternoon", (content.wellness || []).slice(0, 2)],
      ["Evening", (content.dining || []).slice(0, 3)],
    ],
    whoLivesHere: ["Downtown-first residents", "People who value walkability", "Residents comparing lifestyle as much as square footage"],
    nearby: (content.nearbyLocations || []).slice(0, 5).map((item) => [item, "Nearby downtown context"]),
    questions: [
      "What becomes easier if I live here?",
      "What is walkable from the building?",
      "Which nearby places become part of the week?",
      "How does this compare with nearby buildings?",
    ],
    relatedCollections: ["Downtown Living", "Walkable Austin", content.neighborhood ? `${content.neighborhood} Guide` : "Rainey Guide"],
  };
}

export { PARTNER_SECTIONS as legendsResidentialPartnerSections, RESIDENTIAL_ANALYTICS as legendsResidentialAnalytics };
