import { buildMapIntelligence } from "../../utils/mapIntelligence";
import type { AgentContext } from "./types";

export function getAgentMapIntelligence(input: AgentContext, nearby: any[] = []) {
  return buildMapIntelligence({
    selectedEntity: input.selectedEntity || input.context?.[0] || {},
    nearby,
  });
}
