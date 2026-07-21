import {
  requirePartnerMembership,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

const KINDS = {
  perks: { table: "perks", deletedValues: { status: "paused" } },
  events: { table: "events", deletedValues: { status: "cancelled", active: false } },
};

function kindConfig(value) {
  const kind = String(value || "");
  if (!KINDS[kind]) throw new TransactionApiError(400, "CONTENT_KIND_INVALID", "Choose an offer or event.");
  return { kind, ...KINDS[kind] };
}

function clean(value, max = 4000) {
  return String(value || "").trim().slice(0, max) || null;
}

function canPublish(role) {
  return ["owner", "manager", "staff"].includes(String(role || "").toLowerCase());
}

function storedPayload(kind, payload, partnerId) {
  if (!clean(payload?.title, 180)) throw new TransactionApiError(400, "TITLE_REQUIRED", "Add a title before publishing.");
  if (kind === "perks") {
    const status = String(payload.status || "active").toLowerCase();
    return {
      partner_id: partnerId,
      title: clean(payload.title, 180),
      description: clean(payload.description),
      terms: clean(payload.terms),
      starts_at: payload.start_date || null,
      ends_at: payload.end_date || null,
      status: status === "active" ? "active" : "paused",
      discount_type: "custom",
      metadata: {
        venueName: payload.venue_name || null,
        category: payload.category || "discount",
        value: payload.value || null,
        redemptionType: payload.redemption_type || "resident_card",
        eligibility: payload.eligibility || "all_residents",
        availableHours: payload.available_hours || "All day",
      },
    };
  }

  const status = String(payload.status || "upcoming").toLowerCase();
  return {
    partner_id: partnerId,
    title: clean(payload.title, 180),
    description: clean(payload.description),
    start_time: payload.date || null,
    address: clean(payload.address, 240),
    active: !["past", "cancelled"].includes(status),
    status,
    metadata: {
      venueName: payload.venue_name || null,
      category: payload.category || "social",
      capacity: Number(payload.capacity) || null,
      membersOnly: payload.is_members_only !== false,
    },
  };
}

function workspaceRecord(kind, row) {
  const meta = row?.metadata && typeof row.metadata === "object" ? row.metadata : {};
  return kind === "perks" ? {
    id: row.id,
    title: row.title,
    description: row.description || "",
    venue_name: meta.venueName || row.venue_name || "",
    category: meta.category || "discount",
    value: meta.value || "",
    terms: row.terms || "",
    status: row.status === "active" && row.active !== false ? "active" : "paused",
    eligibility: meta.eligibility || "all_residents",
    redemption_type: meta.redemptionType || "resident_card",
    start_date: row.starts_at || "",
    end_date: row.ends_at || "",
    available_hours: meta.availableHours || "All day",
    created_date: row.created_at,
    updated_date: row.updated_at,
  } : {
    id: row.id,
    title: row.title,
    description: row.description || "",
    venue_name: meta.venueName || "",
    category: meta.category || "social",
    address: row.address || "",
    date: row.start_time || "",
    status: row.status || "upcoming",
    is_members_only: meta.membersOnly !== false,
    capacity: meta.capacity || "",
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    const config = kindConfig(req.query?.kind || req.body?.kind);
    const { membership } = await requirePartnerMembership(req);
    const database = (await import("../../src/lib/supabaseServer.js")).supabaseServer;
    if (!database) throw new TransactionApiError(503, "DATABASE_UNAVAILABLE", "Publishing is not available right now.");

    if (req.method === "GET") {
      const { data, error } = await database.from(config.table).select("*").eq("partner_id", membership.partner_id).order("updated_at", { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json({ data: (data || []).map((row) => workspaceRecord(config.kind, row)) });
    }

    if (!canPublish(membership.role)) throw new TransactionApiError(403, "PUBLISH_ACCESS_REQUIRED", "Your account can view this content but cannot publish it.");

    if (req.method === "POST") {
      const values = storedPayload(config.kind, req.body?.payload || {}, membership.partner_id);
      const { data, error } = await database.from(config.table).insert(values).select("*").single();
      if (error || !data) throw error || new Error("content_not_created");
      return res.status(201).json({ data: workspaceRecord(config.kind, data) });
    }

    const id = String(req.query?.id || "").trim();
    if (!id) throw new TransactionApiError(400, "CONTENT_ID_REQUIRED", "Choose the content to update.");

    if (req.method === "PATCH") {
      const values = storedPayload(config.kind, req.body?.payload || {}, membership.partner_id);
      delete values.partner_id;
      const { data, error } = await database.from(config.table).update(values).eq("id", id).eq("partner_id", membership.partner_id).select("*").single();
      if (error || !data) throw error || new Error("content_not_updated");
      return res.status(200).json({ data: workspaceRecord(config.kind, data) });
    }

    if (req.method === "DELETE") {
      const { data, error } = await database.from(config.table).update(config.deletedValues).eq("id", id).eq("partner_id", membership.partner_id).select("*").single();
      if (error || !data) throw error || new Error("content_not_removed");
      return res.status(200).json({ data: workspaceRecord(config.kind, data) });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
