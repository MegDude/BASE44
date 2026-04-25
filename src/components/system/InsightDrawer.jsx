import React from "react";
import GlassPanel from "./GlassPanel";

export default function InsightDrawer({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="ml-auto w-full max-w-md h-full p-4">
        <GlassPanel className="h-full p-4 overflow-y-auto">
          {children}
        </GlassPanel>
      </div>
    </div>
  );
}
