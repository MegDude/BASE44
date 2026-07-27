import { randomUUID } from "node:crypto";
import {
  requireResidentProfile,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

function clean(value, limit = 240) {
  return String(value || "").trim().slice(0, limit);
}

function savedEntityParameters({ user, entityType, entityId, saved, sourceSurface, sourceRoute, sourceContext, idempotencyKey }) {
  return {
    p_auth_user_id: user.id,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_saved: saved,
    p_idempotency_key: idempotencyKey,
    p_source_surface: sourceSurface,
    p_source_route: sourceRoute,
    p_source_context: sourceContext,
  };
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
    const sourceRoute = clean(req.body?.sourceRoute || req.headers?.referer, 500) || null;
    const sourceContext = req.body?.sourceContext && typeof req.body.sourceContext === "object" ? req.body.sourceContext : {};
    const idempotencyKey = clean(req.body?.idempotencyKey, 180) || randomUUID();
    if (!entityType || !entityId) throw new TransactionApiError(400, "ENTITY_REQUIRED", "Choose an item to save.");

    const { data, error } = await database.rpc(
      "dp_set_resident_saved_entity",
      savedEntityParameters({ user, entityType, entityId, saved, sourceSurface, sourceRoute, sourceContext, idempotencyKey }),
    );
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      saved: data?.saved ?? saved,
      entityType: data?.entityType || entityType,
      entityId: data?.entityId || entityId,
      savedCount: Number(data?.savedCount || 0),
      occurredAt: data?.occurredAt || new Date().toISOString(),
      idempotentReplay: Boolean(data?.idempotentReplay),
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
