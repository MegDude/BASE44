import { recommendCampaigns } from "../../utils/recommendCampaigns";
import type { AgentContext } from "./types";

export function getCampaignIntelligence(input: AgentContext, nearby: any[] = []) {
  const selectedEntity = input.selectedEntity || input.context?.[0] || {};
  return recommendCampaigns({
    selectedEntity,
    nearby,
  });
}
