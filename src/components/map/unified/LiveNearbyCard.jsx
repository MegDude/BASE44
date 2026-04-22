import { Flame, MapPin, Sparkles } from "lucide-react";

function getMeta(item) {
  const intelligence = item?.metadata?.intelligence || {};
  const walk = item?.metadata?.walkMinutes;
  const parts = [];

  if (Number.isFinite(walk)) parts.push(`${walk} min walk`);
  if (intelligence.activePerkCount > 0) {
    parts.push(`${intelligence.activePerkCount} perk${intelligence.activePerkCount === 1 ? "" : "s"}`);
  }
  if (intelligence.liveEventCount > 0) {
    parts.push(`${intelligence.liveEventCount} live event${intelligence.liveEventCount === 1 ? "" : "s"}`);
  }

  return parts.join(" · ");
}

export default function LiveNearbyCard({ item, onSelect, compact = false }) {
  if (!item) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className={`w-full rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/92 text-left shadow-[0_12px_28px_rgba(11,31,51,0.08)] backdrop-blur ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="dp-micro-label flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Live Nearby
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold text-[#0b1f33]">{item.name}</h3>
          <p className="mt-1 text-xs text-slate-600">
            {item.description || item.perk_description || item.address || "Worth opening right now."}
          </p>
        </div>
        <span className="dp-chip shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
          {Math.round(item?.metadata?.intelligence?.score || 0)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        {item.address ? (
          <span className="dp-chip">
            <MapPin className="h-3.5 w-3.5" />
            {item.address.split(",")[0]}
          </span>
        ) : null}
        {getMeta(item) ? <span className="dp-chip">{getMeta(item)}</span> : null}
      </div>
    </button>
  );
}
