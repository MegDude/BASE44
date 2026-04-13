import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { Search, Filter, Building2, Utensils, Dumbbell, Heart, Sparkles, Music, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VenueCard from "../../components/downtown-perks/explore/VenueCard";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "restaurant", label: "Dining", icon: Utensils },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "entertainment", label: "Entertainment", icon: Music },
  { id: "building", label: "Buildings", icon: Building2 },
];

const AUSTIN_CENTER = [30.267, -97.743];

function createCustomIcon(category) {
  const colors = {
    restaurant: "#f59e0b",
    bar: "#f59e0b",
    fitness: "#10b981",
    wellness: "#8b5cf6",
    beauty: "#ec4899",
    entertainment: "#3b82f6",
    retail: "#6b7280",
    coworking: "#06b6d4",
    hotel: "#f97316",
  };
  const color = colors[category] || "#d4a13a";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid rgba(0,0,0,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const buildingIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:32px;height:32px;border-radius:8px;background:#d4a13a;border:3px solid rgba(0,0,0,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d1117" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Explore() {
  const [venues, setVenues] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [v, b] = await Promise.all([
        base44.entities.Venue.list(),
        base44.entities.Building.list(),
      ]);
      setVenues(v);
      setBuildings(b);
      setLoading(false);
    }
    load();
  }, []);

  const filteredVenues = venues.filter((v) => {
    if (activeCategory !== "all" && activeCategory !== "building" && v.category !== activeCategory) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const showBuildings = activeCategory === "all" || activeCategory === "building";

  return (
    <div className="pt-16 h-screen flex flex-col">
      {/* Filter bar */}
      <div className="bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search venues, events, neighborhoods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Side panel */}
      <div className="flex-1 flex relative">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={AUSTIN_CENTER}
            zoom={15}
            className="h-full w-full"
            style={{ background: "#0d1117" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {filteredVenues.map((venue) =>
              venue.latitude && venue.longitude ? (
                <Marker
                  key={venue.id}
                  position={[venue.latitude, venue.longitude]}
                  icon={createCustomIcon(venue.category)}
                  eventHandlers={{ click: () => setSelectedVenue(venue) }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>{venue.name}</strong>
                      <br />
                      {venue.perk_description && <span>{venue.perk_description}</span>}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
            {showBuildings &&
              buildings.map((bld) =>
                bld.latitude && bld.longitude ? (
                  <Marker
                    key={`bld-${bld.id}`}
                    position={[bld.latitude, bld.longitude]}
                    icon={buildingIcon}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{bld.name}</strong>
                        <br />
                        {bld.unit_count && <span>{bld.unit_count} units</span>}
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
          </MapContainer>
        </div>

        {/* Selected venue panel */}
        <AnimatePresence>
          {selectedVenue && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-background/95 backdrop-blur-xl border-l border-border overflow-y-auto z-20"
            >
              <VenueCard venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state overlay */}
        {!loading && filteredVenues.length === 0 && buildings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
            <div className="text-center p-8">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                We're mapping downtown Austin's best venues, wellness spots, and experiences. Check back soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}