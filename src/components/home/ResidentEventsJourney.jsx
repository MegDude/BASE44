import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { useResidentMutations } from "@/hooks/useResidentMutations";
import MobileActionPanel from "@/components/shared/MobileActionPanel";

const DEFAULT_CENTER = [30.267, -97.743];
const QUICK_PROMPTS = [
  "Events tonight",
  "Live music tonight",
  "Something social nearby",
  "Member events this week",
];

function toEventModel(item) {
  const dateValue = item?.metadata?.date;
  const parsedDate = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const hasDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  return {
    ...item,
    name: item.name || item.title || "Downtown event",
    category: item.category || "event",
    venueName: item?.metadata?.venue_name || item.address || "Downtown Austin",
    dateLabel: hasDate
      ? parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : item?.metadata?.time || "Tonight",
    timeLabel: item?.metadata?.time || "Tonight",
    attendingCount: item?.metadata?.rsvp_count || item.rsvp_count || 0,
    summary: item.description || item.address || "Live event on the downtown map.",
  };
}

function SkeletonCard() {
  return (
    <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
      <div className="h-3 w-20 rounded-full bg-[rgba(11,31,51,0.08)]" />
      <div className="mt-4 h-5 w-3/4 rounded-full bg-[rgba(11,31,51,0.08)]" />
      <div className="mt-3 h-3 w-full rounded-full bg-[rgba(11,31,51,0.06)]" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-[rgba(11,31,51,0.06)]" />
      <div className="mt-5 h-10 w-full rounded-[14px] bg-[rgba(11,31,51,0.08)]" />
    </div>
  );
}

export default function ResidentEventsJourney() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const mutations = useResidentMutations();

  const [eventsData, setEventsData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [askQuery, setAskQuery] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [confirmedEventId, setConfirmedEventId] = useState(null);

  const selectedEvent = useMemo(
    () => eventsData.find((item) => item.id === selectedEventId) || null,
    [eventsData, selectedEventId]
  );

  async function loadEvents(query = "") {
    const requestQuery = String(query || "").trim();
    const loadingSetter = requestQuery ? setAskLoading : setLoading;

    loadingSetter(true);
    if (!requestQuery) {
      setError("");
    }

    try {
      const response = requestQuery
        ? await mapRepository.searchWithIntent({ query: requestQuery })
        : { items: await mapRepository.getMapFeed({ filters: { types: ["event"] }, limit: 40 }) };

      const items = (response?.items || [])
        .filter((item) => item?.type === "event")
        .filter(
          (item) =>
            Number.isFinite(item?.location?.latitude) &&
            Number.isFinite(item?.location?.longitude)
        )
        .map(toEventModel);

      setEventsData(items);
      setError("");

      const nextSelected =
        items.find((item) => item.id === selectedEventId) ||
        items[0] ||
        null;

      setSelectedEventId(nextSelected?.id || null);

      if (nextSelected?.location) {
        setMapCenter([nextSelected.location.latitude, nextSelected.location.longitude]);
        setMapZoom(15);
      }
    } catch (nextError) {
      console.error("ResidentEventsJourney load failed:", nextError);
      setEventsData([]);
      setSelectedEventId(null);
      setError("We could not load events right now. Try again.");
    } finally {
      loadingSetter(false);
    }
  }

  useEffect(() => {
    loadEvents();
     
  }, []);

  function handleSelect(eventItem) {
    setSelectedEventId(eventItem.id);
    if (eventItem?.location) {
      setMapCenter([eventItem.location.latitude, eventItem.location.longitude]);
      setMapZoom(15);
    }
    mutations.logInteraction(eventItem, "event_select", askQuery, {
      surface: "resident_events_journey",
    });
  }

  async function handleRsvp(eventItem) {
    const result = await mutations.upsertRsvp(eventItem);
    if (result?.success !== false) {
      setConfirmedEventId(eventItem.id);
    }
  }

  function handleAskSubmit(event) {
    event.preventDefault();
    loadEvents(askQuery || "events tonight");
  }

  function handleAskPrompt(prompt) {
    setAskQuery(prompt);
    loadEvents(prompt);
  }

  return (
    <section className="relative overflow-hidden bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell relative overflow-hidden rounded-[32px] border border-[rgba(11,31,51,0.08)] bg-white">
        <div className="relative z-10 grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="border-b border-[rgba(11,31,51,0.08)] bg-white p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
              Events
            </div>
            <h2 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--dp-navy)]">
              What is worth stepping into tonight
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[rgba(11,31,51,0.66)]">
              Downtown plans, live on the map, with the details you need before you head out.
            </p>

            <form onSubmit={handleAskSubmit} className="mt-5">
              <div className="flex gap-2 rounded-[20px] border border-[rgba(11,31,51,0.1)] bg-[rgba(246,248,250,0.96)] p-2">
                <div className="flex min-h-11 flex-1 items-center gap-2 rounded-[14px] bg-white px-3">
                  <Search className="h-4 w-4 text-[rgba(11,31,51,0.42)]" />
                  <input
                    value={askQuery}
                    onChange={(event) => setAskQuery(event.target.value)}
                    placeholder="What is happening tonight?"
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.42)]"
                    aria-label="Ask the map about events"
                  />
                </div>
                <button
                  type="submit"
                  className="dp-cta-primary min-w-[120px]"
                  aria-label="Ask the map"
                  disabled={askLoading}
                >
                  {askLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask the map"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleAskPrompt(prompt)}
                    className="rounded-full border border-[rgba(11,31,51,0.1)] bg-white px-3 py-2 text-[12px] font-semibold text-[rgba(11,31,51,0.72)]"
                    aria-label={`Ask the map: ${prompt}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-5 space-y-3 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
              ) : error ? (
                <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-4">
                  <div className="text-[14px] font-medium text-[var(--dp-navy)]">{error}</div>
                  <button type="button" onClick={() => loadEvents(askQuery)} className="mt-3 dp-cta-secondary">
                    Retry
                  </button>
                </div>
              ) : eventsData.length === 0 ? (
                <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/70 p-4 text-[14px] leading-6 text-[rgba(11,31,51,0.66)]">
                  Nothing scheduled right now. Try asking the map.
                </div>
              ) : (
                eventsData.map((item, index) => {
                  const active = item.id === selectedEventId;
                  const rsvpLoading = mutations.pendingAction === "rsvp" && selectedEventId === item.id;
                  const confirmed = confirmedEventId === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.22, delay: reduceMotion ? 0 : index * 0.04 }}
                      whileHover={reduceMotion ? {} : { y: -2 }}
                      onClick={() => handleSelect(item)}
                      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
                        active
                          ? "border-[rgba(194,143,84,0.48)] bg-[rgba(255,250,245,0.96)] shadow-[0_14px_32px_rgba(11,31,51,0.08)]"
                          : "border-[rgba(11,31,51,0.08)] bg-white hover:bg-[rgba(248,250,252,0.98)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                            {item.dateLabel} · {item.timeLabel}
                          </div>
                          <div className="mt-2 text-[15px] font-semibold leading-5 text-[var(--dp-navy)]">
                            {item.name}
                          </div>
                        </div>
                        <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                          {item.category}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.64)]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
                        <span className="truncate">{item.venueName}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.56)]">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {item.attendingCount} going
                      </div>

                      <div className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                        {item.summary}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-[12px] text-[rgba(11,31,51,0.54)]">
                          {item.metadata?.walkMinutes ? `${item.metadata.walkMinutes} min walk` : "Downtown"}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRsvp(item);
                          }}
                          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] ${
                            confirmed
                              ? "bg-[rgba(47,111,85,0.12)] text-[#2F6F55]"
                              : "bg-[var(--dp-navy)] text-white"
                          }`}
                          aria-label={`RSVP for ${item.name}`}
                        >
                          {rsvpLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          {confirmed ? "Confirmed" : "RSVP"}
                        </button>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[760px]">
            <UnifiedMapShell
              items={eventsData}
              selectedId={selectedEvent?.id}
              markerIcon={(item, isSelected) => createMarker(item, { isSelected })}
              onMarkerSelect={handleSelect}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              onMapCenterChange={setMapCenter}
              onMapZoomChange={setMapZoom}
              className="h-[420px] w-full lg:h-[760px]"
            />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(11,31,51,0.05))]" />

            <div className="absolute left-4 top-4 z-[400] rounded-full border border-[rgba(11,31,51,0.12)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)]">
              Live downtown events
            </div>

            {selectedEvent ? (
              <motion.div
                key={selectedEvent.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="pointer-events-none absolute inset-x-4 bottom-4 z-[400] hidden lg:block"
              >
                <div className="pointer-events-auto ml-auto w-[min(380px,100%)] rounded-[24px] border border-[rgba(11,31,51,0.12)] bg-white p-5 shadow-[0_18px_42px_rgba(11,31,51,0.1)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                    On the map now
                  </div>
                  <h3 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy)]">
                    {selectedEvent.name}
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
                    {selectedEvent.summary}
                  </p>

                  <div className="mt-4 space-y-2 rounded-[18px] bg-[rgba(11,31,51,0.04)] p-4">
                    <div className="flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.66)]">
                      <CalendarDays className="h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                      {selectedEvent.dateLabel} · {selectedEvent.timeLabel}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.66)]">
                      <MapPin className="h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                      {selectedEvent.venueName}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.66)]">
                      <Users className="h-4 w-4 shrink-0 text-[var(--dp-gold-muted)]" />
                      {selectedEvent.attendingCount} going
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleRsvp(selectedEvent)}
                      className="dp-cta-primary"
                      aria-label={`RSVP for ${selectedEvent.name}`}
                    >
                      {mutations.pendingAction === "rsvp" ? <Loader2 className="h-4 w-4 animate-spin" /> : "RSVP"}
                    </button>
                    <Link to="/downtown-perks/explore?type=events" className="dp-cta-secondary">
                      See more nearby
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {selectedEvent ? (
            <motion.div
              key={selectedEvent.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <MobileActionPanel
                eyebrow={selectedEvent.category}
                title={selectedEvent.name}
                meta={`${selectedEvent.venueName} · ${selectedEvent.timeLabel}`}
                onClose={() => setSelectedEventId(null)}
                closeLabel="Close selected event"
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => handleRsvp(selectedEvent)}
                      className="dp-cta-primary flex-1 justify-center"
                      aria-label={`RSVP for ${selectedEvent.name}`}
                    >
                      {mutations.pendingAction === "rsvp" ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmedEventId === selectedEvent.id ? "Confirmed" : "RSVP"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/downtown-perks/explore?type=events")}
                      className="dp-cta-secondary flex-1 justify-center"
                      aria-label="Open the live map"
                    >
                      See more nearby
                    </button>
                  </>
                }
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
