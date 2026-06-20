import { getNearbyPartnerOpportunities } from "../../utils/nearbyPartnerOpportunities";
import type { AgentContext } from "./types";

export function getOpportunityIntelligence(input: AgentContext, nearby: any[] = []) {
  const selectedEntity = input.selectedEntity || input.context?.[0] || {};
  return getNearbyPartnerOpportunities({
    selectedEntity,
    nearby,
  });
}
