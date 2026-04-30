import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { logInteraction } from "../_utils/interactions.js";

function parseBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }

  return req.body && typeof req.body === "object" ? req.body : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabaseServer) {
    return res.status(500).json({ error: "Missing Supabase server environment variables" });
  }

  const body = parseBody(req);
  const entityId = typeof body.entity_id === "string" ? body.entity_id.trim() : "";

  if (!entityId) {
    return res.status(400).json({ error: "Missing entity_id" });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseServer
    .from("qr_tokens")
    .insert({
      token,
      entity_id: entityId,
      partner_id: body.partner_id || null,
      entry_context: typeof body.entry_context === "string" ? body.entry_context : "venue",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  await logInteraction({
    type: "qr_generated",
    entityId,
    entityType: typeof body.entity_type === "string" ? body.entity_type : null,
    partnerId: body.partner_id || null,
    source: "api/qr/generate",
    metadata: {
      token,
      entryContext: data.entry_context,
      expiresAt,
    },
  });

  return res.status(200).json({
    ok: true,
    token,
    expires_at: expiresAt,
    qr_url: `/api/redeem?token=${encodeURIComponent(token)}`,
  });
}
