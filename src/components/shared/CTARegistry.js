import { ROUTES } from "@/lib/routes";

export const CTA_REGISTRY = {
  openMap: { label: "Open the Map", href: ROUTES.explore },
  explore: { label: "Explore Downtown", href: ROUTES.explore },
  getCard: { label: "Get Your Card", href: ROUTES.residentAppCard },
  becomePartner: { label: "Become a Partner", href: ROUTES.partners },
  openResidentApp: { label: "Open Resident App", href: ROUTES.residents },
  openSaved: { label: "Open Saved", href: ROUTES.residentAppSaved },
  openEvents: { label: "Open events", href: ROUTES.events },
  happyHourMap: { label: "Happy hour walking map", href: ROUTES.happyHourWalkingMap },
  partnerOverview: { label: "Partner Overview", href: ROUTES.partners },
  seePartnerFit: { label: "See how it works for you", href: ROUTES.partners },
  startPilot: { label: "Start the Pilot", href: ROUTES.partnerWorkspace },
  openBuildings: { label: "Open Buildings", href: ROUTES.partnerProperties },
  openHotels: { label: "Open Hotels", href: ROUTES.partnerHotels },
  openVenues: { label: "Open Venues", href: ROUTES.partnerVenues },
  openBrands: { label: "Open Brands", href: ROUTES.partnerBrands },
  openCivic: { label: "Open Civic", href: ROUTES.partnerCivic },
  openDashboard: { label: "Open Dashboard", href: ROUTES.partnerDashboard },
  contact: { label: "Contact Us", href: "mailto:hello@downtownperks.com" },
};

export function getSharedCta(key) {
  return CTA_REGISTRY[key] || null;
}
