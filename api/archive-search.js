import { searchArchiveCatalog, getArchiveSummary } from "./_utils/archiveCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const query = String(req.query?.query || "").trim();
    const typeParam = String(req.query?.types || "").trim();
    const types = typeParam ? typeParam.split(",").map((item) => item.trim()).filter(Boolean) : [];
    const limit = Number.parseInt(String(req.query?.limit || "20"), 10);
    const [results, summary] = await Promise.all([
      searchArchiveCatalog(query, { types, limit: Number.isFinite(limit) ? limit : 20 }),
      getArchiveSummary(),
    ]);

    return res.status(200).json({
      ok: true,
      query,
      types,
      count: results.length,
      summary,
      results,
    });
  } catch (error) {
    console.error("archive-search failed", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Archive search failed",
      results: [],
    });
  }
}
