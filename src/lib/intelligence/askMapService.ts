import { runAskMapAgent } from "../../features/agent/askMapAgent";
import type { AgentContext, AgentMode, AgentResponse } from "../../features/agent/types";
import { formatAskMapResponse } from "../../features/ask-map/responseFormatter";
import { getAskMapSystemPrompt } from "../../features/ask-map/promptLibrary";
import { createOpenAIResponse } from "../openai";

export type AskMapRequest = {
  query: string;
  mode: AgentMode;
  userLocation?: { lat: number; lng: number };
  radius?: number;
  timeFilter?: string;
  mapBounds?: Record<string, unknown>;
  context?: Array<Record<string, unknown>>;
  district?: string;
  filter?: string;
  parsedIntent?: Record<string, any>;
  intentCategories?: string[];
  selectedEntity?: Record<string, any> | null;
};

export function parseAskMapIntent(query = "", mode: AgentMode = "resident") {
  const text = query.toLowerCase();
  if (mode === "partner") {
    if (text.includes("campaign")) return "campaign_opportunity";
    if (text.includes("coverage")) return "coverage_gap";
    if (text.includes("demand") || text.includes("rising")) return "demand_signal";
    if (text.includes("audience")) return "audience";
    if (text.includes("scan") || text.includes("save") || text.includes("open")) return "performance";
    return "partner_intelligence";
  }
  if (text.includes("happy hour")) return "happy_hour";
  if (text.includes("coffee")) return "coffee";
  if (text.includes("dining") || text.includes("dinner") || text.includes("food")) return "dining";
  if (text.includes("drink") || text.includes("cocktail")) return "drinks";
  if (text.includes("event") || text.includes("tonight")) return "events";
  if (text.includes("perk") || text.includes("offer")) return "perks";
  return "nearby";
}

function toAgentContext(request: AskMapRequest): AgentContext {
  return {
    query: String(request.query || ""),
    mode: request.mode === "partner" ? "partner" : "resident",
    district: request.district,
    filter: request.filter,
    parsedIntent: request.parsedIntent,
    intentCategories: request.intentCategories,
    context: request.context || [],
    selectedEntity: request.selectedEntity || null,
    userLocation: request.userLocation,
    mapBounds: request.mapBounds,
    timeFilter: request.timeFilter,
  };
}

function mergeOpenAIText(response: AgentResponse, text: string, model: string): AgentResponse {
  if (!text.trim()) return response;
  return {
    ...response,
    answer: text.trim(),
    summary: text.trim(),
    source: "openai",
    model,
  };
}

export async function answerAskMap(request: AskMapRequest) {
  const agentContext = toAgentContext(request);
  const localResponse = await runAskMapAgent(agentContext);
  const ai = await createOpenAIResponse({
    systemPrompt: getAskMapSystemPrompt(agentContext.mode),
    input: JSON.stringify({
      query: agentContext.query,
      mode: agentContext.mode,
      district: agentContext.district,
      filter: agentContext.filter,
      intent: localResponse.intent,
      candidates: (agentContext.context || []).slice(0, 8),
      localAnswer: localResponse.answer,
    }),
  });
  const response = ai ? mergeOpenAIText(localResponse, ai.text, ai.model) : localResponse;

  return {
    mode: response.mode,
    intent: parseAskMapIntent(request.query, response.mode),
    ...formatAskMapResponse(response),
  };
}
