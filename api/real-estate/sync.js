import { timingSafeEqual } from "node:crypto";
import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { createPropertyRepository } from "../../src/server/domains/realEstate/propertyRepository.js";
import { createRealEstateService } from "../../src/server/domains/realEstate/propertyService.js";

function authorized(req) {
  const expected = process.env.REAL_ESTATE_SYNC_SECRET;
  const provided = req.headers?.authorization?.replace(/^Bearer\s+/i, "") || req.headers?.["x-sync-secret"] || "";
  if (!expected || !provided || expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!supabaseServer) return res.status(503).json({ error: "Canonical property store is not configured" });

  const service = createRealEstateService({ repository: createPropertyRepository(supabaseServer) });
  const providerId = String(req.body?.provider || "luxury-presence");
  try {
    const result = await service.syncProvider(providerId, {
      limit: Math.max(1, Math.min(250, Number(req.body?.limit || 100))),
      updatedSince: req.body?.updatedSince,
      status: req.body?.status,
    });
    return res.status(result.status === "configuration-required" ? 503 : 200).json(result);
  } catch (error) {
    console.error("Real estate provider sync failed", { providerId, message: error.message });
    return res.status(error.status || 500).json({ provider: providerId, status: "failed", error: "Provider sync failed" });
  }
}
