import { ROUTES } from "@/lib/routes";

export const CTA_REGISTRY = {
  explore: { label: "Explore Downtown", href: ROUTES.explore },
  getCard: { label: "Get Your Card", href: ROUTES.residentAppCard },
  becomePartner: { label: "Become a Partner", href: ROUTES.partners },
  openMap: { label: "Open Map", href: ROUTES.explore },
  openEvents: { label: "Open events", href: ROUTES.events },
  happyHourMap: { label: "Happy hour walking map", href: ROUTES.happyHourWalkingMap },
  openBrandView: { label: "Open brand view", href: ROUTES.partnerBrands },
  seePartnerFit: { label: "See how it works for you", href: ROUTES.partners },
  startPilot: { label: "Start the Pilot", href: ROUTES.partnerWorkspace },
  openBuildings: { label: "Open Buildings", href: ROUTES.partnerProperties },
  contact: { label: "Contact Us", href: "mailto:partners@downtownperks.com" },
};

export function getSharedCta(key) {
  return CTA_REGISTRY[key] || null;
}
