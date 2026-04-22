import { sanitizeString } from "../_utils/publicActor.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const anonymousId = sanitizeString(req.body?.anonymous_id || `anon-${Date.now()}`, {
      max: 120,
      required: false,
    }) || `anon-${Date.now()}`;

    return res.status(200).json({
      ok: true,
      session: {
        id: anonymousId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      session: {
        id: `anon-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    });
  }
}
