import type { AgentResponse } from "../agent/types";

let lastResponse: AgentResponse | null = null;

export function getLastAskMapResponse() {
  return lastResponse;
}

export function setLastAskMapResponse(response: AgentResponse | null) {
  lastResponse = response;
  return lastResponse;
}
