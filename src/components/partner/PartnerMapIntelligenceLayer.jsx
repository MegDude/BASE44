import { Building2, Hotel, MapPin, Megaphone, Navigation, Store } from "lucide-react";

const KIND_ICONS = {
  brand: Megaphone,
  hotel: Hotel,
  property: Building2,
  venue: Store,
};

function getBounds(items) {
  const valid = items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  if (!valid.length) return { minLat: 30.255, maxLat: 30.275, minLng: -97.755, maxLng: -97.735 };

  const lats = valid.map((item) => item.lat);
  const lngs = valid.map((item) => item.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.2, 0.003);
  const lngPad = Math.max((maxLng - minLng) * 0.2, 0.003);

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

function positionFor(item, bounds) {
  const x = ((item.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = (1 - (item.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(88, Math.max(10, y))}%`,
  };
}

function formatMetric(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

export default function PartnerMapIntelligenceLayer({
  activeId,
  caption = "Live downtown layer",
  insight,
  kind = "property",
  nearby = [],
  onSelect,
  points,
}) {
  const allPoints = [...points, ...nearby];
  const bounds = getBounds(allPoints);
  const selected = points.find((point) => point.id === activeId) || points[0];
  const SelectedIcon = KIND_ICONS[kind] || MapPin;
  const totalScans = points.reduce((sum, point) => sum + (point.scans || point.interactions || point.views || 0), 0);
  const totalSaves = points.reduce((sum, point) => sum + (point.saves || 0), 0);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-xl bg-[#0B1F33] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_26px_80px_rgba(11,31,51,0.20),0_0_54px_rgba(11,31,51,0.16)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.10),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="absolute left-[14%] top-0 h-full w-px bg-white/7" />
        <div className="absolute left-[38%] top-0 h-full w-px bg-white/5" />
        <div className="absolute left-[66%] top-0 h-full w-px bg-white/6" />
        <div className="absolute left-0 top-[24%] h-px w-full bg-white/6" />
        <div className="absolute left-0 top-[52%] h-px w-full bg-white/5" />
        <div className="absolute left-0 top-[78%] h-px w-full bg-white/6" />
        <div className="absolute -bottom-10 left-[8%] h-32 w-[70%] rotate-[-9deg] rounded-full bg-white/8 blur-2xl" />
      </div>

      <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">{caption}</div>
          <div className="mt-1 max-w-md text-[13px] leading-5 text-white/72">{insight}</div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <span className="rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/76 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {formatMetric(totalScans)} actions
          </span>
          <span className="rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/76 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {formatMetric(totalSaves)} saves
          </span>
        </div>
      </div>

      {nearby.map((item) => (
        <div
          key={item.name}
          className="absolute z-[2] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#B38F4F]/80 shadow-[0_0_0_4px_rgba(179,143,79,0.10),0_0_18px_rgba(179, 143, 79, 0.08)]"
          style={positionFor(item, bounds)}
          title={item.name}
        />
      ))}

      {points.map((point) => {
        const active = point.id === selected?.id;
        const Icon = KIND_ICONS[kind] || MapPin;
        return (
          <button
            key={point.id}
            type="button"
            onClick={() => onSelect?.(point)}
            className={`absolute z-[4] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md px-2.5 py-2 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
              active
                ? "bg-white text-[#0B1F33] shadow-[0_0_0_1px_rgba(179, 143, 79, 0.08),0_16px_34px_rgba(0,0,0,0.24),0_0_34px_rgba(179, 143, 79, 0.08)]"
                : "bg-[#081521]/88 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_30px_rgba(0,0,0,0.18)] hover:-translate-y-[calc(50%+2px)] hover:bg-white hover:text-[#0B1F33] hover:shadow-[0_0_0_1px_rgba(179, 143, 79, 0.08),0_16px_34px_rgba(0,0,0,0.22),0_0_28px_rgba(179, 143, 79, 0.08)]"
            }`}
            style={positionFor(point, bounds)}
          >
            {point.logo ? (
              <img src={point.logo} alt="" className="h-5 w-5 shrink-0 rounded-[5px] bg-[#0B1F33] object-cover" />
            ) : (
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#B38F4F]" />
            )}
            <span className="hidden max-w-[128px] truncate text-[11px] font-semibold md:block">{point.name}</span>
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="rounded-lg bg-white/94 p-4 text-[#0B1F33] shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
            <div className="flex items-start gap-3">
              {selected.logo ? (
                <img src={selected.logo} alt="" className="h-10 w-10 shrink-0 rounded-md bg-[#0B1F33] object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0B1F33] text-[#B38F4F]">
                  <SelectedIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold">{selected.name}</div>
                <div className="mt-1 text-[12px] leading-5 text-[#0B1F33]/62">
                  {selected.signal || selected.trigger || selected.top || selected.type || selected.dist || "Showing what people nearby can use right now."}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-[250px]">
            {[
              ["actions", selected.scans || selected.interactions || selected.views],
              ["saves", selected.saves],
              ["uses", selected.redemptions || selected.unlocks || selected.rsvps || selected.visits],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-white/12 px-2 py-2 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="text-[14px] font-semibold text-white">{formatMetric(value) || "-"}</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/54">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-5 right-5 hidden items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/78 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] lg:flex">
        <Navigation className="h-3.5 w-3.5 text-[#B38F4F]" />
        Downtown layer
      </div>
    </div>
  );
}
