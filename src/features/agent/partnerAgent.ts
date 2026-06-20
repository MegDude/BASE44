import { recommendAudience } from "../../utils/recommendAudience";
import type { AgentContext, AgentResponse } from "./types";
import { detectAgentIntent } from "./intentEngine";
import { buildAgentContext } from "./contextEngine";
import { buildRecommendations } from "./recommendationEngine";
import { buildMapActions } from "./mapActionEngine";
import { createConversationMemory } from "./conversationMemory";
import { getCampaignIntelligence } from "./campaignIntelligence";
import { getOpportunityIntelligence } from "./opportunityEngine";
import { getAgentMapIntelligence } from "./mapIntelligence";

export function runPartnerAgent(input: AgentContext): AgentResponse {
  const intent = detectAgentIntent({ ...input, mode: "partner" });
  const context = buildAgentContext({ ...input, mode: "partner" });
  const nearbyEntities = context.nearby.map((item) => item.entity);
  const recommendations = buildRecommendations({
    intent,
    entities: context.entities,
    nearby: context.nearby,
    mode: "partner",
  });
  const opportunities = getOpportunityIntelligence({ ...input, selectedEntity: context.selectedEntity }, context.nearby);
  const campaigns = getCampaignIntelligence({ ...input, selectedEntity: context.selectedEntity }, context.nearby);
  const audiences = recommendAudience({
    selectedEntity: context.selectedEntity || {},
    nearby: context.nearby,
  });
  const intelligence = getAgentMapIntelligence({ ...input, selectedEntity: context.selectedEntity }, context.nearby);
  const actions = buildMapActions({ mode: "partner", recommendations, intentId: intent.id });
  const opportunityTitle = opportunities[0]?.title || campaigns[0]?.actionTitle || "Nearby opportunity";
  const audience = audiences[0]?.segment || "nearby residents and visitors";
  const answer = `${opportunityTitle} is the clearest move around ${context.district}. ${intelligence.summary} The best audience to watch is ${audience}.`;

  return {
    mode: "partner",
    intent,
    title: "Partner intelligence",
    answer,
    summary: intelligence.summary,
    explanation: opportunities[0]?.reason || campaigns[0]?.whyNow || intelligence.summary,
    recommendations,
    places: recommendations.map((item) => item.entity).filter(Boolean),
    actions: actions.map((item) => item.label),
    structuredActions: actions,
    followUps: ["What campaign should I launch?", "Who is nearby?", "Where is the coverage gap?"],
    collections: opportunities.slice(0, 3).map((item: any) => item.title),
    campaigns: campaigns.slice(0, 3).map((item: any) => item.actionTitle),
    events: recommendations.filter((item) => /event/i.test(item.type)).map((item) => item.title),
    source: "local-agent",
    model: "downtown-perks-local-agent",
    memory: createConversationMemory(input, intent.id, recommendations),
  };
}
