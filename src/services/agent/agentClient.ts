import { base44 } from "@/api/base44Client";
import { runAskMapAgent } from "@/features/agent/askMapAgent";
import {
  getAgentConversationId,
  resetAgentConversationId,
  setAgentConversationId,
} from "./conversationStore";

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
  summary?: string;
  explanation?: string;
  places?: Array<Record<string, unknown>>;
  actions?: Array<unknown>;
  structuredActions?: Array<Record<string, unknown>>;
  followUps?: string[];
  stream?: { supported?: boolean; endpoint?: string };
  source?: "base44-agent" | "openai-ask-map" | "backend-agent" | "local-agent" | "fallback" | string;
  model?: string;
  conversationId?: string;
  agent?: Record<string, unknown>;
  [key: string]: unknown;
};

const BASE44_AGENT_NAME = "perk_finder";
const base44AgentClient = base44 as any;

function getDefaultAgentQueryEndpoint() {
  if (typeof window !== "undefined") return "/api/ask-map";
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const env = runtime.process?.env || {};
  const baseUrl = env.BACKEND_AGENT_API_BASE_URL || env.AGENT_API_BASE_URL || env.PLATFORM_API_BASE_URL || "http://localhost:3014";
  return `${baseUrl.replace(/\/$/, "")}/api/ask-map`;
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

function normalizeMode(mode?: string): "resident" | "partner" {
  return mode === "partner" || mode === "campaign" || mode === "reports" ? "partner" : "resident";
}

function asEntityArray(payload: ReturnType<typeof buildAgentPayload>) {
  if (Array.isArray(payload.mapContext)) return payload.mapContext as Array<Record<string, unknown>>;
  if (Array.isArray(payload.context)) return payload.context as Array<Record<string, unknown>>;
  const context = payload.context as Record<string, unknown> | null;
  if (Array.isArray(context?.entities)) return context.entities as Array<Record<string, unknown>>;
  if (Array.isArray(context?.mapContext)) return context.mapContext as Array<Record<string, unknown>>;
  return [];
}

function contentText(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (content && typeof content === "object") {
    const record = content as Record<string, unknown>;
    return String(record.answer || record.summary || record.text || record.content || "").trim();
  }
  return "";
}

function parseAgentContent(content: unknown) {
  if (content && typeof content === "object") return content as Record<string, unknown>;
  const text = contentText(content);
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { answer: text };
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return { answer: text };
    }
  }
}

function normalizeBase44Message(message: any, conversationId: string): AgentResponse {
  const parsed = parseAgentContent(message?.content);
  const rawEntities = Array.isArray(parsed.entities)
    ? parsed.entities
    : Array.isArray(parsed.places)
      ? parsed.places
      : [];
  const rawActions = Array.isArray(parsed.suggestedActions)
    ? parsed.suggestedActions
    : Array.isArray(parsed.structuredActions)
      ? parsed.structuredActions
      : [];
  const answer = String(parsed.answer || parsed.summary || contentText(message?.content) || "").trim();

  return {
    ...parsed,
    answer: answer || "The map agent returned without a readable answer.",
    title: String(parsed.title || (parsed.mode === "partner" ? "Partner intelligence" : "Ask the Map")),
    summary: String(parsed.summary || answer),
    explanation: String(parsed.explanation || parsed.reason || answer),
    places: rawEntities.slice(0, 5).map((entity: any) => ({
      ...entity,
      id: String(entity?.id || entity?.entityId || entity?.title || entity?.name || ""),
      name: String(entity?.name || entity?.title || "Downtown result"),
      reason: String(entity?.reason || entity?.summary || ""),
    })),
    actions: rawActions.slice(0, 4).map((action: any) => action?.label || action?.title || action),
    structuredActions: rawActions.slice(0, 4),
    followUps: Array.isArray(parsed.followUpPrompts)
      ? parsed.followUpPrompts.slice(0, 4).map(String)
      : Array.isArray(parsed.followUps)
        ? parsed.followUps.slice(0, 4).map(String)
        : [],
    source: "base44-agent",
    model: String(message?.model || parsed.model || "base44-perk-finder"),
    conversationId,
    usage: message?.usage || null,
    toolCalls: message?.tool_calls || [],
    agent: { agentName: BASE44_AGENT_NAME, messageId: message?.id || "" },
  };
}

async function waitForBase44Answer(conversationId: string, previousAssistantIds: Set<string>) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const conversation = await base44AgentClient.agents.getConversation(conversationId);
    const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
    const answer = [...messages]
      .reverse()
      .find((message: any) => message?.role === "assistant" && !previousAssistantIds.has(String(message?.id || "")) && contentText(message?.content));
    if (answer) return answer;
    await new Promise((resolve) => setTimeout(resolve, 450));
  }
  return null;
}

async function queryBase44Agent(payload: ReturnType<typeof buildAgentPayload>): Promise<AgentResponse | null> {
  if (typeof window === "undefined" || !base44AgentClient?.agents?.createConversation) return null;
  const authenticated = await base44.auth.isAuthenticated().catch(() => false);
  if (!authenticated) return null;

  const mode = normalizeMode(String(payload.mode || "resident"));
  const organizationId = String(payload.organizationId || "");
  let conversationId = getAgentConversationId(mode, organizationId);
  let conversation: any = null;

  if (conversationId) {
    conversation = await base44AgentClient.agents.getConversation(conversationId).catch(() => null);
    if (!conversation) {
      resetAgentConversationId(mode, organizationId);
      conversationId = "";
    }
  }

  if (!conversationId) {
    conversation = await base44AgentClient.agents.createConversation({
      agent_name: BASE44_AGENT_NAME,
      metadata: {
        surface: "ask_map",
        mode,
        organizationId,
        sessionId: payload.sessionId,
      },
    });
    conversationId = String(conversation?.id || "");
    if (!conversationId) throw new Error("Agent conversation was not created");
    setAgentConversationId(conversationId, mode, organizationId);
  }

  const previousAssistantIds = new Set<string>(
    (conversation?.messages || [])
      .filter((message: any) => message?.role === "assistant")
      .map((message: any) => String(message?.id || "")),
  );
  const message = await base44AgentClient.agents.addMessage(conversation || { id: conversationId }, {
    role: "user",
    content: payload.message,
    custom_context: [
      {
        type: "downtown_perks_map_context",
        message: "Use this current Downtown Perks context. Do not invent unavailable place, offer, event, listing, or performance facts.",
        data: {
          mode,
          intent: payload.intent,
          organizationId,
          location: payload.location,
          mapContext: asEntityArray(payload).slice(0, 25),
          context: payload.context,
        },
      },
    ],
  });

  const directAnswer = message?.role === "assistant" && contentText(message?.content) ? message : null;
  const answer = directAnswer || await waitForBase44Answer(conversationId, previousAssistantIds);
  if (!answer) throw new Error("Agent response timed out");
  return normalizeBase44Message(answer, conversationId);
}

async function queryLocalAgent(payload: ReturnType<typeof buildAgentPayload>): Promise<AgentResponse> {
  const mode = normalizeMode(String(payload.mode || "resident"));
  const context = payload.context && typeof payload.context === "object" && !Array.isArray(payload.context)
    ? payload.context as Record<string, any>
    : {};
  const location = payload.location && typeof payload.location === "object"
    ? payload.location as Record<string, any>
    : {};
  const local = await runAskMapAgent({
    query: payload.message,
    mode,
    district: String(location.district || location.label || context.selectedDistrict || "Downtown Austin"),
    filter: String(context.activeFilter || payload.intent || ""),
    parsedIntent: context.parsedIntent,
    intentCategories: Array.isArray(context.intentCategories) ? context.intentCategories : [],
    context: asEntityArray(payload),
    selectedEntity: context.selectedEntity || null,
    userLocation: location.coordinates || undefined,
    mapBounds: context.mapBounds,
    timeFilter: context.timeContext || "",
  });
  return { ...local, source: "local-agent", degraded: true };
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
    question: message,
    query: message,
    context: input.context || {},
    mapContext: input.mapContext || input.context || {},
    location: input.location || {},
    history: Array.isArray(input.history) ? input.history : [],
  };
}

export async function queryAgent(input: AgentQueryInput, endpoint = getDefaultAgentQueryEndpoint()): Promise<AgentResponse> {
  const payload = buildAgentPayload(input);
  if (!payload.message) throw new Error("Ask a question before sending.");

  try {
    const base44Response = await queryBase44Agent(payload);
    if (base44Response?.answer) return base44Response;
  } catch {
    // Continue to the server-side provider and then the deterministic map fallback.
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Downtown-Perks-Agent-Session": String(payload.sessionId),
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body?.answer) return body;
  } catch {
    // A local, context-bound response keeps every surface useful during provider outages.
  }

  return queryLocalAgent(payload);
}
