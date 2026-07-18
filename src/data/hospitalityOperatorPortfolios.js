const ACTIVE = "active_verified";
const REVIEW = "relationship_review";

function concept(id, name, sourceUrl, aliases = [], extra = {}) {
  return { id, name, sourceUrl, aliases, status: ACTIVE, market: "Austin", ...extra };
}

export const hospitalityOperatorPortfolios = [
  {
    id: "mml-hospitality", name: "MML Hospitality", website: "https://mmlhospitality.com/", sourceLabel: "Official MML Hospitality portfolio",
    keyPeople: ["Larry McGuire", "Tom Moorman", "Liz Lambert"], summary: "Austin restaurants and hospitality concepts operated by MML Hospitality.",
    concepts: [
      concept("mml-jeffreys", "Jeffrey's", "https://mmlhospitality.com/restaurants/", ["jeffrey's", "jeffreys"]),
      concept("mml-josephine-house", "Josephine House", "https://mmlhospitality.com/restaurants/"),
      concept("mml-clarks-austin", "Clark's Oyster Bar", "https://mmlhospitality.com/restaurants/", ["clark's oyster bar", "clarks oyster bar"]),
      concept("mml-perlas", "Perla's", "https://mmlhospitality.com/restaurants/", ["perla's", "perlas"]),
      concept("mml-junes", "June's All Day", "https://mmlhospitality.com/restaurants/", ["june's all day", "junes all day"]),
      concept("mml-sammies", "Sammie's", "https://mmlhospitality.com/restaurants/", ["sammie's", "sammies"]),
      concept("mml-swedish-hill", "Swedish Hill", "https://mmlhospitality.com/restaurants/", ["little swedish hill bakery", "swedish hill"]),
      concept("mml-pool-burger", "Pool Burger", "https://mmlhospitality.com/restaurants/"),
      { ...concept("mml-hotel-magdalena-review", "Hotel Magdalena", "https://mmlhospitality.com/hotels/"), status: REVIEW, reviewNote: "Not listed in MML Hospitality's current hotel portfolio." },
      { ...concept("mml-hotel-saint-cecilia-review", "Hotel Saint Cecilia", "https://mmlhospitality.com/hotels/"), status: REVIEW, reviewNote: "Not listed in MML Hospitality's current hotel portfolio." },
    ],
  },
  {
    id: "new-waterloo", name: "New Waterloo", website: "https://newwaterloo.com/who-we-are/our-places", sourceLabel: "Official New Waterloo portfolio",
    keyPeople: ["Executive leadership", "Hospitality operations"], summary: "Current Austin hospitality concepts and portfolio relationships from New Waterloo.",
    concepts: [
      concept("new-waterloo-manana", "Mañana", "https://newwaterloo.com/who-we-are/our-places/maana", ["manana", "mañana", "mañana dos"]),
      concept("new-waterloo-la-condesa", "La Condesa", "https://newwaterloo.com/who-we-are/our-places"),
      concept("new-waterloo-albert-hotel", "Albert Hotel", "https://newwaterloo.com/who-we-are/our-places/albert-hotel", [], { market: "Fredericksburg", status: "external_market" }),
      ...[["new-waterloo-south-congress-hotel-review", "South Congress Hotel"], ["new-waterloo-carpenter-hotel-review", "The Carpenter Hotel"], ["new-waterloo-cafe-no-se-review", "Café No Sé"], ["new-waterloo-central-machine-works-review", "Central Machine Works"]].map(([id, name]) => ({
        ...concept(id, name, "https://newwaterloo.com/who-we-are/our-places"), status: REVIEW, reviewNote: "Not listed in New Waterloo's current Our Places portfolio.",
      })),
    ],
  },
  {
    id: "white-lodging-austin", name: "White Lodging Austin", website: "https://www.whitelodging.com/restaurants/brands", sourceLabel: "Official White Lodging restaurant portfolio",
    keyPeople: ["Austin Marriott Downtown leadership", "JW Marriott Austin leadership"], summary: "Austin hotel restaurant concepts operated by White Lodging.",
    concepts: [
      concept("white-lodging-deans-austin", "Dean's Italian Steakhouse", "https://www.whitelodging.com/case-studies/deans-italian-steakhouse-austin", ["dean's italian steakhouse", "deans italian steakhouse"], { parentLocation: "JW Marriott Austin" }),
      concept("white-lodging-zanzibar-austin", "Zanzibar", "https://www.whitelodging.com/restaurants/brands", [], { parentLocation: "Austin Marriott Downtown" }),
    ],
  },
  {
    id: "emmer-rye-hospitality", name: "Emmer & Rye Hospitality Group", website: "https://emmerhospitality.com/austin-concepts", sourceLabel: "Official Emmer & Rye Hospitality Group portfolio",
    keyPeople: ["Kevin Fink", "Tavel Bristol-Joseph"], summary: "Austin restaurants led by Emmer & Rye Hospitality Group.",
    concepts: [
      concept("emmer-rye-group-emmer-rye", "Emmer & Rye", "https://emmerhospitality.com/austin-concepts", ["emmer and rye"]),
      concept("emmer-rye-group-hestia", "Hestia", "https://emmerhospitality.com/austin-concepts"),
      concept("emmer-rye-group-canje", "Canje", "https://emmerhospitality.com/austin-concepts"),
      concept("emmer-rye-group-ezov", "Ezov", "https://emmerhospitality.com/austin-concepts"),
      concept("emmer-rye-group-kalimotxo", "Kalimotxo", "https://emmerhospitality.com/austin-concepts"),
      concept("emmer-rye-group-leftys", "Lefty's Day & Night", "https://emmerhospitality.com/austin-concepts", ["lefty's day and night", "leftys day night"]),
    ],
  },
  {
    id: "hai-hospitality", name: "Hai Hospitality", website: "https://www.uchirestaurants.com/", sourceLabel: "Official Hai Hospitality and Uchi Restaurants portfolio",
    keyPeople: ["Tyson Cole"], summary: "Austin Uchi-family restaurants from Hai Hospitality.",
    concepts: [
      concept("hai-uchi-austin", "Uchi", "https://uchi.uchirestaurants.com/location/sushi-austin/"),
      concept("hai-uchiko-austin", "Uchiko", "https://uchiko.uchirestaurants.com/location/sushi-austin/"),
      concept("hai-uchiba-austin", "Uchibā", "https://uchiba.uchirestaurants.com/location/sushi-austin/", ["uchiba", "uchibā"]),
      concept("hai-loro-austin", "Loro", "https://www.haihospitality.com/"),
    ],
  },
];

function normalized(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

const conceptIndex = new Map();
hospitalityOperatorPortfolios.forEach((portfolio) => portfolio.concepts.forEach((item) => {
  [item.id, item.name, ...(item.aliases || [])].forEach((term) => conceptIndex.set(normalized(term), { portfolio, concept: item }));
}));

export function getHospitalityOperatorConcept(entity = {}) {
  return [entity.id, entity.name, entity.title, entity.slug].filter(Boolean).map(normalized).map((term) => conceptIndex.get(term)).find(Boolean);
}

export function applyHospitalityOperatorGovernance(entity = {}) {
  const match = getHospitalityOperatorConcept(entity);
  if (!match) return entity;
  const { portfolio, concept: item } = match;
  const isCurrent = item.status === ACTIVE;
  return {
    ...entity,
    ...(isCurrent ? {
      type: "venue",
      kind: "venue",
      entityType: "venue",
      entity_type: "venue",
      sourceType: "venue",
      markerType: "venue",
      detailDrawerType: "venue",
      category: "Restaurant / Hospitality",
    } : {}),
    operatorPortfolioId: portfolio.id, operatorPortfolioName: portfolio.name, operatorEntityId: item.id,
    operatingStatus: item.status, verificationStatus: isCurrent ? "verified" : "needs_relationship_verification",
    sourceUrl: item.sourceUrl, sourceLabel: portfolio.sourceLabel, parentLocation: item.parentLocation || entity.parentLocation,
    offer: "", perk: null, perks: [], hasPerk: false, deals_offers: "", specials: "",
    searchKeywords: [...new Set([...(entity.searchKeywords || []), portfolio.name, ...portfolio.keyPeople, ...(item.aliases || [])])],
    raw: { ...(entity.raw || {}), operatorPortfolioId: portfolio.id, operatorEntityId: item.id, operatingStatus: item.status, verificationStatus: isCurrent ? "verified" : "needs_relationship_verification", sourceUrl: item.sourceUrl, offer: "", perk: null, perks: [], hasPerk: false, deals_offers: "", specials: "" },
  };
}

export const hospitalityOperatorPortfolioEntities = hospitalityOperatorPortfolios.map((portfolio) => ({
  id: `${portfolio.id}-portfolio`, name: portfolio.name, title: portfolio.name, type: "portfolio", kind: "portfolio", entityType: "portfolio", detailDrawerType: "portfolio", detailEntityType: "portfolio",
  sourceType: "launch_map", pinKey: "portfolio", category: "Hospitality portfolio",
  category_key: [portfolio.name, ...portfolio.keyPeople, ...portfolio.concepts.map((item) => item.name), "hospitality portfolio"].join(" ").toLowerCase(),
  summary: portfolio.summary, description: portfolio.summary, district: "Austin", portfolioId: portfolio.id,
  operatingStatus: ACTIVE, verificationStatus: "verified", publicationStatus: "published", mapVisibility: "search_only", hasExactMarker: false, launchMapPin: true, coords: [],
  source: portfolio.sourceLabel, sourceUrl: portfolio.website, searchKeywords: [...portfolio.keyPeople, ...portfolio.concepts.map((item) => item.name)],
  portfolio: { website: portfolio.website, keyPeople: portfolio.keyPeople, activeLocations: portfolio.concepts.filter((item) => item.status === ACTIVE).map((item) => item.id), concepts: portfolio.concepts },
}));
