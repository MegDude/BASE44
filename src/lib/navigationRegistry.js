import { ROUTES } from './routes.js';

export const primaryNav = [
  { label: 'Map', to: ROUTES.map, id: 'map' },
  { label: 'Events', to: ROUTES.events, id: 'events' },
  { label: 'Perks Card', to: ROUTES.card, id: 'card' },
  { label: 'Partners', to: ROUTES.partners, id: 'partners' },
  { label: 'About', to: ROUTES.about, id: 'about' },
];

export const mobileNav = [
  { label: 'Map', to: ROUTES.map, id: 'map' },
  { label: 'Events', to: ROUTES.events, id: 'events' },
  { label: 'Saved', to: '/saved', id: 'saved' },
  { label: 'Card', to: ROUTES.card, id: 'card' },
];

export const footerNav = {
  Residents: [
    { label: 'Explore Map', to: ROUTES.map },
    { label: 'Events', to: ROUTES.events },
    { label: 'Perks Card', to: ROUTES.card },
    { label: 'About', to: ROUTES.about },
  ],
  Partners: [
    { label: 'Become a Partner', to: ROUTES.partners },
    { label: 'Properties', to: ROUTES.partnerProperties },
    { label: 'Venues', to: ROUTES.partnerVenues },
    { label: 'Brands', to: ROUTES.partnerBrands },
  ],
  Platform: [
    { label: 'Partner Dashboard', to: ROUTES.partnerDashboard },
    { label: 'How It Works', to: ROUTES.about },
  ],
  Legal: [
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
  ],
};
