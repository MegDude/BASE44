import { Check, ChevronRight } from "lucide-react";

type RouteStop = {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  routeStopNumber?: number;
};

type RouteStopListProps = {
  stops: RouteStop[];
  selectedStopId?: string;
  visitedStopIds?: string[];
  started?: boolean;
  onSelectStop: (stop: RouteStop) => void;
};

export function RouteStopList({ stops, selectedStopId, visitedStopIds = [], started = false, onSelectStop }: RouteStopListProps) {
  const visited = new Set(visitedStopIds);
  return (
    <section className="dp-route-stop-section space-y-3" aria-labelledby="route-stop-list-title">
      <header>
        <h3 id="route-stop-list-title" className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C9A66B]">Stops</h3>
      </header>
      <ol className="dp-route-stop-list space-y-2">
        {stops.map((stop, index) => {
          const name = stop.name || stop.title || `Stop ${index + 1}`;
          const isSelected = started && stop.id === selectedStopId;
          const isVisited = visited.has(stop.id);
          const secondary = isSelected
            ? "Current stop"
            : isVisited
              ? "Completed"
              : index === 0 && !started
                ? "Start here"
                : stop.category || stop.summary || stop.description || "";
          return (
            <li key={stop.id}>
              <button
                type="button"
                className={`group flex w-full items-center gap-3.5 rounded-xl border bg-white p-3 text-left transition-all hover:border-[#C9A66B] hover:shadow-xs${isSelected ? " border-[#C9A66B] shadow-xs" : " border-black/10"}${isVisited ? " opacity-60" : ""}`}
                aria-current={isSelected ? "step" : undefined}
                aria-label={`${isSelected ? "Current stop" : isVisited ? "Completed stop" : `Stop ${index + 1}`}: ${name}`}
                onClick={() => onSelectStop(stop)}
              >
                <span className="dp-route-stop-list__number flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F2F2F7] text-[12px] font-bold text-[#0B1F33]">
                  {isVisited ? <Check aria-hidden="true" width={14} height={14} /> : String(stop.routeStopNumber || index + 1).padStart(2, "0")}
                </span>
                <span className="dp-route-stop-list__copy flex-1 min-w-0 space-y-0.5">
                  <strong className="block text-[14px] font-semibold text-[#0B1F33] truncate">{name}</strong>
                  {secondary ? <small className={`block text-[12px] font-medium${index === 0 && !started ? " text-[#C9A66B]" : " text-[#0B1F33]/60"}`}>{secondary}</small> : null}
                </span>
                <ChevronRight aria-hidden="true" width={16} height={16} className="text-[#0B1F33]/40 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
