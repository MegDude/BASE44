export const platformDesignTokens = {
  color: ["--color-navy", "--color-navy-secondary", "--color-gold", "--color-white", "--color-border"],
  type: ["--font-product"],
  radius: ["--radius-control", "--radius-panel"],
  size: ["--control-height", "--page-padding", "--mobile-nav-clearance", "--content-max-width"],
  motion: ["--duration-fast", "--duration-standard", "--duration-panel", "--ease-standard"],
  safeArea: ["--safe-area-top", "--safe-area-bottom"],
  zIndex: ["--z-app-header", "--z-bottom-nav", "--z-drawer", "--z-modal", "--z-toast"],
} as const;

export const platformPrimitiveRegistry = {
  structure: ["PublicHeader", "AppHeader", "MobileTopBar", "BottomNavigation", "WorkspaceSidebar", "WorkspaceMobileNav", "ScopeSelector", "PageContainer", "SectionHeader", "StickyActionRegion", "Footer"],
  inputs: ["Button", "IconButton", "TextAction", "Input", "Textarea", "Select", "MultiSelect", "Checkbox", "RadioGroup", "Toggle", "Search", "Filter", "Sort", "DateTimeField", "FileUploader", "Stepper"],
  content: ["Card", "ListRow", "EntityRow", "MetricBlock", "DetailPanel", "StatusBadge", "Tabs", "Accordion", "Table", "MobileList", "Pagination"],
  feedback: ["EmptyState", "LoadingState", "Skeleton", "Alert", "Toast", "ErrorState", "SuccessState", "ConfirmationScreen", "ProgressIndicator"],
  overlays: ["Drawer", "BottomSheet", "Modal", "Tooltip"],
} as const;

export const allowedMarketingHandoffParams = [
  "returnTo",
  "entityId",
  "partnerType",
  "plan",
  "sku",
  "checkoutKey",
  "billingMode",
  "modules",
  "organizationId",
  "portfolioId",
  "listingId",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

export const authenticatedPageAnatomy = [
  "authorized-context-or-scope",
  "page-title",
  "supporting-sentence",
  "one-primary-action",
  "main-task-content",
  "secondary-context",
  "persistent-navigation",
] as const;

export const residentNavigation = ["Home", "Map", "Perks", "Events", "Saved", "Card"] as const;

export const residentHomeOrder = [
  "Greeting + eligible building",
  "Open map",
  "Resident pass",
  "Happening now",
  "Nearby perks",
  "Upcoming events",
  "Civic updates",
  "Saved and upcoming",
  "Recent activity",
] as const;

export const residentMapDetailOrder = [
  "Media",
  "Identity",
  "Metadata",
  "Primary action",
  "Secondary actions",
  "Explanation",
  "Value",
  "Terms",
  "Nearby",
  "Source",
] as const;

export const partnerWorkspaceRoutes = [
  "overview",
  "map",
  "offers",
  "events",
  "campaigns",
  "broadcasts",
  "redemptions",
  "performance",
  "audience",
  "analytics",
  "reports",
  "sources",
  "automations",
  "media",
  "team",
  "settings",
] as const;

export const partnerRegistrationSequence = [
  "Partner type",
  "Organization",
  "Location or portfolio",
  "Contact",
  "Plan and modules",
  "Review",
  "Checkout",
  "Confirmation",
  "Workspace activation",
] as const;

export const adminScopeRequirements = [
  "server-authorized",
  "url-aware",
  "desktop-searchable",
  "mobile-bottom-sheet",
  "hidden-without-switching-authority",
  "revalidated-on-change",
] as const;

export const authorizationNegativeCases = [
  "cross-resident-data",
  "cross-property-data",
  "cross-organization-data",
  "cross-portfolio-data",
  "cross-listing-data",
  "unlicensed-module",
  "admin-endpoint",
  "platform-wide-without-platform-role",
] as const;

export const platformReleaseGates = [
  "visual-continuity",
  "functional-wiring",
  "intent-persistence",
  "iphone-15-mobile-acceptance",
  "authorization-negative-tests",
  "accessibility-basics",
  "preview-before-production",
] as const;

export const attachmentReviewLedger = [
  {
    attachment: "Unified Product-System Refactor",
    decision: "Implement through BASE44 platform shell, tokens, shared primitives, server-authorized scope, and incremental review PRs; do not edit marketing.",
  },
  {
    attachment: "Two Builds, One Downtown Perks Product",
    decision: "Keep marketing and platform as separate Vercel projects governed by shared tokens, handoff params, and cross-project release gates.",
  },
  {
    attachment: "Unify Marketing-to-Platform Experience",
    decision: "Use marketing as visual reference and refactor authenticated surfaces onto the platform token/component contract without restructuring marketing IA.",
  },
  {
    attachment: "Repeated Unified Product-System Refactor",
    decision: "Same directive as attachment one; tracked once in the source-controlled governance contract and release gates.",
  },
] as const;
