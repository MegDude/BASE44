import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMapStore } from "@/store/map-store";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng } from "@/lib/mapCoordinates";
import { Search, X, MapPin, Sparkles, ExternalLink, Gift, CalendarDays, PersonStanding, Utensils, Dumbbell, Heart, Music, Building2, Hotel, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MapShell from "@/components/map/MapShell";
import MapResultsPanel from "@/components/map/MapResultsPanel";
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

  // Use unified map store instead of local state
  const {
    selectedEntityId,
    selectedEntityType,
    query,
    filters,
    isDrawerOpen,
    selectEntity,
    clearSelection,
    setVisibleResults,
    setCategoryFilter,
    setQueryFilter,
  } = useMapStore();

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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sync store filters with adapter
  const { items: allItems, getMarkerIcon } = useVenueMapAdapter(venues, buildings, {
    category: filters.category,
    query,
    smartFilters: { walking: false, freePerks: false, eventBased: false },
  });

  // Find selected item from store
  const selected = allItems.find((item) => item.id === selectedEntityId);
  const selectedType = selectedEntityType;

  return (
    <div className="pt-[68px] fixed inset-0 flex flex-col md:flex-row overflow-hidden bg-[#f4f4f3]">
      {/* ── MAP (always visible, full screen with floating panels) ──── */}
      <div className="flex-1 relative w-full h-[calc(100vh-68px)] md:h-full">
        <MapShell
          items={allItems}
          selected={selected}
          onSelect={(item) => selectEntity(item.id, item._type)}
          markerIcon={(item, active) => getMarkerIcon(item, active)}
          renderDetailDrawer={(item, onClose) =>
            item._type === "venue" ? (
              <VenueDetail venue={item} onClose={onClose} />
            ) : (
              <BuildingDetail building={item} onClose={onClose} />
            )
          }
          className="w-full h-full"
        />

        {/* Floating search bar */}
        <div className="absolute top-5 left-6 right-6 z-[500] flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#7a746b] shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder="Search venues, perks, neighborhoods..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
            />
            <button className="h-10 px-3.5 rounded-xl border border-[#e8e5df] bg-white text-[12px] font-medium text-[#3d3934] hover:border-[#bbb] transition-all shrink-0 hidden md:block">
              Austin
            </button>
          </div>
        </div>

        {/* Legend (desktop only) */}
        <div className="absolute left-5 bottom-5 z-[500] bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] p-4 max-w-[220px] hidden md:block">
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

      {/* ── FLOATING RESULTS PANEL (layered on top, always visible) ─────────────── */}
      <div className="absolute bottom-0 left-0 right-0 md:static w-full md:w-[420px] md:shrink-0 h-1/2 md:h-full flex flex-col z-40 bg-white md:bg-transparent md:border-l border-t md:border-t-0 border-[#e8e5df]">
        {/* Mobile search bar */}
        <div className="md:hidden p-3 bg-white border-b border-[#e8e5df]">
          <div className="flex items-center gap-2 bg-[#f5f3ef] rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-[#7a746b]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder="Search venues..."
              className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
            />
          </div>
        </div>

        {/* Results panel */}
        <MapResultsPanel
          results={allItems}
          renderCard={(item, active, onClick) =>
            item._type === "venue" ? (
              <VenueSideCard venue={item} active={active} onClick={onClick} />
            ) : (
              <BuildingSideCard building={item} active={active} onClick={onClick} />
            )
          }
          renderEmptyState={() => (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="w-10 h-10 text-[#c8c4be] mb-3" />
              <p className="text-[15px] font-semibold text-[#3d3934]">Nothing found</p>
              <p className="text-[13px] text-[#8d887f] mt-1">Try clearing the search or changing the filter.</p>
            </div>
          )}
        />
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