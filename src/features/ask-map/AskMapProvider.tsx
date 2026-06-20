import { createContext, useContext, useMemo, useState } from "react";
import type { AgentResponse } from "../agent/types";

type AskMapProviderValue = {
  response: AgentResponse | null;
  setResponse: (response: AgentResponse | null) => void;
};

const AskMapContext = createContext<AskMapProviderValue>({
  response: null,
  setResponse: () => {},
});

export function AskMapProvider({ children }: { children: React.ReactNode }) {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const value = useMemo(() => ({ response, setResponse }), [response]);
  return <AskMapContext.Provider value={value}>{children}</AskMapContext.Provider>;
}

export function useAskMap() {
  return useContext(AskMapContext);
}
