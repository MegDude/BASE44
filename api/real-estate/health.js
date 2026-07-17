import { createRealEstateService } from "../../src/server/domains/realEstate/propertyService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  const service = createRealEstateService({ repository: { list: async () => [], get: async () => null, upsertMany: async () => ({ persisted: 0 }) } });
  return res.status(200).json({ providers: await service.health() });
}
