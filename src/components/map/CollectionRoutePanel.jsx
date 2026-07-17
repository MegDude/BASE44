import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, MapPin, Navigation, QrCode, X } from "lucide-react";
import { getWorkflowProfileId, getWorkflowSessionId, fireWorkflow, postWorkflow } from "@/lib/backendWorkflows";
import { getRelatedMapCollections } from "@/data/mapCollections";
import { CollectionHero } from "@/components/map/collections/CollectionHero";
import { CollectionTimeline } from "@/components/map/collections/CollectionTimeline";
import { FeaturedStopCard } from "@/components/map/collections/FeaturedStopCard";
import { CollectionEntityRail } from "@/components/map/collections/CollectionEntityRail";
import { CollectionStoryRail } from "@/components/map/collections/CollectionStoryRail";
import { CollectionProgressCard } from "@/components/map/collections/CollectionProgressCard";
import { AIRecommendationCard } from "@/components/map/collections/AIRecommendationCard";
import { NearbyCollections } from "@/components/map/collections/NearbyCollections";

const CHECK_IN_STORAGE_KEY = "downtown-perks-route-check-ins:v1";
const SAVED_COLLECTIONS_STORAGE_KEY = "downtown-perks-saved-collections:v1";
const CHECK_IN_RADIUS_METERS = 250;

function readCheckIns(routeId) {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(CHECK_IN_STORAGE_KEY) || "{}");
    return Array.isArray(stored?.[routeId]) ? stored[routeId] : [];
  } catch {
    return [];
  }
}

function writeCheckIns(routeId, stopIds) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(window.localStorage.getItem(CHECK_IN_STORAGE_KEY) || "{}");
    window.localStorage.setItem(CHECK_IN_STORAGE_KEY, JSON.stringify({ ...stored, [routeId]: stopIds }));
  } catch {
    // Device storage is a resilience layer; live event recording remains authoritative.
  }
}

function readSavedCollectionIds() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVED_COLLECTIONS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeSavedCollectionIds(collectionIds) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_COLLECTIONS_STORAGE_KEY, JSON.stringify(collectionIds));
  } catch {
    // The live workflow remains authoritative when browser storage is unavailable.
  }
}

function parseRouteQrValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return {
        routeId: String(parsed.routeId || parsed.collectionId || parsed.collection || "").trim(),
        stopId: String(parsed.stopId || parsed.entityId || parsed.placeId || "").trim(),
      };
    }
  } catch {
    // Compact values and URLs are expected.
  }
  if (/^DP-ROUTE:/i.test(value)) {
    const [, maybeVersion, routeId, stopId] = value.split(":");
    return maybeVersion === "1" ? { routeId, stopId } : { routeId: maybeVersion, stopId: routeId };
  }
  try {
    const url = new URL(value);
    return {
      routeId: url.searchParams.get("routeId") || url.searchParams.get("collection") || url.searchParams.get("route") || "",
      stopId: url.searchParams.get("stopId") || url.searchParams.get("entityId") || url.searchParams.get("placeId") || "",
    };
  } catch {
    return { stopId: value };
  }
}

function distanceMeters(a, b) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latDelta = radians(b.lat - a.lat);
  const lngDelta = radians(b.lng - a.lng);
  const h = Math.sin(latDelta / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lngDelta / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
}

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

export default function CollectionRoutePanel({ route, mode = "resident", selectedStopId, onSelectStop, onStart, onViewStops, onOpenCollection, onExit }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [checkedInStopIds, setCheckedInStopIds] = useState(() => readCheckIns(route?.id));
  const [savedCollectionIds, setSavedCollectionIds] = useState(readSavedCollectionIds);
  const [checkInStop, setCheckInStop] = useState(null);
  const [checkInState, setCheckInState] = useState("idle");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const stopsRef = useRef(null);
  const completionRecordedRef = useRef("");

  useEffect(() => setCheckedInStopIds(readCheckIns(route?.id)), [route?.id]);
  const checkedInSet = useMemo(() => new Set(checkedInStopIds), [checkedInStopIds]);
  const activeStop = route?.stops?.find((stop) => stop.id === selectedStopId) || route?.stops?.[0] || null;
  const routeComplete = Boolean(route?.stops?.length) && route.stops.every((stop) => checkedInSet.has(stop.id));
  const isSaved = savedCollectionIds.includes(route?.id);
  const offerStops = useMemo(
    () => (route?.stops || []).filter((stop) => stop.offer || stop.perk || stop.residentPerk || stop.raw?.offer).slice(0, 6),
    [route?.stops],
  );
  const eventStops = useMemo(
    () => (route?.stops || []).filter((stop) => /event|concert|music|market|festival|performance/i.test([stop.type, stop.entityType, stop.category, stop.tags?.join?.(" ")].filter(Boolean).join(" "))).slice(0, 6),
    [route?.stops],
  );
  const relatedCollections = useMemo(
    () => getRelatedMapCollections(route?.id),
    [route?.id],
  );

  useEffect(() => {
    if (!route?.id) return;
    fireWorkflow("/api/events", {
      id: `collection-opened-${route.id}-${Date.now()}`,
      type: "collection.opened",
      timestamp: new Date().toISOString(),
      profileId: getWorkflowProfileId(),
      sessionId: getWorkflowSessionId(),
      entityId: route.id,
      entityType: "collection",
      district: route.neighborhood,
      source: "collection_experience_panel",
      metadata: { title: route.title, stopCount: route.stops?.length || 0, mode },
    });
  }, [mode, route?.id, route?.neighborhood, route?.stops?.length, route?.title]);

  useEffect(() => {
    if (!routeComplete || completionRecordedRef.current === route.id) return;
    completionRecordedRef.current = route.id;
    fireWorkflow("/api/events", {
      id: `passport-completed-${route.id}-${Date.now()}`,
      type: "passport.completed",
      timestamp: new Date().toISOString(),
      profileId: getWorkflowProfileId(),
      sessionId: getWorkflowSessionId(),
      entityId: route.id,
      entityType: "collection",
      district: route.neighborhood,
      source: "collection_experience_panel",
      result: "completed",
      metadata: { title: route.title, badge: route.badge, stopCount: route.stops.length },
    });
  }, [route, routeComplete]);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => stopCamera(), []);

  const closeCheckIn = () => {
    stopCamera();
    setCheckInStop(null);
    setCheckInState("idle");
    setCheckInMessage("");
    setManualCode("");
  };

  const saveSuccessfulCheckIn = (stop) => {
    const next = Array.from(new Set([...checkedInStopIds, stop.id]));
    setCheckedInStopIds(next);
    writeCheckIns(route.id, next);
  };

  const recordCheckIn = async (stop, method, qrValue = "") => {
    if (!stop || checkInState === "saving") return;
    setCheckInState("saving");
    setCheckInMessage("Recording your stop…");
    const sessionId = getWorkflowSessionId();
    const profileId = getWorkflowProfileId();
    const payload = {
      id: `route-check-in-${route.id}-${stop.id}-${Date.now()}`,
      type: "event.checkin",
      timestamp: new Date().toISOString(),
      profileId,
      sessionId,
      entityId: stop.id,
      entityType: "route_stop",
      district: stop.district || route.neighborhood,
      source: "collection_route_panel",
      result: "confirmed",
      metadata: {
        routeId: route.id,
        routeTitle: route.title,
        stopName: stop.name || stop.title,
        method,
        qrValue: qrValue ? qrValue.slice(0, 500) : "",
      },
    };
    try {
      if (qrValue) {
        await postWorkflow("/api/events", { ...payload, id: `route-qr-${route.id}-${stop.id}-${Date.now()}`, type: "qr.scanned" });
      }
      await postWorkflow("/api/events", payload);
      if (route.id === "daa-art-walk") {
        await postWorkflow("/api/daa/check-in", {
          campaignId: route.campaignId,
          stopId: stop.id,
          stopName: stop.name || stop.title,
          placeId: stop.id,
          district: stop.district || route.neighborhood,
          profileId,
          sessionId,
          source: "collection-route-panel",
          shareUrl: typeof window !== "undefined" ? window.location.href : "",
          checkedInAt: payload.timestamp,
        });
      }
      saveSuccessfulCheckIn(stop);
      stopCamera();
      setCheckInState("success");
      setCheckInMessage(`Checked in at ${stop.name || stop.title}.`);
    } catch (error) {
      setCheckInState("error");
      setCheckInMessage(error?.message || "We could not record this check-in. Please try again.");
    }
  };

  const verifyScannedValue = async (value) => {
    const parsed = parseRouteQrValue(value);
    if (!checkInStop) return;
    if (parsed.routeId && parsed.routeId !== route.id) {
      setCheckInState("error");
      setCheckInMessage("That code belongs to a different route.");
      return;
    }
    if (parsed.stopId !== checkInStop.id) {
      setCheckInState("error");
      setCheckInMessage(`That code is not for ${checkInStop.name || checkInStop.title}.`);
      return;
    }
    await recordCheckIn(checkInStop, "qr", value);
  };

  const startCamera = async () => {
    const Detector = typeof window !== "undefined" ? window.BarcodeDetector : null;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setCheckInState("manual");
      setCheckInMessage("Camera QR scanning is not available here. Enter the stop code instead.");
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const detector = new Detector({ formats: ["qr_code"] });
      setCheckInState("scanning");
      setCheckInMessage(`Point the camera at the ${checkInStop?.name || "stop"} QR code.`);
      const scanFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.[0]?.rawValue) {
            stopCamera();
            await verifyScannedValue(codes[0].rawValue);
            return;
          }
        } catch {
          // Camera focus can make individual frames unreadable.
        }
        frameRef.current = requestAnimationFrame(scanFrame);
      };
      frameRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCheckInState("manual");
      setCheckInMessage("Camera access was not available. Enter the stop code or use nearby check-in.");
    }
  };

  const checkInNearby = () => {
    if (!checkInStop || !navigator.geolocation) {
      setCheckInState("error");
      setCheckInMessage("Location check-in is not available on this device.");
      return;
    }
    setCheckInState("locating");
    setCheckInMessage("Confirming that you are near this stop…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = stopCoords(checkInStop).split(",").map(Number);
        if (!coords.every(Number.isFinite)) {
          setCheckInState("error");
          setCheckInMessage("This stop does not have a verified check-in location yet.");
          return;
        }
        const distance = distanceMeters(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          { lat: coords[0], lng: coords[1] },
        );
        if (distance > CHECK_IN_RADIUS_METERS) {
          setCheckInState("error");
          setCheckInMessage(`Move closer to check in. You are about ${Math.round(distance)} m away.`);
          return;
        }
        void recordCheckIn(checkInStop, "proximity");
      },
      () => {
        setCheckInState("manual");
        setCheckInMessage("Location access was not available. Scan or enter the stop code instead.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  const openCheckIn = () => {
    if (!activeStop) return;
    setCheckInStop(activeStop);
    setCheckInState(checkedInSet.has(activeStop.id) ? "success" : "idle");
    setCheckInMessage(checkedInSet.has(activeStop.id) ? `Already checked in at ${activeStop.name || activeStop.title}.` : "");
  };

  const startCollection = () => {
    const eventBase = {
      timestamp: new Date().toISOString(),
      profileId: getWorkflowProfileId(),
      sessionId: getWorkflowSessionId(),
      entityId: route.id,
      entityType: "collection",
      district: route.neighborhood,
      source: "collection_experience_panel",
      result: "started",
      metadata: { title: route.title, stopCount: route.stops.length },
    };
    fireWorkflow("/api/events", { ...eventBase, id: `route-started-${route.id}-${Date.now()}`, type: "route.started" });
    fireWorkflow("/api/events", { ...eventBase, id: `passport-started-${route.id}-${Date.now()}`, type: "passport.started" });
    onStart?.();
  };

  const toggleSaved = () => {
    const nextSaved = isSaved
      ? savedCollectionIds.filter((id) => id !== route.id)
      : [...savedCollectionIds, route.id];
    setSavedCollectionIds(nextSaved);
    writeSavedCollectionIds(nextSaved);
    const action = isSaved ? "unsave" : "save";
    fireWorkflow("/api/map-actions", {
      id: `collection-${action}-${route.id}-${Date.now()}`,
      action,
      mode,
      profileId: getWorkflowProfileId(),
      sessionId: getWorkflowSessionId(),
      source: "collection_experience_panel",
      pageUrl: window.location.href,
      collection: route.id,
      entity: { id: route.id, name: route.title, type: "collection", category: route.category, district: route.neighborhood },
      metadata: { stopCount: route.stops.length, badge: route.badge },
    });
    fireWorkflow("/api/events", {
      id: `collection-${action}-${route.id}-${Date.now()}`,
      type: isSaved ? "entity.dismissed" : "entity.saved",
      timestamp: new Date().toISOString(),
      profileId: getWorkflowProfileId(),
      sessionId: getWorkflowSessionId(),
      entityId: route.id,
      entityType: "collection",
      district: route.neighborhood,
      source: "collection_experience_panel",
      result: action,
    });
  };

  const shareCollection = async () => {
    const shareData = { title: route.title, text: route.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      fireWorkflow("/api/events", {
        id: `collection-shared-${route.id}-${Date.now()}`,
        type: "entity.shared",
        timestamp: new Date().toISOString(),
        profileId: getWorkflowProfileId(),
        sessionId: getWorkflowSessionId(),
        entityId: route.id,
        entityType: "collection",
        district: route.neighborhood,
        source: "collection_experience_panel",
      });
    } catch {
      // Cancelling the native share sheet is not an error state.
    }
  };

  const viewStops = () => {
    onViewStops?.();
    window.requestAnimationFrame(() => {
      stopsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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
    <section className="dp-collection-route-panel" aria-labelledby={`dp-route-panel-title-${route.id}`}>
      <header className="dp-collection-route-panel__header">
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
      </header>
      <div className="dp-collection-route-panel__scroll">
        <CollectionHero route={route} isSaved={isSaved} onSave={toggleSaved} onShare={shareCollection} onStart={startCollection} />
        <section className="dp-collection-v3-section dp-collection-overview" aria-labelledby={`dp-collection-overview-${route.id}`}>
          <div className="dp-collection-v3-heading"><p>Collection overview</p><h3 id={`dp-collection-overview-${route.id}`}>{route.benefitTitle || "A ready-to-use downtown experience"}</h3></div>
          <p>{route.benefitDescription || "Open each stop for current details, directions, and eligible resident value."}</p>
        </section>
        <section className="dp-collection-live-map" aria-label="Live collection map status">
          <span><MapPin aria-hidden="true" /></span>
          <div><p>Live map active</p><strong>{activeStop?.name || activeStop?.title || route.title}</strong><small>Featured stops, progress, offers, and the walking line remain visible on the map.</small></div>
          <button type="button" onClick={viewStops}>View map</button>
        </section>
        <div className="dp-collection-route-panel__meta" aria-label="Route details">
          <span>{route.stops.length} stops</span>
          {route.distanceLabel ? <span>{route.distanceLabel}</span> : null}
          {route.estimatedTime ? <span>{route.estimatedTime}</span> : null}
          {route.checkInEnabled ? <span>{checkedInSet.size}/{route.stops.length} checked in</span> : null}
        </div>
        <div className="dp-collection-route-panel__actions">
          <button type="button" className="dp-route-cta dp-route-cta--primary" onClick={startCollection}>{route.ctaLabel || "Start route"}</button>
        {route.checkInEnabled ? (
          <button type="button" className="dp-route-cta dp-route-cta--check-in" onClick={openCheckIn}>
            <QrCode aria-hidden="true" />
            {checkedInSet.has(activeStop?.id) ? "View check-in" : `Check in: ${activeStop?.name || "selected stop"}`}
          </button>
        ) : null}
          <div className="dp-collection-route-panel__utility-actions">
            {directionsHref ? (
              <a className="dp-route-cta dp-route-cta--secondary" href={directionsHref} target="_blank" rel="noreferrer">Walking guide</a>
            ) : null}
            <button type="button" className="dp-route-cta dp-route-cta--tertiary" onClick={viewStops}>View all stops</button>
          </div>
        </div>
        <section className="dp-collection-v3-section" aria-labelledby={`dp-featured-stops-${route.id}`}>
          <div className="dp-collection-v3-heading"><p>Start here</p><h3 id={`dp-featured-stops-${route.id}`}>Featured stops</h3></div>
          <div className="dp-featured-stop-rail">
            {route.stops.map((stop, index) => <FeaturedStopCard key={stop.id} stop={stop} index={index} checkedIn={checkedInSet.has(stop.id)} onSelect={onSelectStop} />)}
          </div>
        </section>
        <CollectionEntityRail title="Offers in this collection" kind="offers" items={offerStops} onSelect={onSelectStop} />
        <CollectionEntityRail title="Events in this collection" kind="events" items={eventStops} onSelect={onSelectStop} />
        <section className="dp-collection-v3-section dp-collection-walking-card" aria-labelledby={`dp-walking-route-${route.id}`}>
          <div className="dp-collection-v3-heading"><p>Walking route</p><h3 id={`dp-walking-route-${route.id}`}>Suggested order</h3></div>
          <div className="dp-collection-walking-card__body">
            <Navigation aria-hidden="true" />
            <div><strong>{route.estimatedTime || "Self-guided"}</strong><span>{route.distanceLabel || "Downtown Austin"} · {route.stops.length} stops</span></div>
            {directionsHref ? <a href={directionsHref} target="_blank" rel="noreferrer">Navigate</a> : null}
          </div>
        </section>
        <CollectionTimeline route={route} activeStopId={activeStop?.id} checkedInSet={checkedInSet} onSelectStop={onSelectStop} />
        <CollectionStoryRail stories={route.stories || []} />
        {route.accessibility?.length ? (
          <section className="dp-collection-v3-section" aria-labelledby={`dp-accessibility-${route.id}`}>
            <div className="dp-collection-v3-heading"><p>Plan with confidence</p><h3 id={`dp-accessibility-${route.id}`}>Accessibility & comfort</h3></div>
            <div className="dp-collection-accessibility">{route.accessibility.map((item) => <span key={item}>{item}</span>)}</div>
          </section>
        ) : null}
        <CollectionProgressCard route={route} completed={checkedInSet.size} total={route.stops.length} />
        <AIRecommendationCard route={route} activeStop={activeStop} completed={checkedInSet.size} />
        <NearbyCollections collections={relatedCollections} onOpen={onOpenCollection} />
        {mode === "partner" ? (
          <section className="dp-collection-partner-card" aria-labelledby={`dp-partner-collection-${route.id}`}>
            <p>Partner participation</p>
            <h3 id={`dp-partner-collection-${route.id}`}>Join this collection through your workspace.</h3>
            <span>Request inclusion, attach a current offer or event, sponsor the route, and review privacy-safe engagement from one partner workflow.</span>
            <a href={`/partner-workspace/overview?collection=${encodeURIComponent(route.id)}`}>Open partner workspace</a>
          </section>
        ) : null}
        {routeComplete ? (
          <p className="dp-collection-route-panel__completion" role="status">
            <Check aria-hidden="true" /> {route.completionReward || "Route complete — every stop is saved to your activity."}
          </p>
        ) : null}
        <section className="dp-collection-route-panel__stops-section dp-collection-v3-stop-list" ref={stopsRef} aria-labelledby={`dp-route-stops-title-${route.id}`}>
          <div className="dp-collection-route-panel__stops-heading">
            <p id={`dp-route-stops-title-${route.id}`}>Route stops</p>
            <span>Select a stop to open its map detail and check-in.</span>
          </div>
          <div className="dp-collection-route-panel__stops" aria-label="Route stops">
            {route.stops.map((stop, index) => (
              <button
                key={stop.id}
                type="button"
                className={selectedStopId === stop.id ? "is-active" : ""}
                data-checked-in={checkedInSet.has(stop.id) ? "true" : "false"}
                aria-current={selectedStopId === stop.id ? "step" : undefined}
                onClick={() => onSelectStop(stop)}
              >
                <span>{index + 1}</span>
                <span className="dp-route-stop-copy">
                  <strong>{stop.name || stop.title}</strong>
                  {route.checkInEnabled ? <small>{checkedInSet.has(stop.id) ? "Checked in" : selectedStopId === stop.id ? "Selected for check-in" : "Tap to select"}</small> : null}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      {checkInStop && typeof document !== "undefined" ? createPortal((
        <div className="dp-route-check-in-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCheckIn()}>
          <section className="dp-route-check-in" role="dialog" aria-modal="true" aria-labelledby="dp-route-check-in-title">
            <button type="button" className="dp-route-check-in__close" onClick={closeCheckIn} aria-label="Close route check-in"><X aria-hidden="true" /></button>
            <p className="dp-route-check-in__eyebrow">Route check-in</p>
            <h3 id="dp-route-check-in-title">{checkInStop.name || checkInStop.title}</h3>
            <p className="dp-route-check-in__copy">Scan the posted stop QR or confirm you are nearby. Progress is saved to this device and recorded to Downtown Perks when the live service is available.</p>
            <div className="dp-route-check-in__camera" data-state={checkInState}>
              <video ref={videoRef} playsInline muted aria-label="QR scanner camera preview" />
              <QrCode aria-hidden="true" />
              <span>{checkInState === "scanning" ? "Scanning…" : "Stop QR"}</span>
            </div>
            {checkInMessage ? <p className={`dp-route-check-in__status is-${checkInState}`} role="status">{checkInMessage}</p> : null}
            {checkInState === "success" ? (
              <div className="dp-route-check-in__success">
                <Check aria-hidden="true" /><strong>Stop collected</strong><span>{checkedInSet.size} of {route.stops.length} route stops complete</span>
              </div>
            ) : (
              <>
                <div className="dp-route-check-in__actions">
                  <button type="button" onClick={startCamera} disabled={["saving", "locating", "scanning"].includes(checkInState)}><QrCode aria-hidden="true" /> Scan QR</button>
                  <button type="button" onClick={checkInNearby} disabled={["saving", "locating", "scanning"].includes(checkInState)}><MapPin aria-hidden="true" /> Check in nearby</button>
                </div>
                <div className="dp-route-check-in__manual">
                  <label htmlFor="dp-route-stop-code">Stop code</label>
                  <div>
                    <input id="dp-route-stop-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder={`DP-ROUTE:1:${route.id}:${checkInStop.id}`} />
                    <button type="button" onClick={() => verifyScannedValue(manualCode)} disabled={!manualCode.trim() || checkInState === "saving"}>Verify</button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      ), document.body) : null}
    </section>
  );
}
