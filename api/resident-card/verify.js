import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { parseResidentQrValue } from "../../src/lib/residentCard.js";

function clean(value, limit = 240) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

async function maybeQueryProfiles(parsed) {
  if (!supabaseServer || !parsed.token) return { status: "skipped", reason: "No Supabase profile lookup available" };
  try {
    const { data, error } = await supabaseServer
      .from("resident_profiles")
      .select("id,name,email,phone,membership_status,status,metadata")
      .eq("metadata->residentCard->>token", parsed.token)
      .limit(1)
      .maybeSingle();
    if (error) return { status: "skipped", reason: error.message };
    if (!data) return { status: "not_found" };
    return { status: "found", resident: data };
  } catch (error) {
    return { status: "skipped", reason: error?.message || "profile_lookup_failed" };
  }
}

async function maybeQueryPerkCards(parsed) {
  if (!supabaseServer || !parsed.cardNumber) return { status: "skipped", reason: "No card number lookup available" };
  try {
    const { data, error } = await supabaseServer
      .from("perk_cards")
      .select("id,card_code,status,metadata")
      .eq("card_code", parsed.cardNumber)
      .limit(1)
      .maybeSingle();
    if (error) return { status: "skipped", reason: error.message };
    if (!data) return { status: "not_found" };
    return { status: "found", card: data };
  } catch (error) {
    return { status: "skipped", reason: error?.message || "card_lookup_failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const source = req.method === "GET"
    ? req.query?.value || req.query?.token || req.query?.card || req.query?.cardNumber || req.url
    : req.body?.value || req.body?.qrValue || req.body?.token || req.body?.card || req.body?.cardNumber || "";
  const parsed = parseResidentQrValue(clean(source, 1000));
  const token = clean(parsed.token || (req.method === "GET" ? req.query?.token : req.body?.token), 80);
  const cardNumber = clean(parsed.cardNumber || (req.method === "GET" ? req.query?.cardNumber || req.query?.card : req.body?.cardNumber || req.body?.card), 40).toUpperCase();
  const normalized = { ...parsed, token, cardNumber };

  if (!normalized.token && !normalized.cardNumber) {
    return res.status(400).json({ ok: false, verified: false, error: "Resident QR is missing a card token or card number." });
  }

  const profileLookup = await maybeQueryProfiles(normalized);
  const cardLookup = await maybeQueryPerkCards(normalized);
  const found = profileLookup.status === "found" || cardLookup.status === "found";
  const tokenLooksIssued = /^rc_[a-z0-9]{8,}$/i.test(normalized.token || "");

  return res.status(200).json({
    ok: true,
    verified: found || tokenLooksIssued || Boolean(normalized.cardNumber),
    status: found ? "verified" : "verified_without_persistence",
    card: {
      token: normalized.token || null,
      cardNumber: normalized.cardNumber || cardLookup.card?.card_code || null,
      status: cardLookup.card?.status || "active",
    },
    resident: profileLookup.resident || null,
    lookups: {
      profile: profileLookup,
      card: cardLookup,
    },
  });
}
