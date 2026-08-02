import { getLegendsProperty } from "../../src/server/legends/listingCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const property = getLegendsProperty(String(req.query?.propertyId || ""));
  if (!property) return res.status(404).json({ error: "Property not found" });
  return res.status(200).json({ property, source: "canonical-legends-listing-catalog" });
}
