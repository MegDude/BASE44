import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Ellipsis, Map, Navigation, X } from "lucide-react";
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
  routeStopNumber?: number;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coords?: [number, number];
  image?: string;
  heroImage?: string;
  heroImageUrl?: string;
  imageAssets?: { heroImage?: string; thumbnail?: string; galleryImages?: string[] };
  drawerCopy?: string;
  category?: string;
  address?: string;
  accessibility?: string;
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
    attribution?: string;
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
  onBackToRoute?: () => void;
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

function stopDirectionsUrl(stop?: RouteStop) {
  const destination = stopCoords(stop);
  if (!destination) return "";
  const params = new URLSearchParams({ api: "1", travelmode: "walking", destination });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function stopHero(stop?: RouteStop) {
  return stop?.heroImageUrl || stop?.heroImage || stop?.image || stop?.imageAssets?.heroImage || stop?.imageAssets?.thumbnail || stop?.imageAssets?.galleryImages?.[0] || "";
}

function stopTitle(stop?: RouteStop) {
  return stop?.name || stop?.title || "Route stop";
}

export function RouteExperienceSheet({ route, mode, routeState = "", selectedStopId, visitedStopIds = [], relatedRoutes = [], onSelectStop, onOpenStop, onPrimaryAction, onOpenRelatedRoute, onBackToRoute, onExit }: RouteExperienceSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>("medium");
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousRouteScrollTopRef = useRef(0);
  const previousRouteSheetStateRef = useRef<SheetState>("medium");
  const isStarted = routeState === "active" || routeState === "completed";
  const selectedIndex = selectedStopId ? route.stops.findIndex((stop) => stop.id === selectedStopId) : -1;
  const activeStop = selectedIndex >= 0 ? route.stops[selectedIndex] : route.stops[0];
  const isStopDetail = Boolean(selectedStopId && selectedIndex >= 0);
  const directionsHref = useMemo(() => walkingDirectionsUrl(route.stops), [route.stops]);
  const activeStopDirectionsHref = useMemo(() => stopDirectionsUrl(activeStop), [activeStop]);
  const publicLabel = route.routeType || "route";
  const primaryLabel = isStarted ? (selectedStopId ? "Continue walk" : "Continue walk") : `Start ${publicLabel}`;
  const visibleRelatedRoutes = sheetState === "expanded" || sheetState === "full" ? relatedRoutes : [];
  const cycleSheet = () => setSheetState((current) => {
    const states: SheetState[] = ["peek", "medium", "expanded", "full"];
    return states[(states.indexOf(current) + 1) % states.length];
  });
  const toggleMapVisibility = () => setSheetState((current) => current === "peek" ? "medium" : "peek");
  const collapseToMap = () => setSheetState("peek");
  const enterStopDetail = (stop: RouteStop) => {
    previousRouteScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    previousRouteSheetStateRef.current = sheetState === "full" ? "expanded" : sheetState;
    onSelectStop(stop);
  };
  const returnToRoute = () => {
    const previousState = previousRouteSheetStateRef.current || "medium";
    setSheetState(previousState);
    onBackToRoute?.();
    window.requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = previousRouteScrollTopRef.current || 0;
    });
  };
  const continueToNextStop = () => {
    if (!route.stops.length) return;
    const nextStop = route.stops[Math.min(route.stops.length - 1, selectedIndex + 1)] || activeStop;
    if (nextStop) enterStopDetail(nextStop);
  };

  useEffect(() => {
    if (isStopDetail) return;
    previousRouteSheetStateRef.current = sheetState === "full" ? "expanded" : sheetState;
  }, [isStopDetail, sheetState]);

  if (!route.stops.length) return null;
  return (
    <NativeDrawerShell
      className={`dp-route-experience-sheet is-${sheetState} ${isStopDetail ? "is-stop-detail" : "is-route-view"}`}
      drawerState={sheetState}
      panelKind={isStopDetail ? "route-stop" : "route"}
      hasInternalActions={isStarted}
      onDrawerStateChange={setSheetState}
      onRequestClose={onExit}
      aria-labelledby={isStopDetail ? `dp-route-stop-sheet-title-${activeStop.id}` : `dp-route-sheet-title-${route.id}`}
      data-sheet-state={sheetState}
      data-sheet-view={isStopDetail ? "stop-detail" : "route"}
      scrollClassName="dp-route-sheet-scroll"
      scrollRef={scrollRef}
      actions={!isStopDetail ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="dp-route-secondary-action flex-1 min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F2F2F7] px-4 text-[14px] font-semibold text-[#0B1F33] transition-transform active:scale-95 hover:bg-black/10"
            onClick={collapseToMap}
          >
            <span>Continue</span>
            <ChevronRight aria-hidden="true" width={16} height={16} className="text-[#C9A66B]" />
          </button>
          <button
            type="button"
            className="dp-route-primary-action flex-1 min-h-[46px] inline-flex items-center justify-center rounded-xl bg-[#0B1F33] px-4 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-[#0B1F33]/90"
            onClick={() => onPrimaryAction(activeStop)}
          >
            {primaryLabel}
          </button>
        </div>
      ) : undefined}
      header={(
        <>
          <button type="button" className="dp-route-sheet-grabber" onClick={cycleSheet} aria-label={`Route sheet ${sheetState}. Change sheet height.`}><i /></button>
          {isStopDetail ? (
            <header className="dp-route-sheet-header dp-route-stop-detail-header">
              <div>
                <button type="button" className="dp-route-back-button" onClick={returnToRoute} aria-label={`Back to ${route.shortTitle || route.title}`}>
                  <ArrowLeft aria-hidden="true" />
                </button>
                <strong id={`dp-route-stop-sheet-title-${activeStop.id}`}>{stopTitle(activeStop)}</strong>
              </div>
              <div>
                <button type="button" onClick={onExit} aria-label="Close route"><X aria-hidden="true" /></button>
              </div>
            </header>
          ) : (
            <header className="dp-route-sheet-header flex items-center justify-between px-5 pb-3">
              <div className="min-w-0 pr-4">
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#C9A66B]">{publicLabel} · {route.neighborhood || "Downtown Austin"}</span>
                <strong id={`dp-route-sheet-title-${route.id}`} className="block text-lg font-semibold tracking-tight text-[#0B1F33] truncate mt-0.5">{route.shortTitle || route.title}</strong>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="More route actions" aria-expanded={menuOpen} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7] text-[#0B1F33]"><Ellipsis aria-hidden="true" width={16} height={16} /></button>
                <button type="button" onClick={onExit} aria-label="Close route" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F2F7] text-[#0B1F33]"><X aria-hidden="true" width={16} height={16} /></button>
              </div>
              {menuOpen ? (
                <div className="dp-route-overflow-menu">
                  {directionsHref ? <a href={directionsHref} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" /> Open walking directions</a> : null}
                  <button type="button" onClick={() => { setSheetState("full"); setMenuOpen(false); }}><Map aria-hidden="true" /> Route details</button>
                </div>
              ) : null}
            </header>
          )}
        </>
      )}
    >
      {isStopDetail ? (
        <article className="dp-route-stop-detail" data-route-stop-id={activeStop.id}>
          <div className="dp-route-active-action-bar">
            {activeStopDirectionsHref ? <a className="dp-route-primary-action" href={activeStopDirectionsHref} target="_blank" rel="noreferrer">Directions</a> : <button type="button" className="dp-route-primary-action" onClick={() => onOpenStop(activeStop)}>View details</button>}
            <button type="button" className="dp-route-secondary-action" onClick={continueToNextStop}>Continue <ChevronRight aria-hidden="true" /></button>
          </div>
          <section className="dp-route-stop-detail__summary">
            <span>Stop {(selectedIndex >= 0 ? selectedIndex : 0) + 1} of {route.stops.length}</span>
            <p>{activeStop.drawerCopy || activeStop.description || activeStop.summary || "Use this stop as a pause in the route, then continue to the next marker."}</p>
            {activeStop.address ? <small>{activeStop.address}</small> : null}
          </section>
          <section className="dp-route-context-section" aria-labelledby="route-stop-context-title">
            <h3 id="route-stop-context-title">Route context</h3>
            <div className="dp-route-stop-neighbors">
              {selectedIndex > 0 ? <button type="button" onClick={() => enterStopDetail(route.stops[selectedIndex - 1])}>Previous: {stopTitle(route.stops[selectedIndex - 1])}</button> : null}
              {selectedIndex < route.stops.length - 1 ? <button type="button" onClick={() => enterStopDetail(route.stops[selectedIndex + 1])}>Next: {stopTitle(route.stops[selectedIndex + 1])}</button> : null}
            </div>
          </section>
        </article>
      ) : (
        <>
          <section className="dp-route-hero space-y-3 rounded-2xl bg-[#F8F9FA] p-4 border border-black/10">
            <p className="text-[14px] leading-relaxed text-[#0B1F33]/80">{route.summary || route.description}</p>
            <div className="dp-route-facts flex flex-wrap items-center gap-2" aria-label="Route facts">
              <span className="px-2.5 py-1 rounded-lg bg-white shadow-xs text-[12px] font-semibold text-[#0B1F33]">{route.stops.length} stops</span>
              {route.estimatedTime ? <span className="px-2.5 py-1 rounded-lg bg-white shadow-xs text-[12px] font-semibold text-[#0B1F33]">{route.estimatedTime}</span> : null}
              {route.distanceLabel ? <span className="px-2.5 py-1 rounded-lg bg-white shadow-xs text-[12px] font-semibold text-[#0B1F33]">{route.distanceLabel}</span> : null}
              <span className="px-2.5 py-1 rounded-lg bg-white shadow-xs text-[12px] font-semibold text-[#C9A66B]">Self-guided</span>
            </div>
          </section>

          <RouteProgress current={visitedStopIds.length} total={route.stops.length} started={isStarted} nextStopName={activeStop?.name || activeStop?.title} />

          {isStarted && activeStop ? (
            <section className="dp-route-active-stop" aria-labelledby="route-active-stop-title">
              <span>Up next</span>
              <h3 id="route-active-stop-title">{activeStop.name || activeStop.title}</h3>
              <p>{activeStop.summary || activeStop.description || "Continue to the next stop on the route."}</p>
              <button type="button" onClick={() => enterStopDetail(activeStop)}>View stop</button>
            </section>
          ) : null}

          <RouteStopList stops={route.stops} selectedStopId={selectedStopId} visitedStopIds={visitedStopIds} onSelectStop={enterStopDetail} />
          <RouteRelatedList routes={visibleRelatedRoutes} onOpenRoute={onOpenRelatedRoute} />
          <RouteDetails
            description={route.description}
            beforeYouGo={route.beforeYouGo}
            accessibility={route.accessibility}
            partnerName={route.attribution || route.partnerName}
            routeId={route.id}
            mode={mode}
          />
        </>
      )}
    </NativeDrawerShell>
  );
}
