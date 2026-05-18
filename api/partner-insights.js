import { supabaseServer } from "../src/lib/supabaseServer.js";

function bumpMetric(store, key, field, amount = 1) {
  if (!key) return;
  if (!store[key]) {
    store[key] = {
      impressions: 0,
      saves: 0,
      visits: 0,
      redemptions: 0,
      analyticsScans: 0,
      repeatRate: 0,
    };
  }
  store[key][field] = Number(store[key][field] || 0) + amount;
}

function candidateKeys(rawId, rawType) {
  const id = rawId ? String(rawId).trim() : "";
  const type = rawType ? String(rawType).trim() : "";
  if (!id) return [];

  const keys = new Set([id]);
  if (type) keys.add(`${type}:${id}`);
  return [...keys];
}

function withStatus(result) {
  if (!result || result.error) return [];
  return Array.isArray(result.data) ? result.data : [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabaseServer) {
    return res.status(200).json({
      ok: true,
      metricsByEntity: {},
      hasLiveData: false,
      reason: "missing_supabase_env",
    });
  }

  const metricsByEntity = {};

  const [
    impressionsResult,
    savesResult,
    visitsResult,
    redemptionsResult,
    analyticsSignalsResult,
    demandSnapshotsResult,
    pricingRecsResult,
  ] = await Promise.all([
    supabaseServer.from("map_impressions").select("entity_id, entity_type").limit(5000),
    supabaseServer.from("saved_items").select("entity_id, entity_type").limit(5000),
    supabaseServer.from("visits").select("venue_id").limit(5000),
    supabaseServer.from("redemptions").select("venue_id").limit(5000),
    supabaseServer
      .from("analytics_signals")
      .select("action_type, entity_id, entity_type, venue_id, campaign_id")
      .limit(5000),
    supabaseServer
      .from("demand_snapshots")
      .select("entity_id, ts, score, saves, visits, impressions, redemptions")
      .order("ts", { ascending: false })
      .limit(200),
    supabaseServer
      .from("pricing_recs")
      .select("entity_id, ts, recommended_bid_cents, recommended_budget_cents, confidence")
      .order("ts", { ascending: false })
      .limit(200),
  ]);

  const impressions = withStatus(impressionsResult);
  impressions.forEach((row) => {
    candidateKeys(row.entity_id, row.entity_type).forEach((key) =>
      bumpMetric(metricsByEntity, key, "impressions", 1)
    );
  });

  const saves = withStatus(savesResult);
  saves.forEach((row) => {
    candidateKeys(row.entity_id, row.entity_type).forEach((key) =>
      bumpMetric(metricsByEntity, key, "saves", 1)
    );
  });

  const visits = withStatus(visitsResult);
  visits.forEach((row) => {
    candidateKeys(row.venue_id, "venue").forEach((key) =>
      bumpMetric(metricsByEntity, key, "visits", 1)
    );
  });

  const redemptions = withStatus(redemptionsResult);
  redemptions.forEach((row) => {
    candidateKeys(row.venue_id, "venue").forEach((key) =>
      bumpMetric(metricsByEntity, key, "redemptions", 1)
    );
  });

  const analyticsSignals = withStatus(analyticsSignalsResult);
  analyticsSignals.forEach((row) => {
    const rawKey =
      row.entity_id ||
      row.venue_id ||
      row.campaign_id;
    const rawType =
      row.entity_type ||
      (row.venue_id ? "venue" : row.campaign_id ? "campaign" : "");

    candidateKeys(rawKey, rawType).forEach((key) => {
      if (row.action_type === "scan" || row.action_type === "impression") {
        bumpMetric(metricsByEntity, key, "impressions", 1);
      }
      if (row.action_type === "save") {
        bumpMetric(metricsByEntity, key, "saves", 1);
      }
      if (row.action_type === "visit" || row.action_type === "visit_intent") {
        bumpMetric(metricsByEntity, key, "visits", 1);
      }
      if (row.action_type === "redemption") {
        bumpMetric(metricsByEntity, key, "redemptions", 1);
      }
      if (row.action_type === "scan") {
        bumpMetric(metricsByEntity, key, "analyticsScans", 1);
      }
    });
  });

  Object.values(metricsByEntity).forEach((entry) => {
    const impressionsCount = Number(entry.impressions || 0);
    const visitsCount = Number(entry.visits || 0);
    entry.conversionRate =
      impressionsCount > 0 ? Math.round((visitsCount / impressionsCount) * 100) : 0;
  });

  const demandSnapshots = withStatus(demandSnapshotsResult);
  const pricingRecs = withStatus(pricingRecsResult);

  const latestDemandByEntity = {};
  demandSnapshots.forEach((row) => {
    if (!row.entity_id || latestDemandByEntity[row.entity_id]) return;
    latestDemandByEntity[row.entity_id] = row;
  });

  const latestPricingByEntity = {};
  pricingRecs.forEach((row) => {
    if (!row.entity_id || latestPricingByEntity[row.entity_id]) return;
    latestPricingByEntity[row.entity_id] = row;
  });

  const totals = Object.values(metricsByEntity).reduce(
    (acc, entry) => {
      acc.impressions += Number(entry.impressions || 0);
      acc.saves += Number(entry.saves || 0);
      acc.visits += Number(entry.visits || 0);
      acc.redemptions += Number(entry.redemptions || 0);
      return acc;
    },
    { impressions: 0, saves: 0, visits: 0, redemptions: 0 }
  );

  const scoredEntities = Object.entries(latestDemandByEntity)
    .map(([entityId, row]) => ({
      entityId,
      score: Number(row.score || 0),
      saves: Number(row.saves || 0),
      visits: Number(row.visits || 0),
      impressions: Number(row.impressions || 0),
      redemptions: Number(row.redemptions || 0),
      pricing: latestPricingByEntity[entityId] || null,
    }))
    .sort((a, b) => b.score - a.score);

  return res.status(200).json({
    ok: true,
    metricsByEntity,
    hasLiveData: Object.keys(metricsByEntity).length > 0,
    summary: {
      shown: totals.impressions,
      saves: totals.saves,
      visits: totals.visits,
      redemptions: totals.redemptions,
      revenueCents: totals.redemptions * 1200,
    },
    topDemand: scoredEntities.slice(0, 5),
  });
}
