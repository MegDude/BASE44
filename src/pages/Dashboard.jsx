import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, MapPin, Star, Calendar, TrendingUp, Settings,
  Menu, X, ChevronRight, Bell, Building2, Users, ArrowRight,
  Zap, Activity
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "map", label: "Map activity", icon: MapPin },
  { id: "perks", label: "Perks", icon: Star },
  { id: "events", label: "Events", icon: Calendar },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

const PUBLIC_DASHBOARD_USER = {
  email: "partner@downtownperks.local",
  full_name: "Partner Workspace",
};

const DEMO_PERKS = [
  {
    id: "demo-perk-van-zandt",
    title: "Resident rate at Geraldine's",
    venue_name: "Hotel Van Zandt",
    category: "members_rate",
    status: "active",
    value: "15% resident dining",
    redemption_count: 38,
  },
  {
    id: "demo-perk-legends",
    title: "Downtown listing request",
    venue_name: "Legends Real Estate",
    category: "experience",
    status: "active",
    value: "Showing request",
    redemption_count: 21,
  },
  {
    id: "demo-perk-bangers",
    title: "Rainey lunch add-on",
    venue_name: "Banger's",
    category: "free_item",
    status: "active",
    value: "Free side with entree",
    redemption_count: 44,
  },
  {
    id: "demo-perk-seaholm",
    title: "Morning coffee walk",
    venue_name: "Merit Coffee Seaholm",
    category: "discount",
    status: "active",
    value: "$2 resident drip",
    redemption_count: 56,
  },
];

const DEMO_EVENTS = [
  {
    id: "demo-event-rooftop",
    title: "Rooftop resident mixer",
    venue_name: "The Bowie",
    category: "social",
    status: "upcoming",
    rsvp_count: 86,
  },
  {
    id: "demo-event-music",
    title: "Live music before dinner",
    venue_name: "Antone's Nightclub",
    category: "nightlife",
    status: "live",
    rsvp_count: 124,
  },
  {
    id: "demo-event-wellness",
    title: "Saturday wellness walk",
    venue_name: "Lady Bird Lake",
    category: "wellness",
    status: "upcoming",
    rsvp_count: 49,
  },
];

const DEMO_REPORT_ROWS = [
  { district: "Rainey", signal: "Evening dining and nightlife", scans: "4,820", saves: "612", actions: "29%", next: "Run a 6-10 PM resident perk." },
  { district: "Seaholm", signal: "Coffee, lunch, and property traffic", scans: "3,940", saves: "488", actions: "24%", next: "Pair coffee offers with leasing tours." },
  { district: "West 6th", signal: "After-work drinks and event plans", scans: "3,210", saves: "371", actions: "21%", next: "Share music and dinner before 5 PM." },
  { district: "Congress", signal: "Hotel guests and public events", scans: "2,780", saves: "304", actions: "18%", next: "Add QR entry points for guests." },
];

export default function Dashboard() {
  const location = useLocation();
  const isReportsRoute = location.pathname.includes("reports") || location.pathname.includes("analytics");
  const [user, setUser] = useState(PUBLIC_DASHBOARD_USER);
  const [section, setSection] = useState(isReportsRoute ? "performance" : "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => setUser(u || PUBLIC_DASHBOARD_USER)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isReportsRoute) setSection("performance");
  }, [isReportsRoute]);

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-[68px] flex items-center px-5 border-b border-border/40 gap-2.5">
          <div className="w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-primary" />
          </div>
          <span className="font-heading font-medium text-[13px] tracking-normal">
            Downtown<span className="text-primary"> Perks</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="mb-2 px-3">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-[0.14em]">Partner Dashboard</span>
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border/40 space-y-1">
          <Link to="/partner-workspace" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
            <Zap className="w-3.5 h-3.5" /> Workspace
          </Link>
          <Link to="/map?mode=partner&tab=map" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
            <MapPin className="w-3.5 h-3.5" /> Partner map
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-medium text-primary shrink-0">
              {(user.full_name || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-foreground truncate">{user.full_name || "Partner"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="h-[68px] flex items-center justify-between px-5 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-medium text-[13px] tracking-normal text-foreground capitalize">
                {NAV_ITEMS.find(n => n.id === section)?.label || "Dashboard"}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Downtown Perks · Partner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <Link to="/partner-workspace" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/60 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-all">
              Workspace <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {section === "overview" && <DashOverview key="overview" user={user} setSection={setSection} />}
            {section === "map" && <DashMap key="map" user={user} />}
            {section === "perks" && <DashPerks key="perks" user={user} />}
            {section === "events" && <DashEvents key="events" user={user} />}
            {section === "performance" && <DashPerformance key="performance" user={user} />}
            {section === "settings" && <DashSettings key="settings" user={user} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function DashOverview({ user, setSection }) {
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Perk.filter({ created_by: user.email }),
      base44.entities.Event.filter({ created_by: user.email }),
    ]).then(([p, e]) => {
      setPerks(p || []);
      setEvents(e || []);
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, [user.email]);

  const activePerks = perks.filter(p => p.status === "active").length;
  const totalRedemptions = perks.reduce((acc, p) => acc + (p.redemption_count || 0), 0);
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "live").length;
  const totalRSVPs = events.reduce((acc, e) => acc + (e.rsvp_count || 0), 0);
  const hasLiveData = perks.length > 0 || events.length > 0;
  const reportPerks = perks.length ? perks : DEMO_PERKS;
  const reportEvents = events.length ? events : DEMO_EVENTS;

  const KPI_CARDS = [
    { label: "Active perks", value: hasLiveData ? activePerks : reportPerks.filter(p => p.status === "active").length, icon: Star, action: () => setSection("perks") },
    { label: "Total redemptions", value: hasLiveData ? totalRedemptions : reportPerks.reduce((acc, p) => acc + (p.redemption_count || 0), 0), icon: Zap, action: () => setSection("perks") },
    { label: "Upcoming events", value: hasLiveData ? upcomingEvents : reportEvents.filter(e => e.status === "upcoming" || e.status === "live").length, icon: Calendar, action: () => setSection("events") },
    { label: "Total RSVPs", value: hasLiveData ? totalRSVPs : reportEvents.reduce((acc, e) => acc + (e.rsvp_count || 0), 0), icon: Users, action: () => setSection("events") },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-heading text-xl font-medium text-foreground mb-1">
          Good to see you{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
        </h2>
        <p className="text-muted-foreground text-[13px]">
          {hasLiveData ? "Here is a snapshot of your downtown presence." : "Demo reporting is loaded so this page never opens empty."}
        </p>
      </div>

      {loadingData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl border border-border/40 bg-card/20 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPI_CARDS.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={k.action}
                className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 text-left transition-all group">
                <Icon className="w-4 h-4 text-primary/60 mb-3" />
                <div className="font-heading text-2xl font-medium text-foreground">{k.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{k.label}</div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Activity pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border/50 bg-card/40">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Perks on map</div>
            <button onClick={() => setSection("perks")} className="text-[11px] text-primary hover:underline underline-offset-4">Manage</button>
          </div>
          <div className="space-y-2">
              {reportPerks.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "active" ? "bg-[#B38F4F]" : "bg-muted-foreground/40"}`} />
                  <span className="text-[12px] text-foreground flex-1 truncate">{p.title}</span>
                  <span className="text-[11px] text-muted-foreground">{p.redemption_count || 0} redeem</span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/40">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Events on map</div>
            <button onClick={() => setSection("events")} className="text-[11px] text-primary hover:underline underline-offset-4">Manage</button>
          </div>
          <div className="space-y-2">
              {reportEvents.slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.status === "live" ? "bg-[#B38F4F]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <span className="text-[12px] text-foreground flex-1 truncate">{e.title}</span>
                  <span className="text-[11px] text-muted-foreground">{e.rsvp_count || 0} RSVPs</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      {!hasLiveData && (
        <div className="rounded-xl border border-[#B38F4F]/25 bg-[#F7F8FB] p-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#0B1F33]/58">Demo report mode</div>
          <p className="mt-2 text-[13px] leading-6 text-[#0B1F33]/68">
            These sample reports use realistic Downtown Perks activity across Rainey, Seaholm, West 6th, Congress, hotels, venues, properties, and brand placements. Live data replaces them automatically when a partner account has activity.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
        <div className="grid gap-0 md:grid-cols-4">
          {DEMO_REPORT_ROWS.map((row) => (
            <button
              key={row.district}
              type="button"
              onClick={() => setSection("performance")}
              className="border-b border-border/40 p-4 text-left transition hover:bg-muted/20 md:border-b-0 md:border-r last:border-r-0"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{row.district}</div>
              <div className="mt-2 text-[13px] font-medium text-foreground">{row.signal}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <span>{row.scans} scans</span>
                <span>{row.saves} saves</span>
              </div>
              <div className="mt-2 text-[11px] text-[#B38F4F]">{row.next}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "View partner types", sub: "Properties, hotels, venues, brands, civic", href: "/partners", icon: Building2 },
          { label: "Go to workspace", sub: "Add and edit your perks and events", href: "/partner-workspace", icon: Zap },
          { label: "Explore the map", sub: "See your presence on the live downtown map", href: "/map?mode=resident&tab=map", icon: MapPin },
        ].map((l, i) => {
          const Icon = l.icon;
          return (
            <Link key={i} to={l.href} className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/30 transition-all group bg-card/20">
              <Icon className="w-4 h-4 text-primary/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-foreground">{l.label}</div>
                <div className="text-[11px] text-muted-foreground">{l.sub}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── MAP ACTIVITY ─────────────────────────────────────────────────────────────

function DashMap({ user }) {
  const ACTIVITY = [
    { type: "Map view", detail: "Your perk appeared in search results", time: "2 min ago" },
    { type: "Save", detail: "A resident saved one of your offers", time: "14 min ago" },
    { type: "View", detail: "Profile opened from downtown map", time: "28 min ago" },
    { type: "RSVP", detail: "New RSVP on your latest event", time: "1 hr ago" },
    { type: "Redemption", detail: "Perk redeemed at your venue", time: "2 hr ago" },
    { type: "Map view", detail: "Appeared in 'wellness near Congress' search", time: "3 hr ago" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-xl font-medium text-foreground mb-1">Map activity</h2>
        <p className="text-muted-foreground text-[13px]">Recent interactions on the downtown map linked to your account.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Views today", value: "34" }, { label: "Saves this week", value: "12" }, { label: "Nearby searches", value: "8" }].map((s, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/40 text-center">
            <div className="font-heading text-xl font-medium text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
        <div className="p-5 border-b border-border/40 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Recent map activity</span>
        </div>
        <div className="divide-y divide-border/40">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
              <div className="flex-1">
                <div className="text-[12px] font-medium text-foreground">{a.type}</div>
                <div className="text-[11px] text-muted-foreground">{a.detail}</div>
              </div>
              <span className="text-[11px] text-muted-foreground/60 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border/40 bg-primary/5 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[12px] text-foreground font-medium">See your live map presence</p>
          <p className="text-[11px] text-muted-foreground">View how your content appears to people nearby on the map.</p>
        </div>
        <Link to="/map?mode=resident&tab=map" className="text-[12px] text-primary font-medium hover:underline underline-offset-4 shrink-0">
          Open the Map →
        </Link>
      </div>
    </motion.div>
  );
}

// ─── PERKS (DASHBOARD VIEW) ───────────────────────────────────────────────────

function DashPerks({ user }) {
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Perk.filter({ created_by: user.email })
      .then(data => { setPerks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.email]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-medium text-foreground mb-1">Perks</h2>
          <p className="text-muted-foreground text-[13px]">Manage from the workspace to add, edit, or remove perks.</p>
        </div>
        <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
          Manage perks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_PERKS.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium text-[13px] text-foreground">{p.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{p.venue_name}</div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30">demo</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-primary font-medium">{p.value}</span>
                <span className="text-muted-foreground">{p.redemption_count || 0} redemptions</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {perks.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium text-[13px] text-foreground">{p.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{p.venue_name}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  p.status === "active" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
                  "bg-muted text-muted-foreground border-border/50"
                }`}>{p.status}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-primary font-medium">{p.value}</span>
                <span className="text-muted-foreground">{p.redemption_count || 0} redemptions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── EVENTS (DASHBOARD VIEW) ──────────────────────────────────────────────────

function DashEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Event.filter({ created_by: user.email })
      .then(data => { setEvents(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.email]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-medium text-foreground mb-1">Events</h2>
          <p className="text-muted-foreground text-[13px]">Track your events, RSVPs, and activity from the dashboard.</p>
        </div>
        <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
          Manage events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="space-y-3">
          {DEMO_EVENTS.map(e => (
            <div key={e.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-[#B38F4F]" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] text-foreground">{e.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{e.venue_name || "—"} · {e.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-medium text-foreground">{e.rsvp_count || 0}</div>
                  <div className="text-[10px] text-muted-foreground">RSVPs</div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30">demo</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-[#B38F4F]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] text-foreground">{e.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{e.venue_name || "—"} · {e.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-medium text-foreground">{e.rsvp_count || 0}</div>
                  <div className="text-[10px] text-muted-foreground">RSVPs</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  e.status === "live" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
                  e.status === "upcoming" ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-muted text-muted-foreground border-border/50"
                }`}>{e.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── PERFORMANCE ──────────────────────────────────────────────────────────────

function DashPerformance({ user }) {
  const PERIODS = ["7 days", "30 days", "90 days"];
  const [period, setPeriod] = useState("30 days");

  const METRICS = [
    { label: "Map views", value: period === "7 days" ? "284" : period === "30 days" ? "1,140" : "3,420", change: "+12%" },
    { label: "Saves", value: period === "7 days" ? "38" : period === "30 days" ? "142" : "412", change: "+8%" },
    { label: "Visits", value: period === "7 days" ? "22" : period === "30 days" ? "86" : "246", change: "+14%" },
    { label: "Redemptions", value: period === "7 days" ? "9" : period === "30 days" ? "34" : "96", change: "+6%" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-medium text-foreground mb-1">Performance</h2>
          <p className="text-muted-foreground text-[13px]">See what people viewed, saved, used, and visited.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-full border border-border/50 bg-card/40">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-5 rounded-xl border border-border/50 bg-card/40">
            <div className="font-heading text-2xl font-medium text-foreground">{m.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{m.label}</div>
            <div className="text-[11px] text-[#B38F4F] mt-1.5">{m.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 rounded-xl border border-border/50 bg-card/40">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Most used items</div>
        <div className="space-y-3">
          {[
            { name: "Happy Hour offer", type: "Perk", metric: "34 redemptions", bar: 84 },
            { name: "Wellness Walk Club", type: "Event", metric: "71 RSVPs", bar: 68 },
            { name: "Legends listing request", type: "Property", metric: "28 saves", bar: 52 },
          ].map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <div>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground ml-2">{item.type}</span>
                </div>
                <span className="text-muted-foreground">{item.metric}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.bar}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
        <div className="p-5 border-b border-border/40">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">District report</div>
          <p className="mt-1 text-[12px] text-muted-foreground">Realistic demo data keeps reports useful until live partner activity is connected.</p>
        </div>
        <div className="divide-y divide-border/40">
          {DEMO_REPORT_ROWS.map((row) => (
            <div key={row.district} className="grid gap-3 p-4 md:grid-cols-[1fr_80px_80px_80px_1.2fr] md:items-center">
              <div>
                <div className="text-[13px] font-medium text-foreground">{row.district}</div>
                <div className="text-[11px] text-muted-foreground">{row.signal}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Scans</div>
                <div className="text-[12px] font-medium text-foreground">{row.scans}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Saves</div>
                <div className="text-[12px] font-medium text-foreground">{row.saves}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Action</div>
                <div className="text-[12px] font-medium text-[#B38F4F]">{row.actions}</div>
              </div>
              <div className="text-[12px] leading-5 text-muted-foreground">{row.next}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function DashSettings({ user }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-xl font-medium text-foreground mb-1">Settings</h2>
        <p className="text-muted-foreground text-[13px]">Manage your partner account and notification preferences.</p>
      </div>

      <div className="space-y-3">
        <div className="p-5 rounded-xl border border-border/50 bg-card/40">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Account</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Name</span>
              <span className="text-[13px] text-foreground">{user.full_name || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Email</span>
              <span className="text-[13px] text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Role</span>
              <span className="text-[13px] text-foreground capitalize">{user.role || "partner"}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/40">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Partner profile</div>
          <p className="text-[12px] text-muted-foreground mb-3">Update your organization name, type, and contact details.</p>
          <Link to="/partner-workspace" className="inline-flex items-center gap-2 text-[12px] text-primary font-medium hover:underline underline-offset-4">
            Edit in workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/40">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-3">Support</div>
          <div className="space-y-2 text-[13px]">
            <a href="mailto:partners@downtownperks.com" className="block text-primary hover:underline underline-offset-4">partners@downtownperks.com</a>
            <Link to="/partners" className="block text-muted-foreground hover:text-foreground transition-colors">View partner documentation →</Link>
          </div>
        </div>

        <button onClick={() => base44.auth.logout("/")}
          className="w-full p-4 rounded-xl border border-destructive/30 text-destructive text-[13px] font-medium hover:bg-destructive/10 transition-all text-left flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Sign out of partner account
        </button>
      </div>
    </motion.div>
  );
}
