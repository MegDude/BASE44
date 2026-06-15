import { getLegendsPropertyContent } from "./legendsPropertyContent";

const LEGENDS_IMAGE_BASE = "/images/legends-listings";
const PREMIUM_PROPERTY_IMAGE_BASE = "/images/property-listings-premium";

const PREMIUM_PROPERTY_IMAGES = {
  "301 west ave": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/the-independent.jpeg`,
    gallery: [`${PREMIUM_PROPERTY_IMAGE_BASE}/the-independent.jpeg`],
  },
  "222 west ave": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences.jpg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences-pool.webp`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences-deck.jpg`,
    ],
  },
  "501 west ave": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west1.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west2.jpeg`,
    ],
  },
  "202 nueces": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences1.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences2.jpeg`,
    ],
  },
  "70 rainey": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey1.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey2.jpeg`,
    ],
  },
  "44 east ave": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east1.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east2.jpeg`,
    ],
  },
  "54 rainey": {
    exterior: "/buildings/milago.webp",
    gallery: ["/buildings/milago.webp"],
  },
  "1212 guadalupe": {
    exterior: `${PREMIUM_PROPERTY_IMAGE_BASE}/sixth-and-guadalupe.jpeg`,
    gallery: [
      `${PREMIUM_PROPERTY_IMAGE_BASE}/sixth-and-guadalupe.jpeg`,
      `${PREMIUM_PROPERTY_IMAGE_BASE}/sixth-and-guadalupe1.jpeg`,
    ],
  },
};

const BUILDING_LOOKUP = {
  "301 west ave": {
    name: "The Independent",
    district: "Seaholm",
    coordinates: [30.267451, -97.750793],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["301 west ave"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["301 west ave"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["301 west ave"].gallery,
  },
  "222 west ave": {
    name: "Seaholm Residences",
    district: "Seaholm",
    coordinates: [30.2672, -97.75148],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["222 west ave"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["222 west ave"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["222 west ave"].gallery,
  },
  "360 nueces": {
    name: "360 Condominiums",
    district: "2nd Street",
    coordinates: [30.267029, -97.749595],
    buildingExterior: "/buildings/360.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/sdcuyw4dhwd2we6ymxtd.png`,
  },
  "360 nueces st": {
    name: "360 Condominiums",
    district: "2nd Street",
    coordinates: [30.267029, -97.749595],
    buildingExterior: "/buildings/360.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/sdcuyw4dhwd2we6ymxtd.png`,
  },
  "501 west ave": {
    name: "Fifth & West",
    district: "Seaholm",
    coordinates: [30.26914, -97.75111],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["501 west ave"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["501 west ave"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["501 west ave"].gallery,
  },
  "610 davis": {
    name: "The Shore",
    district: "Rainey",
    coordinates: [30.25952, -97.73857],
    buildingExterior: `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/83dcefb7 (1).jpeg`,
  },
  "202 nueces": {
    name: "Austin Proper Residences",
    district: "2nd Street",
    coordinates: [30.26595, -97.7496],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["202 nueces"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["202 nueces"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["202 nueces"].gallery,
  },
  "70 rainey": {
    name: "70 Rainey",
    district: "Rainey",
    coordinates: [30.2583, -97.7383],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["70 rainey"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["70 rainey"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["70 rainey"].gallery,
  },
  "44 east ave": {
    name: "44 East",
    district: "Rainey",
    coordinates: [30.25894, -97.7391],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["44 east ave"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["44 east ave"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["44 east ave"].gallery,
  },
  "300 bowie": {
    name: "Spring Condominiums",
    district: "Seaholm",
    coordinates: [30.2692, -97.7508],
    buildingExterior: "/buildings/spring-condominiums.png",
    lifestyleImage: "/buildings/spring-condominiums.png",
  },
  "54 rainey": {
    name: "Milago",
    district: "Rainey",
    coordinates: [30.25878, -97.73988],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["54 rainey"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["54 rainey"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["54 rainey"].gallery,
  },
  "1212 guadalupe": {
    name: "1212 Guadalupe",
    district: "Downtown Core",
    coordinates: [30.27542, -97.7431],
    buildingExterior: PREMIUM_PROPERTY_IMAGES["1212 guadalupe"].exterior,
    lifestyleImage: PREMIUM_PROPERTY_IMAGES["1212 guadalupe"].exterior,
    galleryImages: PREMIUM_PROPERTY_IMAGES["1212 guadalupe"].gallery,
  },
  "800 brazos": {
    name: "Brazos Place",
    district: "Congress",
    coordinates: [30.269, -97.74096],
    buildingExterior: `${LEGENDS_IMAGE_BASE}/1ad5be0d.jpeg`,
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/1ad5be0d (1).jpeg`,
  },
};

const RAW_LISTINGS = [
  ["360 Condominiums", "360 Nueces ST #4201", "$430,000", 1, 1, 801, "6230337", "2nd Street", "360 nueces st"],
  ["360 Condominiums", "360 Nueces ST #3506", "$445,000", 1, 1, 748, "8744546", "2nd Street", "360 nueces st"],
  ["360 Condominiums", "360 Nueces ST #3106", "$465,000", 1, 1, 748, "1883893", "2nd Street", "360 nueces st", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["Seaholm Residences", "222 West Ave #1412", "$575,000", 1, 1, 821, "4683683", "Seaholm", "222 west ave"],
  ["Fifth & West", "501 West Ave #1207", "$1,699,999", 2, 3, 1759, "3480432", "Seaholm", "501 west ave"],
  ["The Independent", "301 West Ave #4504", "$970,000", 1, 1, 999, "1317826", "Seaholm", "301 west ave"],
  ["Spring Condominiums", "300 Bowie ST #1403", "$1,195,000", 2, 3, 1687, "4131783", "Seaholm", "300 bowie"],
  ["The Shore", "610 Davis ST #4301", "$2,425,500", 3, 3, 1951, "5357248", "Rainey", "610 davis"],
  ["The Shore", "610 Davis ST #5003", "$5,582,000", 4, 5, 3818, "1682504", "Rainey", "610 davis"],
  ["Austin Proper Residences", "202 Nueces ST #1405", "$2,995,000", 2, 3, 1646, "4043365", "2nd Street", "202 nueces"],
  ["70 Rainey", "70 Rainey ST #1409", "$7,000/MONTH", 2, 2, 1128, "9192982", "Rainey", "70 rainey"],
  ["1212 Guadalupe", "1212 Guadalupe ST #601", "$220,000", 1, 1, 454, "3119350", "Downtown Core", "1212 guadalupe", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["44 East", "44 East Ave #3304", "$1,125,000", 2, 2, 1172, "8947667", "Rainey", "44 east ave", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["Milago", "54 Rainey ST #404", "$550,000", 2, 2, 1189, "9558786", "Rainey", "54 rainey", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["Brazos Place", "800 Brazos ST #1111", "$335,000", 1, 1, 623, "4696550", "Congress", "800 brazos", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
];

const PROPERTY_BUILDING_SUMMARIES = {
  "70 Rainey": "Luxury residences set between Rainey Street, Lady Bird Lake, and the downtown trail network.",
  "44 East": "Modern downtown residences with quick access to the lake, Rainey, and East Austin dining.",
  "The Independent": "A landmark downtown tower positioned between Seaholm, Shoal Creek, and the core business district.",
  "Spring Condominiums": "Modern downtown living in the heart of Seaholm. Walk to restaurants, coffee shops, fitness studios, Lady Bird Lake, Whole Foods, and some of Austin's most active downtown destinations.",
  "Seaholm Residences": "A walkable downtown address anchored by Whole Foods, Trader Joe's, Shoal Creek, and lake access.",
  "Fifth & West": "A polished residential tower close to Shoal Creek, Market District dining, and downtown offices.",
  "The Shore": "Lake-adjacent residences with immediate access to trails, Rainey, and downtown hotels.",
  "Milago": "Rainey-area residences with direct lake trail access and a quiet edge of downtown feel.",
  "Austin Proper Residences": "Hotel-connected residences near the Seaholm District, restaurants, wellness, and downtown retail.",
  "1212 Guadalupe": "Central downtown living near the Capitol corridor, Congress Avenue, and everyday city conveniences.",
};

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function moneyNumber(value) {
  return Number(String(value || "").replace(/[^0-9]/g, ""));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function priceRange(listings) {
  const prices = listings.map((listing) => moneyNumber(listing.price)).filter(Boolean).sort((a, b) => a - b);
  if (!prices.length) return "Price available on request";
  if (prices.length === 1 || prices[0] === prices[prices.length - 1]) return `$${formatNumber(prices[0])}`;
  return `$${formatNumber(prices[0])} - $${formatNumber(prices[prices.length - 1])}`;
}

function unitFromAddress(address) {
  return String(address || "").match(/#\s*([A-Za-z0-9-]+)/)?.[1] || "";
}

export const luxuryPresenceListings = RAW_LISTINGS.map((row) => {
  const [buildingName, address, price, beds, baths, sqft, mlsNumber, district, lookupKey, imageRef] = row;
  const building = BUILDING_LOOKUP[lookupKey] || {};
  const unit = unitFromAddress(address);
  const residentialContent = getLegendsPropertyContent([address, `${building.name || buildingName}-${unit}`, building.name || buildingName, lookupKey]);
  const primaryImage = building.buildingExterior || building.lifestyleImage || imageRef;
  const buildingExterior = building.buildingExterior || primaryImage;
  const listingId = `luxury-presence-${slug(address)}-${mlsNumber}`;
  const listingType = "For Sale";

  return {
    listing_id: listingId,
    id: listingId,
    address,
    unit,
    building_name: building.name || buildingName,
    price,
    beds,
    baths,
    sqft,
    mls_number: mlsNumber,
    status: "Active",
    district: district || building.district || "Downtown Core",
    lat: building.coordinates?.[0],
    lng: building.coordinates?.[1],
    image_url: primaryImage,
    primaryImage,
    heroImage: buildingExterior,
    panelImage: primaryImage,
    mobileCardImage: primaryImage,
    thumbnail: primaryImage,
    galleryImages: [primaryImage, buildingExterior, ...(building.galleryImages || [])].filter(Boolean).filter((item, index, list) => list.indexOf(item) === index),
    listing_url: "",
    property_type: "Condominium",
    listing_type: listingType,
    zip_code: "78701",
    source: "Legends listing feed",
    updated_at: "2026-06-04",
    legendsResidentialContent: residentialContent,
    panelTitle: residentialContent?.panel_title || building.name || buildingName,
    panelSubhead: residentialContent?.panel_subtitle || `${beds} Bedroom Residence`,
    panelBody: residentialContent?.summary || `${beds} bed, ${baths} bath residence at ${building.name || buildingName} with ${formatNumber(sqft)} square feet, MLS ${mlsNumber}, and direct access to nearby downtown routines, resident perks, and walkable plans.`,
    facts: {
      price,
      beds,
      baths,
      sqft: `${formatNumber(sqft)} Sq Ft`,
      mls: `MLS ${mlsNumber}`,
      status: "Active",
      type: listingType,
    },
  };
});

export const luxuryPresenceBuildings = Object.values(
  luxuryPresenceListings.reduce((buildings, listing) => {
    const key = slug(listing.building_name);
    const lookup = Object.values(BUILDING_LOOKUP).find((item) => item.name === listing.building_name) || {};
    const current = buildings[key] || {
      id: `luxury-building-${key}`,
      name: listing.building_name,
      building_name: listing.building_name,
      type: "property",
      partnerType: "properties",
      brand: "Legends Real Estate",
      pinKey: "legends",
      category: "Residential Property",
      category_key: "residential_property legends building active_listings",
      latitude: listing.lat,
      longitude: listing.lng,
      district: listing.district,
      address: `${String(listing.address).split("#")[0].trim()}, Austin, TX 78701`,
      zip: "78701",
      zip_code: "78701",
      buildingExterior: lookup.buildingExterior || listing.heroImage,
      lifestyleImage: lookup.lifestyleImage || listing.primaryImage,
      districtImage: lookup.buildingExterior || listing.heroImage,
      image: lookup.buildingExterior || listing.heroImage,
      heroImage: lookup.buildingExterior || listing.heroImage,
      panelImage: lookup.buildingExterior || listing.heroImage,
      mobileCardImage: lookup.buildingExterior || listing.heroImage,
      thumbnail: lookup.buildingExterior || listing.heroImage,
      galleryImages: [lookup.buildingExterior || listing.heroImage, ...(lookup.galleryImages || []), listing.primaryImage].filter(Boolean).filter((item, index, list) => list.indexOf(item) === index),
      listings: [],
      source: "Legends listing feed enriched for Downtown Perks",
      updated_at: "2026-06-04",
    };

    current.listings.push(listing);
    buildings[key] = current;
    return buildings;
  }, {})
).map((building) => {
  const sortedListings = [...building.listings].sort((a, b) => moneyNumber(a.price) - moneyNumber(b.price));
  const residentialContent = getLegendsPropertyContent([building.name, building.address, sortedListings[0]?.address]);
  const priceText = priceRange(sortedListings);
  const beds = [...new Set(sortedListings.map((listing) => listing.beds).filter(Boolean))].sort((a, b) => a - b);
  const sqftValues = sortedListings.map((listing) => Number(listing.sqft)).filter(Boolean).sort((a, b) => a - b);
  const bedroomText = beds.length === 1 ? `${beds[0]} bedroom` : `${beds[0]}-${beds[beds.length - 1]} bedroom`;
  const sqftText = sqftValues.length ? `${formatNumber(sqftValues[0])}-${formatNumber(sqftValues[sqftValues.length - 1])} sq ft` : "Square footage available";
  const listingCountText = `${sortedListings.length} active listing${sortedListings.length === 1 ? "" : "s"}`;
  const baseSummary = residentialContent?.summary || PROPERTY_BUILDING_SUMMARIES[building.name] || `${building.name} is a downtown residential building with walkable access to nearby restaurants, hotels, parks, and resident routines.`;
  const isSpring = building.name === "Spring Condominiums";
  const summary = isSpring ? baseSummary : `${baseSummary} ${listingCountText} from ${priceText}, including ${bedroomText} residences and ${sqftText}.`;
  const springProfile = isSpring
    ? {
        buildingId: "spring-condominiums",
        intent: "live",
        status: "active",
        category: "Residential Property",
        category_key: "residential property spring condominiums seaholm live downtown perks legends real estate",
        eyebrow: "SEAHOLM DISTRICT",
        headline: "Spring Condominiums",
        summary: baseSummary,
        downtownPerksCopy: "Living at Spring means downtown starts at your front door. Downtown Perks helps residents discover what is happening nearby without searching across multiple apps.",
        residentCta: {
          title: "Everything Nearby, One Map.",
          body: "Explore local perks, events, dining, fitness, and neighborhood experiences around Spring Condominiums.",
          primary: "Open Map",
          secondary: "Get Downtown Perks",
        },
        snapshot: [
          ["Address", "300 Bowie Street"],
          ["Neighborhood", "Seaholm District"],
          ["Property Type", "Luxury Residential Condominium"],
          ["Style", "High-Rise"],
          ["Walkability", "Excellent"],
          ["Resident Experience", "Urban Lifestyle"],
        ],
        nearbyDistricts: ["Seaholm", "Downtown Core", "Market District", "West Sixth", "Lady Bird Lake"],
        perksIncluded: ["Nearby dining", "Happy hours", "Events", "Fitness classes", "Coffee shops", "Local services", "Resident-exclusive offers"],
        nearbyLifestyle: {
          Coffee: ["Jo's Coffee", "Merit Coffee", "Starbucks Reserve", "Codependent"],
          Dining: ["True Food Kitchen", "Hestia", "Qi", "La Condesa", "Comedor"],
          Drinks: ["Garage", "The Roosevelt Room", "Ranch 616", "Coconut Club"],
          Wellness: ["CorePower Yoga", "Pure Barre", "Lifetime", "Love Cycling"],
          Groceries: ["Whole Foods Market", "Trader Joe's"],
        },
        walkTimes: [
          ["Whole Foods", "3 min walk"],
          ["Lady Bird Lake Trail", "5 min walk"],
          ["Seaholm District", "2 min walk"],
          ["Downtown Core", "8 min walk"],
          ["West Sixth", "6 min walk"],
        ],
      }
    : null;

  return {
    ...building,
    ...(springProfile || {}),
    legendsResidentialContent: residentialContent,
    buildingId: residentialContent?.id || springProfile?.buildingId || building.buildingId,
    intent: residentialContent ? "live" : springProfile?.intent || building.intent,
    status: residentialContent ? "active" : springProfile?.status || building.status,
    listings: sortedListings,
    activeListings: sortedListings.length,
    averagePrice: Math.round(sortedListings.reduce((sum, listing) => sum + moneyNumber(listing.price), 0) / sortedListings.length),
    priceRange: priceText,
    sqftRange: sqftText,
    listingSummary: residentialContent?.panel_subtitle || (isSpring ? "Seaholm District · 300 Bowie Street" : `${listingCountText} · ${priceText}`),
    summary,
    deals_offers: residentialContent?.cta_primary || (isSpring ? "View nearby perks around Spring Condominiums." : `Want To Live Here? ${listingCountText} through Legends Real Estate.`),
    specials: isSpring ? "Whole Foods · Lady Bird Lake · Seaholm dining · fitness nearby" : `${priceText} · ${bedroomText} residences · MLS-backed availability`,
    panelContent: {
      title: building.name,
      subhead: isSpring ? "Seaholm District · 300 Bowie Street" : `${listingCountText} available`,
      body: summary,
      facts: [
        priceText,
        bedroomText,
        sqftText,
        sortedListings.map((listing) => `MLS ${listing.mls_number}`).join(", "),
      ],
      cta: isSpring ? "View Nearby Perks" : "Want To Live Here?",
      secondaryActions: isSpring ? ["Explore the Neighborhood", "Directions", "Save"] : ["Contact Legends Real Estate", "Directions", "Save"],
    },
    raw: {
      luxuryPresenceBuilding: true,
      ...(springProfile || {}),
      legendsResidentialContent: residentialContent,
      listings: sortedListings,
      panelContent: {
        title: building.name,
        subhead: isSpring ? "Seaholm District · 300 Bowie Street" : `${listingCountText} available`,
        body: summary,
      },
    },
  };
});

export const luxuryPresenceBuildingPlaces = luxuryPresenceBuildings;

export const luxuryPresenceInventorySummary = {
  source: "Legends listing feed",
  generatedAt: "2026-06-04",
  buildingCount: luxuryPresenceBuildings.length,
  listingCount: luxuryPresenceListings.length,
  rejectedMissingRequiredFields: 0,
};
