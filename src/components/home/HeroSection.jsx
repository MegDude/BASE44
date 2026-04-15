import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Search, Calendar, Gift, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import L from "leaflet";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryColors = {
  restaurant: "#C8973A", bar: "#A07830", fitness: "#5B9E6E",
  wellness: "#7B9EC8", beauty: "#C87890", retail: "#8B78C8",
  entertainment: "#C85858", coworking: "#78B0C8", hotel: "#C8A058",
  default: "#C8973A",
};

function createVenueIcon(category) {
  const color = categoryColors[category] || categoryColors.default;
  return L.divIcon({
    className: "",
    html: `<div style="width:9px;height:9px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 7px ${color}80"></div>`,
    iconSize: [9, 9], iconAnchor: [4.5, 4.5],
  });
}

const DOWNTOWN_AUSTIN = [30.2672, -97.7431];

// Search intent prompts that populate the search bar
const INTENT_PROMPTS = [
  { q: "Where do you want to go?", a: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.", fill: "Coffee near me" },
  { q: "What do you want to do?", a: "See what's on tonight. Find something worth showing up for.", fill: "Events tonight" },
  { q: "Who do you want to meet?", a: "See who's going. Join in. Make a plan.", fill: "What's happening nearby" },
];

const FILTER_CHIPS = [
  { label: "Venues", icon: MapPin, active: true },
  { label: "Events", icon: Calendar, active: false },
  { label: "Perks", icon: Gift, active: false },
  { label: "5 min walk", icon: Sparkles, active: false },
];

export default function HeroSection() {
  const [venues, setVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Venues");
  const [intentExpanded, setIntentExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Venue.list().then((d) => setVenues(d || [])).catch(() => {});
  }, []);

  function handlePromptClick(fill) {
    setSearchQuery(fill);
    setIntentExpanded(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/downtown-perks/explore${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  }

  function handleOpenMap() {
    navigate("/downtown-perks/explore");
  }

  const filteredVenues = venues.filter(v => {
    if (!searchQuery) return true;
    return v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section className="relative w-full min-h-screen overflow-hidden">

      {/* ── FULL-SCREEN BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        {/* Austin photo background */}
        <img
          src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
          alt="Downtown Austin"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Light overlay so card reads clearly */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/50 pointer-events-none" />
        {/* Map layer on top, semi-transparent */}
        <div className="absolute inset-0" style={{ opacity: 0.32 }}>
          <MapContainer
            center={DOWNTOWN_AUSTIN}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {filteredVenues.filter(v => v.latitude && v.longitude).map((venue) => (
              <Marker key={venue.id} position={[venue.latitude, venue.longitude]} icon={createVenueIcon(venue.category)}>
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold">{venue.name}</div>
                    <div className="text-gray-500 capitalize">{venue.category}</div>
                    {venue.perk_value && <div className="text-amber-600 mt-1">Perk: {venue.perk_value}</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ── GLASSMORPHIC OVERLAY CARD ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-32">

        {/* Brand tag */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="text-[11px] font-medium text-foreground/50 uppercase tracking-[0.24em]">
            Downtown Perks
          </span>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full max-w-3xl rounded-[30px] border border-white/20 bg-white/[0.88] p-6 md:p-8 shadow-[0_28px_70px_rgba(14,28,54,0.28)] backdrop-blur-2xl"
        >
          {/* Headline */}
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl md:text-[56px] font-semibold tracking-[-0.03em] text-[hsl(218,42%,14%)] leading-[1.08]">
              Where downtown meets you
            </h1>
            <p className="mt-3 text-sm md:text-base leading-6 text-[hsl(218,20%,44%)]">
              Everything nearby — in one map.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-[18px] border border-[hsl(218,20%,86%)] bg-white px-4 py-3 shadow-sm focus-within:border-primary/40 transition-colors">
            <Search className="h-4 w-4 text-foreground/50 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIntentExpanded(true)}
              placeholder="Where should I go right now?"
              className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/40 outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-foreground/40 hover:text-foreground/60 text-xs transition-colors">✕</button>
            )}
          </form>

          {/* Intent prompts dropdown */}
          <AnimatePresence>
            {intentExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-xl mt-2 rounded-2xl border border-[hsl(218,20%,88%)] bg-white shadow-lg overflow-hidden divide-y divide-[hsl(218,20%,92%)]"
              >
                {INTENT_PROMPTS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(item.fill)}
                    className="w-full text-left px-4 py-3.5 hover:bg-[hsl(42,24%,97%)] transition-colors group"
                  >
                    <div className="text-[11px] font-semibold text-primary/80 uppercase tracking-[0.12em] mb-0.5 group-hover:text-primary transition-colors">{item.q}</div>
                    <div className="text-[12px] text-foreground/60 leading-relaxed">{item.a}</div>
                  </button>
                ))}
                <button
                  onClick={() => setIntentExpanded(false)}
                  className="w-full px-4 py-2.5 text-[11px] text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter chips */}
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2.5">
            {FILTER_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isActive = activeChip === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => setActiveChip(chip.label)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold tracking-[0.01em] transition-all ${
                    isActive
                      ? "border-primary/40 bg-primary/8 text-primary"
                      : "border-[hsl(218,20%,88%)] bg-white text-foreground/70 hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleOpenMap}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-[14px] px-6 text-base font-medium min-w-[160px] bg-[hsl(218,42%,14%)] text-white shadow-[0_8px_24px_rgba(14,28,54,.2)] hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(14,28,54,.26)] active:translate-y-0 transition-all duration-200"
            >
              Open map <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIntentExpanded(true)}
              className="inline-flex items-center justify-center gap-2 h-12 rounded-[14px] px-6 text-base font-medium min-w-[160px] border border-[hsl(218,20%,86%)] bg-white text-foreground hover:border-primary/30 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
            >
              Ask the map
            </button>
          </div>
        </motion.div>

        {/* Location count below card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex items-center gap-2"
        >
          <span className="text-[12px] text-foreground/45">
            {venues.length > 0 ? venues.length : "155"} mapped locations · 78701 Austin
          </span>
        </motion.div>
      </div>

      {/* Click-outside to dismiss intent dropdown */}
      {intentExpanded && (
        <div className="fixed inset-0 z-[5]" onClick={() => setIntentExpanded(false)} />
      )}
    </section>
  );
}