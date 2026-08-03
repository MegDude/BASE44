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
  live: "bg-[#0B1F33]/90 text-white",
  upcoming: "bg-black/75 text-white",
  past: "bg-black/50 text-white",
};

/**
 * Render event card
 */
export function EventCard({ event, active, onClick }) {

  const date = event.date ? moment(event.date) : null;
  const CAT_COLORS = {
    fitness: "#0B1F33",
    wellness: "#0B1F33",
    social: "#BFA46A",
    dining: "#BFA46A",
    nightlife: "#0B1F33",
    arts: "#0B1F33",
    networking: "#0B1F33",
    class: "#0B1F33",
    run_club: "#BFA46A",
    yoga: "#0B1F33",
  };
  const color = CAT_COLORS[event.category] || "#BFA46A";

  return (
    <article
      data-id={event.id}
      onClick={onClick}
      className={`rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
        active
          ? "border-[#0B1F33] shadow-[0_16px_36px_rgba(17,17,17,.12)]"
          : "border-[#0B1F33]/8 shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
      }`}
    >
      <div className="relative flex aspect-[1.75/1] items-center justify-center overflow-hidden bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-[#BFA46A]/50 bg-[#0B1F33]">
          <Calendar className="h-8 w-8 text-[#BFA46A]" />
        </div>
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-[8px] text-[11px] font-semibold ${STATUS_STYLE[event.status] || STATUS_STYLE.upcoming}`}
        >
          {event.status === "live" ? "● Live now" : event.status === "upcoming" ? "Upcoming" : event.status}
        </div>
        {event.is_members_only && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-white/95 text-[11px] font-semibold text-[#0B1F33]">
            <Star className="w-3 h-3" /> Members
          </div>
        )}
        {date && (
          <div className="absolute bottom-3 left-3 bg-white/95 rounded-xl px-3 py-2 text-center shadow-sm">
            <div className="text-[20px] font-bold leading-none text-[#0B1F33]">{date.format("D")}</div>
            <div className="text-[10px] uppercase tracking-normalr text-[#0B1F33]/58 mt-0.5 text-[11px] font-bold uppercase tracking-normal">
              {date.format("MMM")}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-[11px] uppercase tracking-normalr text-[#0B1F33]/58 capitalize text-[11px] font-bold uppercase tracking-normal">
            {event.category?.replace("_", " ")}
          </span>
        </div>
        <h3 className="font-semibold text-[16px] text-[#0B1F33] leading-snug mb-2 tracking-normal">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-3 line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {event.venue_name && (
            <span className="flex items-center gap-1.5 bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium">
              📍 {event.venue_name}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1.5 bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium">
              🕐 {date.format("h:mm A")}
            </span>
          )}
          {event.rsvp_count > 0 && (
            <span className="flex items-center gap-1.5 bg-white border border-[#0B1F33]/8 rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#0B1F33]/70 font-medium">
              👥 {event.rsvp_count} going
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
