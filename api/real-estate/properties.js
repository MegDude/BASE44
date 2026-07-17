import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { createPropertyRepository } from "../../src/server/domains/realEstate/propertyRepository.js";
import { createRealEstateService } from "../../src/server/domains/realEstate/propertyService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  const service = createRealEstateService({ repository: createPropertyRepository(supabaseServer) });
  const providerId = String(req.query?.provider || "").trim() || undefined;
  const live = req.query?.live === "true";
  const limit = Math.max(1, Math.min(250, Number(req.query?.limit || 100)));

  try {
    if (req.query?.id) {
      const property = await service.getProperty(String(req.query.id), { providerId, live });
      if (!property) return res.status(404).json({ error: "Property not found" });
      return res.status(200).json({ property });
    }
    const result = await service.listProperties({ providerId, live, limit });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Property request failed" });
  }
}
