import { getRelatedLegendsListings } from "../../../src/server/legends/listingCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(200).json({ listings: getRelatedLegendsListings(req.query?.listingId), source: "canonical-legends-listing-catalog" });
}
