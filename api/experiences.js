import {
  requirePartnerMembership,
  sendTransactionError,
  TransactionApiError,
} from "../src/lib/api/transactionAuth.js";

const PUBLISH_ROLES = new Set(["owner", "manager", "staff"]);

function text(value, max = 4000) {
  return String(value || "").trim().slice(0, max);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function cleanRequest(body = {}) {
  const campaign = body.campaign && typeof body.campaign === "object" ? body.campaign : {};
  const experience = body.experience && typeof body.experience === "object" ? body.experience : {};
  const title = text(experience.title, 180);
  const experienceType = text(experience.type, 80);
  const objective = text(campaign.objective, 120);
  const primaryResult = text(campaign.primaryResult, 120);
  if (!title) throw new TransactionApiError(400, "TITLE_REQUIRED", "Add a title before publishing.");
  if (!experienceType || !objective || !primaryResult) {
    throw new TransactionApiError(400, "EXPERIENCE_INCOMPLETE", "Choose an experience type, goal, and primary result.");
  }
  return {
    experience_type: experienceType,
    title,
    objective,
    primary_result: primaryResult,
    content_items: array(body.contentItems),
    audience: array(body.audience),
    placements: array(body.placements),
    interactions: array(body.interactions),
    timing: body.timing && typeof body.timing === "object" ? body.timing : {},
    metadata: {
      requestedOrganizationId: text(body.organizationId, 180) || null,
      templateId: text(body.templateId, 180) || null,
    },
  };
}

async function resolveOrganization(database, partnerId, requestedId) {
  let query = database
    .from("partner_organizations")
    .select("id,legacy_partner_id,external_id,name")
    .eq("legacy_partner_id", partnerId);

  if (requestedId) query = query.eq("external_id", requestedId);
  const requested = await query.limit(1).maybeSingle();
  if (requested.error) throw requested.error;
  if (requested.data) return requested.data;

  const fallback = await database
    .from("partner_organizations")
    .select("id,legacy_partner_id,external_id,name")
    .eq("legacy_partner_id", partnerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (fallback.error) throw fallback.error;
  if (!fallback.data) {
    throw new TransactionApiError(409, "ORGANIZATION_REQUIRED", "Create or select an operational organization before publishing.");
  }
  return fallback.data;
}

async function writeAudit(database, membership, action, row, beforeState = null) {
  const { error } = await database.from("partner_audit_events").insert({
    partner_id: membership.partner_id,
    partner_user_id: membership.id,
    action,
    resource_type: "experience",
    resource_id: row.id,
    before_state: beforeState,
    after_state: row,
  });
  if (error) throw error;
}

function responseRow(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    type: row.experience_type,
    goal: row.objective,
    primaryResult: row.primary_result,
    content: row.content_items,
    audience: row.audience,
    placements: row.placements,
    interactions: row.interactions,
    timing: row.timing,
    status: row.status,
    version: row.version,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req, res) {
  try {
    const { membership } = await requirePartnerMembership(req);
    const database = (await import("../src/lib/supabaseServer.js")).supabaseServer;
    if (!database) throw new TransactionApiError(503, "DATABASE_UNAVAILABLE", "Publishing is not available right now.");

    if (req.method === "GET") {
      const { data, error } = await database
        .from("partner_experiences")
        .select("*")
        .eq("partner_id", membership.partner_id)
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return res.status(200).json({ ok: true, data: (data || []).map(responseRow) });
    }

    if (!PUBLISH_ROLES.has(String(membership.role || "").toLowerCase())) {
      throw new TransactionApiError(403, "PUBLISH_ACCESS_REQUIRED", "Your account can view experiences but cannot publish them.");
    }

    if (req.method === "POST") {
      const values = cleanRequest(req.body);
      const organization = await resolveOrganization(
        database,
        membership.partner_id,
        text(req.body?.organizationId, 180)
      );
      const { data, error } = await database
        .from("partner_experiences")
        .insert({
          ...values,
          partner_id: membership.partner_id,
          organization_id: organization.id,
          created_by_partner_user_id: membership.id,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (error || !data) throw error || new Error("experience_not_created");
      await writeAudit(database, membership, "experience.published", data);
      return res.status(201).json({ ok: true, data: responseRow(data) });
    }

    const id = text(req.query?.id, 80);
    if (!id) throw new TransactionApiError(400, "EXPERIENCE_ID_REQUIRED", "Choose an experience.");

    const existing = await database
      .from("partner_experiences")
      .select("*")
      .eq("id", id)
      .eq("partner_id", membership.partner_id)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) throw new TransactionApiError(404, "EXPERIENCE_NOT_FOUND", "That experience was not found.");

    if (req.method === "PATCH") {
      const values = cleanRequest(req.body);
      const status = ["draft", "published", "paused", "archived"].includes(req.body?.status)
        ? req.body.status
        : existing.data.status;
      const { data, error } = await database
        .from("partner_experiences")
        .update({ ...values, status })
        .eq("id", id)
        .eq("partner_id", membership.partner_id)
        .select("*")
        .single();
      if (error || !data) throw error || new Error("experience_not_updated");
      await writeAudit(database, membership, `experience.${status}`, data, existing.data);
      return res.status(200).json({ ok: true, data: responseRow(data) });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
