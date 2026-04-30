import { supabaseServer } from "../../../src/lib/supabaseServer.js";
import { DOWNTOWN_BUILDINGS_SEED_RUNTIME } from "../../../src/data/downtownBuildings.seed.runtime.js";
import { dedupeBuildings } from "../../../src/lib/enrichment/buildingEnrichment.runtime.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let buildings = [];

    if (supabaseServer) {
      const { data } = await supabaseServer
        .from("buildings")
        .select("*")
        .order("priority", { ascending: true })
        .order("name", { ascending: true });
      if (Array.isArray(data) && data.length > 0) {
        buildings = data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: item.type,
          address: item.address,
          district: item.district,
          latitude: item.latitude,
          longitude: item.longitude,
          unitCount: item.unit_count,
          unitCountSource: item.unit_count_source,
          websiteUrl: item.website_url,
          managementCompany: item.management_company,
          ownershipGroup: item.ownership_group,
          status: item.status,
          priority: item.priority,
          sourceUrls: item.source_urls || [],
          notes: item.notes || null,
        }));
      }
    }

    if (buildings.length === 0) {
      buildings = DOWNTOWN_BUILDINGS_SEED_RUNTIME;
    }

    return res.status(200).json({
      ok: true,
      count: buildings.length,
      results: dedupeBuildings(buildings),
    });
  } catch (error) {
    console.error("buildings index failed", error);
    return res.status(500).json({ ok: false, count: 0, results: [], error: "Failed to load buildings" });
  }
}

