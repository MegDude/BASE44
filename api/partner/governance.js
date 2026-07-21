import { requireAuthenticatedUser, requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value, max = 1200) => String(value || "").trim().slice(0, max);

async function civicScope(database, req, user) {
  const ref = clean(req.method === "GET" ? req.query?.organizationId : req.body?.organizationId, 120);
  if (!ref) throw new TransactionApiError(400, "ORGANIZATION_REQUIRED", "Choose an organization to continue.");
  let query = database.from("partner_organizations").select("id,name,external_id,status,legacy_partner_id");
  query = UUID.test(ref) ? query.eq("id", ref) : query.eq("external_id", ref);
  const { data: organization, error } = await query.maybeSingle();
  if (error || !organization) throw new TransactionApiError(404, "CIVIC_ORGANIZATION_NOT_FOUND", "This civic organization is not connected yet.");
  const { data: member } = organization.legacy_partner_id ? await database.from("partner_users").select("id,role").eq("partner_id", organization.legacy_partner_id).eq("auth_user_id", user.id).eq("active", true).maybeSingle() : { data: null };
  if (!member) throw new TransactionApiError(403, "CIVIC_ACCESS_REQUIRED", "You do not have access to this civic organization.");
  return { organization, member };
}

export default async function handler(req, res) {
  try {
    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);
    const { organization } = await civicScope(database, req, user);
    if (req.method === "GET") {
      const [{ data: actions }, { data: meetings }, { data: projects }, { data: questions }] = await Promise.all([
        database.from("governance_consultations").select("*,governance_consultation_responses(count)").eq("organization_id", organization.id).order("created_at", { ascending: false }),
        database.from("governance_meetings").select("*").eq("organization_id", organization.id).order("starts_at", { ascending: false }),
        database.from("governance_initiatives").select("*").eq("organization_id", organization.id).order("updated_at", { ascending: false }),
        database.from("governance_questions").select("*").eq("organization_id", organization.id).order("created_at", { ascending: false }),
      ]);
      return res.status(200).json({ organization, initiatives: projects || [], meetings: meetings || [], consultations: (actions || []).map((item) => ({ ...item, response_count: item.governance_consultation_responses?.[0]?.count || 0 })), questions: questions || [], reports: [] });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (req.body?.action !== "create_consultation_draft") throw new TransactionApiError(400, "CIVIC_ACTION_INVALID", "Choose an available civic action.");
    const title = clean(req.body?.title, 140); const summary = clean(req.body?.summary);
    if (title.length < 5 || summary.length < 20) throw new TransactionApiError(400, "CIVIC_DRAFT_INVALID", "Add a clear question and explain why it matters.");
    const { data: partnerUser } = await database.from("partner_users").select("id").eq("auth_user_id", user.id).eq("partner_id", organization.legacy_partner_id).single();
    const { data: record, error } = await database.from("governance_consultations").insert({ organization_id: organization.id, action_type: "quick_question", title, summary, category: "other", questions: [], publication_status: "draft", created_by_partner_user_id: partnerUser?.id }).select("*").single();
    if (error || !record) throw error || new Error("civic_draft_not_created");
    return res.status(201).json({ message: "Question saved as a draft", record });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
