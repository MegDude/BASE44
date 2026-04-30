import { supabaseServer } from "../../../../src/lib/supabaseServer.js";
import { DOWNTOWN_BUILDINGS_SEED_RUNTIME } from "../../../../src/data/downtownBuildings.seed.runtime.js";
import { dedupeBuildings, enrichBuildingRecord, validateBuildingCoordinates } from "../../../../src/lib/enrichment/buildingEnrichment.runtime.js";

function buildWarnings(buildings) {
  const seen = new Set();
  const duplicates = [];

  for (const building of buildings) {
    const key = `${building.name.toLowerCase()}::${building.address.toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push(building.name);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let buildings = [];
    let contacts = [];

    if (supabaseServer) {
      const [{ data: buildingRows }, { data: contactRows }] = await Promise.all([
        supabaseServer.from("buildings").select("*"),
        supabaseServer.from("building_contacts").select("*"),
      ]);
      buildings = Array.isArray(buildingRows) && buildingRows.length > 0
        ? buildingRows.map((item) => ({
            id: item.id,
            name: item.name,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            unitCount: item.unit_count,
            managementCompany: item.management_company,
            status: item.status,
            priority: item.priority,
          }))
        : DOWNTOWN_BUILDINGS_SEED_RUNTIME;
      contacts = Array.isArray(contactRows) ? contactRows : [];
    } else {
      buildings = DOWNTOWN_BUILDINGS_SEED_RUNTIME;
    }

    const normalized = dedupeBuildings(buildings);
    const enriched = normalized.map(enrichBuildingRecord);
    const duplicateWarnings = buildWarnings(normalized);

    return res.status(200).json({
      ok: true,
      totalBuildings: normalized.length,
      verifiedBuildings: normalized.filter((building) => building.status === "verified").length,
      buildingsMissingCoordinates: normalized.filter(
        (building) => !validateBuildingCoordinates(building.latitude, building.longitude)
      ).length,
      buildingsMissingUnitCounts: normalized.filter((building) => !Number.isFinite(Number(building.unitCount))).length,
      buildingsMissingManagementCompany: normalized.filter((building) => !building.managementCompany).length,
      buildingsMissingContactRecords: normalized.filter(
        (building) => !contacts.some((contact) => contact.building_id === building.id)
      ).length,
      duplicateWarnings,
      confidenceByBuilding: enriched.map((building) => ({
        id: building.id,
        name: building.name,
        confidenceScore: building.contactConfidenceScore,
      })),
    });
  } catch (error) {
    console.error("building quality report failed", error);
    return res.status(500).json({ ok: false, error: "Failed to build quality report" });
  }
}

