export const THE_SHORE_ENTITY_ID = "the-shore";
export const THE_SHORE_PROPERTY_ID = THE_SHORE_ENTITY_ID;
export const THE_SHORE_LEGACY_IDS = [
  "property-the-shore",
  "priority-the-shore",
  "shore-condos",
  "shore-building",
  "shore-property",
  "603-davis",
  "603-davis-st",
  "parking-the-shore-evening",
];

export const THE_SHORE_HERO_IMAGE = "/images/reports/the-shore-austin.jpeg";

export const theShoreAvailableHomes = [
  {
    id: "the-shore-2011",
    entityId: THE_SHORE_ENTITY_ID,
    unit: "2011",
    address: "603 Davis Street #2011",
    status: "Active Under Contract",
    badge: "Under Contract",
    price: "$675,000",
    beds: "2",
    baths: "2",
    sqft: "1,219",
    image: "/images/properties/the-shore/2011.jpg",
    description:
      "A two-bedroom residence positioned on an upper floor with direct access to downtown, the waterfront trail system, and the Rainey Street neighborhood.",
  },
  {
    id: "the-shore-1704",
    entityId: THE_SHORE_ENTITY_ID,
    unit: "1704",
    address: "603 Davis Street #1704",
    status: "Active",
    price: "$630,000",
    beds: "2",
    baths: "2",
    sqft: "1,252",
    image: "/images/properties/the-shore/1704.jpg",
    description:
      "A spacious two-bedroom floorplan offering comfortable downtown living near the lake and trail network.",
  },
  {
    id: "the-shore-1409",
    entityId: THE_SHORE_ENTITY_ID,
    unit: "1409",
    address: "603 Davis Street #1409",
    status: "Active Under Contract",
    badge: "Under Contract",
    price: "$550,000",
    beds: "2",
    baths: "2",
    sqft: "1,286",
    image: "/images/properties/the-shore/1409.jpg",
    description:
      "A larger two-bedroom residence with a practical layout and immediate access to downtown amenities.",
  },
  {
    id: "the-shore-907",
    entityId: THE_SHORE_ENTITY_ID,
    unit: "907",
    address: "603 Davis Street #907",
    status: "Active",
    price: "$420,000",
    beds: "1",
    baths: "1",
    sqft: "879",
    image: "/images/properties/the-shore/907.jpg",
    description:
      "A one-bedroom residence suited for buyers seeking a walkable downtown lifestyle near the lake and Rainey Street.",
  },
  {
    id: "the-shore-2007",
    entityId: THE_SHORE_ENTITY_ID,
    unit: "2007",
    address: "603 Davis Street #2007",
    status: "Active",
    price: "$395,000",
    beds: "1",
    baths: "1",
    sqft: "879",
    image: "/images/properties/the-shore/2007.jpg",
    description:
      "An accessible entry point into one of downtown Austin's most established residential towers.",
  },
];

export const theShoreResidentialBuilding = {
  id: THE_SHORE_ENTITY_ID,
  entityId: THE_SHORE_ENTITY_ID,
  slug: THE_SHORE_ENTITY_ID,
  legacyIds: THE_SHORE_LEGACY_IDS,
  canonicalUrl: `/map?entity=${THE_SHORE_ENTITY_ID}`,
  kind: "property",
  entityType: "property",
  category: "Residential",
  name: "The Shore",
  address: "603 Davis Street",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  district: "Rainey Street",
  neighborhood: "Rainey District / Lady Bird Lake",
  latitude: 30.2595,
  longitude: -97.7395,
  heroImage: THE_SHORE_HERO_IMAGE,
  subheadline: "A Rainey Street high-rise positioned between downtown Austin and Lady Bird Lake.",
  overview:
    "The Shore places residents within walking distance of the trail, waterfront, Rainey Street restaurants, Hotel Van Zandt, and the downtown core while maintaining a quieter residential feel along the lake.",
  children: {
    parking: [],
    amenities: [],
    perks: [],
    events: [],
    campaigns: [],
    media: [],
    analytics: [],
  },
  ninaInsight: {
    headline: "The reason to choose The Shore is the contrast.",
    summary:
      "Trail-first mornings and Rainey evenings are close, while the building remains a residential base between them.",
    bestFit:
      "Best for buyers who want the lake, dining, and downtown close without living in the middle of every plan.",
    tradeOff:
      "Rainey is active. Tour when you expect to be home and listen from the residence, balcony, and common areas.",
    verify:
      "Confirm HOA costs, parking, guest rules, current amenities, and any Hotel Van Zandt access before relying on them.",
    suggestedUpdates: [
      ["Lead with the contrast", "Position the home around trail mornings, walkable evenings, and a quieter place to return to."],
      ["Add decision proof", "Show the actual view direction, floor plan, balcony, monthly costs, parking, storage, and verified amenities."],
      ["Separate proximity from access", "Describe Hotel Van Zandt as nearby unless a specific resident-access benefit is confirmed."],
      ["Make the week visible", "Add verified walk times for the trail, dining, groceries, and the places a resident would use repeatedly."],
    ],
  },
  snapshot: [
    ["Address", "603 Davis Street"],
    ["Neighborhood", "Rainey District"],
    ["Building Type", "Residential High-Rise"],
    ["Lifestyle", "Lake Access • Walkable Dining • Downtown Living"],
    ["Best For", "Residents looking for a balance between downtown convenience and waterfront access."],
  ],
  availableHomes: theShoreAvailableHomes,
  residentReasons: [
    ["Waterfront Access", "Steps from the Lady Bird Lake Trail and Austin's waterfront recreation network."],
    ["Rainey Street Nearby", "Walk to restaurants, coffee shops, live music venues, and neighborhood gathering places."],
    ["Downtown Connectivity", "Convenient access to offices, hotels, entertainment, and the Convention Center district."],
    ["Residential Feel", "Close to activity while remaining slightly removed from the busiest parts of downtown."],
  ],
  nearby: [
    ["Hotel Van Zandt", "Hospitality, dining, and live music next door"],
    ["Half Step", "Rainey Street cocktails nearby"],
    ["Banger's", "Beer garden and neighborhood gathering place"],
    ["Lucille", "Rainey patio drinks and casual nights out"],
    ["Geraldine's", "Dining and live music inside Hotel Van Zandt"],
    ["Lady Bird Lake Trail", "Waterfront walking and running access"],
    ["Waterloo Greenway", "Events, green space, and downtown programming"],
    ["Downtown Austin Convention Center", "Event district and downtown connectivity"],
  ],
  cta: {
    headline: "Want to live here?",
    body:
      "Explore available homes and connect with local real estate experts familiar with The Shore and downtown Austin.",
    primary: "View Available Homes",
    secondary: "Contact Listing Agent",
    footer:
      "Listing availability and pricing may change without notice. Verify all information independently.",
  },
  partner: {
    headline: "The Shore",
    subheadline: "Residential building serving residents in the Rainey District.",
    summary:
      "The Shore represents a concentrated residential audience positioned between Lady Bird Lake and downtown Austin. Its location places residents within walking distance of restaurants, events, hospitality venues, wellness operators, and neighborhood experiences throughout the downtown core.",
    insights: [
      ["Residential Audience", "Residents living within walking distance of downtown destinations."],
      ["Neighborhood Context", "Located at the intersection of the waterfront trail system and the Rainey Street district."],
      ["Nearby Activity", "Strong proximity to dining, hospitality, wellness, and event destinations."],
    ],
  },
};
