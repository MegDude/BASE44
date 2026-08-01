import { useMemo, useState } from "react";
import { Ellipsis, Navigation, X } from "lucide-react";
import { RouteDetails } from "./RouteDetails";
import { RouteProgress } from "./RouteProgress";
import { RouteRelatedList } from "./RouteRelatedList";
import { RouteStopList } from "./RouteStopList";
import type { RouteAccessibility } from "@/types/routeExperience";
import { NativeDrawerShell } from "@/components/map/NativeDrawerShell";

type SheetState = "peek" | "medium" | "expanded" | "full";

type RouteStop = {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
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

function routeModeLabel(routeType?: string) {
  if (routeType === "walk") return "Walking route";
  if (routeType === "guide") return "Guide";
  if (routeType === "collection") return "Route";
  return "Route";
}

export function RouteExperienceSheet({ route, mode, routeState = "", selectedStopId, visitedStopIds = [], relatedRoutes = [], onSelectStop, onOpenStop, onPrimaryAction, onOpenRelatedRoute, onExit }: RouteExperienceSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>("medium");
  const [menuOpen, setMenuOpen] = useState(false);
  const isStarted = routeState === "active" || routeState === "completed";
  const selectedIndex = Math.max(0, route.stops.findIndex((stop) => stop.id === selectedStopId));
  const activeStop = route.stops[selectedIndex] || route.stops[0];
  const directionsHref = useMemo(() => walkingDirectionsUrl(route.stops), [route.stops]);
  const routeLabel = routeModeLabel(route.routeType);
  const primaryLabel = isStarted ? "Continue walk" : "Start route";
  const cycleSheet = () => setSheetState((current) => current === "expanded" || current === "full" ? "medium" : "expanded");
  const collapseToMap = () => setSheetState("peek");
  const expandFromDock = () => setSheetState("medium");
  const visibleRelatedRoutes = sheetState === "expanded" || sheetState === "full" ? relatedRoutes : [];

  if (!route.stops.length) return null;
  return (
    <NativeDrawerShell
      className={`dp-route-experience-sheet is-${sheetState}`}
      drawerState={sheetState}
      panelKind="route"
      hasInternalActions={isStarted}
      onDrawerStateChange={setSheetState}
      onRequestClose={onExit}
      aria-labelledby={`dp-route-sheet-title-${route.id}`}
      data-sheet-state={sheetState}
      scrollClassName="dp-route-sheet-scroll"
      header={(
        <>
          <button type="button" className="dp-route-sheet-grabber" onClick={sheetState === "peek" ? expandFromDock : cycleSheet} aria-label={`Route sheet ${sheetState}. Change sheet height.`}><i /></button>
          <header className="dp-route-sheet-header">
            <div>
              <span>{route.neighborhood ? `${route.neighborhood} · ${routeLabel}` : routeLabel}</span>
              <strong id={`dp-route-sheet-title-${route.id}`}>{route.shortTitle || route.title}</strong>
            </div>
            <div>
              <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="More route actions" aria-expanded={menuOpen}><Ellipsis aria-hidden="true" /></button>
              <button type="button" onClick={onExit} aria-label="Close route"><X aria-hidden="true" /></button>
            </div>
            {menuOpen ? (
              <div className="dp-route-overflow-menu">
                <button type="button" onClick={() => { collapseToMap(); setMenuOpen(false); }}>View on map</button>
                {directionsHref ? <a href={directionsHref} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" /> Open walking directions</a> : null}
              </div>
            ) : null}
          </header>
        </>
      )}
    >
        <section className="dp-route-hero">
          <div>
            <p>{route.summary || route.description || "This route is being refreshed. Explore nearby places on the map while updated stops are confirmed."}</p>
            <div className="dp-route-facts" aria-label="Route facts">
              {route.estimatedTime ? <span>{route.estimatedTime}</span> : null}
              {route.distanceLabel ? <span>{route.distanceLabel}</span> : null}
              <span>{route.stops.length} stops</span>
            </div>
            <button type="button" className="dp-route-primary-action" onClick={() => onPrimaryAction(activeStop)}>{primaryLabel}</button>
          </div>
        </section>

        {isStarted ? <RouteProgress current={visitedStopIds.length} total={route.stops.length} started={isStarted} nextStopName={activeStop?.name || activeStop?.title} /> : null}

        {isStarted && activeStop ? (
          <section className="dp-route-active-stop" aria-labelledby="route-active-stop-title">
            <span>Current stop</span>
            <h3 id="route-active-stop-title">{activeStop.name || activeStop.title}</h3>
            <button type="button" onClick={() => onOpenStop(activeStop)}>Open stop</button>
          </section>
        ) : null}

        <RouteStopList stops={route.stops} selectedStopId={selectedStopId} visitedStopIds={visitedStopIds} started={isStarted} onSelectStop={onSelectStop} />
        <RouteRelatedList routes={visibleRelatedRoutes} onOpenRoute={onOpenRelatedRoute} />
        <RouteDetails
          description={route.description}
          beforeYouGo={route.beforeYouGo}
          accessibility={route.accessibility}
          partnerName={route.partnerName}
          routeId={route.id}
          mode={mode}
        />
        {isStarted && activeStop ? (
          <footer className="dp-route-active-action-bar" aria-label="Active route actions">
            <span>{`Stop ${selectedIndex + 1} of ${route.stops.length} · ${activeStop.name || activeStop.title || "Current stop"}`}</span>
            <button type="button" onClick={() => onOpenStop(activeStop)}>Open stop</button>
            <button type="button" onClick={onExit}>End route</button>
          </footer>
        ) : null}
    </NativeDrawerShell>
  );
}
