/**
 * DOWNTOWN PERKS — Product System Tokens
 *
 * This file is the repo-facing contract for the systemization pass:
 * - one typography pairing
 * - one spacing scale
 * - one radius scale
 * - one glass-first surface hierarchy
 * - one CTA and section archetype model
 *
 * Keep values here deliberately narrow so routes do not drift into
 * page-by-page visual inventions.
 */

export const TYPOGRAPHY_STACK = {
  display: "Canela",
  body: "Inter",
};

export const SECTION_ARCHETYPES = [
  "hero",
  "mode-switch",
  "live-intelligence",
  "proof-module",
  "workflow",
  "final-cta",
];

export const CTA_LABELS = {
  openMap: "Open Map",
  exploreNearby: "Explore Nearby",
  viewEvents: "View Events",
  getPerksCard: "Get the Perks Card",
  getMyCard: "Get My Card",
  viewPartnerTypes: "View Partner Types",
  startPilot: "Start the Pilot",
  checkAvailability: "Apply to Be a Partner",
};

export const COPY_MODEL = {
  productPromise: "One map. Everything nearby.",
  behavioralPromise: "Search less. Do more.",
  residentValue:
    "See what is nearby, what is on, and what is worth doing right now.",
  partnerValue: "Show up when nearby intent is already forming.",
  cardValue: "One simple card for local perks, access, and resident rewards.",
  platformValue:
    "Places, events, perks, and properties in one live downtown layer.",
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SPACING & LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export const SPACE = {
  8: "8px",
  12: "12px",
  16: "16px",
  24: "24px",
  32: "32px",
  48: "48px",
  64: "64px",
};

export const SPACING = {
  // Vertical section rhythm
  heroVertical: "py-16 md:py-24 lg:py-28",
  sectionVertical: "py-12 md:py-16 lg:py-20",
  subsectionVertical: "py-8 md:py-12 lg:py-16",
  denseVertical: "py-8 md:py-12",

  // Horizontal padding
  pagePaddingX: "px-6 md:px-8",
  sectionPaddingX: "px-6",

  // Container widths
  containerMax: "max-w-7xl",
  containerWide: "max-w-6xl",
  containerMedium: "max-w-4xl",
  containerNarrow: "max-w-2xl",

  // Card/module spacing
  cardGapTight: "gap-2 md:gap-3",
  cardGapStandard: "gap-4 md:gap-6",
  cardGapLarge: "gap-6 md:gap-8",

  // Typography spacing
  headlineSpacing: "mb-4 md:mb-5 lg:mb-6",
  bodySpacing: "mb-3 md:mb-4",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Hero headlines (narrative surfaces)
  heroHeadline:
    "font-heading text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-semibold leading-[0.94] tracking-[-0.04em]",
  
  // Section headlines (major transitions)
  sectionHeadline:
    "font-heading text-[1.9rem] md:text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.03em]",
  
  // Subsection headlines
  subsectionHeadline:
    "font-heading text-[1.4rem] md:text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.02em]",
  
  // Card/module headlines
  cardHeadline: "font-heading text-lg md:text-xl font-semibold leading-[1.15]",
  
  // Body text (standard)
  bodyLarge: "text-[1rem] md:text-[1.125rem] leading-[1.6]",
  bodyStandard: "text-[0.95rem] md:text-base leading-[1.55]",
  bodySmall: "text-sm leading-[1.5]",
  
  // UI text (compact, operational)
  uiLarge: "text-[15px] font-semibold",
  uiStandard: "text-[14px] font-medium",
  uiSmall: "text-[12px] font-medium",
  uiTiny: "text-[11px] font-semibold uppercase tracking-[0.14em]",
  
  // Supporting text
  caption: "text-[12px] text-muted-foreground",
  muted: "text-muted-foreground text-[13px]",
};

// ─────────────────────────────────────────────────────────────────────────────
// MOTION & ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export const MOTION = {
  // Section reveals (scroll-triggered)
  sectionReveal: {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45 },
  },

  // Staggered card animations
  cardReveal: (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.3, delay },
  }),

  // Drawer entrance
  drawerEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
    transition: { duration: 0.22 },
  },

  // Overlay/popover
  overlayEnter: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.18 },
  },

  // Hover elevation (cards, buttons)
  hoverLift: {
    whileHover: { y: -2 },
    transition: { duration: 0.18 },
  },

  // Tap feedback
  tapPress: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.14 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE TREATMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const SURFACE_LEVELS = {
  surface0: "bg-[var(--dp-surface-base)]",
  surface1:
    "bg-white/72 backdrop-blur-xl border border-white/40 shadow-[0_12px_36px_rgba(11,26,43,0.06)]",
  surface2:
    "bg-white/92 backdrop-blur-xl border border-[rgba(11,26,43,0.08)] shadow-[0_18px_40px_rgba(11,26,43,0.08)]",
};

export const SURFACES = {
  // Glass overlays (map, hero, floating modules)
  glassLight: SURFACE_LEVELS.surface1,
  glassDark:
    "bg-[rgba(11,26,43,0.84)] backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(2,6,23,0.36)]",

  // Solid card surfaces
  cardPrimary: `${SURFACE_LEVELS.surface2} rounded-[20px]`,
  cardMuted: "bg-[rgba(241,244,248,0.78)] rounded-[20px]",
  cardSelected:
    "bg-[rgba(11,31,51,0.06)] border border-[rgba(11,31,51,0.12)] rounded-[20px]",

  // Emphasis surfaces
  brutalistDark: "bg-[var(--dp-navy)] text-white rounded-[24px]",
  brutalistContrast:
    "bg-[var(--dp-navy)] border border-[rgba(198,168,90,0.32)] rounded-[20px]",

  // Minimal divider
  divider: "border-t border-border/40",
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTION STATES
// ─────────────────────────────────────────────────────────────────────────────

export const STATES = {
  // Button hover
  buttonHover: "hover:bg-primary/90 transition-colors duration-200",
  
  // Card hover
  cardHover: "hover:border-border hover:shadow-md transition-all duration-200",
  
  // Active state
  active: "text-primary border-primary/40 bg-primary text-primary-foreground",
  
  // Disabled state
  disabled: "opacity-50 cursor-not-allowed pointer-events-none",

  // Focus ring
  focusRing: "focus-visible:outline-2 outline-offset-2 outline-ring",
};

// ─────────────────────────────────────────────────────────────────────────────
// GRID PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const GRIDS = {
  // Bento grids (mixed content)
  bentoTwo: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  bentoThree: "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6",
  bentoCompact: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",

  // Fluid card grids
  cardFluid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",

  // Tight listing grids
  listingCompact: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4",
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS & PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULTS = {
  // Tap target minimum
  minTapTarget: "min-h-[52px] md:min-h-[56px]",

  // Border radius (consistent)
  radiusSm: "rounded-[12px]",
  radius: "rounded-[16px]",
  radiusMd: "rounded-[16px]",
  radiusLg: "rounded-[22px]",
  radiusXl: "rounded-[28px]",

  // Shadow depth
  shadowSoft: "shadow-sm shadow-black/5",
  shadowStandard: "shadow-md shadow-black/8",
  shadowStrong: "shadow-lg shadow-black/12",

  // Transition defaults
  transitionFast: "transition-all duration-200",
  transitionSmooth: "transition-all duration-300",
};
