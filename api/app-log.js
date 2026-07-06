import { supabaseServer } from "../src/lib/supabaseServer.js";

function clean(value, limit = 500) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function normalizeBody(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return Object.fromEntries(
    Object.entries(body)
      .map(([key, value]) => [
        clean(key, 120),
        typeof value === "object" && value !== null ? value : clean(value, 1000),
      ])
      .filter(([key]) => key),
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = normalizeBody(req.body || {});
  const metadata = {
    path: clean(body.path || body.url || req.headers.referer, 1000),
    sourceUrl: clean(req.url, 1000),
    body,
    capturedAt: new Date().toISOString(),
  };

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, stored: false, reason: "supabase_not_configured" });
  }

  try {
    const { error } = await supabaseServer.from("analytics_signals").insert({
      source_type: "map_discovery",
      action_type: "open",
      value: 1,
      session_token: clean(body.sessionId || body.session_id || body.session, 180) || null,
      user_email: clean(body.profileId || body.userId || body.user_id || body.email, 240) || null,
      metadata,
    });

    if (error) throw error;
    return res.status(200).json({ ok: true, stored: true });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      stored: false,
      reason: error?.message || "analytics_storage_failed",
    });
  }
}
