import { getListingQualityRows } from "../../../src/server/legends/listingCatalog.js";

function isAdmin(req) {
  return [req.headers["x-admin"], req.headers["x-super-admin"], req.query?.admin]
    .map((value) => String(value || "").toLowerCase())
    .some((value) => value === "1" || value === "true" || value === "super_admin");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin access required" });
  const rows = getListingQualityRows();
  return res.status(200).json({ rows, issueCount: rows.filter((row) => row.issues.length).length, source: "canonical-legends-listing-catalog" });
}
