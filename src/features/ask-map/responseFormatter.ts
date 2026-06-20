import type { AgentResponse } from "../agent/types";

export function formatAskMapResponse(response: AgentResponse) {
  return {
    answer: response.answer,
    title: response.title,
    places: response.places,
    actions: response.actions,
    explanation: response.explanation,
    collections: response.collections,
    campaigns: response.campaigns,
    events: response.events,
    summary: response.summary,
    recommendations: response.recommendations,
    followUps: response.followUps,
    memory: response.memory,
    source: response.source,
    model: response.model,
  };
}
