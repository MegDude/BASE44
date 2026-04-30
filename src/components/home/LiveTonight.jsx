import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { openHomeMapIntent } from "@/lib/homeMapIntent";
import { Calendar } from "@/components/ui/calendar";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import { ROUTES } from "@/lib/routes";

function toEventCard(item) {
  const dateValue = item?.metadata?.date;
  const parsedDate = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const hasDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  return {
    ...item,
    name: item.name || item.title || "Downtown event",
    category: item.category || "event",
    venueName: item?.metadata?.venue_name || item.address || "Downtown Austin",
    date: hasDate ? parsedDate : null,
    dateLabel: hasDate
      ? parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Tonight",
    fullDateLabel: hasDate
      ? parsedDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "Tonight",
    timeLabel: item?.metadata?.time || "Tonight",
    rsvpCount: Number(item?.metadata?.rsvp_count || 0),
  };
}

function isSameDay(left, right) {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getEventImage(item) {
  const category = String(item?.category || "").toLowerCase();
  if (category === "nightlife" || category === "social") return "/media/austin-skyline-dusk.jpeg";
  return "/media/austin-hero-correct.png";
}

export default function LiveTonight() {
  const { openFlow } = useCTAFlow();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const feed = await mapRepository.getMapFeed({ filters: { types: ["event"] }, limit: 12 });
        const events = (feed || [])
          .filter((item) => item?.type === "event")
          .slice(0, 12)
          .map(toEventCard)
          .sort((a, b) => {
            const aTime = a.date?.getTime?.() || 0;
            const bTime = b.date?.getTime?.() || 0;
            return aTime - bTime;
          });

        if (!mounted) return;
        setItems(events);
        setSelectedDate(events[0]?.date || null);
        setActiveEventId(events[0]?.id || null);
      } catch (error) {
        console.error("LiveTonight load failed:", error);
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return items.slice(0, 6);
    const sameDay = items.filter((item) => isSameDay(item.date, selectedDate));
    return sameDay.length ? sameDay : items.slice(0, 6);
  }, [items, selectedDate]);

  const activeEvent =
    selectedEvents.find((item) => item.id === activeEventId) || selectedEvents[0] || null;

  useEffect(() => {
    if (!selectedEvents.length) return;
    if (selectedEvents.some((item) => item.id === activeEventId)) return;
    setActiveEventId(selectedEvents[0].id);
  }, [activeEventId, selectedEvents]);

  return (
    <section id="live-tonight" className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="mb-6 grid grid-cols-1 gap-4 border-t border-[rgba(11,31,51,0.08)] pt-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="dp-micro-label"
            >
              Live tonight
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.48, ease: "easeOut", delay: 0.04 }}
              className="dp-display-section mt-3 text-[2rem] text-[var(--dp-navy)] md:text-[2.6rem]"
            >
              See what is worth stepping out for.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.42, ease: "easeOut", delay: 0.1 }}
              className="mt-3 max-w-2xl font-ui text-[14px] leading-6 text-[rgba(11,31,51,0.66)]"
            >
              Pick a day, see what is happening nearby, and open the live events map when you want the full downtown view.
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={ROUTES.happyHourWalkingMap} className="dp-cta-secondary">
              Happy hour walking map
            </Link>
            <button
              type="button"
              onClick={() => openHomeMapIntent({ query: "Events tonight", context: "now" })}
              className="dp-cta-secondary"
            >
              See all events
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                openFlow({
                  type: "venue_onboarding",
                  source: "live_tonight_add_event",
                  sourceComponent: "LiveTonight",
                  partnerType: "venues",
                  successRoute: "/events",
                  initialValues: {
                    intent: "Events",
                  },
                  pageContext: {
                    intent: "Events",
                  },
                })
              }
              className="dp-cta-primary"
            >
              Add Event
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-1">
            <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="h-[320px] rounded-[22px] bg-[rgba(11,31,51,0.06)]" />
                <div className="h-[220px] rounded-[22px] bg-[rgba(11,31,51,0.06)]" />
              </div>
              <div className="h-[540px] rounded-[22px] bg-[rgba(11,31,51,0.06)]" />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[24px] bg-[rgba(255,255,255,0.82)] backdrop-blur-md">
              <div className="border-b border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,249,252,0.92))] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                  Calendar
                </div>
                <div className="mt-2 text-[14px] leading-6 text-[rgba(11,31,51,0.62)]">
                  Pick a day, then open the event that feels most relevant.
                </div>
              </div>

              <div className="p-4">
                <div className="rounded-[22px] bg-white/92 p-2 shadow-[0_12px_28px_rgba(11,31,51,0.05)]">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(value) => value && setSelectedDate(value)}
                    className="w-full"
                  />
                </div>

                {activeEvent ? (
                  <motion.article
                    key={`detail-${activeEvent.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-[0_16px_36px_rgba(11,31,51,0.08)]"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveEventId(activeEvent.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3 px-4 pt-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                          {activeEvent.dateLabel} · {activeEvent.timeLabel}
                        </div>
                        <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                          {activeEvent.category}
                        </span>
                      </div>

                      <div className="px-4 pb-4">
                        <h3 className="mt-3 font-heading text-[1.15rem] font-medium leading-[1.08] tracking-[-0.04em] text-[var(--dp-navy)]">
                          {activeEvent.name}
                        </h3>

                        <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.64)]">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
                          <span>{activeEvent.venueName}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.56)]">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {activeEvent.rsvpCount > 0 ? `${activeEvent.rsvpCount} going` : "Downtown Austin"}
                          </span>
                        </div>

                        <p className="mt-3 text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                          {activeEvent.description || activeEvent.address || "Open the map to see the full event detail."}
                        </p>
                      </div>
                    </button>

                    {selectedEvents.length > 1 ? (
                      <div className="border-t border-[rgba(11,31,51,0.06)] px-4 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                          More on this day
                        </div>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                          {selectedEvents
                            .filter((item) => item.id !== activeEvent.id)
                            .map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveEventId(item.id)}
                                className="shrink-0 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)] transition-colors hover:bg-[rgba(11,31,51,0.06)]"
                              >
                                {item.timeLabel} · {item.category}
                              </button>
                            ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="border-t border-[rgba(11,31,51,0.06)] px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openHomeMapIntent({ query: activeEvent.name, context: "now" })}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--dp-navy)]"
                      >
                        Open events
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.article>
                ) : null}
              </div>
            </div>

            {activeEvent ? (
              <motion.article
                key={`feature-${activeEvent.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_18px_44px_rgba(11,31,51,0.10)]"
              >
                <button
                  type="button"
                  onClick={() => setActiveEventId(activeEvent.id)}
                  className="w-full text-left"
                >
                  <img
                    src={getEventImage(activeEvent)}
                    alt={activeEvent.name}
                    className="h-[260px] w-full object-cover md:h-[320px]"
                  />

                  <div className="flex items-start justify-between gap-3 px-4 pt-4 md:px-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      {activeEvent.dateLabel} · {activeEvent.timeLabel}
                    </div>
                    <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.56)]">
                      {activeEvent.category}
                    </span>
                  </div>

                  <div className="px-4 pb-5 md:px-5">
                    <h3 className="mt-3 font-heading text-[1.3rem] font-medium leading-[1.04] tracking-[-0.04em] text-[var(--dp-navy)] md:text-[1.55rem]">
                      {activeEvent.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.64)]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
                      <span>{activeEvent.venueName}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[13px] text-[rgba(11,31,51,0.56)]">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {activeEvent.rsvpCount > 0 ? `${activeEvent.rsvpCount} going` : "Downtown Austin"}
                      </span>
                    </div>

                    <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                      {activeEvent.description || activeEvent.address || "Open the map to see the full event detail."}
                    </p>
                  </div>
                </button>

                <div className="border-t border-[rgba(11,31,51,0.06)] px-4 py-3 md:px-5">
                  <button
                    type="button"
                    onClick={() => openHomeMapIntent({ query: activeEvent.name, context: "now" })}
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--dp-navy)]"
                  >
                    Open events
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.article>
            ) : (
              <div className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white/84 p-5 shadow-[0_18px_44px_rgba(11,31,51,0.06)]">
                <div className="text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  No event is selected yet.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
