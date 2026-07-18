import {
  ChartNoAxesCombined,
  House,
  MapPin,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type WorkspacePrimaryDestination = "home" | "map" | "publish" | "performance" | "workspace";

export type WorkspaceModuleDefinition = {
  id: string;
  label: string;
  href: string;
  destination: WorkspacePrimaryDestination;
  roles?: readonly string[];
  organizationTypes?: readonly string[];
  featureFlag?: string;
  permissions?: readonly string[];
  plans?: readonly string[];
  integration?: string;
  description?: string;
};

export const workspacePrimaryNavigation: readonly {
  id: WorkspacePrimaryDestination;
  label: string;
  href: string;
  icon: LucideIcon;
  matches: readonly string[];
}[] = [
  { id: "home", label: "Home", href: "/partner-workspace/overview", icon: House, matches: ["overview"] },
  { id: "map", label: "Map", href: "/map?mode=partner&tab=map&filter=All", icon: MapPin, matches: ["map"] },
  { id: "publish", label: "Publish", href: "/partner-workspace/publish", icon: Megaphone, matches: ["publish", "offers", "events", "campaigns", "surveys", "broadcasts"] },
  { id: "performance", label: "Performance", href: "/partner-workspace/performance", icon: ChartNoAxesCombined, matches: ["performance", "analytics", "reports", "audience"] },
  { id: "workspace", label: "Workspace", href: "/partner-workspace/workspace", icon: Settings, matches: ["workspace", "profile", "team", "billing", "media", "sources"] },
] as const;

export const workspaceModules: readonly WorkspaceModuleDefinition[] = [
  { id: "overview", label: "Overview", description: "What needs attention and what changed.", href: "/partner-workspace/overview", destination: "home", permissions: ["workspace:view"] },
  { id: "map", label: "Partner map", description: "Places, listings, placements, routes, and geographic opportunity.", href: "/map?mode=partner&tab=map&filter=All", destination: "map", organizationTypes: ["property_group", "hospitality_group", "venue_group", "brand", "civic", "real_estate"], permissions: ["map:view"] },
  { id: "offers", label: "Offers", description: "Create and manage resident-facing offers.", href: "/partner-workspace/offers", destination: "publish", featureFlag: "offers", permissions: ["offers:view"] },
  { id: "events", label: "Events", description: "Publish events, reminders, and attendee experiences.", href: "/partner-workspace/events", destination: "publish", featureFlag: "events", permissions: ["events:view"] },
  { id: "campaigns", label: "Campaigns", description: "Manage campaigns, placements, audiences, and timing.", href: "/partner-workspace/campaigns", destination: "publish", featureFlag: "campaigns", permissions: ["campaigns:view"] },
  { id: "broadcasts", label: "Broadcasts", description: "Schedule messages and resident updates.", href: "/partner-workspace/broadcasts", destination: "publish", featureFlag: "broadcasts", permissions: ["broadcasts:view"] },
  { id: "surveys", label: "Surveys", description: "Collect and review structured feedback.", href: "/partner-workspace/surveys", destination: "publish", featureFlag: "surveys", permissions: ["surveys:view"] },
  { id: "listings", label: "Listings", description: "Review feed-owned inventory and publish listing updates.", href: "/map?mode=partner&tab=map&filter=Listings", destination: "publish", featureFlag: "listings", permissions: ["listings:view"], integration: "listing_feed" },
  { id: "routes", label: "Routes and guides", description: "Curate map routes, guides, and collections.", href: "/map?mode=partner&tab=map&filter=Discovery%20Trails", destination: "publish", featureFlag: "routes", permissions: ["routes:view"] },
  { id: "analytics", label: "Analytics", description: "See what people find, open, use, and act on.", href: "/partner-workspace/analytics", destination: "performance", featureFlag: "analytics", permissions: ["analytics:view"] },
  { id: "reports", label: "Reports", description: "Open, share, export, and schedule reports.", href: "/partner-workspace/reports", destination: "performance", featureFlag: "reports", permissions: ["reports:view"] },
  { id: "audience", label: "Audience", description: "Review aggregate audience activity and segments.", href: "/partner-workspace/audience", destination: "performance", featureFlag: "analytics", permissions: ["audience:view"] },
  { id: "research", label: "Research coverage", description: "See sourced business records and the work still awaiting review.", href: "/partner-workspace/analytics?view=research", destination: "performance", featureFlag: "analytics", permissions: ["analytics:view"] },
  { id: "seo", label: "SEO Snapshot", description: "Search demand, keyword opportunities, and next actions.", href: "/partner-workspace/analytics?view=seo", destination: "performance", featureFlag: "analytics", permissions: ["analytics:view"], integration: "search_reporting" },
  { id: "map_activity", label: "Map activity", description: "Pin opens, saves, directions, and geographic discovery.", href: "/map?mode=partner&tab=activity", destination: "performance", featureFlag: "analytics", permissions: ["analytics:view"] },
  { id: "profile", label: "Profile", description: "Organization identity, contact details, and public presence.", href: "/partner-workspace/profile", destination: "workspace", permissions: ["profile:view"] },
  { id: "entities", label: "Entities", description: "Places, buildings, listings, venues, and linked records.", href: "/partner-workspace/buildings", destination: "workspace", permissions: ["entities:view"] },
  { id: "people", label: "People and CRM", description: "Residents, leads, guests, attendees, and follow-up.", href: "/partner-workspace/residents", destination: "workspace", permissions: ["crm:view"] },
  { id: "media", label: "Media", description: "Images, logos, documents, floor plans, and campaign assets.", href: "/partner-workspace/media", destination: "workspace", permissions: ["media:view"] },
  { id: "team", label: "Team and roles", description: "Members, invitations, permissions, and access requests.", href: "/partner-workspace/team", destination: "workspace", roles: ["owner", "admin", "super_admin"], permissions: ["team:view"] },
  { id: "sources", label: "Integrations", description: "Feeds, search reporting, maps, billing, and connected systems.", href: "/partner-workspace/sources", destination: "workspace", permissions: ["integrations:view"] },
  { id: "automations", label: "Automations", description: "Review workflow triggers, status, and sync issues.", href: "/partner-workspace/sources?section=automations", destination: "workspace", featureFlag: "automations", permissions: ["automations:view"] },
  { id: "ai", label: "AI tools", description: "Draft, summarize, and recommend with explicit review.", href: "/map?mode=partner&tab=map&filter=All", destination: "workspace", featureFlag: "ai", permissions: ["ai:use"] },
  { id: "qr", label: "QR codes", description: "Destinations, scans, downloads, and campaign links.", href: "/partner-workspace/sources?section=qr", destination: "workspace", featureFlag: "qr", permissions: ["qr:view"] },
  { id: "notifications", label: "Notifications", description: "Choose which workspace activity reaches your team.", href: "/partner-workspace/profile?section=notifications", destination: "workspace", permissions: ["notifications:view"] },
  { id: "billing", label: "Billing and plan", description: "Plan, usage, payment, invoices, and renewal.", href: "/partner-workspace/billing", destination: "workspace", roles: ["owner", "admin", "super_admin"], permissions: ["billing:view"] },
  { id: "support", label: "Support", description: "Setup, publishing, reports, data issues, and diagnostics.", href: "/map?mode=partner&tab=info", destination: "workspace", permissions: ["workspace:view"] },
] as const;

export function getAvailableWorkspaceModules({
  organizationType,
  role,
  features = [],
  permissions = [],
  plan,
  integrations = [],
}: {
  organizationType?: string;
  role?: string;
  features?: readonly string[];
  permissions?: readonly string[];
  plan?: string;
  integrations?: readonly string[];
}) {
  const featureSet = new Set(features);
  const permissionSet = new Set(permissions);
  const integrationSet = new Set(integrations);
  return workspaceModules.filter((module) => {
    if (module.roles?.length && role && !module.roles.includes(role)) return false;
    if (module.organizationTypes?.length && organizationType && !module.organizationTypes.includes(organizationType)) return false;
    if (module.featureFlag && features.length && !featureSet.has(module.featureFlag)) return false;
    if (module.permissions?.length && permissions.length && !module.permissions.some((permission) => permissionSet.has(permission))) return false;
    if (module.plans?.length && plan && !module.plans.includes(plan)) return false;
    if (module.integration && integrations.length && !integrationSet.has(module.integration)) return false;
    return true;
  });
}

export function getWorkspaceModulesForDestination(destination: WorkspacePrimaryDestination) {
  return workspaceModules.filter((module) => module.destination === destination);
}
