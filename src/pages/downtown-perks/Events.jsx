import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMapStore } from "@/store/map-store";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng } from "@/lib/mapCoordinates";
import { Search, X, Users, Clock, MapPin, Calendar, Star, Zap, ExternalLink, Share2, Twitter, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MapShell from "@/components/map/MapShell";
import MapResultsPanel from "@/components/map/MapResultsPanel";
import { eventIcon, EVENT_COLORS as CAT_COLORS } from "@/components/map/mapUtils/markerIcons";
import moment from "moment";

const AUSTIN_CENTER = [30.267, -97.743];

const STATUS_STYLE = {
  live: "bg-green-500/90 text-white",
  upcoming: "bg-black/75 text-white",
  past: "bg-black/50 text-white",
};

const CATS = ["all", "fitness", "wellness", "social", "dining", "nightlife", "arts", "networking", "class", "run_club", "yoga"];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use unified map store
  const {
    selectedEntityId,
    activeFilters,
    isDrawerOpen,
    selectEntity,
    setVisibleResults,
    setCategoryFilter,
    setQueryFilter,
  } = useMapStore();

  useEffect(() => {
    base44.entities.Event.list("-date").then(data => {
      // CRITICAL: All events pass through filterValidMapItems + normalizeCoordinates
      const live = filterValidMapItems((data || []).filter(e => e.status !== "past" && e.status !== "cancelled")).map(normalizeCoordinates);
      setEvents(live);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Filter events by category and query
  const filtered = events.filter(e => {
    if (activeFilters.category !== "all" && e.category !== activeFilters.category) return false;
    if (activeFilters.query && !`${e.title} ${e.venue_name} ${e.address} ${e.category}`.toLowerCase().includes(activeFilters.query.toLowerCase())) return false;
    return true;
  });

  // Update store with visible results
  useEffect(() => {
    setVisibleResults(filtered);
  }, [filtered, setVisibleResults]);

  // Find selected event from store
  const selected = filtered.find((e) => e.id === selectedEntityId);

  return (
    <div className="pt-[68px] min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#f4f4f3]">

      {/* ── MAP (mobile-first, full width on mobile, left side on desktop) ──── */}
      <div className="flex-1 relative w-full md:flex hidden md:block min-h-[50vh] md:min-h-screen">
        <MapShell
          items={filtered}
          selected={selected}
          onSelect={(item) => selectEntity(item.id, 'event')}
          markerIcon={(item, active) => eventIcon(item.category, active)}
          renderDetailDrawer={(item, onClose) => (
            <EventDetail event={item} onClose={onClose} />
          )}
          className="w-full h-full"
        />

        {/* Floating search bar (desktop only) */}
        <div className="absolute top-5 left-6 right-6 z-[500] flex justify-center pointer-events-none hidden md:flex">
          <div className="w-full max-w-2xl pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#7a746b] shrink-0" />
            <input
              type="search" value={activeFilters.query} onChange={e => setQueryFilter(e.target.value)}
              placeholder="Search events, venues, neighborhoods..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
            />
            {CATS.slice(1, 4).map(c => (
              <button key={c} onClick={() => setCategoryFilter(activeFilters.category === c ? "all" : c)}
                className={`h-10 px-3.5 rounded-xl border text-[12px] font-medium shrink-0 transition-all ${
                  activeFilters.category === c ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#3d3934] border-[#e8e5df] hover:border-[#bbb]"
                }`}>
                {c.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Map legend (desktop only) */}
        <div className="absolute left-5 bottom-5 z-[500] bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] p-4 max-w-[240px] hidden md:block">
          <div className="text-[12px] font-bold text-[#111] mb-2.5">Category legend</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CAT_COLORS).slice(0, 6).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-[11px] text-[#4a463f]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v }} />
                {k.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── UNIFIED RESULTS PANEL (shifts below map on mobile) ─────────────── */}
      <div className="w-full md:w-[420px] md:shrink-0 flex flex-col">
        {/* Mobile search bar */}
        <div className="md:hidden p-3 bg-white border-b border-[#e8e5df]">
          <div className="flex items-center gap-2 bg-[#f5f3ef] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-[#7a746b]" />
            <input
              type="search"
              value={activeFilters.query}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder="Search events..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
            />
          </div>
        </div>

        {/* Results panel */}
        <MapResultsPanel
          results={filtered}
          renderCard={(event, active, onClick) => (
            <EventCard event={event} active={active} onClick={onClick} />
          )}
          renderEmptyState={() => (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-10 h-10 text-[#c8c4be] mb-3" />
              <p className="text-[15px] font-semibold text-[#3d3934]">No events found</p>
              <p className="text-[13px] text-[#8d887f] mt-1">Try a different filter or search term.</p>
            </div>
          )}
        />
      </div>

    </div>
  );
}

// ── EVENT CARD (sidebar) ───────────────────────────────────────────────────────

function EventCard({ event, active, onClick }) {
  // Use store to update selection when card is clicked
  const date = event.date ? moment(event.date) : null;
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
      {/* Media */}
      <div className="relative aspect-[1.75/1] bg-gradient-to-br from-[#2a2a2a] to-[#444] overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${STATUS_STYLE[event.status] || STATUS_STYLE.upcoming}`}>
          {event.status === "live" ? "● Live now" : event.status === "upcoming" ? "Upcoming" : event.status}
        </div>

        {/* Members badge */}
        {event.is_members_only && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold text-[#111] backdrop-blur-md">
            <Star className="w-3 h-3" /> Members
          </div>
        )}

        {/* Date block */}
        {date && (
          <div className="absolute bottom-3 left-3 bg-white/95 rounded-xl px-3 py-2 text-center shadow-sm">
            <div className="text-[20px] font-bold leading-none text-[#111]">{date.format("D")}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#7a746b] mt-0.5">{date.format("MMM")}</div>
          </div>
        )}
      </div>

      {/* Body */}
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
          <p className="text-[13px] text-[#6f6b65] leading-relaxed mb-3 line-clamp-2">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {event.venue_name && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <MapPin className="w-3 h-3 text-[#7a746b]" /> {event.venue_name}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <Clock className="w-3 h-3 text-[#7a746b]" /> {date.format("h:mm A")}
            </span>
          )}
          {event.rsvp_count > 0 && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <Users className="w-3 h-3 text-[#7a746b]" /> {event.rsvp_count} going
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── EVENT DETAIL (map drawer) ──────────────────────────────────────────────────

function EventDetail({ event, onClose }) {
  const date = event.date ? moment(event.date) : null;
  const color = CAT_COLORS[event.category] || "#C8973A";

  return (
    <div>
      {/* Header */}
      <div className="p-5 pb-4 border-b border-[#e8e5df]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7a746b] capitalize">
                {event.category?.replace("_", " ")}
              </span>
            </div>
            <h2 className="text-[22px] font-bold text-[#111] leading-tight tracking-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f4f2] border border-[#e8e5df] flex items-center justify-center hover:bg-[#eceae6] transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4 text-[#111]" />
          </button>
        </div>
        {event.venue_name && (
          <p className="text-[14px] text-[#6f6b65]">{event.venue_name}{event.address ? ` · ${event.address}` : ""}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Image */}
        {event.image_url && (
          <img src={event.image_url} alt={event.title} className="w-full aspect-[2/1] object-cover rounded-2xl" />
        )}

        {/* Key facts grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Date", value: date ? date.format("ddd, MMM D") : "TBD" },
            { label: "Time", value: date ? date.format("h:mm A") : "TBD" },
            { label: "RSVPs", value: event.rsvp_count || 0 },
            { label: "Capacity", value: event.capacity || "Open" },
          ].map((f, i) => (
            <div key={i} className="bg-[#f8f6f2] border border-[#e8e5df] rounded-2xl p-3">
              <div className="text-[15px] font-bold text-[#111] mb-0.5">{f.value}</div>
              <div className="text-[11px] text-[#7a746b]">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">About</div>
            <p className="text-[14px] text-[#4a463f] leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">Tags</div>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-3 py-1.5 text-[12px] text-[#3d3934] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {event.is_members_only && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-3 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <Star className="w-3 h-3 text-[#7a746b]" /> Members only
            </span>
          )}
          {event.status && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-3 py-1.5 text-[12px] text-[#3d3934] font-medium capitalize">
              <Zap className="w-3 h-3 text-[#7a746b]" /> {event.status}
            </span>
          )}
        </div>

        {/* Organizer */}
        {event.venue_name && (
          <div className="bg-[#f8f6f2] border border-[#e8e5df] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2">Organizer</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[14px] text-[#111]">{event.venue_name}</div>
                {event.address && <div className="text-[12px] text-[#7a746b] mt-0.5">{event.address}</div>}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#e8e5df] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#7a746b]" />
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2.5 pt-1">
          <button className="flex-1 h-12 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors">
            RSVP
          </button>
          <button className="flex-1 h-12 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors">
            Save
          </button>
        </div>

        {/* Ticketing link */}
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl border border-[#e8e5df] bg-white text-[#3d3934] font-medium text-[13px] hover:bg-[#f5f4f2] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View tickets / event page
          </a>
        )}

        {/* Social sharing */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">Share</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = `${event.title}${event.venue_name ? ` at ${event.venue_name}` : ""}`;
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: event.title, text, url });
                } else {
                  navigator.clipboard.writeText(url);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8e5df] bg-white text-[#3d3934] text-[12px] font-medium hover:bg-[#f5f4f2] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${event.title}${event.venue_name ? ` at ${event.venue_name}` : ""} — downtown Austin`)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8e5df] bg-white text-[#3d3934] text-[12px] font-medium hover:bg-[#f5f4f2] transition-colors"
            >
              <Twitter className="w-3.5 h-3.5" /> Post
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8e5df] bg-white text-[#3d3934] text-[12px] font-medium hover:bg-[#f5f4f2] transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}