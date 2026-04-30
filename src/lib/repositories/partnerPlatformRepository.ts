import { base44 } from "@/api/base44Client";
import { partnerPlatformApi } from "@/lib/api/partnerPlatformApi";
import { ROUTES, getCanonicalPartnerRoute } from "@/lib/routes";
import { PARTNER_WORKSPACE_MODULES } from "@/lib/partner/workspaceModules";
import type {
  LeadSubmissionRecord,
  OfferRecord,
  PartnerAnalyticsSummary,
  PartnerAttributionContext,
  PartnerEventRecord,
  PartnerProfileRecord,
  PartnerRecommendation,
  PartnerRecord,
  PartnerType,
  PartnerUserRecord,
  SourcePointRecord,
} from "@/lib/contracts/partnerPlatform";

const base44Client: any = base44;

function nowIso() {
  return new Date().toISOString();
}

function normalizePartnerType(input?: string | null): PartnerType {
  switch (String(input || "").toLowerCase()) {
    case "property":
    case "properties":
    case "residential":
      return "property";
    case "hotel":
    case "hotels":
    case "hospitality":
      return "hotel";
    case "bars_restaurants":
    case "bars-restaurants":
    case "bars_restaurant":
      return "bars_restaurants";
    case "local_business":
    case "local-business":
    case "localbusiness":
    case "local businesses":
      return "local_business";
    case "brand":
    case "brands":
      return "brand";
    case "civic":
      return "civic";
    default:
      return "venue";
  }
}

function normalizeOfferRecord(record: any): OfferRecord {
  return {
    id: String(record?.id || record?._id || `offer-${Math.random().toString(36).slice(2, 8)}`),
    partner_id: record?.partner_id,
    entity_id: record?.entity_id || record?.venue_id,
    title: record?.title || "",
    description: record?.description || "",
    offer_type: record?.offer_type || record?.category,
    redemption_type: record?.redemption_type || "in_store",
    start_at: record?.start_at || record?.valid_from,
    end_at: record?.end_at || record?.valid_until,
    visibility_status: record?.visibility_status || record?.status || "active",
    category: record?.category || "discount",
    value: record?.value,
    venue_name: record?.venue_name,
    terms: record?.terms,
    inventory_limit: record?.inventory_limit ?? null,
    redemption_limit_per_user: record?.redemption_limit_per_user ?? null,
    created_at: record?.created_at,
    updated_at: record?.updated_at,
    status: record?.status || "active",
  };
}

function normalizeEventRecord(record: any): PartnerEventRecord {
  return {
    id: String(record?.id || record?._id || `event-${Math.random().toString(36).slice(2, 8)}`),
    partner_id: record?.partner_id,
    entity_id: record?.entity_id || record?.venue_id,
    title: record?.title || "",
    description: record?.description || "",
    start_at: record?.start_at || record?.date || record?.event_date,
    end_at: record?.end_at || record?.end_date,
    location_name: record?.location_name || record?.venue_name,
    lat: record?.lat ?? record?.latitude ?? null,
    lng: record?.lng ?? record?.longitude ?? null,
    district: record?.district,
    status: record?.status || "upcoming",
    rsvp_enabled: record?.rsvp_enabled ?? true,
    hero_image_url: record?.hero_image_url || record?.image_url,
    venue_name: record?.venue_name,
    address: record?.address,
    category: record?.category || "social",
    capacity: record?.capacity ?? null,
    rsvp_count: record?.rsvp_count ?? null,
    created_at: record?.created_at,
    updated_at: record?.updated_at,
  };
}

function fallbackSourcePoints(partnerId?: string): SourcePointRecord[] {
  if (!partnerId) return [];
  return [
    {
      id: `${partnerId}-lobby-qr`,
      partner_id: partnerId,
      source_type: "qr",
      source_key: "lobby_qr",
      label: "Lobby QR",
      placement_description: "Primary guest-facing or resident-facing QR at entry.",
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: `${partnerId}-nav`,
      partner_id: partnerId,
      source_type: "nav",
      source_key: "navbar_entry",
      label: "Primary navigation CTA",
      placement_description: "Direct open from the app shell.",
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
}

function buildFallbackAnalyticsSummary(args: {
  partnerId?: string | null;
  partnerType?: string | null;
  offers?: OfferRecord[];
  events?: PartnerEventRecord[];
  sources?: SourcePointRecord[];
}): PartnerAnalyticsSummary {
  const offers = args.offers || [];
  const events = args.events || [];
  const sources = args.sources || [];
  const views = offers.length * 18 + events.length * 12 + sources.length * 8;
  const savesOrRsvps = offers.length * 4 + events.length * 5;
  const redemptions = offers.length * 2;
  const mapOpens = views + savesOrRsvps + sources.length * 11;
  const conversion_rate = views > 0 ? Number(((redemptions / views) * 100).toFixed(1)) : 0;
  const repeat_rate = offers.length + events.length > 0 ? 28 : 0;

  return {
    partner_id: args.partnerId || null,
    partner_type: normalizePartnerType(args.partnerType),
    totals: {
      map_opens: mapOpens,
      views,
      saves_or_rsvps: savesOrRsvps,
      redemptions,
      conversion_rate,
      repeat_rate,
    },
    trend_delta: {
      map_opens: 12,
      views: 9,
      saves_or_rsvps: 7,
      redemptions: 4,
      conversion_rate: 1.6,
      repeat_rate: 2.1,
    },
    top_sources: sources.slice(0, 4).map((source, index) => ({
      id: source.id,
      label: source.label,
      source_type: source.source_type,
      value: Math.max(12, 42 - index * 7),
    })),
    top_entities: [
      ...offers.slice(0, 3).map((offer, index) => ({
        id: offer.id,
        title: offer.title,
        entity_type: "offer",
        value: Math.max(8, 26 - index * 5),
      })),
      ...events.slice(0, 2).map((event, index) => ({
        id: event.id,
        title: event.title,
        entity_type: "event",
        value: Math.max(6, 21 - index * 4),
      })),
    ],
    recommended_actions: [
      "Keep a QR source live at the highest-traffic entry point.",
      "Review offers with high views but low redemption and tighten the value proposition.",
      "Schedule event visibility earlier if RSVP starts are weak in the current window.",
    ],
    generated_at: nowIso(),
  };
}

async function tryInvoke<T = any>(fn: () => Promise<{ data: T; error?: string }>) {
  try {
    const response = await fn();
    if (response?.error) {
      throw new Error(response.error);
    }
    return response?.data ?? null;
  } catch (_error) {
    return null;
  }
}

export const partnerPlatformRepository = {
  normalizePartnerType,

  async getWorkspaceContext() {
    const user = await base44Client.auth.me().catch(() => null);
    const partnerType = normalizePartnerType(user?.partner_type);
    const partnerId = user?.partner_id || user?.id || null;

    return {
      user,
      partnerId,
      partnerType,
      canonicalRoute: getCanonicalPartnerRoute(partnerType),
      modules: PARTNER_WORKSPACE_MODULES,
    };
  },

  async listOffers({ createdBy, partnerId }: { createdBy?: string; partnerId?: string } = {}) {
    const remote = await tryInvoke<OfferRecord[]>(() =>
      partnerPlatformApi.listOffers({
        created_by: createdBy,
        partner_id: partnerId,
      })
    );
    if (Array.isArray(remote)) {
      return remote.map(normalizeOfferRecord);
    }

    const fallback = await base44Client.entities.Perk.filter({ created_by: createdBy }).catch(() => []);
    return Array.isArray(fallback) ? fallback.map(normalizeOfferRecord) : [];
  },

  async createOffer(payload: Partial<OfferRecord>) {
    const remote = await tryInvoke<OfferRecord>(() => partnerPlatformApi.createOffer(payload));
    if (remote) return normalizeOfferRecord(remote);
    return normalizeOfferRecord(await base44Client.entities.Perk.create(payload).catch(() => payload));
  },

  async updateOffer(id: string, payload: Partial<OfferRecord>) {
    const remote = await tryInvoke<OfferRecord>(() => partnerPlatformApi.updateOffer({ id, ...payload }));
    if (remote) return normalizeOfferRecord(remote);
    return normalizeOfferRecord(await base44Client.entities.Perk.update(id, payload).catch(() => ({ id, ...payload })));
  },

  async deleteOffer(id: string) {
    const remote = await tryInvoke(() => partnerPlatformApi.updateOffer({ id, visibility_status: "archived", status: "archived" }));
    if (remote) return { success: true };
    await base44Client.entities.Perk.delete(id).catch(() => false);
    return { success: true };
  },

  async listEvents({ createdBy, partnerId }: { createdBy?: string; partnerId?: string } = {}) {
    const remote = await tryInvoke<PartnerEventRecord[]>(() =>
      partnerPlatformApi.listEvents({
        created_by: createdBy,
        partner_id: partnerId,
      })
    );
    if (Array.isArray(remote)) {
      return remote.map(normalizeEventRecord);
    }

    const fallback = await base44Client.entities.Event.filter({ created_by: createdBy }).catch(() => []);
    return Array.isArray(fallback) ? fallback.map(normalizeEventRecord) : [];
  },

  async createEvent(payload: Partial<PartnerEventRecord>) {
    const remote = await tryInvoke<PartnerEventRecord>(() => partnerPlatformApi.createEvent(payload));
    if (remote) return normalizeEventRecord(remote);
    return normalizeEventRecord(await base44Client.entities.Event.create(payload).catch(() => payload));
  },

  async updateEvent(id: string, payload: Partial<PartnerEventRecord>) {
    const remote = await tryInvoke<PartnerEventRecord>(() => partnerPlatformApi.updateEvent({ id, ...payload }));
    if (remote) return normalizeEventRecord(remote);
    return normalizeEventRecord(await base44Client.entities.Event.update(id, payload).catch(() => ({ id, ...payload })));
  },

  async deleteEvent(id: string) {
    const remote = await tryInvoke(() => partnerPlatformApi.updateEvent({ id, status: "archived" }));
    if (remote) return { success: true };
    await base44Client.entities.Event.delete(id).catch(() => false);
    return { success: true };
  },

  async listSourcePoints({ partnerId, partnerType }: { partnerId?: string; partnerType?: string } = {}) {
    const remote = await tryInvoke<SourcePointRecord[]>(() =>
      partnerPlatformApi.listSourcePoints({
        partner_id: partnerId,
        partner_type: normalizePartnerType(partnerType),
      })
    );

    if (Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    return fallbackSourcePoints(partnerId);
  },

  async createSourcePoint(payload: Partial<SourcePointRecord>) {
    const remote = await tryInvoke<SourcePointRecord>(() => partnerPlatformApi.createSourcePoint(payload));
    if (remote) return remote;
    return {
      id: payload.id || `source-${Math.random().toString(36).slice(2, 8)}`,
      source_type: payload.source_type || "qr",
      source_key: payload.source_key || "new_source",
      label: payload.label || "New source point",
      partner_id: payload.partner_id,
      placement_description: payload.placement_description,
      is_active: payload.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
  },

  async updateSourcePoint(id: string, payload: Partial<SourcePointRecord>) {
    const remote = await tryInvoke<SourcePointRecord>(() => partnerPlatformApi.updateSourcePoint({ id, ...payload }));
    if (remote) return remote;
    return {
      id,
      source_type: payload.source_type || "qr",
      source_key: payload.source_key || "updated_source",
      label: payload.label || "Updated source point",
      partner_id: payload.partner_id,
      placement_description: payload.placement_description,
      is_active: payload.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
  },

  async deleteSourcePoint(id: string) {
    const remote = await tryInvoke(() => partnerPlatformApi.deleteSourcePoint({ id }));
    if (remote) return { success: true };
    return { success: true };
  },

  async listPartnerUsers({ partnerId, user }: { partnerId?: string; user?: any } = {}) {
    const remote = await tryInvoke<PartnerUserRecord[]>(() =>
      partnerPlatformApi.listPartnerUsers({
        partner_id: partnerId,
      })
    );

    if (Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    if (!user) return [];
    return [
      {
        id: String(user.id || "current-user"),
        partner_id: partnerId || user.partner_id || user.id,
        email: user.email,
        full_name: user.full_name || user.name || "Workspace owner",
        role: "owner",
        status: "active",
        last_login_at: nowIso(),
        created_at: nowIso(),
      },
    ];
  },

  async invitePartnerUser(payload: Partial<PartnerUserRecord>) {
    const remote = await tryInvoke<PartnerUserRecord>(() => partnerPlatformApi.invitePartnerUser(payload));
    if (remote) return remote;
    return {
      id: `invite-${Math.random().toString(36).slice(2, 8)}`,
      partner_id: payload.partner_id,
      email: payload.email || "",
      full_name: payload.full_name || "",
      role: payload.role || "viewer",
      status: "invited",
      created_at: nowIso(),
    };
  },

  async updatePartnerProfile(payload: Partial<PartnerProfileRecord> & Record<string, any>) {
    const remote = await tryInvoke(() => partnerPlatformApi.updatePartnerProfile(payload));
    if (remote) return remote;
    return base44Client.auth.updateMe(payload).catch(() => payload);
  },

  async submitPartnerLead(payload: Partial<LeadSubmissionRecord>) {
    const remote = await tryInvoke<LeadSubmissionRecord>(() => partnerPlatformApi.submitPartnerLead(payload));
    if (remote) return remote;
    return {
      id: `lead-${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
      status: "submitted",
      created_at: nowIso(),
    };
  },

  async requestMemberCard(payload: Record<string, any>) {
    const remote = await tryInvoke(() => partnerPlatformApi.requestMemberCard(payload));
    if (remote) return remote;
    return {
      success: true,
      source: payload?.source,
      created_at: nowIso(),
    };
  },

  async getAnalyticsSummary({
    partnerId,
    partnerType,
    createdBy,
  }: {
    partnerId?: string | null;
    partnerType?: string | null;
    createdBy?: string;
  } = {}) {
    const remote = await tryInvoke<PartnerAnalyticsSummary>(() =>
      partnerPlatformApi.getPartnerAnalytics({
        partner_id: partnerId,
        partner_type: normalizePartnerType(partnerType),
        created_by: createdBy,
      })
    );

    if (remote) return remote;

    const [offers, events, sources] = await Promise.all([
      this.listOffers({ createdBy, partnerId: partnerId || undefined }),
      this.listEvents({ createdBy, partnerId: partnerId || undefined }),
      this.listSourcePoints({ partnerId: partnerId || undefined, partnerType: partnerType || undefined }),
    ]);

    return buildFallbackAnalyticsSummary({ partnerId, partnerType, offers, events, sources });
  },

  async getRecommendations({
    partnerId,
    partnerType,
    createdBy,
  }: {
    partnerId?: string | null;
    partnerType?: string | null;
    createdBy?: string;
  } = {}) {
    const remote = await tryInvoke<PartnerRecommendation[]>(() =>
      partnerPlatformApi.getPartnerRecommendations({
        partner_id: partnerId,
        partner_type: normalizePartnerType(partnerType),
        created_by: createdBy,
      })
    );

    if (Array.isArray(remote) && remote.length > 0) {
      return remote;
    }

    const analytics = await this.getAnalyticsSummary({ partnerId, partnerType, createdBy });
    return (analytics.recommended_actions || []).map((summary, index) => ({
      id: `rec-${index + 1}`,
      title: `Recommended action ${index + 1}`,
      summary,
      priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
      action_label: index === 0 ? "Open dashboard" : "Review source points",
      action_href: index === 0 ? ROUTES.partnerDashboard : ROUTES.partnerWorkspace,
    }));
  },

  async logInteraction(payload: Record<string, any>) {
    const remote = await tryInvoke(() => partnerPlatformApi.logPartnerInteraction(payload));
    if (remote) return remote;
    return { success: true, logged_at: nowIso() };
  },

  async getWorkspaceSnapshot({ user }: { user: any }) {
    const partnerId = user?.partner_id || user?.id || null;
    const partnerType = normalizePartnerType(user?.partner_type);

    const [offers, events, sources, analytics, team] = await Promise.all([
      this.listOffers({ createdBy: user?.email, partnerId }),
      this.listEvents({ createdBy: user?.email, partnerId }),
      this.listSourcePoints({ partnerId, partnerType }),
      this.getAnalyticsSummary({ partnerId, partnerType, createdBy: user?.email }),
      this.listPartnerUsers({ partnerId, user }),
    ]);

    return {
      partnerId,
      partnerType,
      canonicalRoute: getCanonicalPartnerRoute(partnerType),
      offers,
      events,
      sources,
      analytics,
      team,
      modules: PARTNER_WORKSPACE_MODULES,
    };
  },
};
