import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Loader2, MapPinned, MapPin, Sparkles, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { mapRepository } from "@/lib/repositories/mapRepository";
import MobileActionPanel from "@/components/shared/MobileActionPanel";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { useMapStateStore } from "@/store/mapStateStore";

function formatEventCard(item) {
  const eventDate = item?.metadata?.date;
  const parsedDate = eventDate ? new Date(`${eventDate}T12:00:00`) : null;
  const validDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  return {
    id: item.id,
    title: item.name || item.title,
    category: item.category || "Event",
    location: item?.metadata?.venue_name || item.address || "Downtown Austin",
    attendees: item?.metadata?.rsvp_count || item.rsvp_count || 0,
    dateLabel: validDate
      ? `${validDate.toLocaleDateString("en-US", { month: "short" })} ${validDate.getDate()}`
      : item?.metadata?.time || "Tonight",
    timeLabel: item?.metadata?.time || "Tonight",
    description: item.description || item.address || "Live event on the downtown map.",
  };
}

function formatPropertyCard(item) {
  return {
    id: item.id,
    title: item.name || item.title,
    badge: item?.isLegends || item?.metadata?.isLegends ? "Legends" : "Property",
    subtitle:
      item?.metadata?.priceRange ||
      item?.subtitle ||
      item?.address?.split(",")[0] ||
      "Downtown Austin",
    location: item.address || "Downtown Austin",
    walkLabel: item?.metadata?.walkMinutes ? `${item.metadata.walkMinutes} min away` : "Downtown",
    description: item.description || "Property pin on the downtown map.",
    district: item?.district || "Downtown Austin",
    listingCount: Number(item?.metadata?.groupedListingCount || item?.metadata?.unitCount || 0),
    buildingName: item?.metadata?.buildingName || item.name || item.title,
  };
}

function prioritizeTheShore(items) {
  return [...items].sort((left, right) => {
    const leftName = String(left?.metadata?.buildingName || left?.name || left?.title || "").trim().toLowerCase();
    const rightName = String(right?.metadata?.buildingName || right?.name || right?.title || "").trim().toLowerCase();
    const leftIsShore = leftName === "the shore";
    const rightIsShore = rightName === "the shore";

    if (leftIsShore && !rightIsShore) return -1;
    if (!leftIsShore && rightIsShore) return 1;
    return 0;
  });
}

export default function PartnerEventsMap({
  onAskMap,
  onSave,
  onDirections,
  onOpenCard,
  onUnlockPerk,
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [eventCards, setEventCards] = useState([]);
  const [propertyCards, setPropertyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [mobileDrawerEntityId, setMobileDrawerEntityId] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const feed = await mapRepository.getMapFeed({ limit: 300 });
        if (!mounted) return;

        const mapItems = feed.filter((item) =>
          ["event", "venue", "building", "property", "hotel"].includes(item.type)
        );
        const events = mapItems.filter((item) => item.type === "event").slice(0, 6);
        const properties = mapItems.filter((item) =>
          ["building", "property", "hotel"].includes(item.type)
        );
        const legendsProperties = properties.filter((item) => item?.isLegends || item?.metadata?.isLegends);
        const featuredProperties = prioritizeTheShore(
          legendsProperties.length > 0 ? legendsProperties : properties
        ).slice(0, 8);

        setItems(mapItems);
        setEventCards(events.map(formatEventCard));
        setPropertyCards(featuredProperties.map(formatPropertyCard));

        if (events[0]) {
          setSelectedMarkerId(events[0].id);
          setSelectedEventId(events[0].id);
          if (events[0].location) {
            setMapCenter([events[0].location.latitude, events[0].location.longitude]);
          }
        }
      } catch (error) {
        console.error("Failed to load partner events map:", error);
        if (!mounted) return;
        setItems([]);
        setEventCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedMarker = useMemo(
    () => items.find((item) => item.id === selectedMarkerId) || null,
    [items, selectedMarkerId]
  );

  const selectedEvent = useMemo(
    () => eventCards.find((item) => item.id === selectedEventId) || null,
    [eventCards, selectedEventId]
  );

  const propertyMapItems = useMemo(
    () => items.filter((item) => propertyCards.some((property) => property.id === item.id)),
    [items, propertyCards]
  );

  const selectedProperty = useMemo(
    () => propertyCards.find((item) => item.id === selectedMarkerId) || null,
    [propertyCards, selectedMarkerId]
  );

  function handleSelectMarker(entity) {
    setSelectedMarkerId(entity.id);
    setMobileDrawerEntityId(entity.id);
    if (entity.type === "event") {
      setSelectedEventId(entity.id);
    }
    if (entity?.location) {
      setMapCenter([entity.location.latitude, entity.location.longitude]);
    }
  }

  function handleSelectEvent(eventCard) {
    setSelectedEventId(eventCard.id);
    setSelectedMarkerId(eventCard.id);
    setMobileDrawerEntityId(null);
    const entity = items.find((item) => item.id === eventCard.id);
    if (entity?.location) {
      setMapCenter([entity.location.latitude, entity.location.longitude]);
      setMapZoom(15);
    }
  }

  function handleSelectProperty(propertyCard) {
    setSelectedEventId(null);
    setSelectedMarkerId(propertyCard.id);
    setMobileDrawerEntityId(null);
    const entity = items.find((item) => item.id === propertyCard.id);
    if (entity?.location) {
      setMapCenter([entity.location.latitude, entity.location.longitude]);
      setMapZoom(15);
    }
  }

  function handleAskMap() {
    const seededQuestion = "What is worth doing tonight near Rainey and downtown?";

    if (onAskMap) {
      onAskMap(seededQuestion);
      return;
    }

    useMapPanelStore.getState().hydrateFromState({
      mode: "ask",
      query: seededQuestion,
      decision: "now",
      type: "events",
      agentExplanation: "Looking at live downtown events and nearby places that fit tonight.",
      agentSuggestions: [
        "What is happening on Rainey right now",
        "Which events are closest tonight",
        "What is worth walking to now",
      ],
      agentSource: "fallback",
      categories: [],
      filters: {
        crowd: false,
        deals: false,
        fiveMin: false,
        tenMin: false,
        openNow: true,
      },
    });

    useMapStateStore.getState().setSearchQuery(seededQuestion);
    useMapStateStore.getState().setShowResultsList(true);
    useMapStateStore.getState().setShowMapOnly(false);
    useMapStateStore.getState().setViewMode("events");

    navigate("/events");
  }

  function handleSaveEvent(eventCard) {
    if (onSave) {
      const entity = items.find((item) => item.id === eventCard.id);
      onSave(entity || eventCard);
      return;
    }
    navigate("/events");
  }

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-2 md:px-6">
      <div className="dp-page-shell overflow-hidden rounded-[32px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(248,251,255,0.96),rgba(238,244,250,0.92))]">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="relative z-10 border-b border-[rgba(11,31,51,0.08)] bg-white/68 p-5 backdrop-blur-xl lg:border-b-0 lg:border-r">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
              Events
            </div>
            <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--dp-navy)] md:text-[2.2rem]">
              Find out what is happening before you miss it.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.64)]">
              Residents can see good events, local plans, and nearby things to do in one place, without digging through a bunch of apps or links.
            </p>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[rgba(207,175,90,0.24)] bg-[linear-gradient(180deg,rgba(11,31,51,0.98),rgba(17,39,61,0.96))] p-4 text-white shadow-[0_18px_44px_rgba(11,31,51,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(207,175,90,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Live map agent
                  </div>
                  <div className="mt-3 text-[1.15rem] font-semibold tracking-[-0.03em] text-white">
                    Ask what is worth doing tonight.
                  </div>
                  <div className="mt-2 max-w-sm text-[13px] leading-6 text-white/72">
                    Open the live events map with the question already loaded, so the agent starts with an answer instead of a blank screen.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAskMap}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--dp-gold)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)] transition hover:brightness-105"
                >
                  Ask the map
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Tonight near Rainey", "Closest live events", "Best nearby plan now"].map((prompt) => (
                  <div
                    key={prompt}
                    className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/78"
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/72 p-4 text-[14px] text-[rgba(11,31,51,0.62)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading live event pins
                </div>
              ) : eventCards.length === 0 ? (
                <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white/72 p-4 text-[14px] leading-7 text-[rgba(11,31,51,0.64)]">
                  No events are loaded yet. The map can still show nearby venues and properties.
                </div>
              ) : (
                eventCards.map((event) => {
                  const active = selectedEventId === event.id;
                  return (
                    <motion.button
                      key={event.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectEvent(event)}
                      className={`w-full rounded-[22px] border p-4 text-left backdrop-blur-xl transition-all ${
                        active
                          ? "border-[rgba(197,166,92,0.52)] bg-white/84 shadow-[0_14px_34px_rgba(11,31,51,0.1)]"
                          : "border-white/56 bg-white/66 hover:bg-white/78"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-[var(--dp-navy)]">{event.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {event.dateLabel}
                          </div>
                        </div>
                        <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                          {event.category}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.62)]">
                        <MapPinned className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.56)]">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {event.attendees} residents going
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-[12px] text-[rgba(11,31,51,0.56)]">{event.timeLabel}</div>
                        <button
                          type="button"
                          onClick={(nextEvent) => {
                            nextEvent.stopPropagation();
                            handleSaveEvent(event);
                          }}
                          className="rounded-full bg-[var(--dp-navy)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                          aria-label={`RSVP for ${event.title}`}
                        >
                          RSVP
                        </button>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            <div className="mt-7 border-t border-[rgba(11,31,51,0.08)] pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                    Want to live here?
                  </div>
                  <div className="mt-2 text-[1rem] font-semibold text-[var(--dp-navy)]">
                    Properties on the same live map
                  </div>
                </div>
                <div className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                  {propertyCards.length} shown
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  Show the residential layer by itself. This view filters down to the exact homes you want to feature, so a property team can point to a few real buildings instead of dropping people into a crowded map.
                </div>

                <div className="mt-4 overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/84 shadow-[0_14px_34px_rgba(11,31,51,0.08)]">
                  <div className="border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,250,253,0.92)] px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      Filtered property map
                    </div>
                    <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.64)]">
                      Only the specific properties shown here are plotted.
                    </div>
                  </div>

                  <div className="relative h-[260px] bg-[rgba(11,31,51,0.03)]">
                    <UnifiedMapShell
                      items={propertyMapItems}
                      selectedId={selectedProperty?.id}
                      markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
                      onMarkerSelect={handleSelectMarker}
                      mapCenter={selectedProperty ? mapCenter : [30.2672, -97.744]}
                      mapZoom={selectedProperty ? Math.max(mapZoom, 16) : 16}
                      onMapCenterChange={setMapCenter}
                      onMapZoomChange={setMapZoom}
                      className="h-full w-full"
                    />
                  </div>

                  <div className="border-t border-[rgba(11,31,51,0.08)] px-4 py-4">
                    {selectedProperty ? (
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                              {selectedProperty.badge} property
                            </div>
                            <div className="mt-1 text-[1rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy)]">
                              {selectedProperty.buildingName}
                            </div>
                          </div>
                          <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                            {selectedProperty.walkLabel}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.62)]">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
                          <span className="truncate">{selectedProperty.location}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)]">
                            {selectedProperty.subtitle}
                          </span>
                          <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)]">
                            {selectedProperty.district}
                          </span>
                          {selectedProperty.listingCount > 0 ? (
                            <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)]">
                              {selectedProperty.listingCount} listing{selectedProperty.listingCount === 1 ? "" : "s"}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 text-[12px] leading-6 text-[rgba(11,31,51,0.58)]">
                          {selectedProperty.description}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[12px] leading-6 text-[rgba(11,31,51,0.58)]">
                        Pick a property pin to show the building detail here.
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {propertyCards.map((property) => {
                        const active = selectedProperty?.id === property.id;
                        return (
                          <button
                            key={property.id}
                            type="button"
                            onClick={() => handleSelectProperty(property)}
                            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                              active
                                ? "bg-[var(--dp-navy)] text-white"
                                : "border border-[rgba(11,31,51,0.08)] bg-white text-[rgba(11,31,51,0.62)]"
                            }`}
                          >
                            {property.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] bg-[rgba(11,31,51,0.02)] lg:min-h-[720px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_22rem)]" />
            <UnifiedMapShell
              items={items}
              selectedId={selectedMarker?.id}
              markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
              onMarkerSelect={handleSelectMarker}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              onMapCenterChange={setMapCenter}
              onMapZoomChange={setMapZoom}
              className="h-[420px] w-full lg:h-[720px]"
            />

            <AnimatePresence>
              {selectedEvent && mobileDrawerEntityId === selectedEvent.id ? (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <MobileActionPanel
                    eyebrow={selectedEvent.category}
                    title={selectedEvent.title}
                    meta={selectedEvent.location}
                    onClose={() => {
                      setMobileDrawerEntityId(null);
                      setSelectedEventId(null);
                      setSelectedMarkerId(null);
                    }}
                    closeLabel="Close event details"
                    actions={
                      <>
                        <button type="button" onClick={() => handleSaveEvent(selectedEvent)} className="dp-cta-primary flex-1 justify-center">
                          RSVP
                        </button>
                        <Link to="/events" className="dp-cta-secondary flex-1 justify-center">
                          Details
                        </Link>
                      </>
                    }
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {selectedMarker && !selectedEvent && mobileDrawerEntityId === selectedMarker.id ? (
                <motion.div
                  key={selectedMarker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <MobileActionPanel
                    eyebrow={selectedMarker?.isLegends || selectedMarker?.metadata?.isLegends ? "Legends property" : "Property"}
                    title={selectedMarker.name}
                    meta={selectedMarker.address}
                    onClose={() => {
                      setMobileDrawerEntityId(null);
                      setSelectedMarkerId(null);
                    }}
                    closeLabel="Close property details"
                    actions={
                      <>
                        <Link to="/explore" className="dp-cta-primary flex-1 justify-center">
                          Explore nearby
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (onDirections) onDirections(selectedMarker);
                          }}
                          className="dp-cta-secondary flex-1 justify-center"
                        >
                          Directions
                        </button>
                      </>
                    }
                  >
                    <div className="text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                      {selectedMarker.description}
                    </div>
                  </MobileActionPanel>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
