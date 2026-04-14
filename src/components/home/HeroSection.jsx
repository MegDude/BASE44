import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
  restaurant: "#C8973A",
  bar: "#A07830",
  fitness: "#5B9E6E",
  wellness: "#7B9EC8",
  beauty: "#C87890",
  retail: "#8B78C8",
  entertainment: "#C85858",
  coworking: "#78B0C8",
  hotel: "#C8A058",
  default: "#C8973A",
};

function createVenueIcon(category) {
  const color = categoryColors[category] || categoryColors.default;
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 6px ${color}60"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

const filterTabs = ["All", "Places", "Offers", "Events", "Properties"];
const categoryFilters = ["Coffee", "Dining", "Nightlife", "Wellness", "Shopping"];

const DOWNTOWN_AUSTIN = [30.2672, -97.7431];

export default function HeroSection() {
  const [venues, setVenues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    base44.entities.Venue.list().then((data) => setVenues(data || [])).catch(() => {});
  }, []);

  const filteredVenues = venues.filter((v) => {
    if (activeCategory && v.category !== activeCategory.toLowerCase() && !v.category?.includes(activeCategory.toLowerCase())) return false;
    if (searchQuery && !v.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 18% 40%) 1px, transparent 1px)",
          backgroundSize: "56px 56px"
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-12 flex-1 flex flex-col">
        {/* Brand tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pin-pulse" />
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em]">
            Downtown Perks · Real-time Downtown · Austin, TX
          </span>
        </motion.div>

        {/* Hero grid: copy left, map right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1">

          {/* LEFT: Copy + Search intent */}
          <div className="flex flex-col justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5"
              >
                Where downtown
                <br />
                <em className="text-primary">meets you.</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg"
              >
                Built for people who actually live here — and the places that make it feel like home. Coffee to dinner, live events, and the perks you didn't know you had. All in one place. No extra apps. No logins.
              </motion.p>

              {/* Search intent cards */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="space-y-2.5 mb-8"
              >
                {[
                  { q: "Where do you want to go?", a: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance." },
                  { q: "What do you want to do?", a: "See what's on tonight. Find something worth showing up for." },
                  { q: "Who do you want to meet?", a: "See who's going. Join in. Make a plan." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-lg border border-border/40 bg-card/40 hover:border-primary/20 transition-all cursor-default"
                  >
                    <div className="w-1 h-full rounded-full bg-primary/30 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-medium text-primary/60 uppercase tracking-[0.12em] mb-1">{item.q}</div>
                      <div className="text-[13px] text-muted-foreground leading-relaxed">{item.a}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to="/downtown-perks/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-md shadow-primary/15"
                >
                  <MapPin className="w-4 h-4" /> Explore Downtown
                </Link>
                <Link
                  to="/downtown-perks/card"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground hover:border-border transition-all duration-300"
                >
                  Get Your Perks Card
                </Link>
                <Link
                  to="/downtown-perks/for-buildings"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/40 text-muted-foreground font-medium text-sm hover:text-foreground transition-all duration-300"
                >
                  Become a Partner
                </Link>
              </motion.div>
            </div>

            {/* Location count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              <span className="text-[12px] text-muted-foreground/60">
                {venues.length > 0 ? venues.length : "155"} mapped locations · 78701 Austin
              </span>
            </motion.div>
          </div>

          {/* RIGHT: Live Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="flex flex-col gap-3"
          >
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2.5 bg-card/70 border border-border/50 rounded-full px-4 py-2.5 focus-within:border-primary/40 transition-colors">
                <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search downtown Austin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-foreground placeholder-muted-foreground/40 outline-none"
                />
              </div>
              <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">
                Ask
              </button>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {["All", ...categoryFilters].map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === "All" ? null : cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                    (cat === "All" && !activeCategory) || activeCategory === cat
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button className="px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-border/40 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
                Market
              </button>
              <button className="px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-border/40 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
                Crowd
              </button>
              <button className="px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-border/40 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
                Perks
              </button>
            </div>

            {/* Map filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {filterTabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                    activeFilter === tab
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* THE MAP */}
            <div className="relative rounded-xl overflow-hidden border border-border/50 flex-1 min-h-[360px]">
              <MapContainer
                center={DOWNTOWN_AUSTIN}
                zoom={14}
                style={{ height: "100%", width: "100%", minHeight: "360px" }}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {filteredVenues.filter(v => v.latitude && v.longitude).map((venue) => (
                  <Marker
                    key={venue.id}
                    position={[venue.latitude, venue.longitude]}
                    icon={createVenueIcon(venue.category)}
                  >
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

              {/* Map overlay legend */}
              <div className="absolute bottom-3 left-3 flex gap-2 z-[400]">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-background/90 border border-border/50 text-[11px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/80" />
                  Perk available
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-background/90 border border-border/50 text-[11px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  Place
                </div>
              </div>

              {/* Results count */}
              <div className="absolute top-3 right-3 z-[400]">
                <div className="px-2.5 py-1.5 rounded-full bg-background/90 border border-border/50 text-[11px] text-muted-foreground">
                  {filteredVenues.length > 0 ? filteredVenues.length : "155"} results
                </div>
              </div>
            </div>

            {/* Quick venue preview */}
            <div className="flex gap-2">
              <Link
                to="/downtown-perks/explore"
                className="flex-1 flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/40 hover:border-primary/20 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] text-foreground">Jo's Coffee</div>
                  <div className="text-[11px] text-primary/60 truncate">Nearby perk · 5-min walk</div>
                </div>
                <span className="text-[11px] font-medium text-primary border border-primary/30 px-2 py-1 rounded-full flex-shrink-0">
                  Show Card
                </span>
              </Link>
              <Link
                to="/downtown-perks/explore"
                className="px-4 rounded-lg border border-border/40 bg-card/40 hover:border-primary/20 transition-all flex items-center justify-center text-[11px] text-muted-foreground hover:text-primary"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}