import {
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
} from "../../../src/lib/api/transactionAuth.js";

const RANGES = { "7d": 7, "30d": 30, "90d": 90 };

function startOfDay(date) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const { membership } = await requirePartnerMembership(req);
    const rangeKey = RANGES[req.query?.range] ? req.query.range : "30d";
    const to = new Date();
    const from = startOfDay(new Date(to.getTime() - RANGES[rangeKey] * 86400000));
    const { data: rows, error } = await database
      .from("perk_redemptions")
      .select("id,status,resident_profile_id,perk_id,discount_amount,final_amount,started_at,completed_at,perk:perks(title)")
      .eq("partner_id", membership.partner_id)
      .gte("started_at", from.toISOString())
      .lte("started_at", to.toISOString())
      .order("started_at", { ascending: false })
      .limit(5000);
    if (error) throw error;

    const all = rows || [];
    const completed = all.filter((row) => row.status === "completed");
    const residents = new Map();
    for (const row of completed) residents.set(row.resident_profile_id, (residents.get(row.resident_profile_id) || 0) + 1);
    const repeats = Array.from(residents.values()).filter((count) => count > 1).length;
    const trendMap = new Map();
    const perkMap = new Map();
    for (const row of completed) {
      const date = String(row.completed_at || row.started_at).slice(0, 10);
      const day = trendMap.get(date) || { date, completedRedemptions: 0, residents: new Set() };
      day.completedRedemptions += 1;
      day.residents.add(row.resident_profile_id);
      trendMap.set(date, day);
      const perk = Array.isArray(row.perk) ? row.perk[0] : row.perk;
      const current = perkMap.get(row.perk_id) || { perkId: row.perk_id, title: perk?.title || "Resident perk", redemptions: 0 };
      current.redemptions += 1;
      perkMap.set(row.perk_id, current);
    }

    const { data: audience } = await database
      .from("partner_audience_insights")
      .select("day_of_week,hour_of_day,redemptions,unique_residents,repeat_redemptions")
      .eq("partner_id", membership.partner_id)
      .order("redemptions", { ascending: false })
      .limit(20);
    const peak = audience?.[0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return res.status(200).json({
      ok: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      metrics: {
        completedRedemptions: completed.length,
        uniqueResidents: residents.size,
        repeatResidentRate: residents.size ? Math.round((repeats / residents.size) * 1000) / 10 : 0,
        conversionRate: all.length ? Math.round((completed.length / all.length) * 1000) / 10 : 0,
        discountValue: completed.reduce((sum, row) => sum + Number(row.discount_amount || 0), 0),
        finalTransactionValue: completed.reduce((sum, row) => sum + Number(row.final_amount || 0), 0),
      },
      trend: Array.from(trendMap.values()).map((day) => ({ date: day.date, completedRedemptions: day.completedRedemptions, uniqueResidents: day.residents.size })),
      topPerks: Array.from(perkMap.values()).sort((a, b) => b.redemptions - a.redemptions).slice(0, 5).map((perk) => ({ ...perk, conversionRate: completed.length ? Math.round((perk.redemptions / completed.length) * 1000) / 10 : 0 })),
      audience: peak ? {
        peakDay: dayNames[Number(peak.day_of_week)] || undefined,
        peakTime: `${String(Number(peak.hour_of_day)).padStart(2, "0")}:00`,
        distinctResidentMinimum: 10,
      } : { distinctResidentMinimum: 10 },
      liveActivity: all.slice(0, 12).map((row) => ({ id: row.id, status: row.status, perkId: row.perk_id, occurredAt: row.completed_at || row.started_at })),
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
