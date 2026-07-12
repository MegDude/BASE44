import { getLegendsSeoReport } from "../../../src/server/integrations/luxuryPresence/seoReport.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET required" });
  }

  const report = getLegendsSeoReport();
  return res.status(200).json(report);
}
