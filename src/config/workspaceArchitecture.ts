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
    description: "Workspace loads without a connected partner organization. Users can select, create, or request access.",
  },
  trial: {
    label: "Trial",
    description: "Workspace is active with trial entitlements and limited billing access.",
  },
  active: {
    label: "Active",
    description: "Workspace can manage campaigns, offers, QR activity, reporting, and team settings.",
  },
  suspended: {
    label: "Suspended",
    description: "Workspace remains visible, but publishing and billing-sensitive actions are disabled.",
  },
};

export const demoOrganizations: WorkspaceOrganization[] = [
  {
    id: "demo-org-legends-residential",
    name: "Legends Residential",
    type: "property_group",
    status: "active",
    plan: "enterprise",
    role: "owner",
    is_demo: true,
  },
  {
    id: "demo-org-larry-and-guy",
    name: "Larry & Guy",
    type: "venue_group",
    status: "active",
    plan: "pro",
    role: "admin",
    is_demo: true,
  },
  {
    id: "demo-org-hotel-van-zandt",
    name: "Hotel Van Zandt",
    type: "hospitality_group",
    status: "trial",
    plan: "growth",
    role: "manager",
    is_demo: true,
  },
  {
    id: "demo-org-yeti",
    name: "YETI",
    type: "brand",
    status: "active",
    plan: "growth",
    role: "editor",
    is_demo: true,
  },
];

export const demoEntityOwners: WorkspaceEntityOwnership[] = [
  { id: "owner-the-shore", organization_id: "demo-org-legends-residential", entity_id: "property-the-shore", entity_type: "property", display_name: "The Shore" },
  { id: "owner-the-quincy", organization_id: "demo-org-legends-residential", entity_id: "property-the-quincy", entity_type: "property", display_name: "The Quincy" },
  { id: "owner-waterline", organization_id: "demo-org-legends-residential", entity_id: "property-waterline", entity_type: "property", display_name: "Waterline" },
  { id: "owner-atx-cocina", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-atx-cocina", entity_type: "venue", display_name: "ATX Cocina", map_filter: "Dining", perk_summary: "Masa Moment Passport Perk" },
  { id: "owner-j-carver", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-j-carvers", entity_type: "venue", display_name: "J. Carver's", map_filter: "Dining", perk_summary: "Chophouse Passport Perk" },
  { id: "owner-red-ash", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-red-ash", entity_type: "venue", display_name: "Red Ash", map_filter: "Dining", perk_summary: "Fire Cooking Passport Perk" },
  { id: "owner-restaurant-francois", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-restaurant-francois", entity_type: "venue", display_name: "Restaurant François", map_filter: "Dining", perk_summary: "French Evening Passport Perk" },
  { id: "owner-roaring-fork", organization_id: "demo-org-larry-and-guy", entity_id: "larry-guy-roaring-fork", entity_type: "venue", display_name: "Roaring Fork", map_filter: "Dining", perk_summary: "Downtown Classic Passport Perk" },
  { id: "owner-hotel-van-zandt", organization_id: "demo-org-hotel-van-zandt", entity_id: "hotel-van-zandt", entity_type: "hotel", display_name: "Hotel Van Zandt" },
  { id: "owner-yeti-store", organization_id: "demo-org-yeti", entity_id: "brand-yeti", entity_type: "brand", display_name: "YETI" },
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

export function getWorkspaceEntitlements(plan: WorkspacePlan) {
  return planEntitlements[plan] || planEntitlements.free;
}

export function canRoleAccess(feature: keyof typeof roleMatrix, role: WorkspaceRole) {
  if (role === "super_admin") return true;
  return Boolean(roleMatrix[feature]?.[role]);
}
