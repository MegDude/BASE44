import { useMemo, useState } from "react";
import { AskMapContext } from "./AskMapContext";
import { runAskMapEngine } from "./AskMapEngine";
import { ASK_MAP_EVENTS, trackAskMapEvent } from "./AskMapAnalytics";

export function AskMapProvider({ children, mode = "resident", entities = [] }) {
  const [state, setState] = useState({
    query: "",
    result: null,
    status: "idle",
  });

  const value = useMemo(() => ({
    ...state,
    mode,
    entities,
    ask(query, options = {}) {
      trackAskMapEvent(ASK_MAP_EVENTS.searchSubmitted, { query, mode });
      const result = runAskMapEngine({ query, mode, entities, ...options });
      trackAskMapEvent(ASK_MAP_EVENTS.intentDetected, {
        query,
        mode,
        intent: result.intent,
        confidence: result.confidence,
      });
      setState({ query, result, status: "ready" });
      return result;
    },
    reset() {
      setState({ query: "", result: null, status: "idle" });
    },
  }), [entities, mode, state]);

  return (
    <AskMapContext.Provider value={value}>
      {children}
    </AskMapContext.Provider>
  );
}
