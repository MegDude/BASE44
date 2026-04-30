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
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return res.status(400).json({ error: "Missing business name" });
  }

  const type = typeof body.type === "string" && body.type.trim() ? body.type.trim() : "venue";
  const payload = {
    name,
    type,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseServer
    .from("map_entities")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  await logInteraction({
    type: "partner_created",
    entityId: data.id,
    entityType: type,
    source: "api/partner/create",
    metadata: {
      name,
    },
  });

  return res.status(200).json(data);
}
