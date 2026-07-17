import { Check, MapPin } from "lucide-react";

export function CollectionTimeline({ route, activeStopId, checkedInSet, onSelectStop }) {
  return (
    <section className="dp-collection-v3-section" aria-labelledby={`dp-collection-timeline-${route.id}`}>
      <div className="dp-collection-v3-heading">
        <p>Journey</p>
        <h3 id={`dp-collection-timeline-${route.id}`}>Collection timeline</h3>
      </div>
      <div className="dp-collection-timeline" aria-label={`${route.title} progress timeline`}>
        {route.stops.map((stop, index) => {
          const complete = checkedInSet.has(stop.id);
          const active = stop.id === activeStopId;
          return (
            <button key={stop.id} type="button" data-complete={complete} data-active={active} onClick={() => onSelectStop(stop)}>
              <span className="dp-collection-timeline__marker">{complete ? <Check aria-hidden="true" /> : <MapPin aria-hidden="true" />}</span>
              <span><small>Stop {index + 1}</small><strong>{stop.name || stop.title}</strong></span>
            </button>
          );
        })}
        <div className="dp-collection-timeline__reward"><span><Check aria-hidden="true" /></span><strong>{route.badge || "Collection complete"}</strong></div>
      </div>
    </section>
  );
}
