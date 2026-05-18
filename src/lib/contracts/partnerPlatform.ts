export type PartnerType =
  | "property"
  | "hotel"
  | "venue"
  | "bars_restaurants"
  | "local_business"
  | "brand"
  | "civic";

export type PartnerStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "archived";

export type PartnerRole =
  | "owner"
  | "manager"
  | "editor"
  | "analyst"
  | "viewer";

export type PartnerEntityType =
  | "building"
  | "hotel"
  | "venue"
  | "event"
  | "perk"
  | "campaign"
  | "district"
  | "zone";

export type SourcePointType =
  | "qr"
  | "building"
  | "campaign"
  | "nav"
  | "email"
  | "sms"
  | "staff_share"
  | "lobby_signage"
  | "room_card"
  | "key_sleeve";

export type InteractionEventType =
  | "map_open"
  | "pin_select"
  | "save"
  | "rsvp_start"
  | "rsvp_complete"
  | "offer_view"
  | "unlock_start"
  | "unlock_complete"
  | "redeem"
  | "cta_click"
  | "form_submit";

export interface PartnerRecord {
  id: string;
  name: string;
  partner_type: PartnerType;
  status: PartnerStatus;
  slug?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  website_url?: string;
  timezone?: string;
  address?: string;
  district?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerEntityRecord {
  id: string;
  partner_id?: string;
  entity_type: PartnerEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  lat?: number | null;
  lng?: number | null;
  address?: string;
  district?: string;
  status?: string;
  image_url?: string;
  cover_image_url?: string;
  hours_json?: Record<string, any> | null;
  metadata_json?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export interface OfferRecord {
  id: string;
  partner_id?: string;
  entity_id?: string;
  title: string;
  description?: string;
  offer_type?: string;
  redemption_type?: string;
  start_at?: string;
  end_at?: string;
  visibility_status?: string;
  category?: string;
  value?: string;
  venue_name?: string;
  terms?: string;
  inventory_limit?: number | null;
  redemption_limit_per_user?: number | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface PartnerEventRecord {
  id: string;
  partner_id?: string;
  entity_id?: string;
  title: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  location_name?: string;
  lat?: number | null;
  lng?: number | null;
  district?: string;
  status?: string;
  rsvp_enabled?: boolean;
  hero_image_url?: string;
  venue_name?: string;
  address?: string;
  category?: string;
  capacity?: number | null;
  rsvp_count?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SourcePointRecord {
  id: string;
  partner_id?: string;
  source_type: SourcePointType;
  source_key: string;
  label: string;
  placement_description?: string;
  building_id?: string | null;
  campaign_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InteractionEventRecord {
  id: string;
  user_id?: string | null;
  anonymous_session_key?: string | null;
  partner_id?: string | null;
  entity_id?: string | null;
  source_point_id?: string | null;
  event_type: InteractionEventType;
  occurred_at: string;
  district?: string | null;
  device_type?: string | null;
  session_id?: string | null;
  metadata_json?: Record<string, any> | null;
}

export interface PartnerUserRecord {
  id: string;
  partner_id?: string;
  email: string;
  full_name?: string;
  role: PartnerRole;
  status?: string;
  last_login_at?: string | null;
  created_at?: string;
}

export interface PartnerProfileRecord {
  partner_id: string;
  branding_json?: Record<string, any> | null;
  notification_settings_json?: Record<string, any> | null;
  default_filters_json?: Record<string, any> | null;
  publishing_preferences_json?: Record<string, any> | null;
  approval_mode?: string | null;
  updated_at?: string;
}

export interface LeadSubmissionRecord {
  id: string;
  partner_type?: PartnerType | string;
  source?: string | null;
  building?: string | null;
  campaign?: string | null;
  placement?: string | null;
  page?: string | null;
  payload_json?: Record<string, any> | null;
  status?: string;
  created_at?: string;
}

export interface MemberCardRecord {
  id: string;
  member_id?: string | null;
  status?: string;
  source?: string | null;
  building?: string | null;
  phone?: string | null;
  email?: string | null;
  display_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RedemptionRecord {
  id: string;
  member_card_id?: string | null;
  offer_id?: string | null;
  partner_id?: string | null;
  entity_id?: string | null;
  source_point_id?: string | null;
  redeemed_at?: string;
  status?: string;
  metadata_json?: Record<string, any> | null;
}

export interface PartnerAnalyticsSummary {
  partner_id?: string | null;
  partner_type?: PartnerType | string | null;
  totals: {
    map_opens: number;
    views: number;
    saves_or_rsvps: number;
    redemptions: number;
    conversion_rate: number;
    repeat_rate: number;
  };
  trend_delta?: {
    map_opens?: number;
    views?: number;
    saves_or_rsvps?: number;
    redemptions?: number;
    conversion_rate?: number;
    repeat_rate?: number;
  };
  top_sources: Array<{
    id: string;
    label: string;
    source_type: string;
    value: number;
  }>;
  top_entities: Array<{
    id: string;
    title: string;
    entity_type: string;
    value: number;
  }>;
  recommended_actions: string[];
  generated_at: string;
}

export interface PartnerRecommendation {
  id: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  action_label?: string;
  action_href?: string;
  entity_id?: string;
}

export interface PartnerWorkspaceModule {
  id:
    | "overview"
    | "offers"
    | "events"
    | "sources"
    | "analytics"
    | "team"
    | "profile";
  label: string;
  description: string;
  owner: "partner_profile" | "offers" | "events" | "sources" | "analytics" | "team_access";
  roles: PartnerRole[];
  cta: string;
  responsibilities: string[];
}

export interface PartnerAttributionContext {
  source?: string;
  building?: string;
  campaign?: string;
  placement?: string;
  page?: string;
  partner_type?: PartnerType | string;
  route?: string;
  entity_id?: string;
}
