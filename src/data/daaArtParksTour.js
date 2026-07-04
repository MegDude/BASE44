export const DAA_STORYMAP_URL = "https://storymaps.arcgis.com/stories/6e2942202cd34cbd8801723e0d8f5ad3";
export const DAA_ART_PARKS_URL = "https://downtownaustin.com/explore/art_and_parks_tour/";

export const DAA_TOUR_TITLE = "Downtown Austin Art & Parks Tour";
export const DAA_TOUR_PRESENTED_BY = "Presented by the Downtown Austin Alliance";
export const DAA_TOUR_STOP_COUNT = 48;

export const daaArtWalkImages = [
  {
    src: "/images/partners/civic/daa-art-walk/daa-art-walk-2.jpg",
    title: "DAA Art Walk Community Moment",
    label: "Downtown civic activation",
  },
  {
    src: "/images/partners/civic/daa-art-walk/daa-art-walk-6.jpeg",
    title: "Public Sculpture Stop",
    label: "Outdoor sculpture and parks route",
  },
  {
    src: "/images/partners/civic/daa-art-walk/daa-art-walk-5.jpg",
    title: "Downtown Mural Stop",
    label: "Murals and street art",
  },
  {
    src: "/images/partners/civic/daa-art-walk/daa-art-walk-3.jpg",
    title: "Iconic Art Stop",
    label: "Family-friendly public art",
  },
];

export const daaTourDistricts = [
  "Downtown Core",
  "Congress",
  "Waterloo",
  "Republic Square",
  "Red River",
  "East Austin",
  "Pease Park",
  "Saltillo",
];

export const daaExplorerQuestions = [
  {
    id: "whyStop",
    question: "Why did you stop?",
    options: ["Public art", "Park space", "Walking route", "Curiosity", "Recommended nearby"],
  },
  {
    id: "moreOf",
    question: "What would you like more of downtown?",
    options: ["Public art", "Shade and seating", "Events", "Family-friendly stops", "Wayfinding"],
  },
  {
    id: "visitFrequency",
    question: "How often do you spend time downtown?",
    options: ["Daily", "A few times a week", "A few times a month", "Occasionally", "First time in a while"],
  },
  {
    id: "visitorType",
    question: "Which best describes you?",
    optional: true,
    options: ["Downtown Resident", "Downtown Worker", "Student", "Visitor", "Nearby Neighborhood"],
  },
];

export const daaSaveBehaviorKeys = ["savedOnly", "savedThenVisited", "visitedWithoutSaving"];

const tourSeedStops = [
  ["Malin's Fountain", "Public Art", "Downtown Core", "Downtown Austin", "Downtown Austin, TX 78701", 30.26816, -97.74288, "Jim Huntington", "1983"],
  ["Treehouse at Pease Park", "Park", "Pease Park", "Pease Park", "1100 Kingsbury St, Austin, TX 78703", 30.28119, -97.75263, "Pease Park Conservancy", "2021"],
  ["Pease Park", "Park", "Pease Park", "Shoal Creek", "1100 Kingsbury St, Austin, TX 78703", 30.28152, -97.75228, "City of Austin", "1875"],
  ["We All Ride", "Public Art", "Downtown / Civic District", "Civic District", "1700 Guadalupe St, Austin, TX 78701", 30.27962, -97.74238, "J Muzacz", "2024"],
  ["Waterloo Park", "Park", "Waterloo", "Waterloo Greenway", "500 E 12th St, Austin, TX 78701", 30.27391, -97.73543, "Waterloo Greenway", "2021"],
  ["Moody Amphitheater", "Cultural Landmark", "Waterloo", "Waterloo Park", "1401 Trinity St, Austin, TX 78701", 30.27378, -97.73555, "Waterloo Greenway", "2021"],
  ["Waller Creek Trail", "Park", "Waterloo", "Waller Creek", "Waller Creek, Austin, TX 78701", 30.27288, -97.73603, "Waterloo Greenway", "2021"],
  ["Republic Square", "Park", "Republic Square", "Republic Square", "422 Guadalupe St, Austin, TX 78701", 30.26798, -97.74734, "Downtown Austin Alliance", "1888"],
  ["Wooldridge Square", "Park", "Downtown Core", "Civic District", "900 Guadalupe St, Austin, TX 78701", 30.27145, -97.74596, "City of Austin", "1909"],
  ["Brush Square", "Park", "Downtown Core", "Convention Center", "409 E 5th St, Austin, TX 78701", 30.26486, -97.73825, "City of Austin", "1913"],
  ["Mexic-Arte Museum", "Cultural Landmark", "Congress", "Congress Avenue", "419 Congress Ave, Austin, TX 78701", 30.2666, -97.74353, "Mexic-Arte Museum", "1984"],
  ["Writing on the Walls", "Public Art", "Congress", "Congress Avenue", "Congress Ave, Austin, TX 78701", 30.26752, -97.74296, "Downtown Austin Alliance Foundation", "2020"],
  ["The Paramount Theatre", "Cultural Landmark", "Congress", "Congress Avenue", "713 Congress Ave, Austin, TX 78701", 30.26963, -97.7419, "John Eberson", "1915"],
  ["The Contemporary Austin - Jones Center", "Cultural Landmark", "Congress", "Congress Avenue", "700 Congress Ave, Austin, TX 78701", 30.26925, -97.74225, "The Contemporary Austin", "2010"],
  ["The Driskill", "Cultural Landmark", "Congress", "6th Street", "604 Brazos St, Austin, TX 78701", 30.26809, -97.74172, "Jasper N. Preston", "1886"],
  ["Congress Avenue Bridge", "Cultural Landmark", "Congress", "Lady Bird Lake", "Congress Ave Bridge, Austin, TX 78701", 30.2632, -97.74404, "City of Austin", "1910"],
  ["Ann and Roy Butler Hike-and-Bike Trail", "Park", "Congress", "Lady Bird Lake", "Lady Bird Lake Trail, Austin, TX 78701", 30.26225, -97.74624, "The Trail Conservancy", "1970s"],
  ["Shoal Beach", "Park", "Republic Square", "Lady Bird Lake", "707 W Cesar Chavez St, Austin, TX 78701", 30.2651, -97.75083, "City of Austin", "2003"],
  ["Central Library Plaza", "Cultural Landmark", "Republic Square", "Seaholm", "710 W Cesar Chavez St, Austin, TX 78701", 30.2658, -97.75153, "Lake Flato + Shepley Bulfinch", "2017"],
  ["Seaholm Intake Facility", "Cultural Landmark", "Republic Square", "Seaholm Waterfront", "800 W Cesar Chavez St, Austin, TX 78701", 30.26503, -97.75295, "City of Austin", "1950"],
  ["Seaholm Power Plant", "Cultural Landmark", "Republic Square", "Seaholm District", "800 W Cesar Chavez St, Austin, TX 78701", 30.26747, -97.75294, "City of Austin", "1951"],
  ["The Independent Public Plaza", "Public Realm", "Republic Square", "Seaholm District", "301 West Ave, Austin, TX 78701", 30.26948, -97.75274, "Rhode Partners", "2019"],
  ["Austin City Hall Plaza", "Public Realm", "Congress", "2nd Street District", "301 W 2nd St, Austin, TX 78701", 30.26475, -97.74743, "Antoine Predock", "2004"],
  ["Long Center Terrace", "Cultural Landmark", "Congress", "Auditorium Shores", "701 W Riverside Dr, Austin, TX 78704", 30.2596, -97.75105, "Long Center", "2008"],
  ["Auditorium Shores", "Park", "Congress", "Lady Bird Lake", "900 W Riverside Dr, Austin, TX 78704", 30.2593, -97.75281, "City of Austin", "1959"],
  ["Palmer Events Center Grounds", "Public Realm", "Congress", "Bouldin / Waterfront", "900 Barton Springs Rd, Austin, TX 78704", 30.26067, -97.75219, "City of Austin", "2002"],
  ["Rainey Street Trailhead", "Park", "Downtown Core", "Rainey District", "Rainey St Trailhead, Austin, TX 78701", 30.25672, -97.73922, "The Trail Conservancy", "2015"],
  ["Emma S. Barrientos Mexican American Cultural Center", "Cultural Landmark", "East Austin", "Rainey / Waterfront", "600 River St, Austin, TX 78701", 30.25825, -97.73842, "CasaBella Architects", "2007"],
  ["Palm Park", "Park", "Red River", "Convention Center", "711 E 3rd St, Austin, TX 78701", 30.26318, -97.73563, "City of Austin", "1933"],
  ["Austin Convention Center Public Art", "Public Art", "Red River", "Convention Center", "500 E Cesar Chavez St, Austin, TX 78701", 30.26406, -97.74064, "City of Austin Art in Public Places", "2002"],
  ["Red River Cultural District", "Cultural Landmark", "Red River", "Red River Street", "Red River St, Austin, TX 78701", 30.26918, -97.73605, "Red River Cultural District", "2013"],
  ["Symphony Square", "Cultural Landmark", "Waterloo", "Red River", "1111 Red River St, Austin, TX 78701", 30.27156, -97.73517, "Waterloo Greenway", "1971"],
  ["Texas State Capitol Grounds", "Park", "Downtown Core", "Capitol District", "1100 Congress Ave, Austin, TX 78701", 30.2747, -97.74035, "State Preservation Board", "1888"],
  ["Governor's Mansion", "Cultural Landmark", "Downtown Core", "Capitol District", "1010 Colorado St, Austin, TX 78701", 30.27339, -97.7431, "Abner Cook", "1856"],
  ["Old Bakery and Emporium", "Cultural Landmark", "Congress", "Congress Avenue", "1006 Congress Ave, Austin, TX 78701", 30.27251, -97.74154, "Charles Lundberg", "1876"],
  ["O. Henry Museum", "Cultural Landmark", "Downtown Core", "Brush Square", "409 E 5th St, Austin, TX 78701", 30.26466, -97.73877, "William Sydney Porter", "1934"],
  ["Susanna Dickinson Museum", "Cultural Landmark", "Downtown Core", "Brush Square", "411 E 5th St, Austin, TX 78701", 30.26458, -97.73843, "City of Austin", "2010"],
  ["Frost Bank Tower Plaza", "Public Realm", "Congress", "Congress Avenue", "401 Congress Ave, Austin, TX 78701", 30.26602, -97.74239, "Duda/Paine Architects", "2004"],
  ["Indeed Tower Plaza", "Public Realm", "Downtown Core", "West 6th", "200 W 6th St, Austin, TX 78701", 30.2691, -97.74489, "Page", "2021"],
  ["Ballet Austin", "Cultural Landmark", "Downtown Core", "West 3rd", "501 W 3rd St, Austin, TX 78701", 30.26719, -97.74903, "Ballet Austin", "2007"],
  ["Austin History Center", "Cultural Landmark", "Downtown Core", "Guadalupe", "810 Guadalupe St, Austin, TX 78701", 30.27039, -97.74527, "Hugo Kuehne", "1933"],
  ["Bullock Museum Grounds", "Cultural Landmark", "Downtown Core", "Museum District", "1800 Congress Ave, Austin, TX 78701", 30.28045, -97.73929, "State Preservation Board", "2001"],
  ["Blanton Museum Courtyard", "Cultural Landmark", "Downtown Core", "Museum District", "200 E Martin Luther King Jr Blvd, Austin, TX 78712", 30.28089, -97.73785, "Blanton Museum of Art", "2006"],
  ["Ellsworth Kelly's Austin", "Public Art", "Downtown Core", "Museum District", "200 E Martin Luther King Jr Blvd, Austin, TX 78712", 30.28068, -97.73742, "Ellsworth Kelly", "2018"],
  ["Saltillo Plaza", "Public Realm", "Saltillo", "East Austin", "412 Comal St, Austin, TX 78702", 30.26252, -97.72761, "City of Austin", "2019"],
  ["Comal Pocket Park", "Park", "Saltillo", "East Austin", "Comal St, Austin, TX 78702", 30.26196, -97.72701, "City of Austin", "2019"],
  ["East 6th Street Murals", "Public Art", "East Austin", "East 6th", "E 6th St, Austin, TX 78702", 30.26328, -97.72458, "Austin mural artists", "Various"],
  ["Plaza Saltillo Station Art", "Public Art", "Saltillo", "Plaza Saltillo", "412 Comal St, Austin, TX 78702", 30.26225, -97.72776, "CapMetro Arts Program", "2019"],
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const stopIds = tourSeedStops.map(([name], index) => `daa-stop-${String(index + 1).padStart(2, "0")}-${slugify(name)}`);

const tourStopCopyOverrides = {
  "Central Library Plaza": {
    displayName: "Austin Central Library",
    popupCopy: "19 of 48 · Public space in the Seaholm District",
    imageUrl: "/images/map-entities/civic/austin-central-library-rooftop.avif",
    description:
      "The Austin Central Library is one of Austin's most remarkable public spaces, with six floors of books, quiet reading rooms, an Innovation Lab, art exhibitions, a rooftop garden, and some of the best free views of Lady Bird Lake.",
    detailHeadline: "World-class architecture. Completely free.",
    daaIntro:
      "Sometimes the best thing downtown is not something to buy. The Austin Central Library is one of the city's most celebrated public spaces, combining award-winning architecture, quiet reading rooms, creative studios, art exhibitions, and a rooftop garden overlooking Lady Bird Lake.",
    whyStopHere:
      "Whether you have fifteen minutes between meetings, need a place to work, or simply want somewhere calm to recharge, it is worth making the short walk.",
    whyStopBullets: [
      "Rooftop garden overlooking Lady Bird Lake",
      "Six floors of comfortable spaces to read, work, and relax",
      "Free Wi-Fi throughout the building",
      "Innovation Lab with maker equipment, creative technology, and workshops",
      "Rotating art exhibitions and community events",
      "Cafe, bookstore, and outdoor terraces",
      "Free entry every day",
    ],
    goodFor: ["Remote work", "Quiet afternoons", "Families", "Students", "Visitors", "Architecture lovers"],
    nearbyLabels: ["Lady Bird Lake", "Seaholm District", "Shoal Creek Trail", "Outdoor terraces"],
    localTip:
      "Take the elevator to the rooftop before sunset. It is one of downtown Austin's best free viewpoints and usually much quieter than the nearby parks.",
    ctaHeadline: "No coupon required.",
    ctaBody:
      "Just show up and enjoy one of Austin's best public spaces. Save it for the next time you need a change of scenery, a quiet place to think, or one of the best views downtown without spending a dollar.",
  },
  "We All Ride": {
    displayName: "We All Ride",
    popupCopy: "04 of 48 · Public art in the Civic District",
    imageUrl: "/images/map-entities/civic/we-all-ride-mosaic.webp",
    artist: "J Muzacz",
    year: "2024",
    detailHeadline: "A community-built mosaic.",
    description:
      "A large-scale mosaic by J Muzacz celebrating Austin's cycling community, assembled with help from hundreds of local volunteers.",
    daaIntro:
      "We All Ride turns a simple downtown wall into a bright portrait of people moving through the city together.",
    whyStopHere:
      "Thousands of glass tiles were placed by hand, creating a permanent public artwork that feels both digital and handmade. It is a quick stop, but the detail rewards slowing down.",
    whyStopBullets: [
      "Created by artist J Muzacz",
      "Assembled with hundreds of local volunteers",
      "Inspired by Austin's cycling community",
      "Detailed glass mosaic with a pixel-like finish",
      "Easy stop while walking or biking nearby",
    ],
    goodFor: ["Public art", "Walks", "Cycling routes", "Families", "Photo stops", "Self-guided tours"],
    nearbyLabels: ["Kingsbury Commons", "Shoal Creek Trail", "Pease Park", "Tudor Cottage", "Treehouse overlook"],
    localTip:
      "Look closely at the individual tiles before stepping back. The piece works twice: first as a detailed mosaic, then as one shared city scene.",
    ctaHeadline: "Look a little closer.",
    ctaBody:
      "Thousands of individual tiles make one shared story, much like the city around them.",
    sourceUrl: "https://jmuzacz.com/portfolio/we-all-ride",
    quickFacts: ["Free", "Always open", "Outdoor public art", "Family friendly", "10-15 minute stop", "Photography spot", "Accessible"],
    partnerHeader: "Community Landmark",
    partnerOverview:
      "We All Ride demonstrates how public art can activate civic space, encourage exploration, and create meaningful community participation.",
    strategicValue: ["Public realm", "Community identity", "Walkability", "Tourism", "Arts & culture", "Cycling", "Neighborhood pride"],
    suggestedCampaigns: ["Walking Tour", "Public Art Passport", "Cycling Week", "Family Discovery Trail", "Arts Month", "Downtown Explorer Challenge"],
    engagementOpportunities: [
      "Sponsor a public art trail",
      "Include in cultural events",
      "Feature on cycling routes",
      "Educational tours",
      "Neighborhood walking guides",
      "Photography challenges",
    ],
    successMetrics: ["Visits", "Directions", "Saves", "Nearby venue conversions", "Walking route engagement", "Average dwell time", "Repeat visits"],
    perkModule: {
      title: "Downtown Public Art Trail",
      headline: "Explore Austin's outdoor gallery.",
      description:
        "Check in at We All Ride as part of the Downtown Public Art Trail. Visit featured installations across downtown to unlock rewards from nearby local businesses.",
      reward: "Visit 5 participating artworks",
    },
  },
  "Malin's Fountain": {
    imageUrl: "/images/partners/civic/daa-art-walk/daa-art-walk-6.jpeg",
    detailHeadline: "Sculpture as a downtown pause point.",
    daaIntro:
      "This Art & Parks Tour stop frames downtown public art as something to notice while moving through the city, not something hidden inside a gallery.",
    whyStopHere:
      "Use this stop as the opening rhythm of the DAA Art Walk: slow down, look at the material and setting, then keep moving toward the next sculpture, mural, plaza, or park.",
    goodFor: ["Public art", "Sculpture", "Slow looking", "Photo stops", "Self-guided walks"],
    ctaHeadline: "Check in at the art walk.",
    ctaBody:
      "Check in to record this stop to the Downtown Austin Alliance workspace and keep your Art & Parks Tour progress attached to the route.",
  },
  "East 6th Street Murals": {
    imageUrl: "/images/partners/civic/daa-art-walk/daa-art-walk-5.jpg",
    detailHeadline: "A mural corridor with downtown energy.",
    daaIntro:
      "The DAA Art & Parks Tour includes mural moments that make downtown feel visible, colorful, and lived-in from the sidewalk.",
    whyStopHere:
      "This is the kind of stop that works best on foot: close enough to notice brushwork, color, texture, and the way the artwork changes the block around it.",
    goodFor: ["Murals", "Street art", "Photos", "Visitors", "Walking routes"],
    ctaHeadline: "Save the mural stop.",
    ctaBody:
      "Check in or save this stop to keep the mural route context connected to your downtown walk.",
  },
  "Austin Convention Center Public Art": {
    imageUrl: "/images/partners/civic/daa-art-walk/daa-art-walk-3.jpg",
    detailHeadline: "Public art hiding in plain sight.",
    daaIntro:
      "This stop helps connect convention traffic, downtown residents, and visitors to Austin's public art layer.",
    whyStopHere:
      "Pause here before heading toward nearby civic stops, murals, parks, restaurants, and event venues.",
    goodFor: ["Public art", "Families", "Visitors", "Convention Center", "Photo stops"],
    ctaHeadline: "Add this to your walking route.",
    ctaBody:
      "Check in to record the stop and keep the DAA Art Walk context connected to your route.",
  },
};

function resolveTourStopImage(name, category, district, locationLabel) {
  const text = [name, category, district, locationLabel].join(" ").toLowerCase();
  if (text.includes("mural")) return "/images/partners/civic/daa-art-walk/daa-art-walk-5.jpg";
  if (text.includes("sculpture") || text.includes("fountain") || text.includes("public art")) return "/images/partners/civic/daa-art-walk/daa-art-walk-6.jpeg";
  if (text.includes("art") || text.includes("gallery")) return "/images/partners/civic/daa-art-walk/daa-art-walk-3.jpg";
  if (text.includes("republic square") || text.includes("park") || text.includes("public realm")) return "/images/partners/civic/daa-art-walk/daa-art-walk-2.jpg";
  if (text.includes("ballet austin")) return "/images/civic/ballet-austin-downtown.png";
  if (text.includes("waterloo") || text.includes("waller creek")) return "/images/imported/perks/waterlook-trail.png";
  if (text.includes("republic square")) return "/images/map-entities/perks/civic_republic_square_1779052838327.png";
  if (text.includes("lady bird") || text.includes("hike-and-bike") || text.includes("trail")) return "/images/map-entities/perks/civic_lake_trail_1779052853070.png";
  if (text.includes("blanton") || text.includes("museum")) return "/images/imported/perks/visitors-at-second-saturdays-at-the-blanton-3-3-1024x683.jpg";
  if (text.includes("gallery") || text.includes("art") || text.includes("mural")) return "/images/map-entities/perks/downtown_art_walk_1779052670656.png";
  if (text.includes("park") || text.includes("square") || text.includes("grounds")) return "/images/imported/perks/republic-square-yoga.jpg";
  if (text.includes("theatre") || text.includes("amphitheater") || text.includes("music")) return "/images/map-entities/perks/moody_theater_live_music_1779052684229.png";
  return "/images/imported/perks/blanton-grounds-photo-by-casey-dunn.jpg";
}

export const daaTourStops = tourSeedStops.map(([name, category, district, locationLabel, address, lat, lng, artist, year], index) => {
  const id = stopIds[index];
  const copyOverride = tourStopCopyOverrides[name] || {};
  const nearbyStops = [stopIds[(index + 1) % stopIds.length], stopIds[(index + 2) % stopIds.length], stopIds[(index + 3) % stopIds.length]];
  const relatedStops = stopIds
    .filter((candidateId, candidateIndex) => candidateIndex !== index && tourSeedStops[candidateIndex][1] === category)
    .slice(0, 4);

  return {
    id,
    stopNumber: index + 1,
    name,
    displayName: copyOverride.displayName || name,
    category,
    district,
    locationLabel,
    address,
    coordinates: { lat, lng },
    artist: copyOverride.artist || artist,
    year: copyOverride.year || year,
    curator: "Downtown Austin Alliance Foundation",
    sponsor: "Downtown Austin Alliance",
    imageUrl: copyOverride.imageUrl || resolveTourStopImage(name, category, district, locationLabel),
    description: copyOverride.description || `${name} is part of the Downtown Austin Art & Parks Tour, connecting public art, parks, landmarks, and walkable downtown places into one self-guided civic experience.`,
    popupCopy: copyOverride.popupCopy || `${String(index + 1).padStart(2, "0")} of 48 · ${category} in ${district}`,
    detailHeadline: copyOverride.detailHeadline || "",
    daaIntro: copyOverride.daaIntro || "This stop is part of the Downtown Austin Alliance Art & Parks Tour, a self-guided collection of public art, parks, murals, and cultural landmarks that tell the story of downtown Austin.",
    whyStopHere: copyOverride.whyStopHere || `Stop here to notice how ${locationLabel} connects downtown's public space, local history, and everyday movement.`,
    whyStopBullets: copyOverride.whyStopBullets || [],
    goodFor: copyOverride.goodFor || [],
    nearbyLabels: copyOverride.nearbyLabels || [],
    localTip: copyOverride.localTip || "",
    ctaHeadline: copyOverride.ctaHeadline || "",
    ctaBody: copyOverride.ctaBody || "",
    quickFacts: copyOverride.quickFacts || [],
    partnerHeader: copyOverride.partnerHeader || "",
    partnerOverview: copyOverride.partnerOverview || "",
    strategicValue: copyOverride.strategicValue || [],
    suggestedCampaigns: copyOverride.suggestedCampaigns || [],
    engagementOpportunities: copyOverride.engagementOpportunities || [],
    successMetrics: copyOverride.successMetrics || [],
    perkModule: copyOverride.perkModule || null,
    sourceUrl: copyOverride.sourceUrl || "",
    nearbyStops,
    relatedStops,
    saveEnabled: true,
    directionsEnabled: true,
    checkInEnabled: true,
    civicFeedbackEnabled: true,
    daaExplorerEnabled: true,
    checkInRadiusMeters: 100,
  };
});

export function getDaaTourStopById(id) {
  return daaTourStops.find((stop) => stop.id === id);
}

export const daaTourProgress = {
  visited: 12,
  total: DAA_TOUR_STOP_COUNT,
  saved: 6,
  nearby: 4,
  lastVisited: "Waterloo Park",
};

export const daaDashboardContent = {
  title: "How People Experience Downtown",
  overview: [
    ["Experience Opens", "4,820"],
    ["Location Views", "18,640"],
    ["Saved Stops", "2,190"],
    ["Verified Visits", "1,148"],
    ["Survey Starts", "892"],
    ["Survey Completions", "641"],
    ["Directions Clicked", "1,376"],
    ["Tour Views", "6,304"],
  ],
  whatPeopleAreTellingUs: ["What Motivates Visits", "Requested Improvements", "Audience Frequency"],
  placesPeopleUseMost: ["Most Visited Locations", "Most Saved Locations", "Highest Repeat Engagement", "Top Direction Requests", "High-Interest Content"],
  areasOfDowntown: ["Most Visited Areas", "Most Saved Areas", "Areas People Want More Of"],
  timeAnalysis: {
    title: "Activity by Time of Day",
    buckets: ["Morning", "Lunch", "Afternoon", "Evening", "Weekend"],
  },
};
