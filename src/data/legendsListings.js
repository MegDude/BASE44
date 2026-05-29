export const LEGENDS_RECONCILIATION_NOTE = {
  rentalsProvided: 14,
  uniqueRentalsIntegrated: 13,
  salesClaimedBySource: 65,
  salesProvided: 48,
  missingSalesForReconciliation: 17,
};

const BUILDING_COORDS = {
  "222 west ave": [30.2672, -97.75148],
  "301 west ave": [30.267451, -97.750793],
  "800 w 5th st": [30.26894, -97.7504],
  "501 west ave": [30.26914, -97.75111],
  "506 w 7th st": [30.27008, -97.74726],
  "1908 san antonio": [30.2824, -97.74265],
  "505 w 7th st": [30.270087, -97.74732],
  "360 nueces st": [30.267029, -97.749595],
  "202 nueces st": [30.26595, -97.7496],
};

const LEGENDS_IMAGE_BASE = "/images/legends-listings";

const LEGENDS_IMAGE_GROUPS = {
  "222 west ave": [
    `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
    `${LEGENDS_IMAGE_BASE}/83dcefb7 (1).jpeg`,
    `${LEGENDS_IMAGE_BASE}/83dcefb7 (2).jpeg`,
    `${LEGENDS_IMAGE_BASE}/83dcefb7 (3).jpeg`,
    `${LEGENDS_IMAGE_BASE}/83dcefb7 (4).jpeg`,
    `${LEGENDS_IMAGE_BASE}/83dcefb7 (5).jpeg`,
  ],
  "301 west ave": [
    `${LEGENDS_IMAGE_BASE}/6dd28e9b.jpeg`,
    `${LEGENDS_IMAGE_BASE}/6dd28e9b (1).jpeg`,
    `${LEGENDS_IMAGE_BASE}/6abf4a82.jpeg`,
    `${LEGENDS_IMAGE_BASE}/84abfe10.jpeg`,
    `${LEGENDS_IMAGE_BASE}/84b12bae.jpeg`,
  ],
  "501 west ave": [
    `${LEGENDS_IMAGE_BASE}/3854745b.jpeg`,
    `${LEGENDS_IMAGE_BASE}/1414e381.jpeg`,
    `${LEGENDS_IMAGE_BASE}/4f5344cd.jpeg`,
    `${LEGENDS_IMAGE_BASE}/af86add3.jpeg`,
  ],
  "800 w 5th st": [
    `${LEGENDS_IMAGE_BASE}/1ad5be0d.jpeg`,
    `${LEGENDS_IMAGE_BASE}/1ad5be0d (1).jpeg`,
    `${LEGENDS_IMAGE_BASE}/d8819d45.jpeg`,
    `${LEGENDS_IMAGE_BASE}/azbtj2rjm8qa7bpld2ti copy.jpg`,
  ],
  "360 nueces st": [
    `${LEGENDS_IMAGE_BASE}/sdcuyw4dhwd2we6ymxtd.png`,
    `${LEGENDS_IMAGE_BASE}/y6irl6fpch4lh0hfs6fw.png`,
    `${LEGENDS_IMAGE_BASE}/aacdlhvpk3bq3ysj5gm9.avif`,
    `${LEGENDS_IMAGE_BASE}/knmt6mphvu2ntfdhb0bw.avif`,
    `${LEGENDS_IMAGE_BASE}/pdamk25y90wjb4fhvhpk.avif`,
  ],
  "202 nueces st": [
    `${LEGENDS_IMAGE_BASE}/63bd283b-6525-4a58-85bf-e13564f11b1c.avif`,
    `${LEGENDS_IMAGE_BASE}/d6a4d9a1-d4c5-4ff8-8261-e51fcf930655.avif`,
    `${LEGENDS_IMAGE_BASE}/fd63k3siyxdany5inwki.jpg`,
  ],
  "505 w 7th st": [
    `${LEGENDS_IMAGE_BASE}/ck80uh0lktj0hjbzvwvk.jpg`,
    `${LEGENDS_IMAGE_BASE}/e4vnxvzzfftxsw2vimfi.jpg`,
    `${LEGENDS_IMAGE_BASE}/ojutzttwbudxtkur0ld8.jpg`,
  ],
  "506 w 7th st": [
    `${LEGENDS_IMAGE_BASE}/ck80uh0lktj0hjbzvwvk.jpg`,
    `${LEGENDS_IMAGE_BASE}/e4vnxvzzfftxsw2vimfi.jpg`,
    `${LEGENDS_IMAGE_BASE}/ojutzttwbudxtkur0ld8.jpg`,
  ],
  "1908 san antonio": [
    `${LEGENDS_IMAGE_BASE}/fd63k3siyxdany5inwki.jpg`,
    `${LEGENDS_IMAGE_BASE}/4f5344cd.jpeg`,
    `${LEGENDS_IMAGE_BASE}/3854745b.jpeg`,
  ],
};

const DEFAULT_LEGENDS_IMAGES = [
  `${LEGENDS_IMAGE_BASE}/83dcefb7.jpeg`,
  `${LEGENDS_IMAGE_BASE}/3854745b.jpeg`,
  `${LEGENDS_IMAGE_BASE}/sdcuyw4dhwd2we6ymxtd.png`,
];

const RENTALS = [
  ["222 West Ave #1404", "Austin", "TX", "78701", "$4,400", 2, 2, 1123, 4],
  ["301 West Ave #4808", "Austin", "TX", "78701", "$4,200", 1, 1, 727, 5],
  ["800 W 5th St #701", "Austin", "TX", "78703", "$4,900", 2, 2, 1586, 7],
  ["800 W 5th St #1007", "Austin", "TX", "78701", "$15,000", 4, 4, 3776, 7],
  ["501 West Ave #3201", "Austin", "TX", "78701", "$13,000", 3, 3, 2517, 8],
  ["301 West Ave #2101", "Austin", "TX", "78701", "$6,000", 2, 2, 1016, 11],
  ["501 West Ave #1206", "Austin", "TX", "78701", "$2,650", 1, 1, 652, 31],
  ["301 West Ave #2902", "Austin", "TX", "78701", "$3,750", 1, 1, 684, 36],
  ["501 West Ave #703", "Austin", "TX", "78701", "$4,050", 1, 2, 930, 50],
  ["506 W 7th St #1", "Austin", "TX", "78701", "$3,500", 0, 0, 0, 57],
  ["501 West Ave #1005", "Austin", "TX", "78701", "$4,750", 1, 2, 1092, 83],
  ["301 West Ave #2708", "Austin", "TX", "78701", "$4,695", 1, 1, 999, 190],
  ["1908 San Antonio #306", "Austin", "TX", "78705", "$1,750", 1, 1, 649, 190],
];

const SALES = [
  ["301 West Ave #3208", "Austin", "TX", "78701", "$924,900", 1, 1, 1000, 0],
  ["501 West Ave #1002", "Austin", "TX", "78701", "$649,000", 1, 1, 846, 1],
  ["505 W 7th St #113", "Austin", "TX", "78701", "$324,999", 1, 1, 656, 6],
  ["301 West Ave #2008", "Austin", "TX", "78701", "$1,350,000", 2, 2, 1312, 6],
  ["222 West Ave #2910", "Austin", "TX", "78701", "$674,000", 1, 1, 821, 7],
  ["360 Nueces St #1007", "Austin", "TX", "78701", "$529,000", 1, 1, 852, 12],
  ["222 West Ave #2301", "Austin", "TX", "78701", "$2,495,000", 3, 3, 2227, 12],
  ["360 Nueces St #1303", "Austin", "TX", "78701", "$460,000", 1, 1, 728, 20],
  ["222 West Ave #2809", "Austin", "TX", "78701", "$525,000", 1, 1, 685, 20],
  ["360 Nueces St #2302", "Austin", "TX", "78701", "$799,000", 2, 2, 1059, 20],
  ["301 West Ave #2009", "Austin", "TX", "78701", "$1,100,000", 2, 2, 1106, 22],
  ["360 Nueces St #1505", "Austin", "TX", "78701", "$729,000", 2, 2, 1225, 23],
  ["222 West Ave #3008", "Austin", "TX", "78701", "$399,000", 0, 1, 558, 26],
  ["360 Nueces St #1408", "Austin", "TX", "78701", "$425,000", 1, 1, 732, 27],
  ["800 W 5th St #606", "Austin", "TX", "78703", "$699,000", 1, 1, 1161, 28],
  ["360 Nueces St #1809", "Austin", "TX", "78701", "$699,500", 2, 2, 1244, 28],
  ["222 West Ave #2207", "Austin", "TX", "78701", "$525,000", 1, 1, 685, 33],
  ["360 Nueces St #1112", "Austin", "TX", "78701", "$440,000", 1, 1, 812, 33],
  ["222 West Ave #2109", "Austin", "TX", "78701", "$499,000", 1, 1, 685, 35],
  ["360 Nueces St #2005", "Austin", "TX", "78701", "$749,000", 2, 2, 1225, 39],
  ["800 W 5th St #906", "Austin", "TX", "78703", "$585,000", 1, 1, 1161, 41],
  ["301 West Ave #1004", "Austin", "TX", "78701", "$1,390,000", 2, 2, 1474, 42],
  ["202 Nueces St #1501", "Austin", "TX", "78701", "$3,850,000", 2, 3, 2068, 42],
  ["301 West Ave #2003", "Austin", "TX", "78701", "$625,000", 1, 1, 697, 42],
  ["360 Nueces St #1417", "Austin", "TX", "78701", "$849,000", 2, 2, 1115, 44],
  ["800 W 5th St #703", "Austin", "TX", "78703", "$800,000", 1, 2, 1538, 47],
  ["360 Nueces St #2407", "Austin", "TX", "78701", "$485,000", 1, 1, 852, 47],
  ["501 West Ave #703", "Austin", "TX", "78701", "$680,000", 1, 1, 930, 50],
  ["360 Nueces St #3602", "Austin", "TX", "78701", "$895,000", 2, 2, 1059, 54],
  ["501 West Ave #3803", "Austin", "TX", "78701", "$3,999,999", 3, 4, 2822, 54],
  ["222 West Ave #1613", "Austin", "TX", "78701", "$1,175,000", 2, 2, 1360, 55],
  ["222 West Ave #1908", "Austin", "TX", "78701", "$600,000", 1, 1, 688, 61],
  ["222 West Ave #1901", "Austin", "TX", "78701", "$2,190,000", 3, 3, 2227, 68],
  ["360 Nueces St #2004", "Austin", "TX", "78701", "$699,900", 2, 2, 998, 71],
  ["360 Nueces St #2509", "Austin", "TX", "78701", "$870,000", 2, 2, 1244, 72],
  ["501 West Ave #3201", "Austin", "TX", "78701", "$2,750,000", 3, 3, 2517, 72],
  ["360 Nueces St #1805", "Austin", "TX", "78701", "$721,999", 2, 2, 1225, 75],
  ["360 Nueces St #1018", "Austin", "TX", "78701", "$459,770", 1, 1, 760, 76],
  ["202 Nueces St #1607", "Austin", "TX", "78701", "$2,995,000", 2, 3, 1931, 77],
  ["360 Nueces St #3309", "Austin", "TX", "78701", "$799,000", 2, 2, 1244, 91],
  ["501 West Ave #1207", "Austin", "TX", "78701", "$1,699,000", 2, 3, 1759, 91],
  ["222 West Ave #2605", "Austin", "TX", "78701", "$539,000", 1, 1, 650, 96],
  ["222 West Ave #2911", "Austin", "TX", "78701", "$550,000", 1, 1, 689, 97],
  ["360 Nueces St #1310", "Austin", "TX", "78701", "$449,000", 1, 1, 715, 98],
  ["360 Nueces St #1217", "Austin", "TX", "78701", "$839,900", 2, 2, 1115, 104],
  ["501 West Ave #3403", "Austin", "TX", "78701", "$2,800,000", 3, 4, 2822, 105],
  ["301 West Ave #2101", "Austin", "TX", "78701", "$899,900", 2, 2, 1077, 109],
  ["800 W 5th St #1001", "Austin", "TX", "78703", "$895,000", 2, 2, 1506, 113],
];

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseAddress(address) {
  return String(address).split("#")[0].trim().toLowerCase();
}

function withCommas(value) {
  return Number(value || 0).toLocaleString();
}

function offsetCoordinate([lat, lng], id) {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const angle = (seed % 360) * (Math.PI / 180);
  const distance = 0.00009 + (seed % 5) * 0.000018;
  return [lat + Math.sin(angle) * distance, lng + Math.cos(angle) * distance];
}

function imageSetForAddress(address, id) {
  const group = LEGENDS_IMAGE_GROUPS[baseAddress(address)] || DEFAULT_LEGENDS_IMAGES;
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = seed % group.length;
  return [...group.slice(start), ...group.slice(0, start)];
}

function listingCopy(type, priceDisplay, beds, baths, sqft, daysOnMarket) {
  if (beds === 0 && baths === 0 && sqft === 0) {
    return "Legends Real Estate has this Downtown Austin listing available, with property details to confirm directly. Send a request to get the full listing notes, availability, and showing options from the Legends team.";
  }

  const detailText = `${beds} bed • ${baths} bath • ${withCommas(sqft)} sq ft • ${daysOnMarket} days on market.`;
  if (type === "rent") {
    return `Legends Real Estate is representing this Downtown Austin rental listed at ${priceDisplay}/mo. ${detailText} Request availability, showing options, and next steps directly from the Legends team.`;
  }
  return `Legends Real Estate is representing this Downtown Austin residence listed at ${priceDisplay}. ${detailText} Request details, confirm availability, or schedule a private tour with the Legends team.`;
}

function toListing(row, type) {
  const [address, city, state, zip, price, beds, baths, sqft, daysOnMarket] = row;
  const id = `legends-${type}-${slug(address)}`;
  const coords = offsetCoordinate(BUILDING_COORDS[baseAddress(address)], id);
  const listingTypeLabel = type === "rent" ? "For Rent" : "For Sale";
  const priceDisplay = type === "rent" ? `${price}/mo` : price;
  const panelCopy = listingCopy(type, price, beds, baths, sqft, daysOnMarket);
  const gallery = imageSetForAddress(address, id);
  const prefilledMessage = type === "rent"
    ? `Hi Legends Real Estate, I’m interested in the rental listing at ${address} listed for ${price}/mo. Please send availability, showing options, and next steps.`
    : `Hi Legends Real Estate, I’m interested in the listing at ${address} listed for ${price}. Please send details, availability, and showing options.`;

  return {
    id,
    name: address,
    type: "property",
    partnerType: "properties",
    brand: "Legends Real Estate",
    pinKey: "legends",
    category: `Legends ${listingTypeLabel}`,
    category_key: `legends_${type}_listing`,
    latitude: coords[0],
    longitude: coords[1],
    image: gallery[0],
    gallery,
    district: zip === "78705" ? "West Campus" : "Downtown Austin",
    address: `${address}, ${city}, ${state} ${zip}`,
    summary: panelCopy,
    deals_offers: `Listed: ${priceDisplay}`,
    specials: `Legends listing status: ${listingTypeLabel}`,
    source: "Legends Real Estate verified listing layer",
    website: "",
    contact_phone: "",
    contact_email: "",
    legendsListing: {
      brand: "Legends Real Estate",
      listingType: type,
      listingTypeLabel,
      neighborhood: "Downtown",
      address,
      city,
      state,
      zip,
      price,
      priceDisplay,
      beds,
      baths,
      sqft,
      sqftDisplay: `${withCommas(sqft)} sq ft`,
      daysOnMarket,
      image: gallery[0],
      gallery,
      panelCopy,
      source: "residents-map",
      mapSource: "Residents Map",
      prefilledMessage,
      reconciliationNote: type === "sale" ? LEGENDS_RECONCILIATION_NOTE : undefined,
    },
  };
}

export const legendsListingPlaces = [
  ...RENTALS.map((row) => toListing(row, "rent")),
  ...SALES.map((row) => toListing(row, "sale")),
];
