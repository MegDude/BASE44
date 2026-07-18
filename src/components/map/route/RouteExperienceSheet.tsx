import { useMemo, useState } from "react";
import { ChevronDown, Ellipsis, Map, Navigation, X } from "lucide-react";
import { RouteDetails } from "./RouteDetails";
import { RouteProgress } from "./RouteProgress";
import { RouteRelatedList } from "./RouteRelatedList";
import { RouteStopList } from "./RouteStopList";
import type { RouteAccessibility } from "@/types/routeExperience";

type SheetState = "peek" | "half" | "full";

type RouteStop = {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  routeStopNumber?: number;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coords?: [number, number];
};

type RouteExperienceSheetProps = {
  route: {
    id: string;
    title: string;
    shortTitle?: string;
    routeType?: "walk" | "route" | "guide" | "collection";
    summary?: string;
    description?: string;
    neighborhood?: string;
    heroImageUrl?: string;
    estimatedTime?: string;
    distanceLabel?: string;
    partnerName?: string;
    beforeYouGo?: string[];
    accessibility?: RouteAccessibility;
    stops: RouteStop[];
  };
  mode: "resident" | "partner";
  routeState?: string;
  selectedStopId?: string;
  visitedStopIds?: string[];
  relatedRoutes?: Array<{ id: string; title: string; routeType?: string; stopIds?: string[]; estimatedTime?: string }>;
  onSelectStop: (stop: RouteStop) => void;
  onOpenStop: (stop: RouteStop) => void;
  onPrimaryAction: (stop: RouteStop) => void;
  onOpenRelatedRoute: (routeId: string) => void;
  onExit: () => void;
};

function stopCoords(stop?: RouteStop) {
  if (Number.isFinite(stop?.lat) && Number.isFinite(stop?.lng)) return `${stop.lat},${stop.lng}`;
  if (Array.isArray(stop?.coords) && stop.coords.length >= 2) return `${stop.coords[0]},${stop.coords[1]}`;
  if (Number.isFinite(stop?.latitude) && Number.isFinite(stop?.longitude)) return `${stop.latitude},${stop.longitude}`;
  return "";
}

function walkingDirectionsUrl(stops: RouteStop[] = []) {
  const coords = stops.map(stopCoords).filter(Boolean);
  if (coords.length < 2) return "";
  const params = new URLSearchParams({ api: "1", travelmode: "walking", origin: coords[0], destination: coords[coords.length - 1] });
  if (coords.length > 2) params.set("waypoints", coords.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function RouteExperienceSheet({ route, mode, routeState = "", selectedStopId, visitedStopIds = [], relatedRoutes = [], onSelectStop, onOpenStop, onPrimaryAction, onOpenRelatedRoute, onExit }: RouteExperienceSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>("half");
  const [menuOpen, setMenuOpen] = useState(false);
  const isStarted = routeState === "active" || routeState === "completed";
  const selectedIndex = Math.max(0, route.stops.findIndex((stop) => stop.id === selectedStopId));
  const activeStop = route.stops[selectedIndex] || route.stops[0];
  const directionsHref = useMemo(() => walkingDirectionsUrl(route.stops), [route.stops]);
  const publicLabel = route.routeType || "route";
  const primaryLabel = isStarted ? (selectedStopId ? "View stop" : "Continue walk") : `Start ${publicLabel}`;
  const cycleSheet = () => setSheetState((current) => current === "peek" ? "half" : current === "half" ? "full" : "peek");

  if (!route.stops.length) return null;
  return (
    <section className={`dp-route-experience-sheet is-${sheetState}`} aria-labelledby={`dp-route-sheet-title-${route.id}`} data-sheet-state={sheetState}>
      <button type="button" className="dp-route-sheet-grabber" onClick={cycleSheet} aria-label={`Route sheet ${sheetState}. Change sheet height.`}><i /></button>
      <header className="dp-route-sheet-header">
        <div><span>{publicLabel} · {route.neighborhood || "Downtown Austin"}</span><strong id={`dp-route-sheet-title-${route.id}`}>{route.shortTitle || route.title}</strong></div>
        <div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="More route actions" aria-expanded={menuOpen}><Ellipsis aria-hidden="true" /></button>
          <button type="button" onClick={onExit} aria-label="Close route"><X aria-hidden="true" /></button>
        </div>
        {menuOpen ? (
          <div className="dp-route-overflow-menu">
            {directionsHref ? <a href={directionsHref} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" /> Open walking directions</a> : null}
            <button type="button" onClick={() => { setSheetState("full"); setMenuOpen(false); }}><Map aria-hidden="true" /> Route details</button>
          </div>
        ) : null}
      </header>

      <div className="dp-route-sheet-scroll">
        <section className="dp-route-hero">
          {route.heroImageUrl ? <img src={route.heroImageUrl} alt="" loading="eager" /> : null}
          <div>
            <p>{route.summary || route.description}</p>
            <div className="dp-route-facts" aria-label="Route facts">
              <span>{route.stops.length} stops</span>
              {route.estimatedTime ? <span>{route.estimatedTime}</span> : null}
              {route.distanceLabel ? <span>{route.distanceLabel}</span> : null}
              <span>Self-guided</span>
            </div>
          </div>
        </section>

        <RouteProgress current={visitedStopIds.length} total={route.stops.length} started={isStarted} nextStopName={activeStop?.name || activeStop?.title} />

        {isStarted && activeStop ? (
          <section className="dp-route-active-stop" aria-labelledby="route-active-stop-title">
            <span>Up next</span>
            <h3 id="route-active-stop-title">{activeStop.name || activeStop.title}</h3>
            <p>{activeStop.summary || activeStop.description || "Continue to the next stop on the route."}</p>
            <button type="button" onClick={() => onOpenStop(activeStop)}>View stop</button>
          </section>
        ) : null}

        <RouteStopList stops={route.stops} selectedStopId={selectedStopId} visitedStopIds={visitedStopIds} onSelectStop={onSelectStop} />
        <RouteRelatedList routes={relatedRoutes} onOpenRoute={onOpenRelatedRoute} />
        <RouteDetails
          description={route.description}
          beforeYouGo={route.beforeYouGo}
          accessibility={route.accessibility}
          partnerName={route.partnerName}
          routeId={route.id}
          mode={mode}
        />
      </div>

      <footer className="dp-route-sheet-footer">
        <button type="button" className="dp-route-primary-action" onClick={() => onPrimaryAction(activeStop)}>{primaryLabel}</button>
        <button type="button" className="dp-route-sheet-size" onClick={() => setSheetState(sheetState === "full" ? "half" : "full")} aria-label={sheetState === "full" ? "Show less route information" : "Show all route information"}>
          <ChevronDown aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
