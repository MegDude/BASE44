import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng } from "@/lib/mapCoordinates";
import { Search, X, MapPin, Sparkles, ExternalLink, Gift, CalendarDays, PersonStanding, Utensils, Dumbbell, Heart, Music, Building2, Hotel, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MapShell from "@/components/map/MapShell";
import { useVenueMapAdapter, VenueSideCard, BuildingSideCard } from "@/components/map/mapAdapters/VenueMapAdapter";
import { VENUE_COLORS } from "@/components/map/mapUtils/markerIcons";
import { isWalkingDistance, hasFreePerks, isEventBased } from "@/components/map/mapUtils/filterLogic";

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "restaurant", label: "Dining", icon: Utensils },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "hotel", label: "Hotels", icon: Hotel },
  { id: "entertainment", label: "Events", icon: Music },
  { id: "building", label: "Buildings", icon: Building2 },
];

export default function Explore() {
  const [venues, setVenues] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState("venue");
  const [smartFilters, setSmartFilters] = useState({ walking: false, freePerks: false, eventBased: false });

  useEffect(() => {
    Promise.all([
      base44.entities.Venue.list(),
      base44.entities.Building.list(),
    ])
      .then(([v, b]) => {
        const venues = filterValidMapItems(v || []).map(normalizeCoordinates);
        const buildings = filterValidMapItems(b || []).map(normalizeCoordinates);
        setVenues(venues);
        setBuildings(buildings);
        if (venues[0]) {
          setSelected(normalizeCoordinates(venues[0]));
          setSelectedType("venue");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { items: allItems, getMarkerIcon } = useVenueMapAdapter(venues, buildings, {
    category: cat,
    query,
    smartFilters,
  });

  function toggleSmartFilter(key) {
    setSmartFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectItem(item) {
    setSelected(item);
    setSelectedType(item._type);
  }

  return (
    <div className="pt-[68px] min-h-screen flex flex-col-reverse md:flex-row overflow-hidden bg-[#f4f4f3]">
      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-full md:w-[420px] md:shrink-0 bg-white md:border-r border-t md:border-t-0 border-[#e8e5df] flex flex-col h-auto md:h-full z-10 md:shadow-[2px_0_12px_rgba(0,0,0,.04)]">
        <div className="px-4 md:px-5 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#e8e5df]">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h1 className="text-lg md:text-[22px] font-semibold text-[#111] tracking-tight leading-tight">Explore</h1>
            <span className="text-[12px] md:text-[13px] font-medium text-[#8d887f] border border-[#e8e5df] rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 bg-[#f5f3ef]">
              {allItems.length}
            </span>
          </div>
          <label className="flex items-center gap-2.5 h-10 md:h-12 rounded-2xl border border-[#e8e5df] bg-[#f7f6f4] px-3 md:px-3.5 mb-3">
            <Search className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#7a746b] shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues..."
              className="flex-1 bg-transparent outline-none text-[13px] md:text-[14px] text-[#111] placeholder:text-[#9d9890]"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#7a746b]" />
              </button>
            )}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`flex items-center gap-1 md:gap-1.5 h-8 md:h-9 px-3 md:px-3.5 rounded-xl text-[11px] md:text-[12px] font-medium whitespace-nowrap border transition-all shrink-0 ${
                    cat === c.id ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#3d3934] border-[#e8e5df] hover:border-[#c8c4be]"
                  }`}
                >
                  <Icon className="w-3 h-3" /> <span className="hidden md:inline">{c.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              {
                key: "walking",
                label: "< 5 min walk",
                icon: PersonStanding,
                activeColor: "bg-emerald-600 text-white border-emerald-600",
              },
              {
                key: "freePerks",
                label: "Free perks",
                icon: Gift,
                activeColor: "bg-amber-500 text-white border-amber-500",
              },
              {
                key: "eventBased",
                label: "Event spots",
                icon: CalendarDays,
                activeColor: "bg-violet-600 text-white border-violet-600",
              },
            ].map(({ key, label, icon: Icon, activeColor }) => {
              const on = smartFilters[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleSmartFilter(key)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all shrink-0 ${
                    on ? activeColor : "bg-white text-[#3d3934] border-[#e8e5df] hover:border-[#c8c4be]"
                  }`}
                >
                  <Icon className="w-3 h-3" /> {label}
                  {on && <X className="w-2.5 h-2.5 ml-0.5 opacity-80" />}
                </button>
              );
            })}
            {(smartFilters.walking || smartFilters.freePerks || smartFilters.eventBased) && (
              <button
                onClick={() => setSmartFilters({ walking: false, freePerks: false, eventBased: false })}
                className="h-8 px-3 rounded-full text-[11px] font-medium text-[#8d887f] border border-[#e8e5df] hover:border-[#c8c4be] whitespace-nowrap transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4 max-h-[40vh] md:max-h-none">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-[#f0ede8] animate-pulse" />
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="w-10 h-10 text-[#c8c4be] mb-3" />
              <p className="text-[15px] font-semibold text-[#3d3934]">Nothing found</p>
              <p className="text-[13px] text-[#8d887f] mt-1">Try clearing the search or changing the filter.</p>
            </div>
          ) : (
            allItems.map((item) =>
              item._type === "venue" ? (
                <VenueSideCard
                  key={`v-${item.id}`}
                  venue={item}
                  active={selectedType === "venue" && selected?.id === item.id}
                  onClick={() => selectItem(item)}
                />
              ) : (
                <BuildingSideCard
                  key={`b-${item.id}`}
                  building={item}
                  active={selectedType === "building" && selected?.id === item.id}
                  onClick={() => selectItem(item)}
                />
              )
            )
          )}
        </div>
      </aside>

      {/* ── MAP ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative hidden md:flex">
        <MapShell
          items={allItems}
          selected={selected}
          onSelect={selectItem}
          markerIcon={(item, active) => getMarkerIcon(item, active)}
          renderItemCard={(item, active, onClick) =>
            item._type === "venue" ? (
              <VenueSideCard venue={item} active={active} onClick={onClick} />
            ) : (
              <BuildingSideCard building={item} active={active} onClick={onClick} />
            )
          }
          renderDetailDrawer={(item, onClose) =>
            item._type === "venue" ? (
              <VenueDetail venue={item} onClose={onClose} />
            ) : (
              <BuildingDetail building={item} onClose={onClose} />
            )
          }
          className="w-full h-full"
        />

        {/* Floating bar */}
        <div className="absolute top-5 left-6 right-6 z-[500] flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#7a746b] shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues, perks, neighborhoods..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
            />
            <button className="h-10 px-3.5 rounded-xl border border-[#e8e5df] bg-white text-[12px] font-medium text-[#3d3934] hover:border-[#bbb] transition-all shrink-0">
              Austin
            </button>
            {Object.values(smartFilters).filter(Boolean).length > 0 && (
              <button
                onClick={() => setSmartFilters({ walking: false, freePerks: false, eventBased: false })}
                className="h-10 px-3.5 rounded-xl border border-violet-300 bg-violet-50 text-[12px] font-medium text-violet-700 hover:bg-violet-100 transition-all shrink-0 flex items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {Object.values(smartFilters).filter(Boolean).length}
                </span>
                Filters on
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute left-5 bottom-5 z-[500] bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] p-4 max-w-[220px]">
          <div className="text-[12px] font-bold text-[#111] mb-2.5">Map logic</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(VENUE_COLORS)
              .slice(0, 5)
              .map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5 text-[11px] text-[#4a463f]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: v }} />
                  {k}
                </span>
              ))}
            <span className="flex items-center gap-1.5 text-[11px] text-[#4a463f]">
              <span className="w-2 h-2 rounded-sm shrink-0 bg-[#C8973A]" />
              building
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── VENUE DETAIL ──────────────────────────────────────────────────────────────

function VenueDetail({ venue, onClose }) {
  return (
    <div>
      <div className="p-5 pb-4 border-b border-[#e8e5df]">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-1.5 capitalize">{venue.category}</div>
            <h2 className="text-[22px] font-bold text-[#111] leading-tight tracking-tight">{venue.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f4f2] border border-[#e8e5df] flex items-center justify-center hover:bg-[#eceae6] transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4 text-[#111]" />
          </button>
        </div>
        {venue.address && <p className="text-[14px] text-[#6f6b65]">{venue.address}</p>}
      </div>
      <div className="p-5 space-y-5">
        {venue.image_url && (
          <img src={venue.image_url} alt={venue.name} className="w-full aspect-[2/1] object-cover rounded-2xl" />
        )}
        {venue.perk_description && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">Member perk</div>
            <div className="bg-[#f8f6f2] border border-[#e8e5df] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#7a746b]" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#7a746b]">Perk</span>
              </div>
              <p className="text-[14px] font-semibold text-[#111]">{venue.perk_description}</p>
              {venue.perk_value && <p className="text-[20px] font-bold text-[#111] mt-1.5 tracking-tight">{venue.perk_value}</p>}
            </div>
          </div>
        )}
        {venue.description && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">About</div>
            <p className="text-[14px] text-[#4a463f] leading-relaxed">{venue.description}</p>
          </div>
        )}
        {venue.hours && (
          <div className="flex items-center gap-2.5 text-[14px] text-[#4a463f]">
            <Clock className="w-4 h-4 text-[#7a746b]" /> {venue.hours}
          </div>
        )}
        {venue.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {venue.tags.map((t, i) => (
              <span key={i} className="bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-3 py-1.5 text-[12px] text-[#3d3934] font-medium">{t}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2.5 pt-1">
          {venue.website ? (
            <a href={venue.website} target="_blank" rel="noopener noreferrer"
              className="flex-1 h-12 rounded-2xl bg-[#111] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors">
              Visit <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button className="flex-1 h-12 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors">
              Save
            </button>
          )}
          <button className="flex-1 h-12 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors">
            Nearby
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BUILDING DETAIL ───────────────────────────────────────────────────────────

function BuildingDetail({ building, onClose }) {
  return (
    <div>
      <div className="p-5 pb-4 border-b border-[#e8e5df]">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-1.5">Building</div>
            <h2 className="text-[22px] font-bold text-[#111] leading-tight tracking-tight">{building.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f4f2] border border-[#e8e5df] flex items-center justify-center hover:bg-[#eceae6] transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4 text-[#111]" />
          </button>
        </div>
        {building.address && <p className="text-[14px] text-[#6f6b65]">{building.address}</p>}
      </div>
      <div className="p-5 space-y-5">
        {building.image_url && (
          <img src={building.image_url} alt={building.name} className="w-full aspect-[2/1] object-cover rounded-2xl" />
        )}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Units", value: building.unit_count || "—" },
            { label: "Developer", value: building.developer || "—" },
            { label: "Status", value: building.status || "active" },
            { label: "Type", value: building.is_partner ? "Partner" : "Building" },
          ].map((f, i) => (
            <div key={i} className="bg-[#f8f6f2] border border-[#e8e5df] rounded-2xl p-3">
              <div className="text-[14px] font-bold text-[#111] capitalize">{f.value}</div>
              <div className="text-[11px] text-[#7a746b] mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>
        {building.description && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">About</div>
            <p className="text-[14px] text-[#4a463f] leading-relaxed">{building.description}</p>
          </div>
        )}
        {building.amenities?.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-2.5">Amenities</div>
            <div className="flex flex-wrap gap-2">
              {building.amenities.map((a, i) => (
                <span key={i} className="bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-3 py-1.5 text-[12px] text-[#3d3934] font-medium">{a}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2.5 pt-1">
          <button className="flex-1 h-12 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors">
            Save
          </button>
          <button className="flex-1 h-12 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors">
            Nearby perks
          </button>
        </div>
      </div>
    </div>
  );
}