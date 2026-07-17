import { supabaseServer } from "../src/lib/supabaseServer.js";

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

function normalizeResident(body = {}) {
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

  return {
    ...record,
    verificationStatus: verificationStatus(record),
  };
}

async function storeResident(record) {
  if (!supabaseServer) return {
    persisted: false,
  };

  const { error } = await supabaseServer.from("resident_profiles").insert({
    user_id: record.id,
    full_name: record.fullName,
    email: record.email,
    phone: record.phone,
    verification_status: record.verificationStatus,
    metadata: record,
  });

  if (error) throw error;

  if (record.buildingName || record.unitNumber) {
    await supabaseServer.from("resident_memberships").insert({
      user_id: record.id,
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

  const record = normalizeResident(req.body || {});
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
