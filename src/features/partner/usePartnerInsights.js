import { useMemo } from "react";

export default function usePartnerInsights(items = []) {
  return useMemo(() => {
    if (!items.length) return [];

    const top = items[0];
    const rising = items.slice(0, 3);

    return [
      {
        observation: `${top.name} is leading activity right now`,
        evidence: `High interaction and proximity signals`,
        recommendation: `Extend visibility or boost promotion`,
      },
      {
        observation: `Demand clustering in ${top.meta?.category || "this category"}`,
        evidence: `${rising.length} top items share same pattern`,
        recommendation: `Align offer timing to peak period`,
      },
    ];
  }, [items]);
}
