import { ROUTES } from "@/lib/routes";

export const CTA_TYPES = Object.freeze({
  ROUTE: "route",
  MUTATION: "mutation",
  MODAL: "modal",
});

export const CTA_ROUTES = Object.freeze({
  openMap: ROUTES.explore,
  askMap: ROUTES.explore,
  explore: ROUTES.explore,
  events: ROUTES.events,
  perks: ROUTES.perks,
  card: ROUTES.card,
  venues: ROUTES.partnerVenues,
  partners: ROUTES.partners,
  fiveMinWalk: `${ROUTES.explore}?radius=5min`,
  dashboard: ROUTES.partnerDashboard,
});

export const CTA_REGISTRY = Object.freeze({
  OPEN_MAP: {
    id: "OPEN_MAP",
    label: "Open Map",
    href: CTA_ROUTES.openMap,
    type: CTA_TYPES.ROUTE,
  },
  EXPLORE_DOWNTOWN: {
    id: "EXPLORE_DOWNTOWN",
    label: "Explore Downtown",
    href: CTA_ROUTES.explore,
    type: CTA_TYPES.ROUTE,
  },
  GET_CARD: {
    id: "GET_CARD",
    label: "Get Your Card",
    href: CTA_ROUTES.card,
    type: CTA_TYPES.ROUTE,
  },
  VIEW_EVENTS: {
    id: "VIEW_EVENTS",
    label: "View Events",
    href: CTA_ROUTES.events,
    type: CTA_TYPES.ROUTE,
  },
  VIEW_RESIDENTS: {
    id: "VIEW_RESIDENTS",
    label: "View Residents",
    href: ROUTES.residents,
    type: CTA_TYPES.ROUTE,
  },
  VIEW_PARTNERS: {
    id: "VIEW_PARTNERS",
    label: "View Partners",
    href: CTA_ROUTES.partners,
    type: CTA_TYPES.ROUTE,
  },
  BECOME_PARTNER: {
    id: "BECOME_PARTNER",
    label: "Become a Partner",
    href: CTA_ROUTES.partners,
    type: CTA_TYPES.ROUTE,
  },
  PARTNER_DASHBOARD: {
    id: "PARTNER_DASHBOARD",
    label: "View Partner Dashboard",
    href: CTA_ROUTES.dashboard,
    type: CTA_TYPES.ROUTE,
  },
  SAVE: {
    id: "SAVE",
    label: "Save",
    apiAction: "SAVE_ENTITY",
    type: CTA_TYPES.MUTATION,
  },
  RSVP: {
    id: "RSVP",
    label: "RSVP",
    onClick: "OPEN_RSVP_MODAL",
    type: CTA_TYPES.MODAL,
  },
  REDEEM: {
    id: "REDEEM",
    label: "Redeem",
    apiAction: "REDEEM_ENTITY",
    type: CTA_TYPES.MUTATION,
  },
});

export function getCta(id) {
  const cta = CTA_REGISTRY[id];
  if (!cta) {
    throw new Error(`Unknown CTA id: ${id}`);
  }
  return cta;
}

export function assertCtaIsActionable(cta) {
  return Boolean(cta?.href || cta?.onClick || cta?.apiAction);
}

export const PRIMARY_SITE_CTAS = [
  CTA_REGISTRY.OPEN_MAP,
  CTA_REGISTRY.GET_CARD,
  CTA_REGISTRY.VIEW_PARTNERS,
];
