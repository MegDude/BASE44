import {
  requireResidentProfile,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

function cleanText(value, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

async function loadCivic(database, profile) {
  const now = new Date().toISOString();
  const { data: actions, error: actionError } = await database
    .from("governance_consultations")
    .select("id,organization_id,action_type,publication_status,title,summary,questions,opens_at,closes_at,published_at,partner_organizations(name)")
    .eq("publication_status", "published")
    .or(`opens_at.is.null,opens_at.lte.${now}`)
    .or(`closes_at.is.null,closes_at.gte.${now}`)
    .order("published_at", { ascending: false })
    .limit(24);
  if (actionError) throw actionError;

  const actionIds = (actions || []).map((item) => item.id);
  const { data: inbox, error: inboxError } = actionIds.length
    ? await database.from("resident_civic_inbox").select("consultation_id,acted_at,dismissed_at").eq("resident_profile_id", profile.id).in("consultation_id", actionIds)
    : { data: [], error: null };
  if (inboxError) throw inboxError;
  const inboxByAction = new Map((inbox || []).map((item) => [item.consultation_id, item]));
  const normalizedActions = (actions || []).map((item) => ({
    ...item,
    organization_name: item.partner_organizations?.name || "Downtown organization",
    options: Array.isArray(item.questions?.[0]?.options) ? item.questions[0].options : [],
    status: item.publication_status,
    has_responded: Boolean(inboxByAction.get(item.id)?.acted_at),
  }));

  const { data: updates, error: updatesError } = await database.from("governance_timeline_updates").select("id,organization_id,title,summary,published_at,partner_organizations(name)").eq("publication_status", "published").order("published_at", { ascending: false }).limit(12);
  if (updatesError) throw updatesError;
  const { data: meetings, error: meetingsError } = await database.from("governance_meetings").select("id,organization_id,title,summary,starts_at,location_name,publication_status,partner_organizations(name)").eq("publication_status", "published").gte("starts_at", now).order("starts_at").limit(12);
  if (meetingsError) throw meetingsError;
  const { data: projects, error: projectsError } = await database.from("governance_initiatives").select("id,organization_id,title,summary,work_status,latitude,longitude,publication_status,partner_organizations(name)").eq("publication_status", "published").order("updated_at", { ascending: false }).limit(12);
  if (projectsError) throw projectsError;

  return {
    initiatives: projects || [],
    meetings: meetings || [],
    consultations: normalizedActions.filter((item) => ["quick_question", "survey"].includes(item.action_type)),
    updates: (updates || []).map((item) => ({ ...item, organization_name: item.partner_organizations?.name || "Downtown organization" })),
    questions: [],
    yourQuestions: [],
    yourReports: [],
    followedInitiativeIds: [],
    neutrality: "Downtown Perks shares verified civic information and resident questions. It does not endorse political candidates.",
  };
}

export default async function handler(req, res) {
  try {
    const database = requireTransactionDatabase();
    const { profile } = await requireResidentProfile(req);

    if (req.method === "GET") return res.status(200).json(await loadCivic(database, profile));
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const action = cleanText(req.body?.action, 60);
    if (action === "submit_response") {
      const civicActionId = cleanText(req.body?.civicActionId, 80);
      const idempotencyKey = cleanText(req.body?.idempotencyKey || req.headers?.["idempotency-key"], 160);
      if (!civicActionId || !idempotencyKey) throw new TransactionApiError(400, "CIVIC_RESPONSE_INVALID", "Choose a response before sending it.");
      const { data, error } = await database.rpc("submit_resident_civic_response", {
        p_resident_profile_id: profile.id,
        p_consultation_id: civicActionId,
        p_answers: req.body?.answer || {},
        p_idempotency_key: idempotencyKey,
        p_source_route: cleanText(req.body?.sourceRoute, 240),
      });
      if (error) throw error;
      return res.status(201).json({ message: "Response received", responseId: data?.response_id || data?.responseId });
    }

    if (action === "submit_question") {
      const question = cleanText(req.body?.question);
      const organizationId = cleanText(req.body?.organizationId, 80);
      if (question.length < 12 || !organizationId) throw new TransactionApiError(400, "QUESTION_INVALID", "Write a clear question before sending it.");
      const { error } = await database.from("governance_questions").insert({ organization_id: organizationId, resident_profile_id: profile.id, question, category: cleanText(req.body?.category, 80) || "other", idempotency_key: cleanText(req.body?.idempotencyKey, 160) });
      if (error) throw error;
      await database.from("user_activity_events").insert({ resident_profile_id: profile.id, entity_type: "civic_question", entity_id: organizationId, event_type: "civic_action_opened", source_route: cleanText(req.body?.sourceRoute, 240) });
      return res.status(201).json({ message: "Question sent for review" });
    }

    throw new TransactionApiError(400, "CIVIC_ACTION_INVALID", "Choose a civic action to continue.");
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
