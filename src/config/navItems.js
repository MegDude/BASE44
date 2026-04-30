import { ROUTES } from "@/config/routes";

export const PRIMARY_NAV_ITEMS = [
  { label: "Residents", to: ROUTES.residents },
  { label: "Map", to: ROUTES.explore },
  { label: "Ask the Map", to: ROUTES.askMap },
  { label: "Events", to: ROUTES.events },
  { label: "Perks Card", to: ROUTES.card },
  { label: "Partners", to: ROUTES.partners },
  { label: "About", to: ROUTES.about },
];

export const PARTNER_NAV_ITEMS = [
  { label: "Overview", to: ROUTES.partners },
  { label: "Properties", to: ROUTES.partnerProperties },
  { label: "Hotels", to: ROUTES.partnerHotelsLegacy },
  { label: "Venues", to: ROUTES.partnerVenues },
  { label: "Brands", to: ROUTES.partnerBrands },
  { label: "Civic", to: ROUTES.partnerCivic },
  { label: "Dashboard", to: ROUTES.partnerDashboard },
];

export const FOOTER_NAV_GROUPS = {
  Explore: [
    { to: ROUTES.explore, label: "Live Map" },
    { to: ROUTES.events, label: "Events" },
    { to: ROUTES.perks, label: "Perks" },
    { to: ROUTES.residentAppCard, label: "Perks Card" },
    { to: ROUTES.about, label: "About" },
  ],
  Partners: [
    { to: ROUTES.partnerProperties, label: "Properties" },
    { to: ROUTES.partnerHotelsLegacy, label: "Hotels" },
    { to: ROUTES.partnerVenues, label: "Venues" },
    { to: ROUTES.partnerBrands, label: "Brands" },
    { to: ROUTES.partnerCivic, label: "Civic" },
  ],
  Platform: [
    { to: ROUTES.partners, label: "Partner Overview" },
    { to: ROUTES.partnerWorkspace, label: "Partner Workspace" },
    { to: ROUTES.partnerDashboard, label: "Dashboard" },
  ],
  "Start Here": [
    { to: ROUTES.brands, label: "Brand Directory" },
    { to: "mailto:partners@downtownperks.com", label: "Contact" },
  ],
};
