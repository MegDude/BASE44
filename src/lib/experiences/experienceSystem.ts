export type ExperienceType =
  | "campaign"
  | "listing_launch"
  | "building_activation"
  | "commercial_property"
  | "amenity_experience"
  | "route"
  | "collection"
  | "perk_experience"
  | "event_experience"
  | "survey"
  | "portfolio";

export type ExperienceGoal =
  | "visit_place"
  | "use_offer"
  | "view_listing"
  | "request_showing"
  | "join_event"
  | "explore_building"
  | "use_amenity"
  | "follow_route"
  | "answer_questions"
  | "contact_team"
  | "save_collection";

export type ExperiencePlacement =
  | "map"
  | "resident_home"
  | "perks"
  | "events"
  | "listings"
  | "building_page"
  | "partner_page"
  | "route"
  | "collection"
  | "qr"
  | "shared_link"
  | "broadcast";

export type StandardInteractionEventName =
  | "map_opened"
  | "search_submitted"
  | "search_result_opened"
  | "filter_selected"
  | "entity_opened"
  | "entity_saved"
  | "directions_tapped"
  | "share_tapped"
  | "perk_opened"
  | "perk_redeemed"
  | "event_opened"
  | "event_rsvp_started"
  | "event_rsvp_completed"
  | "listing_opened"
  | "listing_saved"
  | "showing_requested"
  | "route_started"
  | "route_stop_opened"
  | "route_stop_completed"
  | "route_completed"
  | "survey_started"
  | "survey_question_answered"
  | "survey_completed"
  | "qr_opened"
  | "collection_opened"
  | "campaign_opened"
  | "campaign_result_completed";

export type InteractionSource = "map" | "home" | "search" | "qr" | "route" | "perk" | "event" | "listing" | "broadcast" | "shared_link";

export interface InteractionEventRequest {
  eventName: StandardInteractionEventName;
  occurredAt: string;
  anonymousId: string;
  sessionId: string;
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  campaignId?: string;
  experienceId?: string;
  entityId?: string;
  listingId?: string;
  offerId?: string;
  eventId?: string;
  routeId?: string;
  surveyId?: string;
  questionId?: string;
  qrId?: string;
  source: InteractionSource;
  placement?: string;
  intent?: string;
  district?: string;
  consentState?: string;
  metadata?: Record<string, unknown>;
}

export interface SurveyAnswerRequest {
  surveyId: string;
  questionId: string;
  experienceId?: string;
  campaignId?: string;
  routeId?: string;
  entityId?: string;
  qrId?: string;
  answerType: string;
  answerValue: unknown;
  source: InteractionSource;
  placement?: string;
  consentState: string;
}

export const EXPERIENCE_API_CONTRACT = {
  publish: "/api/experiences",
  surveyResponses: "/api/survey-responses",
  interactions: "/api/interaction-events",
  googleSheetsConnection: "/api/integrations/google-sheets",
} as const;

export interface ExperienceTemplate {
  id: string;
  group: "Listings" | "Buildings" | "Commercial" | "Amenities" | "Routes" | "Collections" | "Offers" | "Events" | "Surveys" | "Portfolio";
  label: string;
  description: string;
  type: ExperienceType;
  goal: ExperienceGoal;
  primaryResult: StandardInteractionEventName;
  content: string[];
  placements: ExperiencePlacement[];
}

export interface ExperienceDraft {
  organizationId: string;
  templateId: string;
  title: string;
  type: ExperienceType;
  goal: ExperienceGoal;
  content: string[];
  audience: string[];
  placements: ExperiencePlacement[];
  interactions: StandardInteractionEventName[];
  primaryResult: StandardInteractionEventName;
  timing: { start: string; end: string; recurrence: string };
  status: "draft";
}

export const EXPERIENCE_BUILDER_STEPS = [
  "Goal",
  "Experience type",
  "Content",
  "Audience",
  "Placements",
  "Interactions",
  "Timing",
  "Tracking",
  "Preview",
  "Publish",
] as const;

export const STANDARD_INTERACTION_EVENTS: readonly StandardInteractionEventName[] = [
  "entity_opened", "entity_saved", "directions_tapped", "share_tapped", "perk_redeemed",
  "event_rsvp_completed", "showing_requested", "route_started", "route_completed",
  "survey_started", "survey_question_answered", "survey_completed", "qr_opened",
  "collection_opened", "campaign_opened", "campaign_result_completed",
] as const;

export const EXPERIENCE_TEMPLATES: readonly ExperienceTemplate[] = [
  { id: "new-listing-launch", group: "Listings", label: "New listing launch", description: "Introduce a listing and make showing interest easy to act on.", type: "listing_launch", goal: "request_showing", primaryResult: "showing_requested", content: ["Listing", "Building", "Agent", "Nearby places", "Showing request"], placements: ["map", "listings", "resident_home", "shared_link"] },
  { id: "resident-welcome", group: "Buildings", label: "Resident welcome", description: "Connect a building to essentials, perks, events, and useful routes.", type: "building_activation", goal: "explore_building", primaryResult: "campaign_result_completed", content: ["Building", "Shared amenities", "Resident perks", "Nearby essentials", "Welcome question"], placements: ["resident_home", "building_page", "map", "qr"] },
  { id: "tenant-discovery", group: "Commercial", label: "Tenant discovery", description: "Show available space, nearby demand, tenants, and leasing contact.", type: "commercial_property", goal: "contact_team", primaryResult: "campaign_result_completed", content: ["Property", "Available spaces", "Current tenants", "Nearby demand", "Leasing contact"], placements: ["map", "partner_page", "shared_link"] },
  { id: "shared-amenity", group: "Amenities", label: "Shared amenity", description: "Explain access and connect an amenity to a useful resident action.", type: "amenity_experience", goal: "use_amenity", primaryResult: "campaign_result_completed", content: ["Amenity", "Access", "Availability", "Related offer", "Optional question"], placements: ["building_page", "resident_home", "map"] },
  { id: "guided-route", group: "Routes", label: "Guided route", description: "Guide people through ordered stops, directions, and an optional question.", type: "route", goal: "follow_route", primaryResult: "route_completed", content: ["Start point", "Route stops", "Directions", "Midpoint question", "Completion"], placements: ["map", "route", "qr", "shared_link"] },
  { id: "curated-collection", group: "Collections", label: "Curated collection", description: "Bring related places, offers, listings, or events together.", type: "collection", goal: "save_collection", primaryResult: "collection_opened", content: ["Collection intro", "Places", "Offers", "Events", "Optional question"], placements: ["map", "collection", "resident_home"] },
  { id: "resident-perk", group: "Offers", label: "Resident perk", description: "Publish a clear benefit with eligibility, timing, and redemption.", type: "perk_experience", goal: "use_offer", primaryResult: "perk_redeemed", content: ["Partner", "Offer", "Eligibility", "Redemption", "Follow-up question"], placements: ["map", "perks", "resident_home", "qr"] },
  { id: "event-path", group: "Events", label: "Event path", description: "Connect an event to RSVP, arrival, nearby places, and follow-up.", type: "event_experience", goal: "join_event", primaryResult: "event_rsvp_completed", content: ["Event", "Location", "RSVP", "Arrival route", "Follow-up question"], placements: ["map", "events", "resident_home", "shared_link"] },
  { id: "one-useful-question", group: "Surveys", label: "One useful question", description: "Ask for relevant feedback without requiring a QR code.", type: "survey", goal: "answer_questions", primaryResult: "survey_completed", content: ["Consent notice", "Question", "Thank you"], placements: ["map", "resident_home", "shared_link"] },
  { id: "portfolio-guide", group: "Portfolio", label: "Portfolio guide", description: "Connect multiple buildings, listings, hotels, or venues in one experience.", type: "portfolio", goal: "explore_building", primaryResult: "campaign_result_completed", content: ["Portfolio intro", "Entities", "Collection", "Route", "Primary action"], placements: ["map", "resident_home", "partner_page", "shared_link"] },
] as const;

export function createExperienceDraft(template: ExperienceTemplate, organizationId: string): ExperienceDraft {
  return {
    organizationId,
    templateId: template.id,
    title: template.label,
    type: template.type,
    goal: template.goal,
    content: [...template.content],
    audience: ["Residents"],
    placements: [...template.placements],
    interactions: [template.primaryResult],
    primaryResult: template.primaryResult,
    timing: { start: "", end: "", recurrence: "" },
    status: "draft",
  };
}

export function buildExperiencePublishRequest(draft: ExperienceDraft) {
  return {
    campaign: { objective: draft.goal, primaryResult: draft.primaryResult },
    experience: { title: draft.title, type: draft.type, status: draft.status },
    contentItems: draft.content.map((label, order) => ({ type: "module", label, order })),
    audience: draft.audience,
    placements: draft.placements,
    interactions: draft.interactions,
    timing: draft.timing,
    organizationId: draft.organizationId,
  };
}
