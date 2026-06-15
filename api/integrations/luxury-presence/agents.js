import { supabaseServer } from "../../../src/lib/supabaseServer.js";
import { fetchLuxuryPresenceAgents } from "../../../src/server/integrations/luxuryPresence/client.js";

function normalizeAgent(agent = {}) {
  const externalAgentId = agent.id || agent.external_id || agent.externalId || agent.uuid;
  const name =
    agent.name ||
    [agent.first_name || agent.firstName, agent.last_name || agent.lastName].filter(Boolean).join(" ") ||
    null;

  return {
    external_agent_id: String(externalAgentId),
    name,
    email: agent.email || null,
    phone: agent.phone || agent.mobile_phone || agent.mobilePhone || null,
    image_url: agent.image_url || agent.imageUrl || agent.photo_url || agent.photoUrl || null,
    brokerage: agent.brokerage || agent.company || null,
    raw_payload: agent,
    synced_at: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  if (!supabaseServer) {
    return res.status(503).json({ error: "Supabase server client is not configured" });
  }

  try {
    const { offset = 0, limit = 50, search, tags, tagsMode, externalSource, externalIds } = req.body || {};
    const payload = await fetchLuxuryPresenceAgents({ offset, limit, search, tags, tagsMode, externalSource, externalIds });
    const agents = Array.isArray(payload?.agents) ? payload.agents : Array.isArray(payload) ? payload : [];
    const rows = agents.map(normalizeAgent).filter((row) => row.external_agent_id);

    if (rows.length) {
      const { error } = await supabaseServer
        .from("luxury_presence_agents")
        .upsert(rows, { onConflict: "external_agent_id" });
      if (error) throw error;
    }

    return res.status(200).json({ synced: rows.length });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "agent sync failed" });
  }
}
