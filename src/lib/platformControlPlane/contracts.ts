export type PlatformRole =
  | "resident"
  | "partner_member"
  | "property_admin"
  | "organization_admin"
  | "platform_admin"
  | "super_admin";

export type PartnerType =
  | "residential_property"
  | "mixed_use"
  | "hotel"
  | "local_business"
  | "brand"
  | "civic"
  | "real_estate";

export type BillingMode = "included" | "subscription" | "one_time" | "manual_approval";
export type AddOnStatus = "active" | "hidden" | "retired";

export type WorkspaceScopeRequest = {
  userId: string;
  role: PlatformRole;
  workspaceSlug?: string;
  organizationId?: string;
  portfolioId?: string;
  listingId?: string;
  buildingId?: string;
};

export type WorkspaceScopeResolution = {
  requiresServerResolution: true;
  source: "backend-platform";
  requested: WorkspaceScopeRequest;
  requiredChecks: readonly string[];
};

export type AddOnContract = {
  key: string;
  name: string;
  description: string;
  eligiblePartnerTypes: readonly PartnerType[];
  billingMode: BillingMode;
  requiredIntegrations?: readonly string[];
  route?: string;
  status: AddOnStatus;
};

export const ADMIN_STUDIO_MASTER_ROUTES = [
  "/admin",
  "/admin/people",
  "/admin/residents",
  "/admin/partners",
  "/admin/organizations",
  "/admin/buildings",
  "/admin/portfolios",
  "/admin/listings",
  "/admin/map",
  "/admin/offers",
  "/admin/events",
  "/admin/campaigns",
  "/admin/reports",
  "/admin/plans",
  "/admin/add-ons",
  "/admin/payments",
  "/admin/entitlements",
  "/admin/integrations",
  "/admin/provisioning",
  "/admin/audit-log",
  "/admin/support",
] as const;

export const CANONICAL_BACKEND_RECORDS = [
  "users",
  "profiles",
  "roles",
  "sessions",
  "consent",
  "organizations",
  "partner_profiles",
  "workspace_memberships",
  "buildings",
  "portfolios",
  "listings",
  "building_memberships",
  "resident_profiles",
  "resident_verifications",
  "resident_interests",
  "resident_cards",
  "plans",
  "add_ons",
  "subscriptions",
  "invoices",
  "payments",
  "entitlements",
  "canonical_map_entities",
  "map_entity_links",
  "offers",
  "events",
  "resident_updates",
  "recommendations",
  "media",
  "audiences",
  "campaigns",
  "campaign_sends",
  "delivery_events",
  "conversions",
  "product_activity_events",
  "redemptions",
  "rsvps",
  "reporting_rollups",
  "provider_connections",
  "sync_jobs",
  "webhook_events",
  "provisioning_jobs",
  "approvals",
  "audit_logs",
  "support_requests",
] as const;

export const PARTNER_WORKSPACE_SHELL = [
  "/partner-workspace/home",
  "/partner-workspace/map",
  "/partner-workspace/offers",
  "/partner-workspace/events",
  "/partner-workspace/reach",
  "/partner-workspace/updates",
  "/partner-workspace/results",
  "/partner-workspace/reports",
  "/partner-workspace/connections",
  "/partner-workspace/media",
  "/partner-workspace/team",
  "/partner-workspace/settings",
] as const;

export const PRODUCT_ACTIVITY_EVENTS = [
  "map_opened",
  "search_submitted",
  "filter_applied",
  "entity_viewed",
  "offer_opened",
  "qr_displayed",
  "qr_scanned",
  "redemption_completed",
  "event_rsvp_created",
  "campaign_delivered",
  "campaign_opened",
  "campaign_clicked",
] as const;

export const REQUIRED_ADD_ON_CATALOG_CONTRACT: readonly AddOnContract[] = [
  { key: "map_profile", name: "Map profile", description: "Manage public presence, location, media, and map context.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["canonical_map_entity"], route: "/partner-workspace/map", status: "active" },
  { key: "member_offers", name: "Member offers", description: "Create offers, terms, eligibility, and QR redemption.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business"], billingMode: "subscription", requiredIntegrations: ["offer_backend", "resident_card", "redemption_backend"], route: "/partner-workspace/offers", status: "active" },
  { key: "events", name: "Events", description: "Publish events, RSVP, and calendar actions.", eligiblePartnerTypes: ["mixed_use", "hotel", "local_business", "brand", "civic"], billingMode: "subscription", requiredIntegrations: ["events_backend"], route: "/partner-workspace/events", status: "active" },
  { key: "campaigns", name: "Reach residents", description: "Create targeted campaigns with authorized audiences.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "subscription", requiredIntegrations: ["audience_backend", "delivery_integration"], route: "/partner-workspace/reach", status: "active" },
  { key: "updates", name: "Send an update", description: "Send partner updates through approved delivery channels.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "civic", "real_estate"], billingMode: "subscription", requiredIntegrations: ["notification_delivery"], route: "/partner-workspace/updates", status: "active" },
  { key: "results", name: "Results", description: "Views, actions, scans, redemptions, and RSVPs.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["scoped_analytics_events"], route: "/partner-workspace/results", status: "active" },
  { key: "reports", name: "Reports", description: "Date-range reporting and export.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "subscription", requiredIntegrations: ["reporting_endpoint"], route: "/partner-workspace/reports", status: "active" },
  { key: "media", name: "Photos & files", description: "Manage approved organization assets.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["scoped_media_storage"], route: "/partner-workspace/media", status: "active" },
  { key: "team", name: "Team", description: "Invite and manage workspace users.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["organization_membership"], route: "/partner-workspace/team", status: "active" },
  { key: "listings", name: "Listings", description: "Manage real-estate listings and portfolio map context.", eligiblePartnerTypes: ["real_estate", "residential_property", "mixed_use"], billingMode: "subscription", requiredIntegrations: ["portfolio_listing_backend", "map_integration"], route: "/partner-workspace/map?filter=Listings", status: "active" },
  { key: "resident_updates", name: "Resident updates", description: "Publish building or community information.", eligiblePartnerTypes: ["residential_property", "mixed_use", "civic"], billingMode: "subscription", requiredIntegrations: ["property_content_model"], route: "/partner-workspace/updates", status: "active" },
  { key: "local_recommendations", name: "Local recommendations", description: "Curate nearby places for residents or guests.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel"], billingMode: "subscription", requiredIntegrations: ["canonical_places"], route: "/partner-workspace/map", status: "active" },
  { key: "surveys", name: "Surveys", description: "Collect resident or visitor input.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "brand", "civic"], billingMode: "subscription", requiredIntegrations: ["survey_backend"], route: "/partner-workspace/reach?module=surveys", status: "active" },
  { key: "sponsorships", name: "Sponsorships", description: "Manage approved placement or sponsor activity.", eligiblePartnerTypes: ["brand", "civic", "mixed_use"], billingMode: "manual_approval", requiredIntegrations: ["campaign_inventory", "reporting_backend"], route: "/partner-workspace/reach?module=sponsorships", status: "active" },
  { key: "integrations", name: "Integrations", description: "Connect CRM, email, reservation, PMS, analytics, or future APIs.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "manual_approval", requiredIntegrations: ["credential_vault"], route: "/partner-workspace/connections", status: "active" },
  { key: "scheduled_actions", name: "Scheduled actions", description: "Repeating updates, reminders, or workflows.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "subscription", requiredIntegrations: ["durable_scheduler", "audit_log"], route: "/partner-workspace/connections?section=scheduled-actions", status: "active" },
  { key: "support", name: "Support", description: "Request help and track resolution.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["support_backend"], route: "/partner-workspace/settings?section=support", status: "active" },
  { key: "billing", name: "Billing", description: "Manage plan, invoices, add-ons, and payment method.", eligiblePartnerTypes: ["residential_property", "mixed_use", "hotel", "local_business", "brand", "civic", "real_estate"], billingMode: "included", requiredIntegrations: ["stripe_customer", "subscription_records"], route: "/partner-workspace/settings?section=billing", status: "active" },
] as const;

export const SUPER_ADMIN_CONTRACT = {
  verifiedEmail: "me@megdude.com",
  role: "super_admin" as const,
  scope: "platform-wide" as const,
  entitlements: ["*"] as const,
  requiresServerAuthorization: true,
  requiresAuditLog: true,
};

export const BACKEND_AUTHORIZATION_CHAIN = [
  "authenticated user",
  "verified role",
  "organization or building membership",
  "portfolio or listing scope where relevant",
  "entitlement",
  "permitted records",
] as const;

export function resolveWorkspaceScopeRequest(request: WorkspaceScopeRequest): WorkspaceScopeResolution {
  return {
    requiresServerResolution: true,
    source: "backend-platform",
    requested: request,
    requiredChecks: BACKEND_AUTHORIZATION_CHAIN,
  };
}
