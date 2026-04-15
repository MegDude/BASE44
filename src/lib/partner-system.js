/**
 * Unified Partner System Constants
 * Single source of truth for spacing, rhythm, and visual standards
 */

export const PARTNER_SPACING = {
  // Section spacing
  sectionTop: 'pt-16 md:pt-24',
  sectionBottom: 'pb-16 md:pb-24',
  sectionVertical: 'py-16 md:py-24',
  
  // Hero spacing (landing pages + individual partner pages)
  heroTop: 'pt-20 md:pt-32',
  heroBottom: 'pb-16 md:pb-24',
  heroVertical: 'pt-20 md:pt-32 pb-16 md:pb-24',
  
  // Subsection spacing
  subsectionTop: 'pt-12 md:pt-16',
  subsectionBottom: 'pb-12 md:pb-16',
  subsectionVertical: 'py-12 md:py-16',
  
  // Container padding
  containerPaddingMobile: 'px-4 md:px-6',
  containerPaddingDesktop: 'px-6 lg:px-8',
  
  // Grid gaps
  gridGapSmall: 'gap-3 md:gap-4',
  gridGapMedium: 'gap-6 md:gap-8',
  gridGapLarge: 'gap-8 md:gap-12',
};

export const PARTNER_GRIDS = {
  // Card grid layouts
  gridCardTwoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  gridCardThreeCol: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  gridCardFourCol: 'grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4',
  gridCardFiveCol: 'grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4',
  
  // Responsive card grids (compact on mobile)
  gridCardCompact: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4',
  
  // Use case grids (featured layouts)
  gridUseCaseTwoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  gridUseCaseFourUp: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
};

export const PARTNER_BREAKPOINTS = {
  sm: '0px',
  md: '640px',
  lg: '1024px',
  xl: '1440px',
};

export const PARTNER_COMPONENTS = [
  'PartnerShell',
  'PartnerHero',
  'PartnerEntryHero',
  'PartnerTypeCard',
  'SelectorCards',
  'PreviewModule',
  'MapExplorer',
  'HowItWorksRail',
  'ProofGrid',
  'LiveActivityFeed',
  'PlanningForm',
  'PartnerCTASection',
];

// Five visible partner categories
export const PARTNER_CATEGORIES = {
  RESIDENTIAL: 'residential',
  HOSPITALITY: 'hospitality',
  VENUES: 'venues',
  BRANDS: 'brands',
  CIVIC: 'civic',
};

export const PARTNER_ROUTES = {
  [PARTNER_CATEGORIES.RESIDENTIAL]: '/partners/residential',
  [PARTNER_CATEGORIES.HOSPITALITY]: '/partners/hotels',
  [PARTNER_CATEGORIES.VENUES]: '/partners/venues',
  [PARTNER_CATEGORIES.BRANDS]: '/partners/brands',
  [PARTNER_CATEGORIES.CIVIC]: '/partners/civic',
};