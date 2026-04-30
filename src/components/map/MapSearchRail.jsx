import React from "react";

function RailButton({ item, compact = false }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={[
        "flex items-center gap-1.5 whitespace-nowrap rounded-[999px] font-bold uppercase tracking-[0.04em] transition-all active:scale-95",
        compact ? "px-2.5 py-1.5 text-[9px]" : "px-3 py-1.5 text-[10px]",
      ].join(" ")}
      style={
        item.active
          ? {
              background: item.accent ? "var(--dp-gold)" : "var(--dp-navy)",
              color: "#fff",
              boxShadow: item.accent
                ? "0 4px 12px rgba(207,175,90,0.22)"
                : "0 4px 12px rgba(18,32,51,0.15)",
            }
          : {
              background: "rgba(255,255,255,0.92)",
              color: "var(--dp-muted, rgba(11,31,51,0.62))",
              backdropFilter: "blur(12px)",
              boxShadow: "0 1px 4px rgba(18,32,51,0.06)",
            }
      }
      aria-pressed={item.active}
    >
      {Icon ? <Icon className={compact ? "h-2.5 w-2.5" : "h-2.5 w-2.5"} /> : null}
      {item.label}
    </button>
  );
}

export default function MapSearchRail({
  primaryItems = [],
  utilityItems = [],
  className = "",
}) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto dp-no-scrollbar ${className}`.trim()}>
      {primaryItems.map((item) => (
        <RailButton key={item.id} item={item} />
      ))}

      {utilityItems.length > 0 ? (
        <div
          className="ml-auto flex items-center gap-1.5 pl-2"
          style={{ borderLeft: "1px solid rgba(18,32,51,0.08)" }}
        >
          {utilityItems.map((item) => (
            <RailButton key={item.id} item={item} compact accent={item.accent} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
