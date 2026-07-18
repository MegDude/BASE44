const DUNLAP_SOURCE = "https://dunlapatx.com/";
const BRIDGET_SOURCE = "https://bridgetdunlap.com/";

export const DUNLAP_PORTFOLIO_ID = "dunlap-atx";

export const dunlapConcepts = [
  {
    id: "dunlap-lustre-pearl-rainey",
    name: "Lustre Pearl Rainey",
    status: "active_verified",
    market: "Austin",
    address: "94 Rainey St, Austin, TX 78701",
    latitude: 30.2591,
    longitude: -97.7381,
    sourceUrl: "https://dunlapatx.com/lustre-pearl-rainey/",
    aliases: ["lustre pearl", "lustre pearl rainey", "partner-lustre-pearl", "happy-hour-lustre-pearl"],
  },
  {
    id: "dunlap-clive-bar",
    name: "Clive Bar",
    status: "active_verified",
    market: "Austin",
    address: "609 Davis St, Austin, TX 78701",
    latitude: 30.260062,
    longitude: -97.738624,
    sourceUrl: "https://dunlapatx.com/clive-bar/",
    aliases: ["clive", "clive bar", "happy-hour-clive-bar"],
  },
  {
    id: "dunlap-lustre-pearl-east",
    name: "Lustre Pearl East",
    status: "active_verified",
    market: "Austin",
    address: "114 Linden St, Austin, TX 78702",
    sourceUrl: "https://dunlapatx.com/lustre-pearl-east/",
    aliases: ["lustre pearl east"],
  },
  {
    id: "dunlap-lustre-pearl-south",
    name: "Lustre Pearl South",
    status: "historic",
    market: "Austin",
    address: "10400 Menchaca Rd, Austin, TX 78748",
    sourceUrl: "https://dunlapatx.com/lustre-pearl-south/",
    aliases: ["lustre pearl south", "vida lee", "lil mama", "lil' mama"],
  },
  {
    id: "dunlap-lustre-pearl-denver",
    name: "Lustre Pearl Denver",
    status: "external_market",
    market: "Denver",
    sourceUrl: "https://dunlapatx.com/lustre-pearl-denver/",
    aliases: ["lustre pearl denver"],
  },
  {
    id: "dunlap-lustre-pearl-portland",
    name: "Lustre Pearl Portland",
    status: "external_market",
    market: "Portland",
    sourceUrl: "https://dunlapatx.com/lustre-pearl-portland/",
    aliases: ["lustre pearl portland"],
  },
  {
    id: "dunlap-lustre-pearl-houston",
    name: "Lustre Pearl Houston",
    status: "active_unverified",
    market: "Houston",
    sourceUrl: "https://dunlapatx.com/lustre-pearl-houston/",
    aliases: ["lustre pearl houston"],
  },
  ...[
    ["dunlap-original-lustre-pearl", "Original Lustre Pearl", ["original lustre pearl"]],
    ["dunlap-pearl-bar", "Pearl Bar", ["pearl bar"]],
    ["dunlap-bar-96", "Bar 96", ["bar 96"]],
    ["dunlap-container-bar", "Container Bar", ["container bar"]],
    ["dunlap-mettle", "Mettle", ["mettle"]],
    ["dunlap-burn", "Burn", ["burn pizza", "burn"]],
    ["dunlap-parlor-yard", "Parlor & Yard", ["parlor and yard", "parlor & yard"]],
  ].map(([id, name, aliases]) => ({ id, name, aliases, status: "historic", market: "Austin", sourceUrl: BRIDGET_SOURCE })),
];

const verifiedPublicConcepts = dunlapConcepts.filter((concept) => concept.status === "active_verified");
const conceptByAlias = new Map(
  dunlapConcepts.flatMap((concept) => [concept.id, concept.name, ...(concept.aliases || [])]
    .map((alias) => [String(alias).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), concept])),
);

function entityTerms(entity = {}) {
  return [entity.id, entity.name, entity.title, entity.slug, entity.brand]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
}

export function getDunlapConcept(entity = {}) {
  const terms = entityTerms(entity);
  return terms.map((term) => conceptByAlias.get(term)).find(Boolean)
    || dunlapConcepts.find((concept) => terms.some((term) => concept.aliases?.some((alias) => term.includes(String(alias).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()))));
}

export function applyDunlapPortfolioGovernance(entity = {}) {
  const concept = getDunlapConcept(entity);
  if (!concept) return entity;
  const isPublic = concept.status === "active_verified" && concept.market === "Austin" && Number.isFinite(concept.latitude) && Number.isFinite(concept.longitude);
  return {
    ...entity,
    id: concept.id,
    name: concept.name,
    title: concept.name,
    address: concept.address || entity.address,
    latitude: concept.latitude,
    longitude: concept.longitude,
    lat: concept.latitude,
    lng: concept.longitude,
    coords: Number.isFinite(concept.latitude) ? [concept.latitude, concept.longitude] : [],
    portfolioId: DUNLAP_PORTFOLIO_ID,
    portfolioEntityId: concept.id,
    portfolioName: "Dunlap ATX",
    operatingStatus: concept.status,
    verificationStatus: isPublic ? "verified" : "needs_operating_status_verification",
    publicationStatus: isPublic ? "published" : "draft",
    mapVisibility: isPublic ? "search_only" : "hidden",
    sourceUrl: concept.sourceUrl,
    sourceLabel: "Official Dunlap ATX website",
    offer: "",
    perk: null,
    perks: [],
    hasPerk: false,
    deals_offers: "",
    specials: "",
    searchKeywords: [...new Set([...(entity.searchKeywords || []), "Dunlap ATX", "Bridget Dunlap", ...(concept.aliases || [])])],
    raw: {
      ...(entity.raw || {}),
      portfolioId: DUNLAP_PORTFOLIO_ID,
      portfolioEntityId: concept.id,
      operatingStatus: concept.status,
      verificationStatus: isPublic ? "verified" : "needs_operating_status_verification",
      publicationStatus: isPublic ? "published" : "draft",
      mapVisibility: isPublic ? "search_only" : "hidden",
      sourceUrl: concept.sourceUrl,
      offer: "",
      perk: null,
      perks: [],
      hasPerk: false,
      deals_offers: "",
      specials: "",
    },
  };
}

export const dunlapPortfolioHub = {
  id: "dunlap-atx-portfolio",
  name: "Dunlap ATX",
  title: "Dunlap ATX",
  brand: "Bridget Dunlap",
  type: "portfolio",
  kind: "portfolio",
  entityType: "portfolio",
  detailDrawerType: "portfolio",
  detailEntityType: "portfolio",
  markerType: "portfolio",
  sourceType: "launch_map",
  pinKey: "portfolio",
  partnerType: "hospitality",
  category: "Hospitality portfolio",
  category_key: "dunlap atx bridget dunlap hospitality portfolio nightlife venues founder",
  summary: "Bridget Dunlap's hospitality portfolio, current Austin venues, and independent creative work.",
  description: "Explore verified Austin venues, portfolio history, and current creative work from Bridget Dunlap and Dunlap ATX.",
  district: "Austin",
  portfolioId: DUNLAP_PORTFOLIO_ID,
  operatingStatus: "active_verified",
  verificationStatus: "verified",
  publicationStatus: "published",
  mapVisibility: "search_only",
  hasExactMarker: false,
  launchMapPin: true,
  latitude: undefined,
  longitude: undefined,
  coords: [],
  source: "Official Dunlap ATX and Bridget Dunlap websites",
  sourceUrl: DUNLAP_SOURCE,
  searchKeywords: ["Bridget Dunlap", "Dunlap ATX", "Lustre Pearl", "Clive Bar", "hospitality portfolio"],
  portfolio: {
    founder: "Bridget Dunlap",
    website: DUNLAP_SOURCE,
    founderWebsite: BRIDGET_SOURCE,
    activeLocations: verifiedPublicConcepts.map((concept) => concept.id),
    concepts: dunlapConcepts,
    products: [
      { id: "bridget-flora", title: "Flora", meta: "$50 · Check availability", href: "https://bridgetdunlap.com/products/flora-1" },
      { id: "bridget-world-tour", title: "World Tour", meta: "$50 · Check availability", href: "https://bridgetdunlap.com/products/unisex-jersey-short-sleeve-tee" },
    ],
  },
};

export const dunlapPortfolioEntities = [dunlapPortfolioHub];
