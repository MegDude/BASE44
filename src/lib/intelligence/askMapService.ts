import { createAgentMemoryRecord } from "./agentMemory";
import { generatePulseSignal } from "./pulseEngine";

export type AskMapRequest = {
  query: string;
  mode: "resident" | "partner";
  userLocation?: { lat: number; lng: number };
  radius?: number;
  timeFilter?: string;
  mapBounds?: Record<string, unknown>;
  context?: Array<Record<string, unknown>>;
};

export function parseAskMapIntent(query = "", mode: "resident" | "partner" = "resident") {
  const text = query.toLowerCase();
  if (mode === "partner") {
    if (text.includes("campaign")) return "campaign_opportunity";
    if (text.includes("coverage")) return "coverage_gap";
    if (text.includes("demand") || text.includes("rising")) return "demand_signal";
    return "partner_intelligence";
  }
  if (text.includes("happy hour")) return "happy_hour";
  if (text.includes("coffee")) return "coffee";
  if (text.includes("event") || text.includes("tonight")) return "events";
  if (text.includes("perk") || text.includes("offer")) return "perks";
  return "nearby";
}

export function answerAskMap(request: AskMapRequest) {
  const intent = parseAskMapIntent(request.query, request.mode);
  const recommendations = (request.context || []).slice(0, 5);
  const pulse = generatePulseSignal({ district: "Downtown Core", views: recommendations.length * 8, saves: recommendations.length });

  return {
    mode: request.mode,
    intent,
    summary: request.mode === "partner"
      ? "Nearby activity is ready for one clear partner action."
      : "Nearby options are ready to compare on the map.",
    recommendations,
    pulse,
    nextActions: request.mode === "partner" ? ["Review opportunity", "Launch campaign", "Compare nearby"] : ["View details", "Save", "Get directions"],
    memory: createAgentMemoryRecord({
      query: request.query,
      mode: request.mode,
      intent,
      recommendations: recommendations.map((item) => String(item.id || item.name || item.title || "")),
    }),
  };
}
