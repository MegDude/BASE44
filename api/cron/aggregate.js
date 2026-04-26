import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { demandScore } from "../_utils/interactions.js";

export default async function handler(req, res) {
  if (!supabaseServer) {
    return res.status(500).json({ error: "Missing Supabase server environment variables" });
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseServer
    .from("interactions")
    .select("entity_id, type, created_at")
    .gte("created_at", since);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const grouped = {};

  for (const item of data || []) {
    if (!item.entity_id) continue;

    if (!grouped[item.entity_id]) {
      grouped[item.entity_id] = {
        saves: 0,
        visits: 0,
        impressions: 0,
        redemptions: 0,
      };
    }

    if (item.type === "save") grouped[item.entity_id].saves += 1;
    if (item.type === "visit_confirmed") grouped[item.entity_id].visits += 1;
    if (item.type === "impression") grouped[item.entity_id].impressions += 1;
    if (item.type === "redeem") grouped[item.entity_id].redemptions += 1;
  }

  const rows = Object.entries(grouped).map(([entityId, metrics]) => ({
    entity_id: entityId,
    ts: new Date().toISOString(),
    ...metrics,
    score: demandScore(metrics),
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabaseServer.from("demand_snapshots").insert(rows);
    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }
  }

  return res.status(200).json({ ok: true, rowsInserted: rows.length });
}
