import { getPartnerSources } from "../_utils/partnerLayerData.js";
import { sanitizeString } from "../_utils/publicActor.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const partnerType = sanitizeString(req.query?.partnerType || "property", { max: 32 });
    const partnerId = sanitizeString(req.query?.partnerId || "", { max: 128 });
    const rows = await getPartnerSources(partnerType, partnerId);
    return res.status(200).json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load partner sources" });
  }
}
