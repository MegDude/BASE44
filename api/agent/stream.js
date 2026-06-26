import { proxyAgentQuery } from "./query.js";

function writeEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    writeEvent(res, { type: "agent_start", sessionId: req.body?.sessionId || "" });
    const result = await proxyAgentQuery(req.body || {});
    if (result.status >= 400) {
      writeEvent(res, { type: "agent_error", error: result.body?.error || "Agent stream failed" });
      res.end();
      return;
    }
    writeEvent(res, { type: "agent_response", payload: result.body });
    writeEvent(res, { type: "agent_done" });
    res.end();
  } catch (error) {
    writeEvent(res, { type: "agent_error", error: error?.message || "Backend agent gateway unavailable" });
    res.end();
  }
}
