import { supabaseServer } from "../src/lib/supabaseServer.js";

function cleanString(value, max = 500) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};

  const name = cleanString(body.name, 160);
  const email = cleanString(body.email, 220);

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const payload = {
    name,
    email,
    phone: cleanString(body.phone, 80),
    organization: cleanString(body.organization || body.company, 180),
    role: cleanString(body.role, 120),
    partner_type: cleanString(body.partnerType || body.partner_type, 96),
    message: cleanString(body.message, 1200),
    source: cleanString(body.source, 160),
    page: cleanString(body.page, 160),
    campaign: cleanString(body.campaign, 160),
    medium: cleanString(body.medium, 160),
    utm_source: cleanString(body.utmSource || body.utm_source, 160),
    referrer: cleanString(body.referrer, 500)
  };

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, stored: false, payload });
  }

  const { error } = await supabaseServer.from("submissions").insert(payload);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, stored: true });
}
