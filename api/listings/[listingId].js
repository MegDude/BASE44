import { getLegendsListingById, publicListing } from "../../src/server/legends/listingCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const listing = getLegendsListingById(req.query?.listingId);
  if (!listing || listing.displayPermission !== "public") return res.status(404).json({ error: "Listing not found" });
  return res.status(200).json({ listing: publicListing(listing), source: "canonical-legends-listing-catalog" });
}
