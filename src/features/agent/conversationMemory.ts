import { createAgentMemoryRecord } from "../../lib/intelligence/agentMemory";
import type { AgentContext, AgentRecommendation } from "./types";

export function createConversationMemory(input: AgentContext, intent: string, recommendations: AgentRecommendation[]) {
  return createAgentMemoryRecord({
    query: input.query,
    mode: input.mode,
    intent,
    recommendations: recommendations.map((item) => item.id),
    sessionContext: {
      district: input.district,
      filter: input.filter,
      selectedEntity: input.selectedEntity?.id,
    },
  });
}
