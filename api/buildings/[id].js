import { supabaseServer } from "../../../src/lib/supabaseServer.js";
import { DOWNTOWN_BUILDINGS_SEED_RUNTIME } from "../../../src/data/downtownBuildings.seed.runtime.js";
import { enrichBuildingRecord } from "../../../src/lib/enrichment/buildingEnrichment.runtime.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = String(req.query?.id || "").trim().toLowerCase();
  if (!id) {
    return res.status(400).json({ error: "Missing building id" });
  }

  try {
    if (supabaseServer) {
      const { data } = await supabaseServer
        .from("buildings")
        .select("*, building_contacts(*)")
        .eq("slug", id)
        .maybeSingle();

      if (data) {
        return res.status(200).json({ ok: true, result: data });
      }
    }

    const building = DOWNTOWN_BUILDINGS_SEED_RUNTIME.find(
      (item) => item.id === id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
    );

    if (!building) {
      return res.status(404).json({ ok: false, error: "Building not found" });
    }

    return res.status(200).json({
      ok: true,
      result: enrichBuildingRecord(building),
    });
  } catch (error) {
    console.error("building detail failed", error);
    return res.status(500).json({ ok: false, error: "Failed to load building detail" });
  }
}
