const DEFAULT_AGENT_BASE_URL = "http://localhost:3014";

function getAgentBaseUrl() {
  return (
    process.env.BACKEND_AGENT_API_BASE_URL ||
    process.env.AGENT_API_BASE_URL ||
    process.env.PLATFORM_API_BASE_URL ||
    DEFAULT_AGENT_BASE_URL
  ).replace(/\/$/, "");
}

function normalizeAgentPayload(payload = {}) {
  const message = String(payload.message || payload.query || "").trim();
  const mapContext = payload.mapContext || payload.context || {};
  const contextArray = Array.isArray(mapContext) ? mapContext : Array.isArray(payload.context) ? payload.context : [];

  return {
    sessionId: payload.sessionId || payload.conversationId || `web_${Date.now()}`,
    userId: payload.userId || payload.residentId || "",
    organizationId: payload.organizationId || payload.partnerId || "",
    mode: payload.mode || "resident",
    intent: payload.intent || payload.activeFilter || payload.filter || "ask_map",
    message,
    context: {
      ...(typeof payload.context === "object" && !Array.isArray(payload.context) ? payload.context : {}),
      mapContext,
      activeFilter: payload.activeFilter || payload.filter || "",
      activeFilterGroup: payload.activeFilterGroup || "",
      isSecondaryFilter: Boolean(payload.isSecondaryFilter),
      parsedIntent: payload.parsedIntent || null,
      intentCategories: Array.isArray(payload.intentCategories) ? payload.intentCategories : [],
      entities: contextArray,
      selectedEntity: payload.selectedEntity || null,
    },
    location: {
      label: payload.district || payload.location || "Downtown Austin",
      district: payload.district || "",
      coordinates: payload.coordinates || payload.userLocation || null,
    },
    history: Array.isArray(payload.history) ? payload.history : [],
  };
}

function normalizeCompatResponse(agentPayload, agentResponse) {
  const response = agentResponse?.response || agentResponse;
  const cards = Array.isArray(response?.cards) ? response.cards : [];
  const actions = Array.isArray(response?.actions) ? response.actions : [];
  const toolCalls = Array.isArray(response?.toolCalls) ? response.toolCalls : [];
  const places =
    cards.length
      ? cards.map((card) => ({
          id: String(card.id || card.entityId || card.name || card.title || ""),
          name: card.name || card.title || "Downtown result",
          reason: card.reason || card.summary || card.description || "",
          mapQuery: card.mapQuery || card.name || card.title || "",
          action: card.action || "Open on map",
        }))
      : toolCalls.flatMap((tool) => {
          const data = Array.isArray(tool?.data) ? tool.data : Array.isArray(tool?.data?.results) ? tool.data.results : [];
          return data.slice(0, 5).map((item) => ({
            id: String(item.id || item.name || ""),
            name: item.name || item.title || "Downtown result",
            reason: item.reason || item.summary || item.category || "",
            mapQuery: item.name || item.title || "",
            action: "Open on map",
          }));
        });

  return {
    ...response,
    title: response?.title || response?.intent || `Answering: "${agentPayload.message}"`,
    answer: response?.answer || response?.summary || "The agent is ready, but no response text was returned.",
    places: places.slice(0, 5),
    actions: actions.map((action) => action.label || action.title || action.name || action).slice(0, 4),
    confidence: typeof response?.confidence === "number" ? response.confidence : 0.72,
    source: "backend-agent",
    model: response?.provider?.model || response?.model || "platform-agent",
    agent: response,
  };
}

export async function proxyAgentQuery(payload = {}) {
  const agentPayload = normalizeAgentPayload(payload);
  if (!agentPayload.message) {
    return {
      status: 400,
      body: { error: "Missing message" },
    };
  }

  const endpoint = `${getAgentBaseUrl()}/api/agent/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agentPayload),
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text || "Backend agent gateway returned a non-JSON response" };
  }

  return {
    status: response.status,
    body: response.ok ? normalizeCompatResponse(agentPayload, json) : json,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await proxyAgentQuery(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || "Backend agent gateway unavailable",
      source: "agent-proxy",
    });
  }
}
