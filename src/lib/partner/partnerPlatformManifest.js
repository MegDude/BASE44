import { ROUTES } from "@/lib/routes";
import { PARTNER_PLATFORM_ACTIONS } from "@/lib/api/partnerPlatformApi";
import { PARTNER_WORKSPACE_MODULES } from "@/lib/partner/workspaceModules";

export const PARTNER_PLATFORM_TABLES = [
  "partners",
  "partner_entities",
  "offers",
  "partner_events",
  "source_points",
  "interaction_events",
  "partner_users",
  "partner_profiles",
  "lead_submissions",
  "member_cards",
  "redemptions",
];

export const PARTNER_PLATFORM_ENDPOINTS = [
  "POST /api/partners",
  "PATCH /api/partners/:id",
  "GET /api/partners/:id",
  "GET /api/partners?type=:partnerType",
  "POST /api/entities",
  "PATCH /api/entities/:id",
  "GET /api/entities/:id",
  "GET /api/entities?partner_id=:partnerId",
  "POST /api/offers",
  "PATCH /api/offers/:id",
  "GET /api/offers?partner_id=:partnerId",
  "POST /api/events",
  "PATCH /api/events/:id",
  "GET /api/events?partner_id=:partnerId",
  "POST /api/source-points",
  "PATCH /api/source-points/:id",
  "GET /api/source-points?partner_id=:partnerId",
  "POST /api/partner-leads",
  "POST /api/card-request",
  "GET /api/analytics/partner/:id",
  "GET /api/analytics/district/:district",
  "GET /api/analytics/source/:source_point_id",
  "GET /api/analytics/dashboard",
  "GET /api/analytics/recommendations",
  "GET /api/map/entities",
  "GET /api/map/nearby",
  "GET /api/map/intelligence",
];

export const PARTNER_SERVER_ACTION_MANIFEST = PARTNER_PLATFORM_ACTIONS;

export const PARTNER_FRONTEND_COMPONENT_RESPONSIBILITIES = {
  PartnerWorkspace: {
    route: ROUTES.partnerWorkspace,
    responsibilities: [
      "Owns partner-side control modules for offers, events, sources, analytics, team, and profile.",
      "Reads and writes through the canonical partner platform repository.",
      "Keeps module hierarchy consistent with the shared design system.",
    ],
  },
  PartnerDashboard: {
    route: ROUTES.partnerDashboard,
    responsibilities: [
      "Shows live intelligence, recommendations, and ranked signals by geography.",
      "Shares the same analytics contracts and attribution model as the workspace.",
      "Never falls back to separate hardcoded metric language by partner type.",
    ],
  },
  PartnerForms: {
    route: ROUTES.partners,
    responsibilities: [
      "Preserve hidden attribution and route context across all partner onboarding forms.",
      "Use one submission shape for pilot, property, hotel, venue, brand, and civic inquiries.",
      "Map visible labels to canonical partner types and routes.",
    ],
  },
};

export const PARTNER_WORKSPACE_MODULE_MANIFEST = PARTNER_WORKSPACE_MODULES;
