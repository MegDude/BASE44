import { proxyAgentQuery } from "./agent/query.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await proxyAgentQuery({
      ...(req.body || {}),
      intent: req.body?.intent || "ask_map",
    });
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || "Backend agent gateway unavailable",
      source: "ask-map-agent-proxy",
    });
  }
}
