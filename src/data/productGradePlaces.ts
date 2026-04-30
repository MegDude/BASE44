export interface ProductGradePlace {
  name: string;
  category: string;
  subcategory?: string;
  district?: string;
  shortDescription?: string;
  whyItMatters?: string;
  tags?: string[];
  sourceConfidence?: "high" | "medium" | "low";
  status?: string;
}

const PRODUCT_GRADE_PLACES: ProductGradePlace[] = [
  {
    name: "Banger's Sausage House & Beer Garden",
    category: "Bars & Nightlife",
    subcategory: "Beer Garden",
    district: "Rainey Street",
    shortDescription: "Large Rainey Street beer garden with extensive tap list and dog-friendly patio.",
    whyItMatters: "A defining Rainey Street anchor.",
    tags: ["rainey street", "beer garden", "patio", "anchor"],
    sourceConfidence: "high",
    status: "open",
  },
  {
    name: "Half Step",
    category: "Bars & Nightlife",
    subcategory: "Cocktail Bar",
    district: "Rainey Street",
    shortDescription: "Craft cocktail bar with a spacious backyard on Rainey Street.",
    whyItMatters: "One of the most cited Rainey cocktail destinations.",
    tags: ["rainey street", "cocktails", "backyard"],
    sourceConfidence: "high",
    status: "open",
  },
  {
    name: "Bar Hacienda",
    category: "Bars & Nightlife",
    subcategory: "Speakeasy",
    district: "Rainey Street",
    shortDescription: "Sophisticated speakeasy-style lounge in the Rainey area.",
    whyItMatters: "Broadens the premium lounge mix in the district.",
    tags: ["rainey street", "speakeasy", "lounge"],
    sourceConfidence: "medium",
    status: "operating",
  },
  {
    name: "Electric Shuffle",
    category: "Bars & Nightlife",
    subcategory: "Entertainment Bar",
    district: "Rainey Street",
    shortDescription: "Shuffleboard-led nightlife venue with private rooms and brunch traffic.",
    whyItMatters: "Hybrid nightlife and experience anchor in Rainey.",
    tags: ["shuffleboard", "entertainment", "rainey street"],
    sourceConfidence: "medium",
    status: "open",
  },
  {
    name: "Heydey Social Club",
    category: "Bars & Nightlife",
    subcategory: "Rooftop Bar",
    district: "Congress Corridor",
    shortDescription: "Vintage-inspired rooftop bar on Congress Avenue.",
    whyItMatters: "Useful for Congress corridor rooftop nightlife coverage.",
    tags: ["rooftop", "congress avenue", "cocktails"],
    sourceConfidence: "medium",
    status: "open",
  },
  {
    name: "Subterra Agave Bar",
    category: "Bars & Nightlife",
    subcategory: "Cocktail Bar",
    district: "Seaholm",
    shortDescription: "Moody basement lounge specializing in agave spirits in the Seaholm area.",
    whyItMatters: "Adds premium agave-led nightlife coverage to the west side of downtown.",
    tags: ["agave", "seaholm", "cocktails", "bar"],
    sourceConfidence: "medium",
    status: "open",
  },
  {
    name: "The Roosevelt Room",
    category: "Bars & Nightlife",
    subcategory: "Cocktail Bar",
    district: "Warehouse District",
    shortDescription: "Award-winning cocktail bar with a historically themed drinks menu.",
    whyItMatters: "A canonical Warehouse District cocktail destination.",
    tags: ["cocktails", "warehouse district", "award-winning", "nightlife"],
    sourceConfidence: "high",
    status: "open",
  },
  {
    name: "Zanzibar",
    category: "Bars & Nightlife",
    subcategory: "Rooftop Bar",
    district: "2nd Street District",
    shortDescription: "Lush rooftop bar with global bites and tiki-inspired drinks.",
    whyItMatters: "Important hospitality-linked rooftop venue in the 2nd Street area.",
    tags: ["rooftop", "tiki", "hotel bar", "2nd street"],
    sourceConfidence: "medium",
    status: "operating",
  },
  {
    name: "ACL Live at The Moody Theater",
    category: "Event Venues & Live Music",
    subcategory: "Live Music Venue",
    district: "Downtown Core",
    shortDescription: "Major downtown music venue and home of the ACL taping brand.",
    whyItMatters: "One of the most recognizable live music anchors in the city.",
    tags: ["acl live", "moody theater", "live music", "concerts"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Antone's Nightclub",
    category: "Event Venues & Live Music",
    subcategory: "Live Music Club",
    district: "Downtown Core",
    shortDescription: "Historic Austin club with deep roots in blues and touring acts.",
    whyItMatters: "Adds legacy music coverage to the downtown nightlife layer.",
    tags: ["live music", "blues", "nightclub", "downtown"],
    sourceConfidence: "medium",
    status: "operating",
  },
  {
    name: "La Condesa",
    category: "Restaurants",
    subcategory: "Restaurant",
    district: "2nd Street District",
    shortDescription: "Core downtown dining landmark.",
    whyItMatters: "One of the best-known 2nd Street restaurant anchors.",
    tags: ["restaurant", "2nd street", "dining"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Austin Central Library",
    category: "Civic, Cultural & Landmark Destinations",
    subcategory: "Library",
    district: "Downtown Core",
    shortDescription: "Modern public library with rooftop garden and lake views.",
    whyItMatters: "A signature civic and architectural anchor.",
    tags: ["library", "civic", "lake views"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "BookPeople",
    category: "Retail & Local Businesses",
    subcategory: "Bookstore",
    district: "Downtown Core",
    shortDescription: "Independent bookstore and recurring event destination.",
    whyItMatters: "A recognizable local-business anchor with real programming value.",
    tags: ["books", "retail", "events", "local"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Fairmont Austin",
    category: "Hotels",
    subcategory: "Hotel",
    district: "Downtown Core",
    shortDescription: "Major anchor hotel connected to convention and Rainey activity.",
    whyItMatters: "Strong hospitality node linking guests to the wider district.",
    tags: ["hotel", "convention", "pool deck", "hospitality"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Four Seasons Hotel Austin",
    category: "Hotels",
    subcategory: "Luxury Hotel",
    district: "Rainey Street",
    shortDescription: "Luxury lakefront hotel with dining, events, and premium guest reach.",
    whyItMatters: "Defines the high-end guest layer at the edge of downtown and Rainey.",
    tags: ["hotel", "luxury", "lakefront", "hospitality"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Hotel Van Zandt",
    category: "Hotels",
    subcategory: "Hotel",
    district: "Rainey Street",
    shortDescription: "Boutique hospitality anchor deeply tied to Rainey Street activity.",
    whyItMatters: "High-value crossover point between guests, music, and nightlife.",
    tags: ["hotel", "rainey street", "music", "hospitality"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "The LINE Austin",
    category: "Hotels",
    subcategory: "Hotel",
    district: "Downtown Core",
    shortDescription: "Landmark hotel at Congress and Cesar Chavez with event space and lake access.",
    whyItMatters: "Important hospitality node at the downtown core and lake edge.",
    tags: ["hotel", "congress", "lake", "events"],
    sourceConfidence: "high",
    status: "operating",
  },
  {
    name: "Waterline Austin",
    category: "Mixed-use Development / Corporate Office",
    subcategory: "Skyscraper",
    district: "Downtown Core",
    shortDescription: "74-story skyscraper under construction with residences, office space, and future hospitality.",
    whyItMatters: "Future flagship district node and major mixed-use influence point.",
    tags: ["waterline", "mixed-use", "skyscraper", "development"],
    sourceConfidence: "medium",
    status: "under construction",
  },
];

const PLACE_LOOKUP = new Map(
  PRODUCT_GRADE_PLACES.map((place) => [normalizePlaceName(place.name), place])
);

export function normalizePlaceName(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getProductGradePlace(name = ""): ProductGradePlace | null {
  return PLACE_LOOKUP.get(normalizePlaceName(name)) || null;
}

