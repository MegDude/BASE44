import { supabaseServer } from "../../../src/lib/supabaseServer.js";
import { getLegendsListingById } from "../../../src/server/legends/listingCatalog.js";

function residentKey(req) {
  return String(req.headers["x-resident-id"] || req.headers["x-user-id"] || req.body?.residentId || req.body?.profileId || "").trim();
}

export default async function handler(req, res) {
  if (!["POST", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Method not allowed" });
  const listing = getLegendsListingById(req.query?.listingId);
  if (!listing || listing.displayPermission !== "public") return res.status(404).json({ error: "Listing not found" });
  const residentId = residentKey(req);
  if (!residentId) return res.status(401).json({ error: "Resident identity required" });

  if (supabaseServer) {
    if (req.method === "POST") {
      const { error } = await supabaseServer.from("resident_saved_entities").upsert({ resident_profile_id: residentId, entity_id: listing.id, entity_type: "listing" }, { onConflict: "resident_profile_id,entity_id,entity_type" });
      if (error) return res.status(500).json({ error: error.message });
    } else {
      const { error } = await supabaseServer.from("resident_saved_entities").delete().eq("resident_profile_id", residentId).eq("entity_id", listing.id).eq("entity_type", "listing");
      if (error) return res.status(500).json({ error: error.message });
    }
  }

  return res.status(200).json({ ok: true, status: req.method === "POST" ? "saved" : "removed", listingId: listing.id });
}
