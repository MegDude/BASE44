import { useCallback, useState } from "react";
import { queryAgent, type AgentQueryInput, type AgentResponse } from "./agentClient";

export function useAgent() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [response, setResponse] = useState<AgentResponse | null>(null);

  const ask = useCallback(async (input: AgentQueryInput) => {
    setStatus("loading");
    setError("");
    try {
      const next = await queryAgent(input);
      setResponse(next);
      setStatus("ready");
      return next;
    } catch (err: any) {
      setError(err?.message || "Agent request failed");
      setStatus("error");
      throw err;
    }
  }, []);

  return { ask, response, status, error };
}
