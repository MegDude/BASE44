import { useMemo } from "react";
import { useMapDecisionStore } from "@/store/useMapDecisionStore";
import { rankMapEntities, getBestNow } from "@/lib/ranking";

export default function useRankedResults() {
  const intent = useMapDecisionStore((s) => s.intent);
  const filters = useMapDecisionStore((s) => s.filters);
  const results = useMapDecisionStore((s) => s.results);

  const context = { intent, filters };

  const ranked = useMemo(() => rankMapEntities(results, context), [results, intent, filters]);
  const bestNow = useMemo(() => getBestNow(results, context), [results, intent, filters]);

  return { ranked, bestNow };
}
