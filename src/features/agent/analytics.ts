import type { AgentContext, AgentResponse } from "./types";

export function trackAgentEvent(eventName: string, payload: Record<string, any> = {}) {
  return {
    eventName,
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function buildAgentAnalytics(input: AgentContext, response: AgentResponse) {
  return trackAgentEvent("ask_map_agent_response", {
    mode: input.mode,
    intent: response.intent.id,
    recommendationCount: response.recommendations.length,
    source: response.source,
  });
}
