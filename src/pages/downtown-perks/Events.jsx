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
    category: "Activation",
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
    title: "Rivian Downtown Demo",
    date: new Date(2026, 5, 4, 18, 0),
    time: "Thu · 6:00 PM",
    venue: "Seaholm",
    category: "Activation",
    going: 64,
    image: "/images/partners/hospitality-rooftop-social.png",
    imageAlt: "Downtown Austin brand activation and resident gathering",
    imageLabel: "Brand activation",
    description: "A resident-friendly brand moment near Seaholm. Stop by, scan in, answer a short prompt, and see what is happening nearby after.",
  },
];

const categoryTone = {
  "Happy Hour": "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  "Things to do": "border-[#0B1F33]/10 bg-[#F7F8FB] text-[#0B1F33]",
  Fitness: "border-[#0B1F33]/10 bg-white text-[#0B1F33]",
  Access: "border-[#0B1F33]/10 bg-[#0B1F33] text-white",
  Activation: "border-[#0B1F33]/10 bg-[#0B1F33]/8 text-[#0B1F33]",
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#0B1F33]/8 bg-white text-[#0B1F33]/62 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                aria-label="Close event details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(82vh-56px)] overflow-y-auto p-4">
              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[220px] overflow-hidden rounded-[6px] border border-[#0B1F33]/8 bg-[#F7F8FB]">
                  <img src={event.image} alt={event.imageAlt} className="h-full min-h-[220px] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/46 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-[2px] border border-white/18 bg-[#0B1F33]/42 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    {event.imageLabel}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-[2px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", categoryTone[event.category] || "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]")}>
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
                    <Link
                      to={`/map?mode=resident&tab=map&filter=Events&q=${encodeURIComponent(event.title)}`}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                    >
                      View on map
                    </Link>
                    <button
                      type="button"
                      onClick={() => onToggleRsvp(event)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:-translate-y-0.5 hover:border-[#0B1F33]/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                      aria-pressed={rsvped}
                    >
                      {rsvped ? "RSVP’d" : "RSVP"}
                    </button>
                  </div>
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
    <div className="mt-4 rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] p-3">
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
        className="group relative min-h-[240px] overflow-hidden rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] shadow-[0_18px_44px_rgba(11,31,51,0.08)] md:min-h-[280px]"
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

export default function Events() {
  const [selected, setSelected] = useState(events[0].date);
  const [visibleMonth, setVisibleMonth] = useState(events[0].date);
  const [selectedEventId, setSelectedEventId] = useState(events[0].id);
  const [detailOpen, setDetailOpen] = useState(false);
  const [eventResultsCollapsed, setEventResultsCollapsed] = useState(false);
  const [eventListExpanded, setEventListExpanded] = useState(false);
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
  const visibleOrderedEvents = eventListExpanded ? orderedEvents : orderedEvents.slice(0, 4);
  const hiddenEventCount = Math.max(0, orderedEvents.length - visibleOrderedEvents.length);
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
    setEventListExpanded(false);
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
    <div className="min-h-screen bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <span className="dp-label mb-4 block">Events</span>
              <h1 className="font-heading text-4xl font-medium leading-[1.04] tracking-normal md:text-4xl">
                Search less. Do more.
              </h1>
              <div className="mt-5 max-w-2xl space-y-3 text-[15px] leading-[1.7] text-[#0B1F33]/68">
                <p>Downtown Perks helps you figure out what’s happening nearby without bouncing between five apps and a group chat.</p>
                <p>
                  A rooftop before it gets packed. The live show you almost missed. A meet-up a couple blocks away. A last-minute plan that turns into the whole night.
                  Whatever makes leaving the apartment worth it.
                </p>
                <p>
                  Open the map, see what’s going on nearby, and make quicker plans before everyone says, “I don’t care, you pick.”
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2px] border border-[#0B1F33]/8 bg-white shadow-[0_14px_34px_rgba(6,27,51,0.04)]">
              <div className="border-b border-[#0B1F33]/8 bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B1F33]/46">Calendar</div>
                <div className="mt-2 text-[14px] leading-6 text-[#0B1F33]/62">Events, activations, happy hours, perks, and things to do in one place.</div>
                <div className="dp-event-chip-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
                  {[["All", events.length], ...Object.entries(allCategoryCounts)].map(([category, count]) => {
                    const active = activeCategory === category;
                    return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => chooseCategory(category)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]",
                        active
                          ? "border-[#0B1F33] bg-[#0B1F33] text-white"
                          : categoryTone[category] || "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                      )}
                    >
                      {category}
                      <span className="opacity-60">{count}</span>
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
                          day: "relative flex h-9 w-full items-center justify-center rounded-[2px] p-0 text-[13px] font-normal transition hover:bg-[#F7F8FB] hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B38F4F]",
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
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB]">
                          <CalendarDays className="h-4 w-4 text-[#B38F4F]" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">Happening now</div>
                          <div className="font-heading text-xl font-medium text-[#0B1F33]">Find something worth showing up for.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEventResultsCollapsed((current) => !current)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#0B1F33]/10 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
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
                          <div className="divide-y divide-[#0B1F33]/8 border-y border-[#0B1F33]/8">
                            {visibleOrderedEvents.map((event) => {
                              const active = event.id === selectedEvent.id;
                              return (
                                <button
                                  key={event.id}
                                  type="button"
                                  onClick={() => chooseEvent(event)}
                                  className="grid w-full gap-3 py-3 text-left sm:grid-cols-[120px_1fr_auto] sm:items-center"
                                >
                                  <div className={cn("text-[11px] font-medium uppercase tracking-[0.14em]", active ? "text-[#B38F4F]" : "text-[#0B1F33]/42")}>
                                    {event.time}
                                  </div>
                                  <div>
                                    <div className={cn("font-heading text-lg font-medium leading-tight", active ? "text-[#0B1F33]" : "text-[#0B1F33]/78")}>{event.title}</div>
                                    <div className="mt-1 text-[12px] text-[#0B1F33]/56">{event.venue}</div>
                                  </div>
                                  <span className={cn("w-fit rounded-[2px] border px-2.5 py-1 text-[11px] font-medium", active ? "border-[#0B1F33]/16 bg-white text-[#0B1F33]" : "border-[#0B1F33]/8 text-[#0B1F33]/56")}>
                                    {event.category}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!eventResultsCollapsed && orderedEvents.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setEventListExpanded((current) => !current)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[2px] border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/62 transition hover:border-[#0B1F33]/10 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                        aria-expanded={eventListExpanded}
                      >
                        {eventListExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            Roll up events
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            Show {hiddenEventCount} more events
                          </>
                        )}
                      </button>
                    )}

                    <div className="mt-4 grid gap-3 rounded-[2px] bg-[#F7F8FB] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <p className="text-[13px] leading-[1.65] text-[#0B1F33]/64">
                        See what else is happening nearby.
                      </p>
                      <Link to="/map" className="inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#081521]">
                        View on map
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
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
