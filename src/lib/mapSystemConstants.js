/**
 * Global map system constants
 * Enforces consistency across all map surfaces
 */

export const BREAKPOINTS = {
  sm: '0px',
  md: '640px',
  lg: '1024px',
  xl: '1440px',
};

export const CONTAINER_CONFIG = {
  maxWidth: 'max-w-7xl',
  paddingMobile: 'px-4',
  paddingTablet: 'md:px-6',
  paddingDesktop: 'lg:px-8',
};

export const BUTTON_SIZES = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-12 px-4 text-base',
  lg: 'h-14 px-6 text-lg',
};

export const MAP_LAYOUT = {
  mobile: {
    mapHeight: 'h-[calc(100vh-68px-44px-60px)]', // screen - navbar - search - filter
    searchTop: 'top-5',
    filtersHeight: 'h-16',
  },
  desktop: {
    mapWidth: 'w-2/3',
    panelWidth: 'w-1/3',
  },
};

export const DRAWER_STATES = {
  collapsed: { height: 80, label: 'collapsed' },
  mid: { height: Math.min(window?.innerHeight * 0.5 || 450, 450), label: 'mid' },
  full: { height: window?.innerHeight || 800, label: 'full' },
};

export const FILTER_CHIPS = [
  { id: 'places', label: 'Places', icon: 'MapPin', active: true },
  { id: 'events', label: 'Events', icon: 'Calendar', active: false },
  { id: 'perks', label: 'Perks', icon: 'Gift', active: false },
  { id: 'buildings', label: 'Buildings', icon: 'Building2', active: false },
  { id: 'open-now', label: 'Open now', icon: 'Clock', active: false },
  { id: 'walkable-5', label: '5 min walk', icon: 'Sparkles', active: false },
  { id: 'popular', label: 'Popular now', icon: 'TrendingUp', active: false },
  { id: 'new', label: 'New', icon: 'Star', active: false },
];

export const SEARCH_PROMPTS = [
  {
    q: 'Where do you want to go?',
    a: 'Find coffee, dinner, drinks, perks, listings, and nearby places worth leaving for.',
    fill: 'Where do you want to go?',
  },
  {
    q: 'What do you want to see?',
    a: 'Surface events, happy hours, listings, local businesses, and useful downtown signals.',
    fill: 'What do you want to see?',
  },
  {
    q: 'What do you want to do?',
    a: 'Ask the map for a plan, a place, a perk, or a partner opportunity nearby.',
    fill: 'What do you want to do?',
  },
];

export const CATEGORY_COLORS = {
  restaurant: '#B38F4F',
  bar: '#B38F4F',
  fitness: '#0B1F33',
  wellness: '#0B1F33',
  beauty: '#081521',
  retail: '#425466',
  entertainment: '#0B1F33',
  coworking: '#081521',
  hotel: '#B38F4F',
  building: '#B38F4F',
};

export const MOTION_PRESETS = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
};

export const AUSTIN_CENTER = [30.267, -97.743];

/**
 * Map state shape (for Zustand)
 */
export const initialMapState = {
  selectedId: null,
  selectedType: null,
  query: '',
  activeFilters: {},
  results: [],
  isLoading: false,
  drawerState: 'collapsed',
  mapCenter: AUSTIN_CENTER,
  mapZoom: 14,
};
