import React from "react";
import GlassPanel from "./GlassPanel";

export default function ResidentPassCard({ name = "Downtown Perks", qr }) {
  return (
    <GlassPanel className="p-4 space-y-3">
      <div className="text-sm font-medium">{name}</div>
      <div className="flex items-center justify-center h-40 bg-white/40 rounded-lg">
        {qr ? (
          <img src={qr} alt="QR" className="h-full" />
        ) : (
          <div className="text-xs text-slate-400">QR Placeholder</div>
        )}
      </div>
      <button className="w-full py-2 rounded-full bg-slate-900 text-white text-sm">
        Show Card
      </button>
    </GlassPanel>
  );
}
