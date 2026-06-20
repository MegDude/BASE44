import type { AgentContext, AgentResponse } from "./types";
import { runPartnerAgent } from "./partnerAgent";
import { runResidentAgent } from "./residentAgent";

export async function runAskMapAgent(input: AgentContext): Promise<AgentResponse> {
  const mode = input.mode === "partner" ? "partner" : "resident";
  return mode === "partner" ? runPartnerAgent({ ...input, mode }) : runResidentAgent({ ...input, mode });
}
