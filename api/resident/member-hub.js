import { requireResidentProfile, requireTransactionDatabase, sendTransactionError } from "../../src/lib/api/transactionAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const { profile } = await requireResidentProfile(req);
    const [{ data: saved, error: savedError }, { data: bookings, error: bookingError }, { data: redemptions, error: redemptionError }] = await Promise.all([
      database.from("resident_saved_entities").select("entity_type,entity_id,saved_at,source_context").eq("resident_profile_id", profile.id).order("saved_at", { ascending: false }).limit(100),
      database.from("event_rsvps").select("id,event_id,status,source,metadata,created_at,events(id,title,start_time,end_time,address,image_url)").eq("resident_id", profile.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(100),
      database.from("perk_redemptions").select("id,perk_id,status,source,metadata,redeemed_at,perks(id,title,description,start_date,end_date)").eq("resident_id", profile.id).in("status", ["ready", "presented", "wallet_added", "active"]).order("redeemed_at", { ascending: false }).limit(100),
    ]);
    if (savedError) throw savedError;
    if (bookingError) throw bookingError;
    if (redemptionError) throw redemptionError;
    return res.status(200).setHeader("Cache-Control", "private, no-store").json({
      ok: true,
      profileId: profile.id,
      saved: saved || [],
      activePerks: redemptions || [],
      upcomingBookings: (bookings || []).filter((booking) => {
        const start = booking.events?.start_time;
        return !start || new Date(start).getTime() >= Date.now() - 60 * 60 * 1000;
      }),
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
