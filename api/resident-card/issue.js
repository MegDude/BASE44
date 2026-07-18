import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { createResidentCardProfile, isUuid } from "../../src/lib/residentCard.js";

function clean(value, limit = 240) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function requestOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${protocol}://${host}` : undefined;
}

async function insertBestEffort(table, row) {
  if (!supabaseServer) return { table, status: "unavailable", reason: "Supabase is not configured" };
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    return error ? { table, status: "skipped", reason: error.message } : { table, status: "stored" };
  } catch (error) {
    return { table, status: "skipped", reason: error?.message || "insert_failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body || {};
  const resident = createResidentCardProfile(body, { origin: requestOrigin(req) });
  const card = resident.residentCard;
  const userId = isUuid(body.userId || body.user_id || body.id) ? (body.userId || body.user_id || body.id) : null;
  const writes = [];

  writes.push(await insertBestEffort("resident_profiles", {
    user_id: userId,
    name: clean(resident.fullName || resident.name, 160) || null,
    email: clean(resident.email, 240).toLowerCase() || null,
    phone: clean(resident.phone, 60) || null,
    membership_status: clean(resident.verificationStatus || resident.membership_status, 80) || "active",
    source: clean(resident.source, 120) || "resident_card_issue",
    status: "active",
    metadata: {
      ...body,
      residentCard: card,
      residentId: resident.residentId,
      cardNumber: card.cardNumber,
      cardIssuedAt: card.issuedAt,
    },
  }));

  writes.push(await insertBestEffort("perk_cards", {
    card_code: card.cardNumber,
    status: "active",
    metadata: {
      residentId: resident.residentId,
      token: card.token,
      issuedAt: card.issuedAt,
      source: "resident_card_issue",
    },
  }));

  return res.status(200).json({
    ok: true,
    resident,
    card,
    persisted: writes.some((write) => write.status === "stored"),
    status: writes.some((write) => write.status === "stored") ? "issued" : "issued_local",
    writes,
  });
}
