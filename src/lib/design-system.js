/**
 * DOWNTOWN PERKS — Unified Design System
 * 
 * Foundation:
 * - Token-based color system (index.css, tailwind.config.js)
 * - Typography: Inter Tight (display), Inter (body), Allura (accent)
 * - Spacing: 4px base unit grid (0.5rem radius)
 * - Motion: Framer Motion (precise, fast, purposeful)
 * - Glass/Overlay system: refined, light-touch, map-aware
 * 
 * Principles:
 * - Minimalism as default (strip noise, tighten spacing)
 * - Big typography only where hierarchy needs it
 * - Glass selective (overlays, previews, map modules)
 * - Brutalism only for emphasis (proof, ROI, statements)
 * - Immersive scroll on narrative surfaces only
 * - Dark mode deliberate (map contexts, night use)
 * - Bento grids for mixed content structure
 * - One coherent interaction language across all surfaces
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SPACING & LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  // Vertical section rhythm
  heroVertical: "py-20 md:py-32 lg:py-40",
  sectionVertical: "py-16 md:py-24 lg:py-32",
  subsectionVertical: "py-12 md:py-16 lg:py-20",
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
  cardGapTight: "gap-3",
  cardGapStandard: "gap-6",
  cardGapLarge: "gap-8",

  // Typography spacing
  headlineSpacing: "mb-5 md:mb-6 lg:mb-8",
  bodySpacing: "mb-3 md:mb-4",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Hero headlines (narrative surfaces)
  heroHeadline: "font-heading text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight",
  
  // Section headlines (major transitions)
  sectionHeadline: "font-heading text-3xl md:text-4xl font-medium leading-[1.1] tracking-tight",
  
  // Subsection headlines
  subsectionHeadline: "font-heading text-2xl md:text-3xl font-medium leading-[1.15] tracking-tight",
  
  // Card/module headlines
  cardHeadline: "font-heading text-lg md:text-xl font-medium leading-[1.2]",
  
  // Body text (standard)
  bodyLarge: "text-base md:text-lg leading-relaxed",
  bodyStandard: "text-base leading-relaxed",
  bodySmall: "text-sm leading-relaxed",
  
  // UI text (compact, operational)
  uiLarge: "text-[14px] font-medium",
  uiStandard: "text-[13px] font-medium",
  uiSmall: "text-[12px] font-medium",
  uiTiny: "text-[11px] font-medium uppercase tracking-[0.12em]",
  
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
    transition: { duration: 0.6 },
  },

  // Staggered card animations
  cardReveal: (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, delay },
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
  glassLight: "bg-white/75 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5",
  glassDark: "bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/30",

  // Solid card surfaces
  cardPrimary: "bg-white border border-border/40 rounded-2xl",
  cardMuted: "bg-muted rounded-2xl",
  cardSelected: "bg-primary/5 border border-primary/20 rounded-2xl",

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
  buttonHover: "hover:bg-primary/90 transition-colors duration-200",
  
  // Card hover
  cardHover: "hover:border-border hover:shadow-md transition-all duration-200",
  
  // Active state
  active: "text-primary border-primary/40 bg-primary/5",
  
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
  bentoTwo: "grid grid-cols-1 md:grid-cols-2 gap-6",
  bentoThree: "grid grid-cols-1 md:grid-cols-3 gap-6",
  bentoCompact: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",

  // Fluid card grids
  cardFluid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",

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
  radius: "rounded-2xl",
  radiusSm: "rounded-xl",
  radiusLg: "rounded-3xl",

  // Shadow depth
  shadowSoft: "shadow-sm shadow-black/5",
  shadowStandard: "shadow-md shadow-black/8",
  shadowStrong: "shadow-lg shadow-black/12",

  // Transition defaults
  transitionFast: "transition-all duration-200",
  transitionSmooth: "transition-all duration-300",
};
