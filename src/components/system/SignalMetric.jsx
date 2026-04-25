import React from "react";
import GlassPanel from "./GlassPanel";

export default function SignalMetric({ title, value, change, insight }) {
  return (
    <GlassPanel className="p-4 space-y-1">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
      {change && <div className="text-xs text-slate-400">{change}</div>}
      {insight && <div className="text-xs text-slate-600">{insight}</div>}
    </GlassPanel>
  );
}
