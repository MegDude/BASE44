/**
 * Unified Partner System Constants
 * Single source of truth for spacing, rhythm, and visual standards
 */
import { ROUTES } from "@/lib/routes";

export const PARTNER_SPACING = {
  // Section spacing
  sectionTop: 'pt-12 md:pt-16',
  sectionBottom: 'pb-12 md:pb-16',
  sectionVertical: 'py-12 md:py-16',
  
  // Hero spacing (landing pages + individual partner pages)
  heroTop: 'pt-16 md:pt-24',
  heroBottom: 'pb-12 md:pb-16',
  heroVertical: 'pt-16 md:pt-24 pb-12 md:pb-16',
  
  // Subsection spacing
  subsectionTop: 'pt-8 md:pt-10',
  subsectionBottom: 'pb-8 md:pb-10',
  subsectionVertical: 'py-8 md:py-10',
  
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
  [PARTNER_CATEGORIES.RESIDENTIAL]: ROUTES.partnerResidential,
  [PARTNER_CATEGORIES.HOSPITALITY]: ROUTES.partnerHotels,
  [PARTNER_CATEGORIES.VENUES]: ROUTES.partnerVenues,
  [PARTNER_CATEGORIES.BRANDS]: ROUTES.partnerBrands,
  [PARTNER_CATEGORIES.CIVIC]: ROUTES.partnerCivic,
};
