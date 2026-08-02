import { getDowntownTop10Listings, getLegendsListings, publicListing } from "../src/server/legends/listingCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const status = String(req.query?.status || "").toLowerCase();
  const top10 = String(req.query?.collection || "") === "downtown-top-10";
  const listings = top10 ? getDowntownTop10Listings() : getLegendsListings().map(publicListing);
  const filtered = status ? listings.filter((listing) => listing.status === status) : listings;
  return res.status(200).json({ listings: filtered, count: filtered.length, source: "canonical-legends-listing-catalog" });
}
