import type { AgentAction, AgentRecommendation } from "./types";

export function buildMapActions({
  mode,
  recommendations,
  intentId,
}: {
  mode: "resident" | "partner";
  recommendations: AgentRecommendation[];
  intentId: string;
}): AgentAction[] {
  const first = recommendations[0];
  if (mode === "partner") {
    return [
      { id: "review-opportunity", label: "Review opportunity", type: "open_entity", payload: { entityId: first?.id } },
      { id: "create-campaign", label: "Create Campaign", type: "open_dashboard", payload: { tab: "campaigns", intent: intentId } },
      { id: "compare-nearby", label: "Compare nearby", type: "show_related", payload: { entityId: first?.id } },
    ].filter((item) => item.payload?.entityId || item.type !== "open_entity");
  }

  return [
    { id: "open-nearby", label: "Open Nearby", type: "open_entity", payload: { entityId: first?.id } },
    { id: "save-place", label: "Save", type: "save_entity", payload: { entityId: first?.id } },
    { id: "get-directions", label: "Directions", type: "directions", payload: { entityId: first?.id } },
  ].filter((item) => item.payload?.entityId || item.type !== "open_entity");
}
