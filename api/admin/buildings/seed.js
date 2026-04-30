import { DOWNTOWN_BUILDINGS_SEED_RUNTIME } from "../../../../src/data/downtownBuildings.seed.runtime.js";
import { dedupeBuildings, upsertBuilding } from "../../../../src/lib/enrichment/buildingEnrichment.runtime.js";
import { supabaseServer } from "../../../../src/lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const buildings = dedupeBuildings(DOWNTOWN_BUILDINGS_SEED_RUNTIME);
    const results = [];

    for (const building of buildings) {
      const { error } = await upsertBuilding(building, supabaseServer);
      results.push({ id: building.id, name: building.name, ok: !error, error: error?.message || null });
    }

    return res.status(200).json({
      ok: true,
      seeded: buildings.length,
      results,
      source: supabaseServer ? "supabase" : "fallback",
    });
  } catch (error) {
    console.error("building seed failed", error);
    return res.status(500).json({ ok: false, error: "Failed to seed buildings" });
  }
}

