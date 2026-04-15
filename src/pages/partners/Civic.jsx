import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Users, TrendingUp, Activity, Building2, Zap, Star, ChevronRight, X } from "lucide-react";
import L from "leaflet";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── SHARED DEMO DATA ───────────────────────────────────────────────────────

const DISTRICTS = {
  congress: {
    id: "congress", name: "Congress", color: "#C8973A",
    programs: 3, rsvps: 184, views: 412, trend: "+18% this week",
    active: 3, buildingLinked: 1,
    topActivity: "Downtown Style Weekend",
    nearby: ["Public Art Walk", "Congress Clean Streets Briefing", "Rooftop Yoga at The Quincy"],
    center: [30.2660, -97.7431],
  },
  rainey: {
    id: "rainey", name: "Rainey", color: "#7B9EC8",
    programs: 2, rsvps: 96, views: 233, trend: "+9% this week",
    active: 1, buildingLinked: 1,
    topActivity: "Rainey Clean Corridor Morning",
    nearby: ["Rainey Resident Safety Walk", "Hotel Van Zandt Wellness Hour"],
    center: [30.2580, -97.7370],
  },
  waterloo: {
    id: "waterloo", name: "Waterloo", color: "#5B9E6E",
    programs: 2, rsvps: 71, views: 188, trend: "+11% this week",
    active: 1, buildingLinked: 1,
    topActivity: "Waterloo Sunset Series",
    nearby: ["Wellness Walk Club", "Waterloo Park Morning"],
    center: [30.2720, -97.7390],
  },
  redRiver: {
    id: "redRiver", name: "Red River", color: "#C85858",
    programs: 2, rsvps: 54, views: 165, trend: "+6% this week",
    active: 0, buildingLinked: 0,
    topActivity: "Red River Night Pulse",
    nearby: ["Venue Safety Activation"],
    center: [30.2645, -97.7360],
  },
};

const PROGRAMS = [
  {
    id: "style-weekend", name: "Downtown Style Weekend",
    type: "Civic activation", district: "Congress", schedule: "Fri–Sun · 78701",
    status: "This weekend",
    description: "A multi-day downtown activation connecting style, retail, hospitality, and walkable discovery.",
    venues: ["Fine Eyewear", "Hotel Van Zandt", "Neighbourhood coffee stop", "Local retail partner"],
    linked: ["The Quincy", "The Independent"],
    rsvps: 184, saves: 92, visits: 246,
    lat: 30.2660, lng: -97.7431,
    filter: "civic",
  },
  {
    id: "public-art", name: "Public Art Walk",
    type: "Community event", district: "Congress", schedule: "Saturdays · 10am",
    status: "This weekend",
    description: "A guided walk through public art installations in the Congress district, open to all residents.",
    venues: ["The Quincy", "Fine Eyewear"],
    linked: ["The Independent"],
    rsvps: 47, saves: 38, visits: 94,
    lat: 30.2670, lng: -97.7440,
    filter: "events",
  },
  {
    id: "clean-streets", name: "Congress Clean Streets Briefing",
    type: "Civic program", district: "Congress", schedule: "Mondays · 8am",
    status: "Active now",
    description: "Weekly district briefing connecting building managers, businesses, and residents around cleanliness and safety.",
    venues: ["The Quincy"],
    linked: [],
    rsvps: 22, saves: 15, visits: 41,
    lat: 30.2655, lng: -97.7425,
    filter: "civic",
  },
  {
    id: "rainey-morning", name: "Rainey Clean Corridor Morning",
    type: "Neighborhood program", district: "Rainey", schedule: "Tuesdays · 7am",
    status: "Active now",
    description: "Early morning corridor activation with residents, local businesses, and neighborhood group volunteers.",
    venues: ["Hotel Van Zandt"],
    linked: [],
    rsvps: 38, saves: 24, visits: 61,
    lat: 30.2580, lng: -97.7370,
    filter: "community",
  },
  {
    id: "safety-walk", name: "Rainey Resident Safety Walk",
    type: "Community event", district: "Rainey", schedule: "Thursdays · 7pm",
    status: "Tonight",
    description: "Resident-led safety and community walk through Rainey Street with local group coordination.",
    venues: ["Hotel Van Zandt"],
    linked: [],
    rsvps: 29, saves: 18, visits: 44,
    lat: 30.2575, lng: -97.7365,
    filter: "community",
  },
  {
    id: "waterloo-sunset", name: "Waterloo Sunset Series",
    type: "Cultural programming", district: "Waterloo", schedule: "Fridays · 6pm",
    status: "Tonight",
    description: "Weekly outdoor performance series at Waterloo Park — music, art, and public space activation.",
    venues: ["Waterloo Greenway"],
    linked: ["The Independent"],
    rsvps: 71, saves: 49, visits: 113,
    lat: 30.2720, lng: -97.7390,
    filter: "events",
  },
  {
    id: "wellness-walk", name: "Wellness Walk Club",
    type: "Wellness program", district: "Waterloo", schedule: "Wednesdays · 7am",
    status: "This week",
    description: "Community morning walk for downtown residents and workers — starting at Waterloo Park.",
    venues: ["Waterloo Greenway"],
    linked: [],
    rsvps: 33, saves: 21, visits: 55,
    lat: 30.2715, lng: -97.7385,
    filter: "wellness",
  },
  {
    id: "red-river-pulse", name: "Red River Night Pulse",
    type: "Safety + hospitality activation", district: "Red River", schedule: "Fri–Sat · 9pm",
    status: "Active now",
    description: "Live safety and hospitality activation during peak Red River nightlife hours — real-time district visibility.",
    venues: ["Venue Safety Activation"],
    linked: [],
    rsvps: 54, saves: 32, visits: 88,
    lat: 30.2645, lng: -97.7360,
    filter: "hospitality",
  },
  {
    id: "venue-safety", name: "Venue Safety Activation",
    type: "Civic / hospitality", district: "Red River", schedule: "Weekends",
    status: "This weekend",
    description: "Coordinated venue safety activation working with businesses and district partners on Red River corridor.",
    venues: [],
    linked: [],
    rsvps: 12, saves: 8, visits: 22,
    lat: 30.2640, lng: -97.7355,
    filter: "civic",
  },
];

const ORGS = [
  {
    id: "daa", name: "Downtown Austin Alliance", programs: 2,
    desc: "District-level organization focused on downtown experience, activation, mobility, and placemaking.",
    chip: "City & policy",
  },
  {
    id: "visit-austin", name: "Visit Austin", programs: 1,
    desc: "Visitor and event partner helping people discover what's happening downtown.",
    chip: "District programs",
  },
  {
    id: "rainey-group", name: "Rainey Street Neighborhood Group", programs: 2,
    desc: "Neighborhood organization focused on livability, local communication, and community activity.",
    chip: "Community groups",
  },
  {
    id: "waterloo", name: "Waterloo Greenway", programs: 2,
    desc: "Public space and cultural organization connected to park programming and civic events.",
    chip: "District programs",
  },
  {
    id: "arts-network", name: "City Cultural Arts Network", programs: 1,
    desc: "Arts and cultural organization supporting installations, performances, and public programming represented across the downtown map.",
    chip: "Community groups",
  },
];

const NETWORK_CHIPS = ["City & policy", "District programs", "Buildings & residents", "Community groups", "Hospitality", "Wellness & movement"];

const LIVE_FEED = [
  { name: "Downtown Style Weekend", district: "Congress", status: "This weekend", id: "style-weekend" },
  { name: "Rainey Clean Corridor Morning", district: "Rainey", status: "Active now", id: "rainey-morning" },
  { name: "Waterloo Sunset Series", district: "Waterloo", status: "Tonight", id: "waterloo-sunset" },
  { name: "Red River Night Pulse", district: "Red River", status: "Active now", id: "red-river-pulse" },
];

const MAP_FILTERS = [
  { id: "all", label: "All", count: 24 },
  { id: "civic", label: "Civic", count: 8 },
  { id: "districts", label: "Districts", count: 4 },
  { id: "buildings", label: "Buildings", count: 3 },
  { id: "events", label: "Events", count: 5 },
  { id: "community", label: "Community", count: 4 },
  { id: "hospitality", label: "Hospitality", count: 2 },
  { id: "wellness", label: "Movement", count: 2 },
];

const STATUS_COLORS = {
  "Active now": "bg-green-500/20 text-green-400 border-green-500/30",
  "Tonight": "bg-primary/20 text-primary border-primary/30",
  "This weekend": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "This week": "bg-muted text-muted-foreground border-border/50",
};

// ─── ANIMATED COUNT UP ───────────────────────────────────────────────────────

function CountUp({ to, duration = 1.2 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, {
      duration,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return controls.stop;
  }, [isInView, to]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

// ─── MAP MARKERS ──────────────────────────────────────────────────────────────

function civicIcon(color = "#C8973A", size = 10) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.75);box-shadow:0 0 8px ${color}70"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function districtIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:3px;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px ${color}90;transform:rotate(45deg)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 });
  }, [center]);
  return null;
}

// ─── CIVIC PAGE ───────────────────────────────────────────────────────────────

export default function CivicPartner() {
  const [mapFilter, setMapFilter] = useState("all");
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [networkChip, setNetworkChip] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.2660, -97.7410]);
  const [formType, setFormType] = useState("civic");
  const [formText, setFormText] = useState("");

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  // Filter programs for map
  const visiblePrograms = mapFilter === "all"
    ? PROGRAMS
    : PROGRAMS.filter(p => p.filter === mapFilter || mapFilter === "districts");

  const visibleDistricts = ["all", "districts"].includes(mapFilter) ? Object.values(DISTRICTS) : [];

  function openDistrict(id) {
    setActiveDistrict(id);
    setActiveProgram(null);
    const d = DISTRICTS[id];
    if (d) setMapCenter(d.center);
  }

  function openProgram(id) {
    setActiveProgram(id);
    setActiveDistrict(null);
    const p = PROGRAMS.find(x => x.id === id);
    if (p) setMapCenter([p.lat, p.lng]);
  }

  const district = activeDistrict ? DISTRICTS[activeDistrict] : null;
  const program = activeProgram ? PROGRAMS.find(p => p.id === activeProgram) : null;

  const filteredOrgs = networkChip
    ? ORGS.filter(o => o.chip === networkChip)
    : ORGS;

  const networkDesc = {
    "City & policy": "City agencies, district managers, and policy groups shaping the downtown experience.",
    "District programs": "Organizations running active programs across specific downtown corridors.",
    "Buildings & residents": "Residential and commercial buildings adding civic context for residents.",
    "Community groups": "Neighborhood and community organizations generating local activity.",
    "Hospitality": "Hospitality partners supporting district-level programming and activation.",
    "Wellness & movement": "Wellness organizations running recurring walks, classes, and movement activations.",
  };

  const FORM_TYPES = ["Property", "Hotel", "Venue", "Brand", "Civic"];
  const PROMPTS = [
    "Help me write this",
    "We're planning a downtown weekend activation.",
    "We need help getting visibility for a public event.",
    "We want to connect multiple districts.",
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="pt-36 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(hsl(222 18% 40%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 18% 40%) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link to="/brands" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Partner Directory
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
                Civic Layer · Downtown Austin · 78701
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-5">
                Make downtown programs<br />
                <em className="text-primary">easier to find and join.</em>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
                District events, public programs, and civic initiatives show up on the same map people use to find dining, places, and things to do — alongside everything else happening nearby.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15">
                 List your organization <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#civic-map" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
                 See what is active
                </a>
              </div>
            </motion.div>

            {/* Hero stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                {/* Top strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40 border-b border-border/40">
                  {[
                    { label: "Active now", value: 5 },
                    { label: "Districts live", value: 4 },
                    { label: "Programs this week", value: 8 },
                    { label: "Map views", value: 10880 },
                  ].map((s, i) => (
                    <div key={i} className="p-5 text-center">
                      <div className="font-heading text-2xl font-medium text-foreground tracking-tight">
                        <CountUp to={s.value} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Secondary strip */}
                <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
                  {[
                    { label: "Saves", value: 495 },
                    { label: "RSVPs", value: 327 },
                    { label: "Visits", value: 246 },
                  ].map((s, i) => (
                    <div key={i} className="p-3.5 text-center">
                      <div className="font-medium text-sm text-foreground"><CountUp to={s.value} /></div>
                      <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground/60">Updated 2 min ago</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CIVIC MAP ───────────────────────────────────────────────── */}
      <section id="civic-map" className="fixed inset-0 pt-[68px] flex flex-col bg-muted/10">
        <div className="flex-1 relative w-full h-full flex flex-col">
          {/* Header + filters (floating at top) */}
          <div className="absolute top-0 left-0 right-0 z-20 px-6 py-6 bg-gradient-to-b from-background/95 to-background/50 backdrop-blur-md border-b border-border/20">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 items-end">
                <div>
                  <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Civic Layer</span>
                  <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
                    Four districts. All on the map.
                  </h2>
                </div>
                <p className="text-muted-foreground text-[13px] leading-relaxed hidden md:block">
                  Select any district or program pin to see what is currently active.
                </p>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {MAP_FILTERS.map((f) => (
                  <button key={f.id} onClick={() => { setMapFilter(f.id); setActiveDistrict(null); setActiveProgram(null); }}
                    className={`px-3.5 py-2 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                      mapFilter === f.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label} <span className={`ml-1.5 text-[10px] ${mapFilter === f.id ? "text-primary/70" : "text-muted-foreground/50"}`}>{f.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map (always visible) */}
          <div className="flex-1 relative mt-[180px] md:mt-[140px]">
              <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={true} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                <MapController center={mapCenter} />

                {/* District markers */}
                {visibleDistricts.map(d => (
                  <Marker key={d.id} position={d.center} icon={districtIcon(d.color)}
                    eventHandlers={{ click: () => openDistrict(d.id) }}>
                    <Popup><div className="text-xs font-semibold">{d.name} District</div></Popup>
                  </Marker>
                ))}

                {/* Program markers */}
                {visiblePrograms.map(p => {
                  const dColor = Object.values(DISTRICTS).find(d => d.name === p.district)?.color || "#C8973A";
                  return (
                    <Marker key={p.id} position={[p.lat, p.lng]} icon={civicIcon(dColor)}
                      eventHandlers={{ click: () => openProgram(p.id) }}>
                      <Popup>
                        <div className="text-xs">
                          <div className="font-semibold mb-0.5">{p.name}</div>
                          <div className="text-gray-400">{p.district} · {p.type}</div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Drawer panel (floating right on desktop, bottom on mobile) */}
              <div className="absolute bottom-0 right-0 md:top-0 w-full md:w-96 h-1/2 md:h-[calc(100%-140px)] md:mt-[140px] rounded-t-2xl md:rounded-none border border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden flex flex-col z-30 md:shadow-lg">
              {!district && !program && (
                <div className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Live Feed</div>
                    <p className="text-[12px] text-muted-foreground/60">A quick read on what is active across the map right now.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                    {LIVE_FEED.map((item) => (
                      <button key={item.id} onClick={() => openProgram(item.id)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0 group-hover:bg-primary transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[13px] text-foreground truncate">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{item.district}</div>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[item.status]}`}>
                          {item.status}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 border-t border-border/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Districts</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(DISTRICTS).map(d => (
                        <button key={d.id} onClick={() => openDistrict(d.id)}
                          className="p-2.5 rounded-lg border border-border/40 hover:border-primary/30 transition-all text-left">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12px] font-medium text-foreground">{d.name}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">{d.programs} programs</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* District Drawer */}
              {district && (
                <motion.div key={district.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: district.color }} />
                      <span className="font-medium text-foreground">{district.name} District</span>
                    </div>
                    <button onClick={() => setActiveDistrict(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Active now", value: district.active },
                        { label: "Building-linked", value: district.buildingLinked },
                        { label: "Programs", value: district.programs },
                      ].map((s, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-xl font-medium text-foreground">{s.value}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[12px] font-medium text-foreground">Trend</div>
                      <div className="text-[12px] font-medium text-primary">{district.trend}</div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Top activity</div>
                      <div className="text-sm font-medium text-foreground">{district.topActivity}</div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Nearby</div>
                      <div className="space-y-1.5">
                        {district.nearby.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Activity</div>
                      <div className="flex gap-3 text-[12px] text-muted-foreground">
                        <span>{district.rsvps} RSVPs</span>
                        <span>·</span>
                        <span>{district.views} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">
                      View district
                    </button>
                    <button className="flex-1 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">
                      View nearby
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Program Drawer */}
              {program && (
                <motion.div key={program.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{program.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{program.type}</div>
                    </div>
                    <button onClick={() => setActiveProgram(null)} className="text-muted-foreground hover:text-foreground transition-colors ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[program.status] || STATUS_COLORS["This week"]}`}>
                        {program.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{program.district} · {program.schedule}</span>
                    </div>

                    <p className="text-[13px] text-muted-foreground leading-relaxed">{program.description}</p>

                    {program.venues.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Participating venues</div>
                        <div className="space-y-1">
                          {program.venues.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {program.linked.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2">Linked places</div>
                        <div className="space-y-1">
                          {program.linked.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 text-[12px] text-foreground/70">
                              <div className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "RSVPs", value: program.rsvps },
                        { label: "Saves", value: program.saves },
                        { label: "Visits", value: program.visits },
                      ].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
                          <div className="font-heading text-lg font-medium text-foreground">{s.value}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-border/40 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-all">
                      RSVP
                    </button>
                    <button className="flex-1 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">
                      Save
                    </button>
                    <button className="px-4 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[12px] font-medium hover:text-foreground transition-all">
                      Nearby
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT SUMMARY ──────────────────────────────────────────── */}
      <ImpactSection />

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── DISTRICT INTELLIGENCE ───────────────────────────────────── */}
      <DistrictIntelligence districts={DISTRICTS} openDistrict={openDistrict} />

      {/* ── CIVIC PARTNER NETWORK ───────────────────────────────────── */}
      <NetworkSection orgs={filteredOrgs} allOrgs={ORGS} chips={NETWORK_CHIPS} activeChip={networkChip} setChip={setNetworkChip} desc={networkDesc} />

      {/* ── FROM ACTIVITY TO RESPONSE ───────────────────────────────── */}
      <ActivityStrip />

      {/* ── PARTNER FORM ────────────────────────────────────────────── */}
      <PartnerForm formType={formType} setFormType={setFormType} formText={formText} setFormText={setFormText} />

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">Civic Layer</span>
              <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-4">
                Your programs belong on this map.
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Public activity is already here. Add what your organization is running.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Six organizations are listed. Getting on the map takes less than a day.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#partner-form" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                  List your organization <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#civic-map" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/70 font-medium text-sm hover:text-foreground transition-all">
                  See what is active
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Activity Summary</span>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              What public participation looks like across the map.
            </h2>
          </div>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { label: "Map views", value: 10880 },
            { label: "Saves", value: 495 },
            { label: "RSVPs", value: 327 },
            { label: "Visits", value: 246 },
            { label: "Participation", value: 402 },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }}
              className="p-5 rounded-lg border border-border/50 bg-card/40 text-center">
              <div className="font-heading text-2xl font-medium text-foreground tracking-tight">
                <CountUp to={s.value} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Live now", value: "5", sub: "programs active" },
            { label: "District activity", value: "8", sub: "this week" },
            { label: "Building-linked", value: "3", sub: "places connected" },
            { label: "Recurring series", value: "2", sub: "weekly programs" },
            { label: "Movement activity", value: "Moderate", sub: "across districts" },
            { label: "Map coverage", value: "100%", sub: "all 4 districts" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.05 }}
              className="p-4 rounded-lg border border-border/40 bg-card/20">
              <div className="font-heading text-lg font-medium text-foreground">{s.value}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground/50 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const steps = [
    { n: "1", label: "Add the activity", detail: "A district team, civic group, or partner adds something happening." },
    { n: "2", label: "Place it on the map", detail: "It appears in the right downtown context, tied to district and location." },
    { n: "3", label: "Make it visible", detail: "Residents and visitors nearby see it in their feed and on the map." },
    { n: "4", label: "Connect it to place", detail: "Buildings, venues, and linked places surface alongside the activity." },
    { n: "5", label: "See the response", detail: "RSVPs, saves, and visits create a measurable signal for every program." },
  ];
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How it works</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              From activity to response.
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.7, delay: 0.15 }}
            className="text-muted-foreground text-[13px] leading-relaxed">
            A district group, civic organization, or program team adds what is happening. It appears on the map in context — tied to location, time, and the people nearby who can act on it.
          </motion.p>
        </div>

        {/* Steps with connector */}
        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.1 }}
                className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-10 h-10 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-4 z-10">
                  <span className="text-primary font-heading font-medium text-sm">{s.n}</span>
                </div>
                <div className="font-medium text-sm text-foreground mb-1.5">{s.label}</div>
                <div className="text-[12px] text-muted-foreground leading-relaxed">{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Proof strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "8 live civic items",
            "4 districts connected",
            "3 linked places",
            "2 hospitality-supported moments",
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-card/20">
              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              <span className="text-[12px] text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DistrictIntelligence({ districts, openDistrict }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">District Intelligence</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              By district, in numbers.
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active now", value: "5" },
              { label: "Building-linked", value: "3" },
              { label: "Recurring series", value: "2" },
              { label: "Movement", value: "Moderate" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40 bg-card/20 text-center">
                <div className="font-heading text-lg font-medium text-foreground">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(districts).map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}
              onClick={() => openDistrict(d.id)}
              className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 cursor-pointer transition-all group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="font-heading font-medium text-sm text-foreground">{d.name}</span>
              </div>

              {/* Mini activity bar */}
              <div className="h-1.5 rounded-full bg-border/50 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${Math.min(100, (d.rsvps / 200) * 100)}%` } : {}}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: d.color }}
                />
              </div>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Programs</span><span className="text-foreground font-medium">{d.programs}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>RSVPs</span><span className="text-foreground font-medium">{d.rsvps}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Views</span><span className="text-foreground font-medium">{d.views}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Trend</span><span className="text-primary font-medium">{d.trend}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Hotspot</div>
                <div className="text-[12px] text-foreground truncate">{d.topActivity}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkSection({ orgs, allOrgs, chips, activeChip, setChip, desc }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Civic Partner Network</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              Organizations already on the map.
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
            className="text-muted-foreground text-[13px] leading-relaxed">
            {activeChip ? desc[activeChip] : "District groups, cultural organizations, and neighborhood programs contributing to what people see and do downtown."}
          </motion.p>
        </div>

        {/* Chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {chips.map((chip) => (
            <button key={chip} onClick={() => setChip(activeChip === chip ? null : chip)}
              className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all ${
                activeChip === chip ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org, i) => (
            <motion.div key={org.id} initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}
              className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="font-heading font-medium text-sm text-foreground leading-snug">{org.name}</div>
                <span className="text-[11px] font-medium text-primary/70 whitespace-nowrap">{org.programs} {org.programs === 1 ? "program" : "programs"} live</span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{org.desc}</p>
              <div className="mt-3 pt-3 border-t border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground/60 border border-border/40 px-2.5 py-1 rounded-full">{org.chip}</span>
              </div>
            </motion.div>
          ))}
          {/* "Your org" card */}
          {orgs.length < 5 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: orgs.length * 0.07 }}
              className="p-5 rounded-xl border border-dashed border-border/40 hover:border-primary/30 transition-all flex flex-col items-center justify-center text-center min-h-[120px] group cursor-pointer">
              <div className="text-[12px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">Your organization</div>
              <div className="text-[11px] text-muted-foreground/30 mt-1">Add it to the civic layer</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function ActivityStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const steps = [
    { label: "Activate", detail: "Add the activity to the map." },
    { label: "Show", detail: "Visible to people nearby." },
    { label: "Connect", detail: "Tied to place and district." },
    { label: "Engage", detail: "RSVPs, saves, shares." },
    { label: "Measure", detail: "30/60/90-day read." },
  ];
  return (
    <section ref={ref} className="py-14 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="grid grid-cols-5 gap-2 relative">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-4">
                <div className="w-8 h-8 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-3 z-10">
                  <span className="text-primary text-[11px] font-medium">{i + 1}</span>
                </div>
                <div className="font-medium text-xs text-foreground mb-1">{s.label}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed hidden md:block">{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerForm({ formType, setFormType, formText, setFormText }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const TYPES = ["Property", "Hotel", "Venue", "Brand", "Civic"];
  const PROMPTS = [
    "Help me write this",
    "We're planning a downtown weekend activation.",
    "We need help getting visibility for a public event.",
    "We want to connect multiple districts.",
  ];
  return (
    <section id="partner-form" ref={ref} className="py-16 px-6 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Get Started</span>
            <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-tight">
              List your organization or program.
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
            className="text-muted-foreground text-[13px] leading-relaxed">
            Share what is happening, where, and what kind of response you want to generate. We will help you get it on the map.
          </motion.p>
        </div>

        <div className="border border-border/50 rounded-xl overflow-hidden">
          {/* Type tabs */}
          <div className="flex border-b border-border/40 overflow-x-auto">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setFormType(t)}
                className={`px-6 py-4 text-[12px] font-medium whitespace-nowrap border-r border-border/40 last:border-r-0 transition-all ${
                  formType === t ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Form */}
            <div className="p-8 md:border-r border-border/40 space-y-4">
              {[
                { label: "Organization Name", type: "text" },
                { label: "Your Name & Role", type: "text" },
                { label: "Email", type: "email" },
                { label: "Phone", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{f.label}</label>
                  <input type={f.type} className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">What's happening</label>
                <textarea
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Tell us what is happening, where it is happening, and what kind of response you want to drive."
                  className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30"
                />
              </div>
              <button className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
                Integrate your organization
              </button>
            </div>

            {/* Prompts panel */}
            <div className="p-8 bg-muted/10 flex flex-col">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Prompts</div>
              <div className="space-y-2 flex-1">
                {PROMPTS.map((p) => (
                  <button key={p} onClick={() => setFormText(p === "Help me write this" ? "" : p)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border/40 hover:border-primary/30 text-[13px] text-muted-foreground hover:text-foreground transition-all">
                    {p}
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/40 space-y-1">
                <p className="text-[12px] text-muted-foreground/60 italic">
                  Questions?{" "}
                  <a href="mailto:civic@downtownperks.com" className="text-primary hover:underline underline-offset-4">
                    civic@downtownperks.com
                  </a>
                </p>
                <p className="text-[11px] text-muted-foreground/40">Downtown Perks · Powered by Boop · Austin, Texas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}