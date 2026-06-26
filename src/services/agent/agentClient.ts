export type AgentMode = "resident" | "partner" | "admin" | "campaign" | "reports" | "marketing" | "developer";

export type AgentQueryInput = {
  sessionId?: string;
  userId?: string;
  organizationId?: string;
  mode?: AgentMode | string;
  intent?: string;
  message?: string;
  query?: string;
  mapContext?: unknown;
  context?: unknown;
  location?: unknown;
  history?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  [key: string]: unknown;
};

export type AgentResponse = {
  answer?: string;
  title?: string;
  places?: Array<Record<string, unknown>>;
  actions?: Array<unknown>;
  stream?: { supported?: boolean; endpoint?: string };
  agent?: Record<string, unknown>;
  [key: string]: unknown;
};

function getDefaultAgentQueryEndpoint() {
  if (typeof window !== "undefined") return "/api/agent/query";
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const env = runtime.process?.env || {};
  const baseUrl = env.BACKEND_AGENT_API_BASE_URL || env.AGENT_API_BASE_URL || env.PLATFORM_API_BASE_URL || "http://localhost:3014";
  return `${baseUrl.replace(/\/$/, "")}/api/agent/query`;
}

function getSessionId() {
  if (typeof window === "undefined") return `server_${Date.now()}`;
  const key = "downtown-perks-agent-session-id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const next = `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  window.sessionStorage.setItem(key, next);
  return next;
}

export function buildAgentPayload(input: AgentQueryInput) {
  const message = String(input.message || input.query || "").trim();
  return {
    ...input,
    sessionId: input.sessionId || getSessionId(),
    userId: input.userId || "",
    organizationId: input.organizationId || "",
    mode: input.mode || "resident",
    intent: input.intent || "ask_map",
    message,
    context: input.context || {},
    mapContext: input.mapContext || input.context || {},
    location: input.location || {},
    history: Array.isArray(input.history) ? input.history : [],
  };
}

export async function queryAgent(input: AgentQueryInput, endpoint = getDefaultAgentQueryEndpoint()): Promise<AgentResponse> {
  const payload = buildAgentPayload(input);
  if (!payload.message) {
    throw new Error("Missing agent message");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Agent request failed");
  }
  return body;
}
