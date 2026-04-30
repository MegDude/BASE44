import { supabaseServer } from "../supabaseServer.js";

const FALLBACK_COORDINATES = { lat: 30.2672, lng: -97.7431 };

export function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "string" ? Number.parseFloat(value.trim()) : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function validateBuildingCoordinates(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function normalizeBuildingRecord(record = {}) {
  const lat = toFiniteNumber(record.latitude ?? record.lat);
  const lng = toFiniteNumber(record.longitude ?? record.lng);
  const safeLat = validateBuildingCoordinates(lat, lng) ? lat : FALLBACK_COORDINATES.lat;
  const safeLng = validateBuildingCoordinates(lat, lng) ? lng : FALLBACK_COORDINATES.lng;

  return {
    id: String(record.id || "").trim(),
    name: String(record.name || "").trim(),
    slug: String(record.slug || record.name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    type: record.type || "residential",
    address: String(record.address || "").trim(),
    district: String(record.district || "Downtown Austin").trim(),
    latitude: safeLat,
    longitude: safeLng,
    unitCount: Number.isFinite(Number(record.unitCount)) ? Number(record.unitCount) : null,
    unitCountSource: record.unitCountSource || null,
    websiteUrl: record.websiteUrl || null,
    managementCompany: record.managementCompany || null,
    ownershipGroup: record.ownershipGroup || null,
    status: record.status || "needs_verification",
    priority: Number.isFinite(Number(record.priority)) ? Number(record.priority) : 3,
    notes: record.notes || null,
    sourceUrls: Array.isArray(record.sourceUrls) ? record.sourceUrls.filter(Boolean) : [],
  };
}

export function dedupeBuildings(records = []) {
  const byAddress = new Map();

  for (const rawRecord of records) {
    const record = normalizeBuildingRecord(rawRecord);
    if (!record.name) continue;

    const key = `${record.name.toLowerCase()}::${record.address.toLowerCase()}`;
    if (!byAddress.has(key)) {
      byAddress.set(key, record);
      continue;
    }

    const existing = byAddress.get(key);
    byAddress.set(key, {
      ...existing,
      ...record,
      sourceUrls: Array.from(new Set([...(existing.sourceUrls || []), ...(record.sourceUrls || [])])),
      unitCount: record.unitCount ?? existing.unitCount,
      unitCountSource: record.unitCountSource || existing.unitCountSource,
      managementCompany: record.managementCompany || existing.managementCompany,
      ownershipGroup: record.ownershipGroup || existing.ownershipGroup,
      status: existing.status === "verified" ? existing.status : record.status,
      priority: Math.min(existing.priority || 3, record.priority || 3),
    });
  }

  return Array.from(byAddress.values());
}

export function scoreContactConfidence(contact = {}) {
  let score = 0.35;
  if (contact.name) score += 0.2;
  if (contact.email) score += 0.15;
  if (contact.phone) score += 0.1;
  if (contact.linkedin_url) score += 0.08;
  if (contact.source_url) score += 0.08;
  if (contact.verification_status === "verified") score += 0.2;
  if (!contact.name && contact.role_title) score -= 0.05;
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

export function enrichBuildingRecord(record = {}) {
  const normalized = normalizeBuildingRecord(record);
  const defaultRoles = [
    "Property Manager",
    "Leasing Manager",
    "Community Manager",
    "Marketing Director",
    "General Manager",
  ];

  return {
    ...normalized,
    contactConfidenceScore:
      normalized.managementCompany || normalized.websiteUrl || normalized.sourceUrls.length > 0 ? 0.72 : 0.42,
    lastVerifiedAt: normalized.status === "verified" ? new Date().toISOString() : null,
    rolePlaceholders: defaultRoles.map((roleTitle) => ({
      contact_type: "placeholder",
      role_title: roleTitle,
      name: null,
      email: null,
      phone: null,
      linkedin_url: null,
      source_url: normalized.websiteUrl || normalized.sourceUrls[0] || null,
      confidence_score: scoreContactConfidence({ role_title: roleTitle, verification_status: "needs_verification" }),
      verification_status: "needs_verification",
    })),
  };
}

export async function upsertBuilding(building, client = supabaseServer) {
  if (!client) return { data: normalizeBuildingRecord(building), error: null, source: "fallback" };

  const normalized = normalizeBuildingRecord(building);
  const payload = {
    name: normalized.name,
    slug: normalized.slug,
    type: normalized.type,
    address: normalized.address,
    district: normalized.district,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    unit_count: normalized.unitCount,
    unit_count_source: normalized.unitCountSource,
    website_url: normalized.websiteUrl,
    management_company: normalized.managementCompany,
    ownership_group: normalized.ownershipGroup,
    status: normalized.status,
    priority: normalized.priority,
    source_urls: normalized.sourceUrls,
    notes: normalized.notes,
  };

  return client.from("buildings").upsert(payload, { onConflict: "slug" });
}

export async function upsertBuildingContacts(buildingId, contacts = [], client = supabaseServer) {
  if (!client) return { data: contacts, error: null, source: "fallback" };
  if (!buildingId || !Array.isArray(contacts) || contacts.length === 0) {
    return { data: [], error: null, source: "noop" };
  }

  const payload = contacts.map((contact) => ({
    building_id: buildingId,
    contact_type: contact.contact_type || "placeholder",
    role_title: contact.role_title || null,
    name: contact.name || null,
    email: contact.email || null,
    phone: contact.phone || null,
    linkedin_url: contact.linkedin_url || null,
    source_url: contact.source_url || null,
    confidence_score: scoreContactConfidence(contact),
    verification_status: contact.verification_status || "needs_verification",
  }));

  return client.from("building_contacts").upsert(payload, { onConflict: "building_id,role_title,email" });
}
