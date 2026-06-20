import { createContext, useContext } from "react";
import type { AgentResponse } from "./types";

type AgentContextValue = {
  lastResponse: AgentResponse | null;
};

const AgentContext = createContext<AgentContextValue>({ lastResponse: null });

export const AgentProvider = AgentContext.Provider;

export function useAgentContext() {
  return useContext(AgentContext);
}
