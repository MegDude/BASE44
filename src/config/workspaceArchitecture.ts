export const workspaceStatuses = ["unlinked", "trial", "active", "suspended"] as const;
export type WorkspaceStatus = (typeof workspaceStatuses)[number];

export const workspaceEntityTypes = ["property", "hotel", "venue", "brand", "civic", "listing"] as const;
export type WorkspaceEntityType = (typeof workspaceEntityTypes)[number];

export const workspaceRoles = ["owner", "admin", "super_admin", "manager", "editor", "analyst", "viewer"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

export const workspacePlans = ["free", "starter", "growth", "pro", "enterprise"] as const;
export type WorkspacePlan = (typeof workspacePlans)[number];

export const entitlementKeys = ["analytics", "campaigns", "offers", "events", "reports", "qr", "exports", "api"] as const;
export type EntitlementKey = (typeof entitlementKeys)[number];

export type WorkspaceOrganization = {
  id: string;
  slug?: string;
  name: string;
  type: "property_group" | "hospitality_group" | "venue_group" | "brand" | "civic" | "real_estate";
  status: WorkspaceStatus;
  plan: WorkspacePlan;
  role: WorkspaceRole;
  is_demo?: boolean;
};

export type WorkspaceEntityOwnership = {
  id: string;
  organization_id: string;
  entity_id: string;
  entity_type: WorkspaceEntityType;
  display_name: string;
  map_filter?: string;
  perk_summary?: string;
  media?: {
    src: string;
    alt: string;
  };
};

export const roleMatrix: Record<string, Partial<Record<WorkspaceRole, boolean>>> = {
  reports: { owner: true, admin: true, super_admin: true, manager: true, analyst: true },
  campaigns: { owner: true, admin: true, super_admin: true, manager: true, editor: true },
  billing: { owner: true, admin: true, super_admin: true },
  team: { owner: true, admin: true, super_admin: true },
  settings: { owner: true, admin: true, super_admin: true },
};

export const planEntitlements: Record<WorkspacePlan, EntitlementKey[]> = {
  free: ["offers", "events", "qr"],
  starter: ["offers", "events", "qr", "reports"],
  growth: ["analytics", "campaigns", "offers", "events", "reports", "qr", "exports"],
  pro: ["analytics", "campaigns", "offers", "events", "reports", "qr", "exports", "api"],
  enterprise: ["analytics", "campaigns", "offers", "events", "reports", "qr", "exports", "api"],
};

export const workspaceStatusCopy: Record<WorkspaceStatus, { label: string; description: string }> = {
  unlinked: {
    label: "Unlinked",
    description: "Workspace opens without a connected partner organization. Users can select, create, or request access.",
  },
  trial: {
    label: "Trial",
    description: "Workspace is active with trial access and limited billing.",
  },
  active: {
    label: "Active",
    description: "Workspace can manage campaigns, offers, QR links, reports, and team settings.",
  },
  suspended: {
    label: "Suspended",
    description: "Workspace remains visible, but publishing and billing-sensitive actions are disabled.",
  },
};

export const demoOrganizations: WorkspaceOrganization[] = [
  {
    id: "demo-org-legends-real-estate",
    slug: "legends-real-estate",
    name: "Legends Real Estate",
    type: "real_estate",
    status: "active",
    plan: "enterprise",
    role: "owner",
    is_demo: true,
  },
  {
    id: "demo-org-larry-and-guy",
    slug: "larry-and-guy",
    name: "Larry & Guy",
    type: "venue_group",
    status: "active",
    plan: "pro",
    role: "admin",
    is_demo: true,
  },
  {
    id: "demo-org-hotel-van-zandt",
    slug: "hotel-van-zandt",
    name: "Hotel Van Zandt",
    type: "hospitality_group",
    status: "trial",
    plan: "growth",
    role: "manager",
    is_demo: true,
  },
  {
    id: "demo-org-yeti",
    slug: "yeti",
    name: "YETI",
    type: "brand",
    status: "active",
    plan: "growth",
    role: "editor",
    is_demo: true,
  },
];

export const demoEntityOwners: WorkspaceEntityOwnership[] = [
  { id: "owner-legends-real-estate", organization_id: "demo-org-legends-real-estate", entity_id: "legends-real-estate", entity_type: "brand", display_name: "Legends Real Estate", map_filter: "Legends", perk_summary: "Real estate workspace", media: { src: "/pins/downtown-perks/legends-logo-gold.svg", alt: "Legends Real Estate" } },
  { id: "owner-the-shore-4301", organization_id: "demo-org-legends-real-estate", entity_id: "luxury-presence-610-davis-st-4301-5357248", entity_type: "listing", display_name: "The Shore #4301", map_filter: "All Listings", perk_summary: "Active listing · MLS 5357248", media: { src: "/images/map/panels/the-shore-austin.jpg", alt: "The Shore condominium tower in Rainey" } },
  { id: "owner-the-shore-5003", organization_id: "demo-org-legends-real-estate", entity_id: "luxury-presence-610-davis-st-5003-1682504", entity_type: "listing", display_name: "The Shore #5003", map_filter: "All Listings", perk_summary: "Active listing · MLS 1682504", media: { src: "/images/map/panels/the-shore-austin.jpg", alt: "The Shore condominium tower in Rainey" } },
  { id: "owner-atx-cocina", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-atx-cocina", entity_type: "venue", display_name: "ATX Cocina", map_filter: "Dining", perk_summary: "Masa Moment Passport Perk" },
  { id: "owner-j-carver", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-j-carvers", entity_type: "venue", display_name: "J. Carver's", map_filter: "Dining", perk_summary: "Chophouse Passport Perk" },
  { id: "owner-red-ash", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-red-ash", entity_type: "venue", display_name: "Red Ash", map_filter: "Dining", perk_summary: "Fire Cooking Passport Perk" },
  { id: "owner-restaurant-francois", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-restaurant-francois", entity_type: "venue", display_name: "Restaurant François", map_filter: "Dining", perk_summary: "French Evening Passport Perk" },
  { id: "owner-roaring-fork", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-roaring-fork", entity_type: "venue", display_name: "Roaring Fork", map_filter: "Dining", perk_summary: "Downtown Classic Passport Perk" },
  { id: "owner-hotel-van-zandt", organization_id: "demo-org-hotel-van-zandt", entity_id: "hotel-van-zandt", entity_type: "hotel", display_name: "Hotel Van Zandt", media: { src: "/images/residential-content/the-shore-hospitality.webp", alt: "Hotel Van Zandt in the Rainey District" } },
  { id: "owner-yeti-store", organization_id: "demo-org-yeti", entity_id: "brand-yeti", entity_type: "brand", display_name: "YETI", media: { src: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg", alt: "YETI flagship store interior in downtown Austin" } },
];

export const superAdminCapabilities = [
  "view all organizations",
  "impersonate organization",
  "manage plans",
  "manage billing",
  "manage campaigns",
  "manage content",
  "manage approvals",
] as const;

export const publicDataRules = {
  routes: ["Map", "Events", "Perks", "Properties", "Hotels", "Buildings", "Amenities"],
  allowedLookupKeys: ["slug", "id", "buildingId", "entityId"],
  forbiddenRequirements: ["currentUser", "auth token", "workspace membership"],
} as const;

export function getOrganizationEntities(organizationId: string) {
  return demoEntityOwners.filter((owner) => owner.organization_id === organizationId);
}

function normalizeWorkspaceLookup(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveWorkspaceOrganization(input: {
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationName?: string | null;
} = {}) {
  const directId = String(input.organizationId || "").trim();
  if (directId) {
    const byId = demoOrganizations.find((organization) => organization.id === directId);
    if (byId) return byId;
  }

  const candidates = [input.organizationSlug, input.organizationName]
    .map(normalizeWorkspaceLookup)
    .filter(Boolean);
  if (!candidates.length) return null;

  return demoOrganizations.find((organization) => {
    const values = [organization.id, organization.slug, organization.name].map(normalizeWorkspaceLookup);
    return candidates.some((candidate) => values.includes(candidate));
  }) || null;
}

export function getWorkspaceEntitlements(plan: WorkspacePlan) {
  return planEntitlements[plan] || planEntitlements.free;
}

export function canRoleAccess(feature: keyof typeof roleMatrix, role: WorkspaceRole) {
  if (role === "super_admin") return true;
  return Boolean(roleMatrix[feature]?.[role]);
}
