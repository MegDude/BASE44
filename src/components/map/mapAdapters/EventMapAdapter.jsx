import { eventIcon } from "../mapUtils/markerIcons";
import { filterEvents } from "../mapUtils/filterLogic";
import moment from "moment";
import { Calendar, Star } from "lucide-react";

/**
 * EventMapAdapter — Wraps Events page data/filter logic for MapShell
 */
export function useEventMapAdapter(events, { category, query }) {
  const filtered = filterEvents(events, { category, query });

  function getMarkerIcon(event, active) {
    return eventIcon(event.category, active);
  }

  return {
    items: filtered,
    getMarkerIcon,
  };
}

const STATUS_STYLE = {
  live: "bg-green-500/90 text-white",
  upcoming: "bg-black/75 text-white",
  past: "bg-black/50 text-white",
};

/**
 * Render event card
 */
export function EventCard({ event, active, onClick }) {

  const date = event.date ? moment(event.date) : null;
  const CAT_COLORS = {
    fitness: "#10b981",
    wellness: "#8b5cf6",
    social: "#f59e0b",
    dining: "#ef4444",
    nightlife: "#6366f1",
    arts: "#ec4899",
    networking: "#06b6d4",
    class: "#84cc16",
    run_club: "#f97316",
    yoga: "#a78bfa",
  };
  const color = CAT_COLORS[event.category] || "#C8973A";

  return (
    <article
      data-id={event.id}
      onClick={onClick}
      className={`rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#111] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#efede8] shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative aspect-[1.75/1] bg-gradient-to-br from-[#2a2a2a] to-[#444] overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${STATUS_STYLE[event.status] || STATUS_STYLE.upcoming}`}
        >
          {event.status === "live" ? "● Live now" : event.status === "upcoming" ? "Upcoming" : event.status}
        </div>
        {event.is_members_only && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-[#111] backdrop-blur-md">
            <Star className="w-3 h-3" /> Members
          </div>
        )}
        {date && (
          <div className="absolute bottom-3 left-3 bg-white/95 rounded-xl px-3 py-2 text-center shadow-sm">
            <div className="text-[20px] font-bold leading-none text-[#111]">{date.format("D")}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#7a746b] mt-0.5">
              {date.format("MMM")}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7a746b] capitalize">
            {event.category?.replace("_", " ")}
          </span>
        </div>
        <h3 className="font-semibold text-[16px] text-[#111] leading-snug mb-2 tracking-tight">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-3 line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {event.venue_name && (
            <span className="flex items-center gap-1.5 rounded-full border border-[rgba(11,31,51,0.08)] bg-[var(--dp-surface-base)] px-2.5 py-1.5 text-[12px] font-medium text-foreground/78">
              📍 {event.venue_name}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1.5 rounded-full border border-[rgba(11,31,51,0.08)] bg-[var(--dp-surface-base)] px-2.5 py-1.5 text-[12px] font-medium text-foreground/78">
              🕐 {date.format("h:mm A")}
            </span>
          )}
          {event.rsvp_count > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-[rgba(11,31,51,0.08)] bg-[var(--dp-surface-base)] px-2.5 py-1.5 text-[12px] font-medium text-foreground/78">
              👥 {event.rsvp_count} going
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
