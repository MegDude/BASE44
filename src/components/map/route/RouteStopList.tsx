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
    <section className="dp-route-stop-section" aria-labelledby="route-stop-list-title">
      <header>
        <h3 id="route-stop-list-title">Stops</h3>
      </header>
      <ol className="dp-route-stop-list">
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
                className={isSelected ? "is-selected" : isVisited ? "is-visited" : ""}
                aria-current={isSelected ? "step" : undefined}
                aria-label={`${isSelected ? "Current stop" : isVisited ? "Completed stop" : `Stop ${index + 1}`}: ${name}`}
                onClick={() => onSelectStop(stop)}
              >
                <span className="dp-route-stop-list__number">{isVisited ? <Check aria-hidden="true" /> : String(stop.routeStopNumber || index + 1).padStart(2, "0")}</span>
                <span className="dp-route-stop-list__copy">
                  <strong>{name}</strong>
                  {secondary ? <small>{secondary}</small> : null}
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
