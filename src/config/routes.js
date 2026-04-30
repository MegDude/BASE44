import { ROUTES } from "@/lib/routes";

export const CANONICAL_ROUTES = {
  home: ROUTES.home,
  explore: ROUTES.explore,
  askMap: ROUTES.askMap,
  events: ROUTES.events,
  perks: ROUTES.perks,
  card: ROUTES.card,
  residents: ROUTES.residents,
  about: ROUTES.about,
  partners: ROUTES.partners,
  partnerProperties: ROUTES.partnerProperties,
  partnerHotels: ROUTES.partnerHotelsLegacy,
  partnerHospitality: ROUTES.partnerHospitality,
  partnerVenues: ROUTES.partnerVenues,
  partnerBrands: ROUTES.partnerBrands,
  partnerCivic: ROUTES.partnerCivic,
  partnerDashboard: ROUTES.partnerDashboard,
  partnerWorkspace: ROUTES.partnerWorkspace,
  residentApp: ROUTES.residentApp,
  residentAppCard: ROUTES.residentAppCard,
  adminQa: "/admin/qa",
};

export const ROUTE_INVENTORY = [
  { route: CANONICAL_ROUTES.home, shell: "PublicShell", job: "Map-first entry", primaryCta: "Open Map", dataDependency: "map-data" },
  { route: CANONICAL_ROUTES.explore, shell: "PublicShell", job: "Decision engine", primaryCta: "Ask the Map", dataDependency: "ask-map + map-data" },
  { route: CANONICAL_ROUTES.askMap, shell: "PublicShell", job: "AI command surface", primaryCta: "Ask the Map", dataDependency: "ask-map + map-data" },
  { route: CANONICAL_ROUTES.events, shell: "PublicShell", job: "Time-first discovery", primaryCta: "View on Map", dataDependency: "map-data" },
  { route: CANONICAL_ROUTES.card, shell: "PublicShell", job: "Public card explainer", primaryCta: "Get Your Card", dataDependency: "resident intake" },
  { route: CANONICAL_ROUTES.residents, shell: "PublicShell", job: "Resident utility explainer", primaryCta: "Open Map", dataDependency: "map-data" },
  { route: CANONICAL_ROUTES.about, shell: "PublicShell", job: "Plain-language product overview", primaryCta: "Open Map", dataDependency: "none" },
  { route: CANONICAL_ROUTES.partners, shell: "PublicShell", job: "Partner overview", primaryCta: "Become a Partner", dataDependency: "partner content" },
  { route: CANONICAL_ROUTES.partnerDashboard, shell: "PartnerPortalShell", job: "Proof and signal layer", primaryCta: "What to do next", dataDependency: "analytics events" },
  { route: CANONICAL_ROUTES.partnerWorkspace, shell: "PartnerPortalShell", job: "Offers and listing management", primaryCta: "Publish", dataDependency: "partner data" },
  { route: CANONICAL_ROUTES.adminQa, shell: "AdminShell", job: "QA and drift detection", primaryCta: "Run QA", dataDependency: "app state" },
];

export { ROUTES };
