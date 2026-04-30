import { DOWNTOWN_BUILDINGS_SEED_RUNTIME } from "../../../../src/data/downtownBuildings.seed.runtime.js";
import { enrichBuildingRecord, upsertBuilding, upsertBuildingContacts } from "../../../../src/lib/enrichment/buildingEnrichment.runtime.js";
import { supabaseServer } from "../../../../src/lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((id) => String(id)) : [];
    const sourceBuildings = ids.length > 0
      ? DOWNTOWN_BUILDINGS_SEED_RUNTIME.filter((building) => ids.includes(building.id))
      : DOWNTOWN_BUILDINGS_SEED_RUNTIME;

    const results = [];

    for (const building of sourceBuildings) {
      const enriched = enrichBuildingRecord(building);
      const buildingResult = await upsertBuilding(enriched, supabaseServer);
      let persistedBuildingId = enriched.id;

      if (supabaseServer) {
        const { data: persistedRow } = await supabaseServer
          .from("buildings")
          .select("id")
          .eq("slug", enriched.slug)
          .maybeSingle();
        if (persistedRow?.id) {
          persistedBuildingId = persistedRow.id;
        }
      }

      const contactResult = await upsertBuildingContacts(
        persistedBuildingId,
        enriched.rolePlaceholders,
        supabaseServer
      );

      results.push({
        id: enriched.id,
        name: enriched.name,
        buildingOk: !buildingResult.error,
        contactsOk: !contactResult.error,
        contactConfidenceScore: enriched.contactConfidenceScore,
      });
    }

    return res.status(200).json({
      ok: true,
      count: results.length,
      results,
      source: supabaseServer ? "supabase" : "fallback",
    });
  } catch (error) {
    console.error("building enrich failed", error);
    return res.status(500).json({ ok: false, error: "Failed to enrich buildings" });
  }
}
