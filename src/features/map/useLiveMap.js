import { useMemo } from "react";
import { useMapDecisionStore } from "@/store/useMapDecisionStore";
import { rankMapEntities } from "@/lib/ranking";
import { applyLiveSignals } from "@/lib/signals";

export default function useLiveMap() {
  const intent = useMapDecisionStore((s) => s.intent);
  const filters = useMapDecisionStore((s) => s.filters);
  const results = useMapDecisionStore((s) => s.results);

  const context = { intent, filters };

  const withSignals = useMemo(() => applyLiveSignals(results, context), [results, intent, filters]);

  const ranked = useMemo(() => {
    return rankMapEntities(withSignals, context).sort(
      (a, b) => (b.signalScore || 0) - (a.signalScore || 0)
    );
  }, [withSignals, intent, filters]);

  return {
    liveResults: ranked,
    bestNow: ranked[0] || null,
  };
}
