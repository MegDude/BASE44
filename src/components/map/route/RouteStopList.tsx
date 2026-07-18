import { Check, ChevronRight } from "lucide-react";

type RouteStop = {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  routeStopNumber?: number;
};

type RouteStopListProps = {
  stops: RouteStop[];
  selectedStopId?: string;
  visitedStopIds?: string[];
  onSelectStop: (stop: RouteStop) => void;
};

export function RouteStopList({ stops, selectedStopId, visitedStopIds = [], onSelectStop }: RouteStopListProps) {
  const visited = new Set(visitedStopIds);
  return (
    <section className="dp-route-stop-section" aria-labelledby="route-stop-list-title">
      <header>
        <h3 id="route-stop-list-title">Route stops</h3>
        <span>{stops.length} total</span>
      </header>
      <ol className="dp-route-stop-list">
        {stops.map((stop, index) => {
          const name = stop.name || stop.title || `Stop ${index + 1}`;
          const isSelected = stop.id === selectedStopId;
          const isVisited = visited.has(stop.id);
          return (
            <li key={stop.id}>
              <button
                type="button"
                className={isSelected ? "is-selected" : isVisited ? "is-visited" : ""}
                aria-current={isSelected ? "step" : undefined}
                aria-label={`${isSelected ? "Selected stop" : isVisited ? "Visited stop" : `Stop ${index + 1}`}: ${name}`}
                onClick={() => onSelectStop(stop)}
              >
                <span className="dp-route-stop-list__number">{isVisited ? <Check aria-hidden="true" /> : stop.routeStopNumber || index + 1}</span>
                <span className="dp-route-stop-list__copy">
                  <strong>{name}</strong>
                  <small>{isSelected ? "Selected stop" : isVisited ? "Visited" : (stop.summary || stop.description || "Continue along the route")}</small>
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
