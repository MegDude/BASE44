export const ROUTES = {
  home: "/",
  residents: "/residents",
  explore: "/explore",
  map: "/map",
  events: "/events",
  happyHourWalkingMap: "/happy-hour-walking-map",
  perks: "/perks",
  card: "/card",
  about: "/about",
  buildPack: "/build-pack",
  brands: "/brands",
  partners: "/partners",
  partnerResidential: "/partners/residential",
  partnerProperties: "/partners/properties",
  partnerHospitality: "/partners/hospitality",
  partnerHotelsLegacy: "/partners/hotels",
  partnerVenues: "/partners/venues",
  partnerBrands: "/partners/brands",
  partnerCivic: "/partners/civic",
  partnerApply: "/partners/apply",
  partnerDashboard: "/partners/dashboard",
  partnerDashboardResidential: "/partners/dashboard/residential",
  partnerDashboardHospitality: "/partners/dashboard/hospitality",
  partnerDashboardVenues: "/partners/dashboard/venues",
  partnerDashboardBrands: "/partners/dashboard/brands",
  partnerDashboardCivic: "/partners/dashboard/civic",
  partnerWorkspace: "/partner-workspace",
  residentApp: "/resident-app",
  residentAppCard: "/resident-app/card",
  dashboardHub: "/dashboard",
};

export function getCanonicalPartnerRoute(partnerType) {
  switch (partnerType) {
    case "property":
    case "properties":
    case "residential":
      return ROUTES.partnerProperties;
    case "hotel":
    case "hospitality":
    case "hotels":
      return ROUTES.partnerHospitality;
    case "bars_restaurants":
    case "local_business":
    case "venue":
    case "venues":
      return ROUTES.partnerVenues;
    case "brand":
    case "brands":
      return ROUTES.partnerBrands;
    case "civic":
      return ROUTES.partnerCivic;
    default:
      return ROUTES.partners;
  }
}

export function getPartnerDashboardRoute(partnerType) {
  switch (partnerType) {
    case "property":
    case "properties":
    case "residential":
      return ROUTES.partnerDashboardResidential;
    case "hotel":
    case "hospitality":
    case "hotels":
      return ROUTES.partnerDashboardHospitality;
    case "bars_restaurants":
    case "local_business":
    case "venue":
    case "venues":
      return ROUTES.partnerDashboardVenues;
    case "brand":
    case "brands":
      return ROUTES.partnerDashboardBrands;
    case "civic":
      return ROUTES.partnerDashboardCivic;
    default:
      return ROUTES.partnerDashboard;
  }
}
