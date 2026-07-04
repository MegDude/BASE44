import { useState } from "react";

function stopCoords(stop) {
  if (Number.isFinite(stop?.lat) && Number.isFinite(stop?.lng)) return `${stop.lat},${stop.lng}`;
  if (Array.isArray(stop?.coords) && stop.coords.length >= 2) return `${stop.coords[0]},${stop.coords[1]}`;
  if (Number.isFinite(stop?.latitude) && Number.isFinite(stop?.longitude)) return `${stop.latitude},${stop.longitude}`;
  return "";
}

function walkingDirectionsUrl(stops = []) {
  const coords = stops.map(stopCoords).filter(Boolean);
  if (coords.length < 2) return "";
  const origin = encodeURIComponent(coords[0]);
  const destination = encodeURIComponent(coords[coords.length - 1]);
  const waypoints = coords.slice(1, -1).map(encodeURIComponent).join("|");
  const waypointParam = waypoints ? `&waypoints=${waypoints}` : "";
  return `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${origin}&destination=${destination}${waypointParam}`;
}

export default function CollectionRoutePanel({ route, selectedStopId, onSelectStop, onStart, onViewStops, onExit }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!route?.stops?.length) return null;
  const directionsHref = walkingDirectionsUrl(route.stops);
  const routeLabel = route.neighborhood || "Downtown Austin";

  if (isMinimized) {
    return (
      <section className="dp-collection-route-panel dp-collection-route-panel--minimized" aria-label={`${route.title} route minimized`}>
        <button
          type="button"
          className="dp-route-mini-main"
          onClick={() => setIsMinimized(false)}
          aria-label={`Expand ${route.title} route panel`}
        >
          <span className="dp-route-mini-kicker">{routeLabel}</span>
          <strong>{route.title}</strong>
          <em>{route.stops.length} stops active · expand</em>
        </button>
        <button type="button" className="dp-route-mini-exit" onClick={onExit} aria-label="Exit collection route">
          Exit
        </button>
      </section>
    );
  }

  return (
    <section className="dp-collection-route-panel" aria-label={`${route.title} route`}>
      <div className="dp-collection-route-panel__header">
        <p>{routeLabel}</p>
        <div className="dp-collection-route-panel__header-actions">
          <button
            type="button"
            className="dp-route-panel-control"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize route panel"
          >
            Minimize
          </button>
          <button type="button" className="dp-route-panel-control" onClick={onExit} aria-label="Exit collection route">
            Exit
          </button>
        </div>
      </div>
      <h2>{route.title}</h2>
      <p className="dp-collection-route-panel__description">{route.description}</p>
      <div className="dp-collection-route-panel__meta">
        <span>{route.stops.length} stops</span>
        {route.distanceLabel ? <span>{route.distanceLabel}</span> : null}
        {route.estimatedTime ? <span>{route.estimatedTime}</span> : null}
      </div>
      <div className="dp-collection-route-panel__actions">
        <button type="button" className="dp-route-cta dp-route-cta--primary" onClick={onStart}>{route.ctaLabel || "Start route"}</button>
        {directionsHref ? (
          <a className="dp-route-cta dp-route-cta--secondary" href={directionsHref} target="_blank" rel="noreferrer">Walking guide</a>
        ) : null}
        <button type="button" className="dp-route-cta dp-route-cta--tertiary" onClick={onViewStops}>View stops</button>
      </div>
      <div className="dp-collection-route-panel__stops" aria-label="Route stops">
        {route.stops.map((stop, index) => (
          <button
            key={stop.id}
            type="button"
            className={selectedStopId === stop.id ? "is-active" : ""}
            onClick={() => onSelectStop(stop)}
          >
            <span>{index + 1}</span>
            <strong>{stop.name || stop.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
