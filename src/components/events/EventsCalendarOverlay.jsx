import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, ExternalLink, MapPin, Martini, Music4, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMapStateStore } from "@/store/mapStateStore";
import { ROUTES } from "@/lib/routes";

const DEFAULT_IMAGES = {
  nightlife: "/media/austin-skyline-dusk.jpeg",
  entertainment: "/media/austin-skyline-dusk.jpeg",
  event: "/media/austin-skyline-dusk.jpeg",
  social: "/media/austin-skyline-dusk.jpeg",
  food: "/media/austin-hero-correct.png",
  restaurant: "/media/austin-hero-correct.png",
  coffee: "/media/austin-hero-correct.png",
  default: "/media/austin-hero-correct.png",
};

const ENTRY_FILTERS = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "happy-hour", label: "Happy hour" },
  { id: "drinks", label: "Drinks" },
  { id: "food", label: "Food" },
  { id: "open-now", label: "Open now" },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDayLabel(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getImageForItem(item) {
  return (
    item.image_url ||
    item.image ||
    DEFAULT_IMAGES[item.category] ||
    DEFAULT_IMAGES[item.type] ||
    DEFAULT_IMAGES.default
  );
}

function getSpecialText(item, linkedVenue) {
  return (
    item.perk_value ||
    item.metadata?.perk_value ||
    item.metadata?.discount ||
    item.metadata?.offer ||
    linkedVenue?.perk_value ||
    linkedVenue?.metadata?.perk_value ||
    linkedVenue?.metadata?.offer ||
    linkedVenue?.perk_description ||
    linkedVenue?.metadata?.offerDetail ||
    ""
  );
}

function getHoursText(item, linkedVenue) {
  return item.hours || item.metadata?.hours || linkedVenue?.hours || linkedVenue?.metadata?.hours || "";
}

function buildLinkedVenueMap(items) {
  const map = new Map();

  items
    .filter((item) => item.type === "venue" || item.type === "perk" || item.type === "hotel")
    .forEach((item) => {
      const keys = [
        item.name,
        item.title,
        item.metadata?.venue_name,
        item.subtitle,
      ]
        .filter(Boolean)
        .map(normalizeText);

      keys.forEach((key) => {
        if (key && !map.has(key)) {
          map.set(key, item);
        }
      });
    });

  return map;
}

function buildEntries(items) {
  const venueMap = buildLinkedVenueMap(items);
  const today = startOfDay(new Date());

  const eventEntries = items
    .filter((item) => item.type === "event")
    .map((item) => {
      const linkedVenue =
        venueMap.get(normalizeText(item.metadata?.venue_name)) ||
        venueMap.get(normalizeText(item.subtitle)) ||
        null;
      const eventDate = item.metadata?.date ? startOfDay(new Date(`${item.metadata.date}T00:00:00`)) : today;
      const special = getSpecialText(item, linkedVenue);
      const hours = getHoursText(item, linkedVenue);
      const tags = [
        "event",
        item.category,
        linkedVenue?.category,
        special ? "happy-hour" : null,
        special ? "drinks" : null,
      ].filter(Boolean);

      return {
        id: `calendar-${item.id}`,
        sourceId: item.id,
        kind: "event",
        title: item.name,
        subtitle: item.metadata?.venue_name || item.subtitle || item.address,
        description: item.description,
        imageUrl: getImageForItem(linkedVenue || item),
        date: eventDate,
        dateLabel: formatDayLabel(eventDate),
        timeLabel: item.metadata?.time || "Time listed on venue page",
        hoursLabel: hours,
        specialLabel: special,
        category: item.category || "event",
        isOpenNow: Boolean(linkedVenue?.isOpenNow),
        district: item.district,
        attendees: Number(item.metadata?.rsvp_count || 0),
        sourceEntity: item,
        tags,
      };
    });

  const venueEntries = items
    .filter((item) => item.type === "venue" || item.type === "perk" || item.type === "hotel")
    .filter((item) => {
      const haystack = normalizeText(
        [
          item.category,
          item.description,
          item.perk_value,
          item.metadata?.offer,
          item.metadata?.offerDetail,
          item.metadata?.perk_description,
          item.metadata?.sourceCategory,
        ].join(" ")
      );
      return (
        ["coffee", "restaurant", "bar", "nightlife", "entertainment", "hotel"].includes(item.category) ||
        haystack.includes("happy hour") ||
        haystack.includes("cocktail") ||
        haystack.includes("drink") ||
        haystack.includes("beer") ||
        haystack.includes("wine") ||
        haystack.includes("speakeasy") ||
        haystack.includes("food")
      );
    })
    .map((item) => {
      const special = getSpecialText(item, null);
      const description = item.description || item.metadata?.offerDetail || item.metadata?.perk_description;
      const tags = [
        "place",
        item.type === "perk" ? "perk" : null,
        item.category,
        item.isOpenNow ? "open-now" : null,
        special && normalizeText(`${special} ${description}`).includes("happy hour") ? "happy-hour" : null,
        normalizeText(`${special} ${description}`).match(/drink|cocktail|beer|wine|bar|speakeasy/) ? "drinks" : null,
        normalizeText(`${special} ${description}`).match(/food|dining|restaurant|pizza|snack|brunch|coffee|crepe/) ? "food" : null,
      ].filter(Boolean);

      return {
        id: `calendar-${item.id}`,
        sourceId: item.id,
        kind: item.type === "perk" ? "perk" : "place",
        title: item.name,
        subtitle: item.address || item.subtitle || "Downtown Austin",
        description,
        imageUrl: getImageForItem(item),
        date: today,
        dateLabel: "Today",
        timeLabel: item.isOpenNow ? "Open now" : "Hours below",
        hoursLabel: getHoursText(item, null),
        specialLabel: special,
        category: item.category || item.type,
        isOpenNow: Boolean(item.isOpenNow),
        district: item.district,
        attendees: 0,
        sourceEntity: item,
        tags,
      };
    });

  return [...eventEntries, ...venueEntries].sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    if (a.kind !== b.kind) {
      return a.kind === "event" ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
}

export default function EventsCalendarOverlay() {
  const filteredResults = useMapStateStore((state) => state.filteredResults);
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [entryFilter, setEntryFilter] = useState("all");

  const entries = useMemo(() => buildEntries(filteredResults), [filteredResults]);

  useEffect(() => {
    if (!entries.length) return;
    const hasSelectedDay = entries.some((entry) => isSameDay(entry.date, selectedDate));
    if (!hasSelectedDay) {
      setSelectedDate(entries[0].date);
    }
  }, [entries, selectedDate]);

  const visibleEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (entryFilter === "events" && entry.kind !== "event") return false;
      if (entryFilter === "happy-hour" && !entry.tags.includes("happy-hour")) return false;
      if (entryFilter === "drinks" && !entry.tags.includes("drinks")) return false;
      if (entryFilter === "food" && !entry.tags.includes("food")) return false;
      if (entryFilter === "open-now" && !entry.isOpenNow) return false;
      return isSameDay(entry.date, selectedDate) || entry.dateLabel === "Today";
    });
  }, [entries, entryFilter, selectedDate]);

  const venueCount = visibleEntries.filter((entry) => entry.kind !== "event").length;
  const eventCount = visibleEntries.filter((entry) => entry.kind === "event").length;
  const formUrl = import.meta.env.VITE_GOOGLE_FORMS_VENUE_URL || "";

  return (
    <>
      <aside className="pointer-events-auto fixed bottom-4 left-4 top-[154px] z-[35] hidden w-[420px] overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.95)] shadow-[0_24px_60px_rgba(11,31,51,0.14)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="border-b border-[rgba(11,31,51,0.08)] px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            Main calendar
          </div>
          <h2 className="mt-2 font-heading text-[1.6rem] leading-[1.02] text-[var(--dp-navy)]">
            What is on, what is open, and where to go next.
          </h2>
          <p className="mt-2 max-w-[34ch] text-[13px] leading-5 text-[rgba(11,31,51,0.68)]">
            This pulls the live event list together with bars, restaurants, specials, and nearby places on the map.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[rgba(11,31,51,0.56)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {eventCount} events
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1">
              <Martini className="h-3.5 w-3.5" />
              {venueCount} places and specials
            </span>
          </div>
          <div className="mt-3">
            <Link
              to={ROUTES.happyHourWalkingMap}
              className="inline-flex min-h-11 items-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white px-4 text-[12px] font-semibold text-[var(--dp-navy)]"
            >
              <Martini className="h-4 w-4" />
              Happy hour walking map
            </Link>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[172px_minmax(0,1fr)]">
          <div className="border-r border-[rgba(11,31,51,0.08)] bg-[rgba(247,247,251,0.88)]">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(value) => value && setSelectedDate(startOfDay(value))}
              className="w-full"
            />
            <div className="px-4 pb-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                Filter
              </div>
              <div className="flex flex-wrap gap-2">
                {ENTRY_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEntryFilter(item.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      entryFilter === item.id
                        ? "bg-[var(--dp-navy)] text-white"
                        : "bg-white text-[rgba(11,31,51,0.62)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formUrl) {
                    window.open(formUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy)]"
              >
                <ExternalLink className="h-4 w-4" />
                Submit venue or event update
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                  {formatDayLabel(selectedDate)}
                </div>
                <div className="text-[13px] text-[rgba(11,31,51,0.62)]">
                  {visibleEntries.length} listings on the map
                </div>
              </div>
              {selectedEntity ? (
                <div className="max-w-[140px] text-right text-[11px] text-[rgba(11,31,51,0.58)]">
                  Selected: <span className="font-semibold text-[var(--dp-navy)]">{selectedEntity.name}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              {visibleEntries.map((entry) => {
                const isActive = selectedEntity?.id === entry.sourceEntity.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => selectEntity(entry.sourceEntity)}
                    className={`w-full rounded-[22px] border p-3 text-left transition-all ${
                      isActive
                        ? "border-[rgba(207,175,90,0.52)] bg-[rgba(255,249,236,0.95)] shadow-[0_12px_28px_rgba(207,175,90,0.18)]"
                        : "border-[rgba(11,31,51,0.08)] bg-white hover:bg-[rgba(248,250,252,0.98)]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        className="h-[88px] w-[88px] shrink-0 rounded-[16px] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                              {entry.kind === "event" ? "Event" : entry.kind === "perk" ? "Perk spot" : "Open place"}
                            </div>
                            <div className="mt-1 line-clamp-2 font-heading text-[1.05rem] leading-[1.06] text-[var(--dp-navy)]">
                              {entry.title}
                            </div>
                          </div>
                          {entry.specialLabel ? (
                            <span className="shrink-0 rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--dp-navy)]">
                              {entry.kind === "event" ? "Offer" : "Special"}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[rgba(11,31,51,0.62)]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {entry.subtitle}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {entry.kind === "event" ? entry.timeLabel : entry.hoursLabel || entry.timeLabel}
                          </span>
                        </div>

                        {entry.specialLabel ? (
                          <div className="mt-2 text-[12px] font-medium text-[rgba(11,31,51,0.82)]">
                            {entry.specialLabel}
                          </div>
                        ) : null}

                        <div className="mt-2 line-clamp-2 text-[12px] leading-5 text-[rgba(11,31,51,0.62)]">
                          {entry.description || "Linked directly to the live downtown map."}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.hoursLabel ? (
                            <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.56)]">
                              {entry.kind === "event" ? "Venue hours" : "Hours"}
                            </span>
                          ) : null}
                          {entry.kind === "event" && entry.attendees > 0 ? (
                            <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.56)]">
                              {entry.attendees} going
                            </span>
                          ) : null}
                          {entry.tags.includes("happy-hour") ? (
                            <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)]">
                              Happy hour
                            </span>
                          ) : null}
                          {entry.tags.includes("drinks") ? (
                            <span className="rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.56)]">
                              Drinks
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {visibleEntries.length === 0 ? (
                <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white px-4 py-5 text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                  Nothing matches that date and filter yet. The map is still live, so widen the day or switch the filter.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      <div className="pointer-events-auto fixed inset-x-3 bottom-3 z-[35] overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.94)] shadow-[0_18px_44px_rgba(11,31,51,0.14)] backdrop-blur-xl lg:hidden">
        <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
            Events and specials
          </div>
          <div className="mt-1 text-[13px] text-[rgba(11,31,51,0.64)]">
            {visibleEntries.length} things you can open on the map right now.
          </div>
        </div>
        <div className="max-h-[42vh] overflow-y-auto px-3 py-3">
          <Link
            to={ROUTES.happyHourWalkingMap}
            className="mb-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy)]"
          >
            <Martini className="h-4 w-4" />
            Happy hour walking map
          </Link>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {ENTRY_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEntryFilter(item.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  entryFilter === item.id
                    ? "bg-[var(--dp-navy)] text-white"
                    : "bg-[rgba(11,31,51,0.05)] text-[rgba(11,31,51,0.62)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {visibleEntries.slice(0, 8).map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => selectEntity(entry.sourceEntity)}
                className="flex w-full items-start gap-3 rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white p-3 text-left"
              >
                <img src={entry.imageUrl} alt={entry.title} className="h-16 w-16 shrink-0 rounded-[14px] object-cover" />
                <div className="min-w-0">
                  <div className="line-clamp-2 font-heading text-[1rem] leading-[1.05] text-[var(--dp-navy)]">
                    {entry.title}
                  </div>
                  <div className="mt-1 text-[11px] text-[rgba(11,31,51,0.58)]">
                    {entry.subtitle}
                  </div>
                  <div className="mt-1 text-[11px] text-[rgba(11,31,51,0.58)]">
                    {entry.kind === "event" ? entry.timeLabel : entry.hoursLabel || entry.timeLabel}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {formUrl ? (
            <button
              type="button"
              onClick={() => window.open(formUrl, "_blank", "noopener,noreferrer")}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy)]"
            >
              <Sparkles className="h-4 w-4" />
              Submit venue or event update
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
