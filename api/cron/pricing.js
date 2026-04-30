import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { pricingModel, trendBoost } from "../_utils/interactions.js";

export default async function handler(req, res) {
  if (!supabaseServer) {
    return res.status(500).json({ error: "Missing Supabase server environment variables" });
  }

  const { data, error } = await supabaseServer
    .from("demand_snapshots")
    .select("*")
    .order("ts", { ascending: false })
    .limit(500);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const latestByEntity = new Map();
  const previousByEntity = new Map();

  for (const row of data || []) {
    if (!latestByEntity.has(row.entity_id)) {
      latestByEntity.set(row.entity_id, row);
    } else if (!previousByEntity.has(row.entity_id)) {
      previousByEntity.set(row.entity_id, row);
    }
  }

  const inserts = [];

  for (const [entityId, current] of latestByEntity.entries()) {
    const previous = previousByEntity.get(entityId) || null;
    const trend = trendBoost(current, previous);
    const adjustedScore = Number(current.score || 0) * trend;
    const { bid, budget, confidence } = pricingModel(adjustedScore);

    inserts.push({
      entity_id: entityId,
      ts: new Date().toISOString(),
      recommended_bid_cents: bid,
      recommended_budget_cents: budget,
      confidence,
    });
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabaseServer.from("pricing_recs").insert(inserts);
    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }
  }

  return res.status(200).json({ ok: true, rowsInserted: inserts.length });
}
