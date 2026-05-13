import { ROUTES } from './routes.js';

export const ctaRegistry = {
  openMap: {
    id: 'openMap',
    label: 'Open Map',
    to: ROUTES.map,
    variant: 'primary',
    description: 'Navigate to the interactive downtown map',
  },
  getCard: {
    id: 'getCard',
    label: 'Get Your Perks Card',
    to: ROUTES.card,
    variant: 'secondary',
    description: 'Get your downtown resident perks card',
  },
  viewEvents: {
    id: 'viewEvents',
    label: 'View Events',
    to: ROUTES.events,
    variant: 'secondary',
    description: 'Browse upcoming downtown events',
  },
  becomePartner: {
    id: 'becomePartner',
    label: 'Become a Partner',
    to: ROUTES.partners,
    variant: 'primary',
    description: 'Join the Downtown Perks partner network',
  },
  partnerDashboard: {
    id: 'partnerDashboard',
    label: 'Partner Dashboard',
    to: ROUTES.partnerDashboard,
    variant: 'secondary',
    description: 'Access your partner analytics dashboard',
  },
};

export function getCTA(id) {
  return ctaRegistry[id] ?? null;
}
