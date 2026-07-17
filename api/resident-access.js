import { supabaseServer } from "../src/lib/supabaseServer.js";
import { createResidentCardProfile, isUuid } from "../src/lib/residentCard.js";

const APPROVED_BUILDING_DOMAINS = new Set([
  "springaustin.com",
  "theindependentaustin.com",
  "seaholmresidences.com",
]);

function clean(value, limit = 240) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function normalizeDomain(email = "") {
  return clean(email.split("@")[1] || "", 180).toLowerCase();
}

function verificationStatus(record) {
  const domain = normalizeDomain(record.email);
  if (APPROVED_BUILDING_DOMAINS.has(domain)) return "verified";
  if (record.accessPath === "building") return "pending_building_review";
  return "perks_card";
}

function normalizeResident(body = {}, origin) {
  const record = {
    id: clean(body.id, 180) || `resident-${Date.now()}`,
    fullName: clean(body.fullName || body.name),
    email: clean(body.email, 240).toLowerCase(),
    phone: clean(body.phone, 60),
    accessPath: clean(body.accessPath, 60) || "card",
    buildingName: clean(body.buildingName),
    buildingAddress: clean(body.buildingAddress, 300),
    unitNumber: clean(body.unitNumber, 80),
    moveInStatus: clean(body.moveInStatus, 120),
    source: clean(body.source, 120) || "resident_access",
    createdAt: new Date().toISOString(),
  };

  return createResidentCardProfile({
    ...record,
    verificationStatus: verificationStatus(record),
  }, { origin });
}

function requestOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${protocol}://${host}` : undefined;
}

async function storeResident(record) {
  if (!supabaseServer) return {
    persisted: false,
  };

  const userId = isUuid(record.userId || record.user_id || record.id) ? (record.userId || record.user_id || record.id) : null;
  const { error } = await supabaseServer.from("resident_profiles").insert({
    user_id: userId,
    name: record.fullName || record.name || null,
    email: record.email || null,
    phone: record.phone || null,
    membership_status: record.verificationStatus || "perks_card",
    source: record.source || "resident_access",
    status: "active",
    metadata: record,
  });

  if (error) throw error;

  await supabaseServer.from("perk_cards").insert({
    card_code: record.residentCard.cardNumber,
    status: "active",
    metadata: {
      residentId: record.residentId,
      token: record.residentCard.token,
      issuedAt: record.residentCard.issuedAt,
      source: "resident_access",
    },
  }).then(() => null).catch(() => null);

  if (record.buildingName || record.unitNumber) {
    await supabaseServer.from("resident_memberships").insert({
      user_id: userId,
      building_id: record.buildingName || "manual-review",
      unit_number: record.unitNumber || null,
      status: record.verificationStatus === "verified" ? "active" : "pending",
      metadata: record,
    });
  }

  return { persisted: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const record = normalizeResident(req.body || {}, requestOrigin(req));
  if (!record.fullName) return res.status(400).json({ error: "Name is required" });
  if (!record.email) return res.status(400).json({ error: "Email is required" });
  if (record.accessPath === "building" && (!record.buildingName || !record.unitNumber)) {
    return res.status(400).json({ error: "Building name and unit are required for building verification" });
  }

  try {
    const persistence = await storeResident(record);
    const resident = record;
    return res.status(200).json({
      ok: true,
      resident,
      persisted: persistence.persisted,
      status: persistence.persisted ? "accepted" : "accepted_local",
      next: persistence.persisted && record.verificationStatus === "verified" ? "open_app" : "review",
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Resident access failed" });
  }
}
