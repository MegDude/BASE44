const LEGENDS_IMAGE_BASE = "/images/legends-listings";

const BUILDING_LOOKUP = {
  "301 west ave": {
    name: "The Independent",
    district: "Seaholm",
    coordinates: [30.267451, -97.750793],
    buildingExterior: "/buildings/independent.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/6dd28e9b.jpeg`,
  },
  "222 west ave": {
    name: "Seaholm Residences",
    district: "Seaholm",
    coordinates: [30.2672, -97.75148],
    buildingExterior: "/buildings/seaholm.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
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
    buildingExterior: `${LEGENDS_IMAGE_BASE}/3854745b.jpeg`,
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/1414e381.jpeg`,
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
    buildingExterior: "/hotels/austin-proper.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/63bd283b-6525-4a58-85bf-e13564f11b1c.avif`,
  },
  "70 rainey": {
    name: "70 Rainey",
    district: "Rainey",
    coordinates: [30.2583, -97.7383],
    buildingExterior: "/buildings/70-rainey.webp",
    lifestyleImage: "/images/map-entities/properties/70-rainey.jpeg",
  },
  "44 east ave": {
    name: "44 East",
    district: "Rainey",
    coordinates: [30.25894, -97.7391],
    buildingExterior: "/buildings/44-east.webp",
    lifestyleImage: "/buildings/44-east.webp",
  },
  "300 bowie": {
    name: "Spring Condominiums",
    district: "Seaholm",
    coordinates: [30.2692, -97.7508],
    buildingExterior: "/buildings/spring.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/3854745b.jpeg`,
  },
  "54 rainey": {
    name: "Milago",
    district: "Rainey",
    coordinates: [30.25878, -97.73988],
    buildingExterior: "/buildings/milago.webp",
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
  },
  "1212 guadalupe": {
    name: "1212 Guadalupe",
    district: "Downtown Core",
    coordinates: [30.27542, -97.7431],
    buildingExterior: `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
    lifestyleImage: `${LEGENDS_IMAGE_BASE}/83dcefb7 (2).jpeg`,
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
  ["1212 Guadalupe", "1212 Guadalupe ST #601", "$220,000", 1, 1, 454, "3119350", "Downtown Core", "1212 guadalupe", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["44 East", "44 East Ave #3304", "$1,125,000", 2, 2, 1172, "8947667", "Rainey", "44 east ave", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["Milago", "54 Rainey ST #404", "$550,000", 2, 2, 1189, "9558786", "Rainey", "54 rainey", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
  ["Brazos Place", "800 Brazos ST #1111", "$335,000", 1, 1, 623, "4696550", "Congress", "800 brazos", `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`],
];

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
  const primaryImage = imageRef || building.lifestyleImage || building.buildingExterior;
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
    galleryImages: [primaryImage, buildingExterior].filter(Boolean).filter((item, index, list) => list.indexOf(item) === index),
    listing_url: "",
    property_type: "Condominium",
    listing_type: listingType,
    zip_code: "78701",
    source: "Luxury Presence MLS feed",
    updated_at: "2026-06-04",
    panelTitle: building.name || buildingName,
    panelSubhead: `${beds} Bedroom Residence`,
    panelBody: `${beds} bed, ${baths} bath residence at ${building.name || buildingName} with ${formatNumber(sqft)} square feet, MLS ${mlsNumber}, and direct access to nearby downtown routines, resident perks, and walkable plans.`,
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
      category_key: "residential_property luxury_presence building active_listings",
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
      listings: [],
      source: "Luxury Presence MLS feed enriched for Downtown Perks",
      updated_at: "2026-06-04",
    };

    current.listings.push(listing);
    buildings[key] = current;
    return buildings;
  }, {})
).map((building) => {
  const sortedListings = [...building.listings].sort((a, b) => moneyNumber(a.price) - moneyNumber(b.price));
  const priceText = priceRange(sortedListings);
  const beds = [...new Set(sortedListings.map((listing) => listing.beds).filter(Boolean))].sort((a, b) => a - b);
  const sqftValues = sortedListings.map((listing) => Number(listing.sqft)).filter(Boolean).sort((a, b) => a - b);
  const bedroomText = beds.length === 1 ? `${beds[0]} bedroom` : `${beds[0]}-${beds[beds.length - 1]} bedroom`;
  const sqftText = sqftValues.length ? `${formatNumber(sqftValues[0])}-${formatNumber(sqftValues[sqftValues.length - 1])} sq ft` : "Square footage available";
  const listingCountText = `${sortedListings.length} active listing${sortedListings.length === 1 ? "" : "s"}`;
  const summary = `Want to live here? ${building.name} has ${listingCountText} from ${priceText}, including ${bedroomText} residences and ${sqftText}. Contact Legends Real Estate for availability, showing options, and nearby context residents can actually use.`;

  return {
    ...building,
    listings: sortedListings,
    activeListings: sortedListings.length,
    averagePrice: Math.round(sortedListings.reduce((sum, listing) => sum + moneyNumber(listing.price), 0) / sortedListings.length),
    priceRange: priceText,
    sqftRange: sqftText,
    listingSummary: `${listingCountText} · ${priceText}`,
    summary,
    deals_offers: `Want To Live Here? ${listingCountText} through Legends Real Estate.`,
    specials: `${priceText} · ${bedroomText} residences · MLS-backed availability`,
    panelContent: {
      title: building.name,
      subhead: `${listingCountText} available`,
      body: summary,
      facts: [
        priceText,
        bedroomText,
        sqftText,
        sortedListings.map((listing) => `MLS ${listing.mls_number}`).join(", "),
      ],
      cta: "Want To Live Here?",
      secondaryActions: ["Contact Legends Real Estate", "Directions", "Save"],
    },
    raw: {
      luxuryPresenceBuilding: true,
      listings: sortedListings,
      panelContent: {
        title: building.name,
        subhead: `${listingCountText} available`,
        body: summary,
      },
    },
  };
});

export const luxuryPresenceBuildingPlaces = luxuryPresenceBuildings;

export const luxuryPresenceInventorySummary = {
  source: "Luxury Presence MLS feed",
  generatedAt: "2026-06-04",
  buildingCount: luxuryPresenceBuildings.length,
  listingCount: luxuryPresenceListings.length,
  rejectedMissingRequiredFields: 0,
};
