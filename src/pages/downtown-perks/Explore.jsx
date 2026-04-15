import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { normalizeCoordinates, filterValidMapItems, getValidLatLng } from "@/lib/mapCoordinates";
import { Search, X, MapPin, Clock, Building2, Utensils, Dumbbell, Heart, Music, Sparkles, ExternalLink, Tag, Hotel, PersonStanding, Gift, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const AUSTIN_CENTER = [30.267, -97.743];

const CAT_COLORS = {
  restaurant: "#f59e0b", bar: "#f59e0b", fitness: "#10b981",
  wellness: "#8b5cf6", beauty: "#ec4899", entertainment: "#3b82f6",
  retail: "#6b7280", coworking: "#06b6d4", hotel: "#f97316",
};

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "restaurant", label: "Dining", icon: Utensils },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "hotel", label: "Hotels", icon: Hotel },
  { id: "entertainment", label: "Events", icon: Music },
  { id: "building", label: "Buildings", icon: Building2 },
];

function venueIcon(category, active = false) {
  const color = CAT_COLORS[category] || "#C8973A";
  if (active) {
    return L.divIcon({
      className: "",
      html: `<div style="background:#fff;color:#111;border:2px solid #111;border-radius:999px;padding:5px 11px;font:600 12px/1 Inter,sans-serif;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.2);transform:scale(1.05)">● ${category}</div>`,
      iconSize: [120, 28], iconAnchor: [60, 14],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,.9);box-shadow:0 3px 10px ${color}50"></div>`,
    iconSize: [11, 11], iconAnchor: [5.5, 5.5],
  });
}

const buildingIcon = (active = false) => L.divIcon({
  className: "",
  html: `<div style="width:${active ? 36 : 28}px;height:${active ? 36 : 28}px;border-radius:${active ? 10 : 7}px;background:${active ? "#111" : "#C8973A"};border:${active ? "2.5px solid #fff" : "2px solid rgba(255,255,255,.9)"};box-shadow:0 4px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${active ? "#fff" : "#fff"}" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>
  </div>`,
  iconSize: [active ? 36 : 28, active ? 36 : 28],
  iconAnchor: [active ? 18 : 14, active ? 18 : 14],
});

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2 && position.every(v => typeof v === 'number' && isFinite(v))) {
      map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.55 });
    }
  }, [position, map]);
  return null;
}

export default function Explore() {
  const [venues, setVenues] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState("venue"); // "venue" | "building"
  const [smartFilters, setSmartFilters] = useState({ walking: false, freePerks: false, eventBased: false });

  function toggleSmartFilter(key) {
    setSmartFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    Promise.all([
      base44.entities.Venue.list(),
      base44.entities.Building.list(),
    ]).then(([v, b]) => {
      const venues = filterValidMapItems(v || []).map(normalizeCoordinates);
      const buildings = filterValidMapItems(b || []).map(normalizeCoordinates);
      setVenues(venues);
      setBuildings(buildings);
      const first = venues[0];
      if (first) { setSelected(first); setSelectedType("venue"); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Smart filter helpers — approximate "walking distance" as venues with coordinates near Austin center
  const WALKING_RADIUS_DEG = 0.018; // ~2km / ~5-min walk radius
  const [mapCenter] = useState(AUSTIN_CENTER);

  function isWalkingDistance(item) {
    if (!item.latitude || !item.longitude) return false;
    const dlat = item.latitude - mapCenter[0];
    const dlng = item.longitude - mapCenter[1];
    return Math.sqrt(dlat * dlat + dlng * dlng) <= WALKING_RADIUS_DEG;
  }

  function hasFreePerks(item) {
    const text = `${item.perk_description || ""} ${item.perk_value || ""}`.toLowerCase();
    return text.includes("free") || text.includes("complimentary") || text.includes("on us") || text.includes("no charge");
  }

  const EVENT_CATEGORIES = ["entertainment", "bar", "fitness", "wellness"];

  function isEventBased(item) {
    return EVENT_CATEGORIES.includes(item.category);
  }

  const showBuildings = cat === "all" || cat === "building";
  const filteredVenues = venues.filter(v => {
    if (cat !== "all" && cat !== "building" && v.category !== cat) return false;
    if (cat === "building") return false;
    if (query && !`${v.name} ${v.category} ${v.address} ${v.perk_description}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (smartFilters.walking && !isWalkingDistance(v)) return false;
    if (smartFilters.freePerks && !hasFreePerks(v)) return false;
    if (smartFilters.eventBased && !isEventBased(v)) return false;
    return true;
  });
  const filteredBuildings = showBuildings ? buildings.filter(b => {
    if (query && !`${b.name} ${b.address} ${b.developer}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (smartFilters.walking && !isWalkingDistance(b)) return false;
    return true;
  }) : [];

  const allItems = [
    ...filteredVenues.map(v => ({ ...v, _type: "venue" })),
    ...filteredBuildings.map(b => ({ ...b, _type: "building" })),
  ];

  function selectItem(item, type) {
    setSelected(item);
    setSelectedType(type);
  }

  const flyTarget = getValidLatLng(selected);

  return (
    <div className="pt-[68px] min-h-screen flex flex-col-reverse md:flex-row overflow-hidden bg-[#f4f4f3]">

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-full md:w-[420px] md:shrink-0 bg-white md:border-r border-t md:border-t-0 border-[#e8e5df] flex flex-col h-auto md:h-full z-10 md:shadow-[2px_0_12px_rgba(0,0,0,.04)]">

        {/* Top */}
        <div className="px-4 md:px-5 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#e8e5df]">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h1 className="text-lg md:text-[22px] font-semibold text-[#111] tracking-tight leading-tight">Explore</h1>
            <span className="text-[12px] md:text-[13px] font-medium text-[#8d887f] border border-[#e8e5df] rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 bg-[#f5f3ef]">
              {allItems.length}
            </span>
          </div>

          {/* Search */}
          <label className="flex items-center gap-2.5 h-10 md:h-12 rounded-2xl border border-[#e8e5df] bg-[#f7f6f4] px-3 md:px-3.5 mb-3">
            <Search className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#7a746b] shrink-0" />
            <input
              type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search venues..."
              className="flex-1 bg-transparent outline-none text-[13px] md:text-[14px] text-[#111] placeholder:text-[#9d9890]"
            />
            {query && <button onClick={() => setQuery("")}><X className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#7a746b]" /></button>}
          </label>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={`flex items-center gap-1 md:gap-1.5 h-8 md:h-9 px-3 md:px-3.5 rounded-xl text-[11px] md:text-[12px] font-medium whitespace-nowrap border transition-all shrink-0 ${
                    cat === c.id
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white text-[#3d3934] border-[#e8e5df] hover:border-[#c8c4be]"
                  }`}>
                  <Icon className="w-3 h-3" /> <span className="hidden md:inline">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smart filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { key: "walking", label: "< 5 min walk", icon: PersonStanding, activeColor: "bg-emerald-600 text-white border-emerald-600" },
              { key: "freePerks", label: "Free perks", icon: Gift, activeColor: "bg-amber-500 text-white border-amber-500" },
              { key: "eventBased", label: "Event spots", icon: CalendarDays, activeColor: "bg-violet-600 text-white border-violet-600" },
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

        {/* Cards list */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4 max-h-[40vh] md:max-h-none">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-[#f0ede8] animate-pulse" />)}
            </div>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="w-10 h-10 text-[#c8c4be] mb-3" />
              <p className="text-[15px] font-semibold text-[#3d3934]">Nothing found</p>
              <p className="text-[13px] text-[#8d887f] mt-1">Try clearing the search or changing the filter.</p>
            </div>
          ) : (
            allItems.map(item => item._type === "venue" ? (
              <VenueSideCard
                key={`v-${item.id}`}
                venue={item}
                active={selectedType === "venue" && selected?.id === item.id}
                onClick={() => selectItem(item, "venue")}
              />
            ) : (
              <BuildingSideCard
                key={`b-${item.id}`}
                building={item}
                active={selectedType === "building" && selected?.id === item.id}
                onClick={() => selectItem(item, "building")}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── MAP ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative hidden md:flex">
        {/* Floating bar */}
        <div className="absolute top-5 left-6 right-6 z-[500] flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#7a746b] shrink-0" />
            <input
              type="search" value={query} onChange={e => setQuery(e.target.value)}
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

        <MapContainer
          center={AUSTIN_CENTER} zoom={15}
          className="h-full w-full"
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <MapFlyTo position={flyTarget} />

          {filteredVenues.map(v => {
            const coords = getValidLatLng(v);
            return coords ? (
              <Marker
                key={v.id}
                position={coords}
                icon={venueIcon(v.category, selectedType === "venue" && selected?.id === v.id)}
                eventHandlers={{ click: () => selectItem(v, "venue") }}
              />
            ) : null;
          })}
          {filteredBuildings.map(b => {
            const coords = getValidLatLng(b);
            return coords ? (
              <Marker
                key={`b-${b.id}`}
                position={coords}
                icon={buildingIcon(selectedType === "building" && selected?.id === b.id)}
                eventHandlers={{ click: () => selectItem(b, "building") }}
              />
            ) : null;
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute left-5 bottom-5 z-[500] bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] p-4 max-w-[220px]">
          <div className="text-[12px] font-bold text-[#111] mb-2.5">Map logic</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CAT_COLORS).slice(0, 5).map(([k, v]) => (
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

        {/* Detail drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={`${selectedType}-${selected.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="absolute right-5 bottom-5 z-[600] w-[90vw] md:w-[400px] max-h-[50vh] md:max-h-[72vh] overflow-y-auto bg-white/97 backdrop-blur-xl border border-black/8 rounded-3xl shadow-[0_24px_60px_rgba(17,17,17,.16)]"
            >
              {selectedType === "venue" ? (
                <VenueDetail venue={selected} onClose={() => setSelected(null)} />
              ) : (
                <BuildingDetail building={selected} onClose={() => setSelected(null)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── VENUE SIDE CARD ───────────────────────────────────────────────────────────

function VenueSideCard({ venue, active, onClick }) {
  const color = CAT_COLORS[venue.category] || "#C8973A";
  return (
    <article onClick={onClick} className={`rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
      active ? "border-[#111] shadow-[0_16px_36px_rgba(17,17,17,.12)]" : "border-[#efede8] shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
    }`}>
      <div className="relative aspect-[2/1] bg-gradient-to-br from-[#333] to-[#555] overflow-hidden">
        {venue.image_url ? (
          <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md capitalize">
          {venue.category}
        </div>
        {venue.perk_value && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/92 text-[#111] text-[11px] font-bold backdrop-blur-md">
            {venue.perk_value}
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#111] leading-snug mb-1.5 tracking-tight">{venue.name}</h3>
        {venue.address && (
          <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{venue.address}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {venue.perk_description && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium max-w-full truncate">
              <Tag className="w-3 h-3 text-[#7a746b] shrink-0" /> {venue.perk_description}
            </span>
          )}
          {venue.hours && (
            <span className="flex items-center gap-1.5 bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              <Clock className="w-3 h-3 text-[#7a746b]" /> {venue.hours}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── BUILDING SIDE CARD ────────────────────────────────────────────────────────

function BuildingSideCard({ building, active, onClick }) {
  return (
    <article onClick={onClick} className={`rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
      active ? "border-[#111] shadow-[0_16px_36px_rgba(17,17,17,.12)]" : "border-[#efede8] shadow-[0_4px_14px_rgba(17,17,17,.03)] hover:-translate-y-px hover:shadow-[0_12px_28px_rgba(17,17,17,.08)]"
    }`}>
      <div className="relative aspect-[2/1] bg-gradient-to-br from-[#C8973A]/40 to-[#8a6622]/60 overflow-hidden">
        {building.image_url ? (
          <img src={building.image_url} alt={building.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold backdrop-blur-md">
          Building
        </div>
        {building.unit_count && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/92 text-[#111] text-[11px] font-bold backdrop-blur-md">
            {building.unit_count} units
          </div>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-[16px] text-[#111] leading-snug mb-1.5 tracking-tight">{building.name}</h3>
        {building.address && <p className="text-[13px] text-[#6f6b65] mb-3 truncate">{building.address}</p>}
        <div className="flex flex-wrap gap-2">
          {building.developer && (
            <span className="bg-[#f5f3ef] border border-[#e8e5df] rounded-full px-2.5 py-1.5 text-[12px] text-[#3d3934] font-medium">
              {building.developer}
            </span>
          )}
          <span className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border ${
            building.status === "active" ? "bg-green-50 border-green-200 text-green-700" :
            building.status === "pilot" ? "bg-amber-50 border-amber-200 text-amber-700" :
            "bg-[#f5f3ef] border-[#e8e5df] text-[#7a746b]"
          } capitalize`}>
            {building.status || "active"}
          </span>
        </div>
      </div>
    </article>
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