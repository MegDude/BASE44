import React from "react";
import GlassPanel from "./GlassPanel";

const TYPES = [
  "Property",
  "Venue",
  "Brand",
  "Civic",
  "Organization",
];

export default function PartnerTypeSwitcher({ value, onChange }) {
  return (
    <GlassPanel className="flex gap-2 p-2">
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-3 py-1 rounded-full text-xs transition ${
            value === type
              ? "bg-slate-900 text-white"
              : "text-slate-600"
          }`}
        >
          {type}
        </button>
      ))}
    </GlassPanel>
  );
}
