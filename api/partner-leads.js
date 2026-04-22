import { supabaseServer } from "../src/lib/supabaseServer.js";
import { sanitizeString } from "./_utils/publicActor.js";

const PARTNER_TYPES = new Set(["residential", "property", "hotel", "venue", "brand", "civic"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const partnerType = sanitizeString(req.body?.partner_type || "property", { max: 32 }).toLowerCase();
    if (!PARTNER_TYPES.has(partnerType)) {
      return res.status(400).json({ error: "Unsupported partner type" });
    }

    const payload = {
      partner_type: partnerType,
      organization_name: sanitizeString(req.body?.organization_name, { max: 160 }),
      contact_name: sanitizeString(req.body?.contact_name, { max: 160 }),
      email: sanitizeString(req.body?.email, { max: 160 }),
      phone: sanitizeString(req.body?.phone || "", { max: 64, required: false }),
      role: sanitizeString(req.body?.role || "", { max: 120, required: false }),
      property_type: sanitizeString(req.body?.property_type || "", { max: 120, required: false }),
      goals: Array.isArray(req.body?.goals) ? req.body.goals.slice(0, 12) : [],
      message: sanitizeString(req.body?.message || "", { max: 4000, required: false }),
      source_page: sanitizeString(req.body?.source_page || "/partners", { max: 255 }),
      created_at: new Date().toISOString(),
    };

    if (!supabaseServer) {
      return res.status(200).json({ ok: true, persisted: false });
    }

    const { error } = await supabaseServer.from("partner_leads").insert(payload);
    if (error) {
      return res.status(200).json({ ok: true, persisted: false, warning: error.message });
    }

    return res.status(200).json({ ok: true, persisted: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid partner lead request" });
  }
}
