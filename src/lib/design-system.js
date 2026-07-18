/**
 * DOWNTOWN PERKS — Unified Design System
 * 
 * Foundation:
 * - Token-based color system (index.css, tailwind.config.js)
 * - Typography: Inter for headings, body, navigation, drawers, and map UI
 * - Spacing: compact 4px base unit grid (6px default radius)
 * - Motion: Framer Motion (precise, fast, purposeful)
 * - Surface system: architectural, light-touch, map-aware
 * 
 * Principles:
 * - Downtown intelligence layer: spatial, editorial, utility-first
 * - Minimalism as default: strip noise, tighten spacing
 * - Map-native interfaces over decorative marketing surfaces
 * - Gold only for selected states, progress, and quiet emphasis
 * - Dark mode deliberate (map contexts, night use)
 * - Rails and compact rows over card-wall layouts
 * - One coherent interaction language across all surfaces
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SPACING & LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  // Vertical section rhythm
  heroVertical: "py-20 md:py-24",
  sectionVertical: "py-14 md:py-20",
  subsectionVertical: "py-12 md:py-16",
  denseVertical: "py-8 md:py-12",

  // Horizontal padding
  pagePaddingX: "px-4 sm:px-6 lg:px-8",
  sectionPaddingX: "px-4 sm:px-6 lg:px-8",

  // Container widths
  containerMax: "max-w-7xl",
  containerWide: "max-w-7xl",
  containerMedium: "max-w-4xl",
  containerNarrow: "max-w-2xl",

  // Card/module spacing
  cardGapTight: "gap-3",
  cardGapStandard: "gap-4",
  cardGapLarge: "gap-5",

  // Typography spacing
  headlineSpacing: "mb-5 md:mb-6 lg:mb-8",
  bodySpacing: "mb-3 md:mb-4",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Hero headlines (narrative surfaces)
  heroHeadline: "font-heading text-4xl md:text-6xl font-medium leading-[1.05] tracking-normal",
  
  // Section headlines (major transitions)
  sectionHeadline: "font-heading text-3xl md:text-4xl font-medium leading-[1.1] tracking-normal",
  
  // Subsection headlines
  subsectionHeadline: "font-heading text-2xl md:text-3xl font-medium leading-[1.15] tracking-normal",
  
  // Card/module headlines
  cardHeadline: "font-heading text-lg md:text-xl font-medium leading-[1.2]",
  
  // Body text (standard)
  bodyLarge: "text-[15px] md:text-base leading-[1.7]",
  bodyStandard: "text-[14px] leading-[1.7]",
  bodySmall: "text-[13px] leading-[1.65]",
  
  // UI text (compact, operational)
  uiLarge: "text-[14px] font-medium",
  uiStandard: "text-[13px] font-medium",
  uiSmall: "text-[12px] font-medium",
  uiTiny: "text-[11px] font-medium uppercase tracking-[0.16em]",
  
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
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
  },

  // Staggered card animations
  cardReveal: (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.22, delay, ease: [0.2, 0.8, 0.2, 1] },
  }),

  // Drawer entrance
  drawerEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
  },

  // Overlay/popover
  overlayEnter: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] },
  },

  // Hover elevation (cards, buttons)
  hoverLift: {
    whileHover: { y: -2 },
    transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] },
  },

  // Tap feedback
  tapPress: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE TREATMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const SURFACES = {
  // Glass overlays (map, hero, floating modules)
  glassLight: "bg-white/90 backdrop-blur-md border border-[#0B1F33]/10 shadow-[0_8px_24px_rgba(11,31,51,0.07)]",
  glassDark: "bg-[#0B1F33]/92 backdrop-blur-md border border-white/10 shadow-[0_18px_48px_rgba(11,31,51,0.11)]",

  // Solid card surfaces
  cardPrimary: "bg-white border border-[#0B1F33]/10 rounded-[18px] shadow-[0_1px_2px_rgba(11,31,51,0.04)]",
  cardMuted: "bg-white rounded-[18px]",
  cardSelected: "bg-white border border-[#BFA46A]/60 rounded-[18px]",

  // Brutalist emphasis (proof, ROI, statements)
  brutalistDark: "bg-[#0B1F33] text-white rounded-[18px]",
  brutalistContrast: "bg-navy-900 border border-primary rounded-[18px]",

  // Minimal divider
  divider: "border-t border-border/40",
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTION STATES
// ─────────────────────────────────────────────────────────────────────────────

export const STATES = {
  // Button hover
  buttonHover: "hover:bg-[#0B1F33] transition-colors duration-300",
  
  // Card hover
  cardHover: "hover:border-border hover:shadow-md transition-all duration-200",
  
  // Active state
  active: "text-[#0B1F33] border-[#BFA46A]/50 bg-[#0B1F33]/10",
  
  // Disabled state
  disabled: "opacity-50 cursor-not-allowed pointer-events-none",

  // Focus ring
  focusRing: "focus-visible:outline-2 outline-offset-2 outline-ring",
};

// ─────────────────────────────────────────────────────────────────────────────
// GRID PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const GRIDS = {
  // Editorial grids for simple repeated content
  editorialTwo: "grid grid-cols-1 md:grid-cols-2 gap-4",
  editorialThree: "grid grid-cols-1 md:grid-cols-3 gap-4",
  editorialCompact: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",

  // Fluid card grids
  cardFluid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",

  // Tight listing grids
  listingCompact: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS & PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULTS = {
  // Tap target minimum
  minTapTarget: "min-h-11 md:min-h-12",

  // Border radius (consistent)
  radius: "rounded-[18px]",
  radiusSm: "rounded-[12px]",
  radiusLg: "rounded-[24px]",

  // Shadow depth
  shadowSoft: "shadow-[0_1px_2px_rgba(11,31,51,0.04)]",
  shadowStandard: "shadow-[0_8px_24px_rgba(11,31,51,0.07)]",
  shadowStrong: "shadow-[0_18px_48px_rgba(11,31,51,0.11)]",

  // Transition defaults
  transitionFast: "transition-all duration-200",
  transitionSmooth: "transition-all duration-200",
};
