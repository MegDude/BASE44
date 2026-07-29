import {
  requireResidentProfile,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

function clean(value, limit = 240) {
  return String(value || "").trim().slice(0, limit);
}

export default async function handler(req, res) {
  if (!new Set(["GET", "POST"]).has(req.method)) return res.status(405).json({ error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const { user, profile } = await requireResidentProfile(req);

    if (req.method === "GET") {
      const { data, error } = await database
        .from("resident_saved_entities")
        .select("entity_type,entity_id,saved_at,source_surface,source_context")
        .eq("resident_profile_id", profile.id)
        .order("saved_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return res.status(200).json({ ok: true, profileId: profile.id, entities: data || [], savedCount: data?.length || 0 });
    }

    const entityType = clean(req.body?.entityType, 80);
    const entityId = clean(req.body?.entityId, 180);
    const saved = req.body?.saved !== false;
    const sourceSurface = clean(req.body?.sourceSurface, 120) || null;
    const sourceContext = req.body?.sourceContext && typeof req.body.sourceContext === "object" ? req.body.sourceContext : {};
    if (!entityType || !entityId) throw new TransactionApiError(400, "ENTITY_REQUIRED", "Choose an item to save.");

    const idempotencyKey = clean(req.headers?.["idempotency-key"] || req.body?.idempotencyKey, 200);
    if (idempotencyKey.length < 8) throw new TransactionApiError(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid request key is required.");

    const { data, error } = await database.rpc("dp_set_resident_saved_entity", {
      p_auth_user_id: user.id,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_saved: saved,
      p_idempotency_key: idempotencyKey,
      p_source_surface: sourceSurface,
      p_source_route: clean(req.body?.sourceRoute, 1000) || null,
      p_source_context: sourceContext,
    });
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      saved,
      entityType,
      entityId,
      savedCount: Number(data?.saved_count || 0),
      occurredAt: data?.occurred_at || new Date().toISOString(),
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
