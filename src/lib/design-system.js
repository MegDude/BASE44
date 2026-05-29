/**
 * DOWNTOWN PERKS — Unified Design System
 * 
 * Foundation:
 * - Token-based color system (index.css, tailwind.config.js)
 * - Typography: Playfair Display (heading), Inter (body)
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
 * - Bento grids for mixed content structure
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
  pagePaddingX: "px-6 md:px-8",
  sectionPaddingX: "px-6",

  // Container widths
  containerMax: "max-w-6xl",
  containerWide: "max-w-6xl",
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
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },

  // Staggered card animations
  cardReveal: (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
  }),

  // Drawer entrance
  drawerEnter: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
    transition: { duration: 0.3 },
  },

  // Overlay/popover
  overlayEnter: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },

  // Hover elevation (cards, buttons)
  hoverLift: {
    whileHover: { y: -2 },
    transition: { duration: 0.2 },
  },

  // Tap feedback
  tapPress: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE TREATMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const SURFACES = {
  // Glass overlays (map, hero, floating modules)
  glassLight: "bg-white/82 backdrop-blur-md border border-[#0B1F33]/8 shadow-[0_14px_34px_rgba(11,31,51,0.04)]",
  glassDark: "bg-[#0B1F33]/88 backdrop-blur-md border border-white/10 shadow-[0_18px_46px_rgba(11,31,51,0.18)]",

  // Solid card surfaces
  cardPrimary: "bg-white/82 border border-[#0B1F33]/8 rounded-[6px] shadow-[0_14px_34px_rgba(11,31,51,0.04)]",
  cardMuted: "bg-[#F7F8FB] rounded-[6px]",
  cardSelected: "bg-[#0B1F33]/10 border border-[#B38F4F]/50 rounded-[6px]",

  // Brutalist emphasis (proof, ROI, statements)
  brutalistDark: "bg-slate-950 text-white rounded-3xl",
  brutalistContrast: "bg-navy-900 border-2 border-primary rounded-2xl",

  // Minimal divider
  divider: "border-t border-border/40",
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTION STATES
// ─────────────────────────────────────────────────────────────────────────────

export const STATES = {
  // Button hover
  buttonHover: "hover:bg-[#081521] transition-colors duration-300",
  
  // Card hover
  cardHover: "hover:border-border hover:shadow-md transition-all duration-200",
  
  // Active state
  active: "text-[#0B1F33] border-[#B38F4F]/50 bg-[#0B1F33]/10",
  
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
  bentoTwo: "grid grid-cols-1 md:grid-cols-2 gap-4",
  bentoThree: "grid grid-cols-1 md:grid-cols-3 gap-4",
  bentoCompact: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",

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
  minTapTarget: "min-h-12 md:min-h-14",

  // Border radius (consistent)
  radius: "rounded-[6px]",
  radiusSm: "rounded-sm",
  radiusLg: "rounded-[10px]",

  // Shadow depth
  shadowSoft: "shadow-[0_14px_34px_rgba(11,31,51,0.04)]",
  shadowStandard: "shadow-[0_18px_48px_rgba(11,31,51,0.06)]",
  shadowStrong: "shadow-[0_18px_46px_rgba(11,31,51,0.18)]",

  // Transition defaults
  transitionFast: "transition-all duration-200",
  transitionSmooth: "transition-all duration-300",
};
