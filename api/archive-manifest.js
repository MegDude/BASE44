import { getArchiveManifest, getArchiveSummary } from "./_utils/archiveCatalog.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [manifest, summary] = await Promise.all([getArchiveManifest(), getArchiveSummary()]);
    return res.status(200).json({
      ok: true,
      manifest,
      summary,
    });
  } catch (error) {
    console.error("archive-manifest failed", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Archive manifest failed",
    });
  }
}
