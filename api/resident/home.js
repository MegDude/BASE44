import { requireResidentProfile, requireTransactionDatabase, sendTransactionError } from "../../src/lib/api/transactionAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const { profile } = await requireResidentProfile(req);
    const [{ data: saved }, { data: events }, { data: inbox }] = await Promise.all([
      database.from("resident_saved_entities").select("entity_type,entity_id,saved_at").eq("resident_profile_id", profile.id).order("saved_at", { ascending: false }).limit(3),
      database.from("user_activity_events").select("event_type,entity_type,entity_id,occurred_at").eq("resident_profile_id", profile.id).order("occurred_at", { ascending: false }).limit(3),
      database.from("resident_civic_inbox").select("consultation_id,delivered_at,acted_at,governance_consultations(title,summary,action_type,publication_status)").eq("resident_profile_id", profile.id).is("dismissed_at", null).order("delivered_at", { ascending: false }).limit(1),
    ]);
    return res.status(200).json({ profile, briefing: { discovery: saved?.[0] || null, benefit: events?.find((item) => item.entity_type === "perk") || null, civic: inbox?.[0] || null }, saved: saved || [], activity: events || [] });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
