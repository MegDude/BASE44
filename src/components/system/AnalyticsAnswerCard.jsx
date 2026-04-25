import React from "react";
import GlassPanel from "./GlassPanel";

export default function AnalyticsAnswerCard({
  observation,
  evidence,
  recommendation,
}) {
  return (
    <GlassPanel className="p-4 space-y-2">
      <div className="text-sm font-medium">{observation}</div>
      <div className="text-xs text-slate-500">{evidence}</div>
      {recommendation && (
        <div className="text-xs text-slate-700">→ {recommendation}</div>
      )}
    </GlassPanel>
  );
}
