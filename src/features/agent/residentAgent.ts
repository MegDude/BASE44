import type { AgentContext, AgentResponse } from "./types";
import { detectAgentIntent } from "./intentEngine";
import { buildAgentContext, getEntityTitle } from "./contextEngine";
import { buildRecommendations } from "./recommendationEngine";
import { buildMapActions } from "./mapActionEngine";
import { createConversationMemory } from "./conversationMemory";

export function runResidentAgent(input: AgentContext): AgentResponse {
  const intent = detectAgentIntent({ ...input, mode: "resident" });
  const context = buildAgentContext({ ...input, mode: "resident" });
  const recommendations = buildRecommendations({
    intent,
    entities: context.entities,
    nearby: context.nearby,
    mode: "resident",
  });
  const top = recommendations[0];
  const actions = buildMapActions({ mode: "resident", recommendations, intentId: intent.id });
  const title = top ? `Start with ${top.title}.` : "Start with nearby Downtown Perks.";
  const answer = top
    ? `${top.title} is the clearest match for ${intent.label.toLowerCase()} near ${context.district}. ${top.distanceLabel ? `${top.distanceLabel} away. ` : ""}Open it, save it, or compare the nearby options before leaving the map.`
    : "Not enough nearby context yet. Try a category like coffee, dining, events, perks, or walkable.";

  return {
    mode: "resident",
    intent,
    title,
    answer,
    summary: answer,
    explanation: top?.reason || answer,
    recommendations,
    places: recommendations.map((item) => item.entity).filter(Boolean),
    actions: actions.map((item) => item.label),
    structuredActions: actions,
    followUps: ["What is nearby after this?", "What can I use today?", "Is this walkable?"],
    collections: recommendations.slice(0, 3).map((item) => item.type || "Downtown Picks"),
    campaigns: [],
    events: recommendations.filter((item) => /event/i.test(item.type)).map((item) => item.title),
    source: "local-agent",
    model: "downtown-perks-local-agent",
    memory: createConversationMemory(input, intent.id, recommendations),
  };
}
