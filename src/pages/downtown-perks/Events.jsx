import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronDown, ChevronUp, MapPin, Users, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useEventRsvpStore } from "@/store/event-rsvp-store";

const events = [
  {
    id: "lobby-hour",
    title: "Lobby Hour",
    date: new Date(2026, 4, 27, 18, 30),
    time: "Tonight · 6:30 PM",
    venue: "The Paseo Lobby",
    category: "Happy Hour",
    going: 34,
    image: "/images/buildings/lobby-to-street-arrival.png",
    imageAlt: "Downtown residents moving from a building lobby into the neighborhood",
    imageLabel: "Lobby to street",
    description: "A casual meet-up a couple blocks away. Drop in, meet a few neighbors, grab a drink, and let the night figure itself out.",
  },
  {
    id: "seaholm-happy-hour",
    title: "Seaholm Happy Hour",
    date: new Date(2026, 4, 27, 17, 0),
    time: "Tonight · 5:00 PM",
    venue: "Seaholm District",
    category: "Happy Hour",
    going: 41,
    image: "/images/venues/downtown-dining-patio.png",
    imageAlt: "Downtown Austin patio dining and drinks",
    imageLabel: "After-work drinks",
    description: "A simple after-work stop near Seaholm. Good for a quick drink, an easy dinner plan, or meeting someone before the night gets crowded.",
  },
  {
    id: "rainey-patio-night",
    title: "Rainey Patio Night",
    date: new Date(2026, 4, 28, 19, 0),
    time: "Thu · 7:00 PM",
    venue: "Rainey Street",
    category: "Things to do",
    going: 52,
    image: "/images/partners/hospitality-rooftop-social.png",
    imageAlt: "Downtown hospitality gathering with evening energy",
    imageLabel: "Patio plans",
    description: "An easy night out for residents looking for good music, a couple drinks, and enough nearby spots to keep things interesting without overplanning any of it.",
  },
  {
    id: "run-club",
    title: "Run Club",
    date: new Date(2026, 4, 29, 7, 15),
    time: "Fri · 7:15 AM",
    venue: "Shoal Creek Trailhead",
    category: "Fitness",
    going: 28,
    image: "/images/residents/downtown-rooftop-evening.png",
    imageAlt: "Downtown Austin residents gathering outside with the skyline nearby",
    imageLabel: "Morning movement",
    description: "Start nearby, finish with coffee after. Built for residents who want movement without another app or group thread.",
  },
  {
    id: "coffee-walk",
    title: "Coffee Walk",
    date: new Date(2026, 4, 29, 9, 0),
    time: "Fri · 9:00 AM",
    venue: "2nd Street",
    category: "Things to do",
    going: 22,
    image: "/images/buildings/lobby-to-street-arrival.png",
    imageAlt: "Residents moving from the lobby into downtown Austin",
    imageLabel: "Morning nearby",
    description: "Meet downstairs, walk a few blocks, and grab coffee nearby. Easy, useful, and over before the day gets away from you.",
  },
  {
    id: "rooftop-social",
    title: "Rooftop Social",
    date: new Date(2026, 4, 30, 19, 0),
    time: "Sat · 7:00 PM",
    venue: "Downtown Rooftop",
    category: "Access",
    going: 46,
    image: "/images/partners/hospitality-rooftop-social.png",
    imageAlt: "Rooftop social gathering with downtown hospitality energy",
    imageLabel: "Rooftop access",
    description: "Curated access for downtown residents. See who's going, RSVP, and use your card when you arrive.",
  },
  {
    id: "waterline-preview",
    title: "Waterline Preview Walk",
    date: new Date(2026, 4, 30, 16, 30),
    time: "Sat · 4:30 PM",
    venue: "Waterline District",
    category: "Local",
    going: 31,
    image: "/images/properties/bowie-attached.jpg",
    imageAlt: "Downtown Austin residential building context",
    imageLabel: "Neighborhood preview",
    description: "See what is opening nearby, what is walkable, and which places are worth keeping on your radar if you live downtown.",
  },
  {
    id: "sunday-brunch-card",
    title: "Sunday Brunch Card Perk",
    date: new Date(2026, 4, 31, 11, 30),
    time: "Sun · 11:30 AM",
    venue: "Downtown Dining Partners",
    category: "Perk",
    going: 38,
    image: "/images/venues/downtown-dining-patio.png",
    imageAlt: "Downtown Austin patio brunch scene",
    imageLabel: "Brunch perk",
    description: "Use your card at participating brunch spots and keep the plan simple: pick what is close, show the card, and sit down.",
  },
  {
    id: "morning-yoga",
    title: "Morning Yoga at Waterloo Park",
    date: new Date(2026, 5, 2, 7, 30),
    time: "Tue · 7:30 AM",
    venue: "Waterloo Park",
    category: "Fitness",
    going: 28,
    image: "/images/residents/downtown-rooftop-evening.png",
    imageAlt: "Downtown residents gathering before a morning wellness event",
    imageLabel: "Park morning",
    description: "Start your morning with a free community yoga session in Waterloo Park. All levels welcome. Bring a mat, water, and a neighbor.",
  },
  {
    id: "red-river-live-list",
    title: "Red River Live List",
    date: new Date(2026, 5, 2, 20, 0),
    time: "Tue · 8:00 PM",
    venue: "Red River",
    category: "Live Music",
    going: 57,
    image: "/images/partners/hospitality-rooftop-social.png",
    imageAlt: "Downtown Austin social evening gathering",
    imageLabel: "Live tonight",
    description: "A quick look at what is actually worth catching tonight, grouped around places close enough to make the decision easy.",
  },
  {
    id: "brand-sampling",
    title: "Monday Meetups at Stay Put",
    date: new Date(2026, 5, 4, 18, 0),
    time: "Thu · 6:00 PM",
    venue: "Stay Put",
    category: "Social",
    going: 64,
    image: "/images/partners/hospitality-rooftop-social.png",
    imageAlt: "Downtown Austin residents gathering for a local event",
    imageLabel: "Low-key local",
    description: "Start the week with something low-key, local, and easy to say yes to.",
  },
];

const happeningNowItems = [
  ["Happy Hours", "Find what’s close, active, and worth showing up for."],
  ["Local Programming", "See what’s happening tonight without switching apps."],
  ["Resident Plans", "Save, RSVP, and keep the night simple."],
];

const categoryTone = {
  "Happy Hour": "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  "Things to do": "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Fitness: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Access: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Local: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Social: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Perk: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  "Live Music": "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
};

const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function formatMonthDay(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(date);
}

function sortedEvents(list) {
  return [...list].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function EventBottomDrawer({ event, open, onClose, rsvped, onToggleRsvp }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="pointer-events-none fixed inset-0 z-[700] flex items-end justify-center bg-[#0B1F33]/10 px-3 pb-3 backdrop-blur-[2px]">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close event details" onClick={onClose} />
          <motion.section
            key={event.id}
            initial={{ opacity: 0, y: 42, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 34, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-t-2xl border border-[#0B1F33]/8 bg-white shadow-[0_24px_80px_rgba(11,31,51,0.18)] md:rounded-[8px]"
            role="dialog"
            aria-modal="true"
            aria-label={`${event.title} details`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#0B1F33]/8 bg-white/96 px-4 py-3 backdrop-blur-xl">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/50">Event details</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center bg-transparent text-[#0B1F33]/62 transition hover:text-[#B38F4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                aria-label="Close event details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(82vh-56px)] overflow-y-auto p-4">
              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[220px] overflow-hidden rounded-[6px] border border-[#0B1F33]/8 bg-white">
                  <img src={event.image} alt={event.imageAlt} className="h-full min-h-[220px] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/46 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-[2px] border border-white/18 bg-[#0B1F33]/42 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    {event.imageLabel}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-[2px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", categoryTone[event.category] || "border-[#0B1F33]/8 bg-white text-[#0B1F33]")}>
                      {event.category}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">
                      {formatMonthDay(event.date)} · {event.time.split("·").pop().trim()}
                    </span>
                  </div>
                  <h2 className="mt-3 font-heading text-3xl font-medium leading-[1.03] text-[#0B1F33]">
                    {event.title}
                  </h2>
                  <div className="mt-4 grid gap-2 text-[13px] text-[#0B1F33]/64">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#B38F4F]" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0 text-[#0B1F33]/42" />
                      <span>{event.going} going</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[14px] leading-7 text-[#0B1F33]/68">{event.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleRsvp(event)}
                      className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-normal text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                      aria-pressed={rsvped}
                    >
                      {rsvped ? "Saved" : "RSVP / Save Event"}
                      <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
                    </button>
                    <Link
                      to={`/map?mode=resident&tab=map&filter=Events&q=${encodeURIComponent(event.title)}`}
                      className="inline-flex h-10 items-center justify-center bg-white px-4 text-[11px] font-semibold uppercase tracking-normal text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.08),0_10px_24px_rgba(11,31,51,0.06)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                    >
                      View on map
                    </Link>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-[#0B1F33]/54">
                    Events can show on the map, appear in building feeds, and connect to nearby perks when active.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}

function DayAgenda({ date, eventsForDay, onSelectEvent, selectedEvent }) {
  const [expanded, setExpanded] = useState(false);
  const visibleEvents = expanded ? eventsForDay : eventsForDay.slice(0, 2);
  const hiddenCount = Math.max(0, eventsForDay.length - visibleEvents.length);

  return (
    <div className="mt-4 rounded-[2px] border border-[#0B1F33]/8 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">Selected day</div>
          <div className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{formatWeekday(date)}</div>
        </div>
        <span className="rounded-[2px] border border-[#0B1F33]/8 bg-white px-2.5 py-1 text-[11px] font-medium text-[#0B1F33]/62">
          {eventsForDay.length || "No"} {eventsForDay.length === 1 ? "plan" : "plans"}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {eventsForDay.length ? (
          visibleEvents.map((event) => {
            const active = event.id === selectedEvent.id;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className={cn(
                  "grid w-full grid-cols-[72px_1fr] gap-3 rounded-[2px] border p-2.5 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]",
                  active ? "border-[#0B1F33]/18 bg-white shadow-[0_10px_24px_rgba(11,31,51,0.08)]" : "border-[#0B1F33]/8 bg-white/72"
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52">
                  {event.time.split("·").pop().trim()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[#0B1F33]">{event.title}</span>
                  <span className="mt-1 block truncate text-[11px] text-[#0B1F33]/56">{event.category} · {event.venue}</span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-3 text-[12px] leading-5 text-[#0B1F33]/62">
            No scheduled Downtown Perks plans on this date yet. Use the full list to pick another day or open the map for nearby places.
          </div>
        )}
        {eventsForDay.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[2px] border border-[#0B1F33]/8 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#0B1F33]/10 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Roll up plans
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show {hiddenCount} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function EventImagePanel({ event }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.figure
        key={event.id}
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: -6 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="group relative min-h-[240px] overflow-hidden rounded-[2px] border border-[#0B1F33]/8 bg-white shadow-[0_18px_44px_rgba(11,31,51,0.08)] md:min-h-[280px]"
      >
        <img
          src={event.image}
          alt={event.imageAlt}
          className="h-full min-h-[260px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/56 via-[#0B1F33]/14 to-transparent" />
        <figcaption className="absolute bottom-3 left-3 max-w-[min(78%,360px)] rounded-[2px] border border-white/18 bg-[#0B1F33]/38 p-2.5 text-white shadow-[0_10px_26px_rgba(11,31,51,0.16)] backdrop-blur-[8px]">
          <div className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-white/72">
            {event.imageLabel}
          </div>
          <div className="mt-1 truncate font-heading text-xl font-medium leading-none tracking-normal">
            {event.title}
          </div>
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/78">
            <MapPin className="h-3 w-3 shrink-0 text-[#B38F4F]" />
            <span className="truncate">{event.venue}</span>
          </div>
        </figcaption>
      </motion.figure>
    </AnimatePresence>
  );
}

const eventMapPositions = [
  ["18%", "28%"],
  ["28%", "56%"],
  ["42%", "34%"],
  ["52%", "72%"],
  ["62%", "42%"],
  ["74%", "26%"],
  ["80%", "62%"],
  ["20%", "74%"],
  ["38%", "78%"],
  ["58%", "22%"],
  ["72%", "78%"],
];

function EventMapPanel({ events: mapEvents, selectedEvent, onSelectEvent }) {
  return (
    <div
      className="dp-events-map-panel relative overflow-hidden bg-white shadow-[inset_0_0_0_1px_rgba(11,31,51,0.08),0_18px_48px_rgba(11,31,51,0.055)]"
      style={{ minHeight: 380 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,51,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(11,31,51,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-[10%] top-[14%] h-40 w-40 bg-[#B38F4F]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-48 w-48 bg-[#0B1F33]/6 blur-3xl" />
      <div className="pointer-events-none absolute left-[12%] right-[12%] top-[48%] h-px rotate-[-8deg] bg-[#0B1F33]/10" />
      <div className="pointer-events-none absolute bottom-[24%] left-[18%] right-[8%] h-px rotate-[7deg] bg-[#0B1F33]/10" />
      <div className="pointer-events-none absolute left-[32%] top-[10%] h-[72%] w-px rotate-[8deg] bg-[#0B1F33]/10" />

      <div className="absolute left-4 top-4 z-10 max-w-[15rem] bg-white/82 px-3 py-2 shadow-[0_12px_30px_rgba(11,31,51,0.055)] backdrop-blur-md">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#B38F4F]">Event map</div>
        <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/62">Tap a marker to open the full event details.</p>
      </div>

      {mapEvents.map((event, index) => {
        const [left, top] = eventMapPositions[index % eventMapPositions.length];
        const active = event.id === selectedEvent.id;
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent(event)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
            style={{ left, top }}
            aria-label={`Open ${event.title} details`}
          >
            <span
              className={cn(
                "relative flex h-10 w-10 items-center justify-center bg-white text-[#0B1F33] shadow-[0_12px_26px_rgba(11,31,51,0.12),0_0_18px_rgba(179,143,79,0.08)] transition hover:-translate-y-px",
                active && "bg-[#0B1F33] text-white shadow-[0_14px_30px_rgba(11,31,51,0.16),0_0_26px_rgba(179,143,79,0.22)]"
              )}
            >
              {active && <span className="absolute -inset-2 bg-[#B38F4F]/18 blur-md" aria-hidden="true" />}
              <MapPin className={cn("relative h-4 w-4", active ? "text-[#B38F4F]" : "text-[#0B1F33]/70")} />
            </span>
            <span
              className={cn(
                "mt-2 hidden min-w-[150px] max-w-[180px] bg-white/88 px-2.5 py-2 shadow-[0_10px_26px_rgba(11,31,51,0.065)] backdrop-blur-md sm:block",
                active && "shadow-[inset_0_2px_0_#B38F4F,0_12px_28px_rgba(11,31,51,0.08)]"
              )}
            >
              <span className="block truncate text-[10px] font-semibold uppercase tracking-normal text-[#B38F4F]">{event.time}</span>
              <span className="mt-1 block truncate text-[13px] font-semibold text-[#0B1F33]">{event.title}</span>
              <span className="mt-0.5 block truncate text-[11px] text-[#0B1F33]/56">{event.venue}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function Events() {
  const [selected, setSelected] = useState(events[0].date);
  const [visibleMonth, setVisibleMonth] = useState(events[0].date);
  const [selectedEventId, setSelectedEventId] = useState(events[0].id);
  const [detailOpen, setDetailOpen] = useState(false);
  const [eventResultsCollapsed, setEventResultsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const rsvps = useEventRsvpStore((state) => state.rsvps);
  const addRsvp = useEventRsvpStore((state) => state.addRsvp);
  const removeRsvp = useEventRsvpStore((state) => state.removeRsvp);

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.id === selectedEventId) || events.find((event) => sameDay(event.date, selected)) || events[0];
  }, [selected, selectedEventId]);

  const selectedDayEvents = useMemo(() => sortedEvents(events.filter((event) => sameDay(event.date, selected))), [selected]);

  const eventDates = useMemo(() => events.map((event) => event.date), []);
  const orderedEvents = useMemo(
    () => sortedEvents(activeCategory === "All" ? events : events.filter((event) => event.category === activeCategory)),
    [activeCategory]
  );
  const visibleOrderedEvents = orderedEvents;
  const allCategoryCounts = useMemo(
    () =>
      events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {}),
    []
  );

  function chooseDay(day) {
    if (!day) return;
    setSelected(day);
    setVisibleMonth(day);
    const firstEvent = sortedEvents(events.filter((event) => sameDay(event.date, day)))[0];
    if (firstEvent) {
      setSelectedEventId(firstEvent.id);
      setDetailOpen(true);
    }
  }

  function chooseEvent(event) {
    setSelected(event.date);
    setVisibleMonth(event.date);
    setSelectedEventId(event.id);
    setDetailOpen(true);
  }

  function chooseCategory(category) {
    setActiveCategory(category);
    setEventResultsCollapsed(false);

    const firstEvent = sortedEvents(category === "All" ? events : events.filter((event) => event.category === category))[0];
    if (firstEvent) {
      setSelected(firstEvent.date);
      setVisibleMonth(firstEvent.date);
      setSelectedEventId(firstEvent.id);
    }
  }

  function toggleRsvp(event) {
    if (rsvps.some((item) => item.id === event.id)) {
      removeRsvp(event.id);
      return;
    }
    addRsvp(event, "events-page");
  }

  return (
    <div className="min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <span className="dp-label mb-4 block">Downtown Events</span>
              <h1 className="font-heading text-[52px] font-bold leading-[0.92] tracking-[-0.04em] md:text-[92px]">
                Search less.
                <br />
                <span className="text-[#B38F4F]">Do more.</span>
              </h1>
              <div className="mt-6 max-w-3xl space-y-3 text-[16px] leading-[1.72] text-[#0B1F33]/68 md:text-[18px]">
                <p>Downtown Perks helps you see what’s happening, what’s worth showing up for, and what you can RSVP to without bouncing between five apps and a group chat.</p>
                <p>
                  A rooftop before it gets packed. A live show you almost missed. A resident meetup a couple blocks away.
                </p>
                <p>
                  Open the map, see what’s going on, and make the plan before everyone says, “I don’t care, you pick.”
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                <Link to="/map?mode=resident&tab=map&filter=Events" className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-normal text-white shadow-[0_12px_28px_rgba(11,31,51,0.12),0_0_18px_rgba(179,143,79,0.08)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
                  Open the Map
                  <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
                </Link>
                <Link to="/card" className="inline-flex h-10 items-center justify-center bg-white px-4 text-[11px] font-semibold uppercase tracking-normal text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.08),0_10px_24px_rgba(11,31,51,0.06)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
                  Get Your Perks Card
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="mb-3 block text-[13px] font-semibold text-[#B38F4F]">Events Happening Now</span>
              <h2 className="font-heading text-[34px] font-bold leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[52px]">
                Worth leaving <span className="text-[#B38F4F]">the apartment for.</span>
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-[#0B1F33]/66 md:text-[16px]">
                See what’s on, find what’s worth showing up for, and RSVP without leaving the map. A quick look at resident hours, local events, live music, happy hours, wellness, and neighborhood plans.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {happeningNowItems.map(([title, body]) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pl-4"
                >
                  <span className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-px bg-[#B38F4F]/55 shadow-[0_0_18px_rgba(179,143,79,0.24)]" aria-hidden="true" />
                  <h3 className="text-[15px] font-semibold text-[#0B1F33]">{title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/62">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2px] border border-[#0B1F33]/8 bg-white shadow-[0_14px_34px_rgba(6,27,51,0.04)]">
              <div className="border-b border-[#0B1F33]/8 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">Downtown Calendar</div>
                    <div className="mt-2 font-heading text-[28px] font-bold leading-[1] tracking-[-0.025em] text-[#0B1F33]">June events</div>
                    <div className="mt-2 text-[14px] leading-6 text-[#0B1F33]/62">Browse what’s coming up and open any event to save or RSVP.</div>
                  </div>
                </div>
	                <div className="dp-event-chip-scroll mt-3 flex gap-5 overflow-x-auto pb-1">
	                  {["All", ...Object.keys(allCategoryCounts)].map((category) => {
	                    const active = activeCategory === category;
	                    return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => chooseCategory(category)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 bg-transparent px-0 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/58 shadow-[inset_0_-1px_0_rgba(11,31,51,0.10)] transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]",
                        active
                          ? "text-[#0B1F33] shadow-[inset_0_-2px_0_#B38F4F]"
                          : ""
                      )}
                    >
                      {category}
                    </button>
                  )})}
                </div>
              </div>
              <div className="p-4">
                <EventImagePanel event={selectedEvent} />
                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(300px,0.75fr)_minmax(280px,0.85fr)_minmax(360px,1.1fr)] xl:items-start">
                  <div className="min-w-0">
                    <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-2">
                      <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={chooseDay}
                        month={visibleMonth}
                        onMonthChange={setVisibleMonth}
                        modifiers={{ hasEvent: eventDates }}
                        modifiersClassNames={{
                          hasEvent: "after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-[2px] after:bg-[#B38F4F]",
                        }}
                        className="w-full p-0"
                        classNames={{
                          months: "w-full",
                          month: "w-full space-y-3",
                          table: "w-full border-collapse",
                          head_row: "grid grid-cols-7",
                          head_cell: "flex h-8 items-center justify-center rounded-[2px] text-[11px] font-medium text-[#0B1F33]/46",
                          row: "mt-1 grid w-full grid-cols-7 gap-1",
                          cell: "relative p-0 text-center text-[13px]",
                          day: "relative flex h-9 w-full items-center justify-center rounded-[2px] p-0 text-[13px] font-normal transition hover:bg-white hover:text-[#0B1F33] hover:shadow-[0_8px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B38F4F]",
                          day_selected: "bg-[#0B1F33] text-white hover:bg-[#0B1F33] hover:text-white focus:bg-[#0B1F33] focus:text-white",
                          day_today: "bg-[#0B1F33]/15 text-[#0B1F33]",
                          day_outside: "day-outside text-[#0B1F33]/30 aria-selected:bg-[#0B1F33]/10 aria-selected:text-[#0B1F33]/50",
                        }}
                      />
                    </div>
                  </div>
                  <DayAgenda date={selected} eventsForDay={selectedDayEvents} onSelectEvent={chooseEvent} selectedEvent={selectedEvent} />

                  <div className="rounded-[2px] border border-[#0B1F33]/8 bg-white p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-white">
                          <CalendarDays className="h-4 w-4 text-[#B38F4F]" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">Event map</div>
                          <div className="font-heading text-xl font-medium text-[#0B1F33]">Find something worth showing up for.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEventResultsCollapsed((current) => !current)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border border-[#0B1F33]/8 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#0B1F33]/10 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                        aria-expanded={!eventResultsCollapsed}
                      >
                        {eventResultsCollapsed ? (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            Show
                          </>
                        ) : (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            Roll up
                          </>
                        )}
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {!eventResultsCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <EventMapPanel events={visibleOrderedEvents} selectedEvent={selectedEvent} onSelectEvent={chooseEvent} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 grid gap-3 rounded-[2px] border border-[#0B1F33]/8 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <p className="text-[13px] leading-[1.65] text-[#0B1F33]/64">
                        See what else is happening nearby.
                      </p>
                      <Link to="/map?mode=resident&tab=map" className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#0B1F33]">
                        View on map
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div className="mt-8 border-t border-[#0B1F33]/10 pt-8">
          <h2 className="font-heading text-[34px] font-bold leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[52px]">
            Find the plan before <span className="text-[#B38F4F]">the group chat gives up.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[#0B1F33]/66 md:text-[16px]">
            Open the map, save an event, RSVP when it makes sense, and keep downtown easy to use.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/map?mode=resident&tab=map&filter=Events" className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-normal text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Open the Map
              <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
            </Link>
            <Link to="/card" className="inline-flex h-10 items-center justify-center bg-white px-4 text-[11px] font-semibold uppercase tracking-normal text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.08),0_10px_24px_rgba(11,31,51,0.06)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
              Get Your Perks Card
            </Link>
          </div>
        </div>
        </div>
      </section>
      <EventBottomDrawer
        event={selectedEvent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        rsvped={rsvps.some((item) => item.id === selectedEvent.id)}
        onToggleRsvp={toggleRsvp}
      />
    </div>
  );
}
