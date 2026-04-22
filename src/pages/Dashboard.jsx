import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerTypeCard from "@/components/partner/PartnerTypeCard";
import {
  LayoutDashboard, MapPin, Star, Calendar, TrendingUp, Settings,
  Menu, X, ChevronRight, Bell, Building2, Users, ArrowRight,
  Zap, Megaphone, Wrench,
  ClipboardList, Home, FileText, BarChart3
} from "lucide-react";
import {
  PARTNER_LANDING_SECTIONS,
  PARTNER_PLATFORM_MODULES,
  PARTNER_ROLE_PROOF,
  PARTNER_TYPE_CONTENT,
  PARTNER_TYPE_ORDER,
} from "@/lib/partnerContent";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "map", label: "Map activity", icon: MapPin },
  { id: "residents", label: "Residents", icon: Users },
  { id: "perks", label: "Perks", icon: Star },
  { id: "events", label: "Events", icon: Calendar },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "amenities", label: "Amenities", icon: Home },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "partners", label: "Partners", icon: Building2 },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

const PROPERTY_CAPABILITIES = [
  {
    id: "residents",
    label: "Resident CRM",
    value: "540",
    detail: "Profiles, building source, saved places, card status, and segments.",
    icon: Users,
  },
  {
    id: "campaigns",
    label: "Campaigns",
    value: "12",
    detail: "Announcements, offer pushes, event reminders, open rate, click rate, conversion.",
    icon: Megaphone,
  },
  {
    id: "amenities",
    label: "Amenities",
    value: "8",
    detail: "Amenity booking and neighborhood value surfaced from one resident hub.",
    icon: Home,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    value: "23",
    detail: "Resident requests, status, priority, property operations, and follow-up.",
    icon: Wrench,
  },
  {
    id: "reports",
    label: "Reports",
    value: "4",
    detail: "Redemption reports, engagement trends, segmentation, and actionable recommendations.",
    icon: BarChart3,
  },
  {
    id: "partners",
    label: "Partner network",
    value: "31",
    detail: "Venues, brands, hotels, civic partners, and active perk performance.",
    icon: Building2,
  },
];

const DEMO_PARTNER_USER = {
  id: "demo-partner",
  full_name: "Downtown Perks Partner",
  email: "partner@downtownperks.demo",
  role: "partner",
  is_demo: true,
};

export default function Dashboard({ defaultSection = "overview" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSection(defaultSection);
  }, [defaultSection]);

  useEffect(() => {
    base44.auth
      .me()
      .then(u => setUser(u || DEMO_PARTNER_USER))
      .catch(() => setUser(DEMO_PARTNER_USER))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(207,175,90,0.09),transparent_28%),linear-gradient(180deg,#F8F7F3_0%,#F1F0EA_100%)] flex text-[var(--dp-navy,#0B1F33)]">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-[rgba(247,246,242,0.72)] backdrop-blur-xl border-r border-[rgba(11,31,51,0.08)] flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-[68px] flex items-center px-5 border-b border-[rgba(11,31,51,0.08)] gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[rgba(11,31,51,0.06)]">
            <MapPin className="w-4 h-4 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.75} />
          </div>
          <span className="font-heading text-sm font-semibold tracking-[-0.035em]">
            Downtown Perks
          </span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="mb-2 px-3">
            <span className="text-[10px] font-semibold text-[rgba(11,31,51,0.42)] uppercase tracking-[0.16em]">Intelligence Hub</span>
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-[12px] font-medium transition-all ${
                    active ? "bg-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]" : "text-[rgba(11,31,51,0.54)] hover:text-[var(--dp-navy,#0B1F33)] hover:bg-white/36"
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[rgba(11,31,51,0.08)] space-y-1">
          <Link to="/partner-workspace" className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] text-[12px] text-[rgba(11,31,51,0.56)] hover:text-[var(--dp-navy,#0B1F33)] hover:bg-white/36 transition-all">
            <Zap className="w-3.5 h-3.5" /> Workspace
          </Link>
          <div className="px-3 py-2 text-[11px] text-[rgba(11,31,51,0.46)]">
            Public preview mode
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-[rgba(11,31,51,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[10px] bg-[rgba(11,31,51,0.08)] flex items-center justify-center text-[11px] font-semibold text-[var(--dp-navy,#0B1F33)] shrink-0">
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
      <div className="flex-1 lg:ml-60 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="h-[68px] flex items-center justify-between px-6 border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,246,242,0.58)] backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-medium text-sm tracking-tight text-foreground capitalize">
                {NAV_ITEMS.find(n => n.id === section)?.label || "Dashboard"}
              </h1>
              <p className="text-[11px] text-[rgba(11,31,51,0.48)] hidden sm:block">Downtown Perks · Property + partner intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <Link to="/partner-workspace" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-white/42 text-[12px] font-medium text-foreground/70 hover:bg-white/68 hover:text-foreground transition-all">
              Workspace <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {section === "overview" && <DashOverview key="overview" user={user} setSection={setSection} />}
            {section === "map" && <DashMap key="map" user={user} />}
            {section === "residents" && <DashCapability key="residents" capabilityId="residents" />}
            {section === "perks" && <DashPerks key="perks" user={user} />}
            {section === "events" && <DashEvents key="events" user={user} />}
            {section === "campaigns" && <DashCapability key="campaigns" capabilityId="campaigns" />}
            {section === "amenities" && <DashCapability key="amenities" capabilityId="amenities" />}
            {section === "maintenance" && <DashCapability key="maintenance" capabilityId="maintenance" />}
            {section === "reports" && <DashCapability key="reports" capabilityId="reports" />}
            {section === "partners" && <DashPartners key="partners" />}
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

  const KPI_CARDS = [
    { label: "Active perks", value: activePerks, icon: Star, action: () => setSection("perks") },
    { label: "Total redemptions", value: totalRedemptions, icon: Zap, action: () => setSection("perks") },
    { label: "Upcoming events", value: upcomingEvents, icon: Calendar, action: () => setSection("events") },
    { label: "Total RSVPs", value: totalRSVPs, icon: Users, action: () => setSection("events") },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7 max-w-6xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(40,62%,42%)] mb-3">
          Backend capability layer
        </p>
        <h2 className="dp-display-section text-3xl text-foreground mb-2">
          Property operations, resident engagement, and downtown conversion in one hub.
        </h2>
        <p className="text-muted-foreground text-[13px] max-w-3xl">
          Modeled from the Harmony Homes backend dashboard: residents, campaigns, amenities, maintenance, reports, partner performance, and map activity use the same Downtown Perks visual system.
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
                className="p-5 rounded-[20px] bg-white/34 backdrop-blur-md hover:bg-white/52 text-left transition-all group">
                <Icon className="w-4 h-4 text-[hsl(40,62%,42%)] mb-3" strokeWidth={1.75} />
                <div className="dp-ui-title text-2xl text-foreground">{k.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{k.label}</div>
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {PROPERTY_CAPABILITIES.map((capability) => {
          const Icon = capability.icon;
          return (
            <button
              key={capability.id}
              type="button"
              onClick={() => setSection(capability.id)}
              className="group rounded-[22px] bg-white/30 p-5 text-left backdrop-blur-md transition hover:bg-white/52"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[rgba(11,31,51,0.06)]">
                  <Icon className="h-4 w-4 text-[var(--dp-navy,#0B1F33)]" strokeWidth={1.75} />
                </span>
                <span className="dp-ui-title text-2xl text-[hsl(40,62%,42%)]">
                  {capability.value}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-[-0.025em] text-foreground">{capability.label}</h3>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{capability.detail}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-[rgba(11,31,51,0.62)] group-hover:text-[var(--dp-navy,#0B1F33)]">
                Open surface <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Activity pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-[22px] bg-white/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Perks on map</div>
            <button onClick={() => setSection("perks")} className="text-[11px] text-primary hover:underline underline-offset-4">Manage</button>
          </div>
          {perks.length === 0 ? (
            <div className="text-center py-6">
              <Star className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">No perks yet. <button onClick={() => setSection("perks")} className="text-primary hover:underline underline-offset-4">Add one</button></p>
            </div>
          ) : (
            <div className="space-y-2">
              {perks.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "active" ? "bg-[hsl(40,62%,42%)]" : "bg-muted-foreground/40"}`} />
                  <span className="text-[12px] text-foreground flex-1 truncate">{p.title}</span>
                  <span className="text-[11px] text-muted-foreground">{p.redemption_count || 0} redeem</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-[22px] bg-white/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Events on map</div>
            <button onClick={() => setSection("events")} className="text-[11px] text-primary hover:underline underline-offset-4">Manage</button>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">No events yet. <button onClick={() => setSection("events")} className="text-primary hover:underline underline-offset-4">Add one</button></p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.status === "live" ? "bg-[hsl(40,62%,42%)] animate-pulse" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <span className="text-[12px] text-foreground flex-1 truncate">{e.title}</span>
                  <span className="text-[11px] text-muted-foreground">{e.rsvp_count || 0} RSVPs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "View partner types", sub: "Properties, hotels, venues, brands, civic", href: "/partners", icon: Building2 },
          { label: "Go to workspace", sub: "Add and edit your perks and events", href: "/partner-workspace", icon: Zap },
          { label: "Explore the map", sub: "See your presence on the live downtown map", href: "/downtown-perks/explore", icon: MapPin },
        ].map((l, i) => {
          const Icon = l.icon;
          return (
            <Link key={i} to={l.href} className="flex items-center gap-3 p-4 rounded-[18px] bg-white/24 hover:bg-white/48 transition-all group">
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

// ─── PROPERTY OPERATING SURFACES ─────────────────────────────────────────────

const CAPABILITY_DETAILS = {
  residents: {
    eyebrow: "Resident CRM",
    title: "Resident access, segments, and card activity.",
    body: "Bring the Harmony-style resident roster into Downtown Perks: active members, building attribution, saved places, QR card status, and segment-ready audience data.",
    metrics: [
      { label: "Active residents", value: "540" },
      { label: "Card activations", value: "186" },
      { label: "Building sources", value: "6" },
      { label: "Segments", value: "9" },
    ],
    rows: [
      ["The Quincy", "142 residents", "Coffee + evening offers"],
      ["The Ashton", "118 residents", "Events tonight"],
      ["Seaholm", "96 residents", "Wellness + lake routes"],
      ["Waterline", "84 residents", "Premium dining"],
    ],
  },
  campaigns: {
    eyebrow: "Campaigns",
    title: "Announcements, offers, and reminders with conversion signal.",
    body: "Track campaign delivery like the backend dashboard: sent audience, open rate, click rate, RSVP, redemption, and downtown action.",
    metrics: [
      { label: "Active campaigns", value: "12" },
      { label: "Open rate", value: "64%" },
      { label: "CTR", value: "22%" },
      { label: "Conversions", value: "137" },
    ],
    rows: [
      ["Friday dinner push", "Resident segment", "38 redemptions"],
      ["Waterloo Sunset Series", "Event reminder", "71 RSVPs"],
      ["New perk drop", "Card holders", "42 saves"],
      ["Building welcome QR", "New residents", "29 activations"],
    ],
  },
  amenities: {
    eyebrow: "Amenities",
    title: "Building amenities connected to the neighborhood layer.",
    body: "Use the same operating model for rooftop events, pool access, fitness reservations, lobby QR entry, and partner perks around the property.",
    metrics: [
      { label: "Amenity modules", value: "8" },
      { label: "Reservations", value: "214" },
      { label: "QR entries", value: "18" },
      { label: "Nearby opens", value: "4.2" },
    ],
    rows: [
      ["Rooftop social", "Building event", "Live tonight"],
      ["Fitness room", "Amenity reservation", "86 bookings"],
      ["Lobby QR", "Resident onboarding", "42 scans"],
      ["Pool day partner perk", "Local activation", "19 saves"],
    ],
  },
  maintenance: {
    eyebrow: "Maintenance",
    title: "Requests, status, priority, and resident follow-up.",
    body: "The property layer can support operational requests alongside neighborhood value, keeping resident service and local activation in one managed surface.",
    metrics: [
      { label: "Open requests", value: "23" },
      { label: "High priority", value: "4" },
      { label: "Avg response", value: "1.8h" },
      { label: "Resolved", value: "91%" },
    ],
    rows: [
      ["Unit 1704", "HVAC request", "In progress"],
      ["Amenity deck", "Lighting check", "Scheduled"],
      ["Lobby QR stand", "Replacement needed", "Open"],
      ["Parking gate", "Resident report", "Resolved"],
    ],
  },
  reports: {
    eyebrow: "Reports",
    title: "Performance reports and actionable recommendations.",
    body: "Convert raw data into operator guidance: redemption trends, venue status, category mix, building attribution, and next actions.",
    metrics: [
      { label: "Reports", value: "4" },
      { label: "Top venues", value: "12" },
      { label: "Attribution paths", value: "18" },
      { label: "Recommendations", value: "7" },
    ],
    rows: [
      ["Perks performance", "Monthly report", "Ready"],
      ["Building attribution", "Source analysis", "Updated"],
      ["Venue health", "Underperforming partners", "3 flagged"],
      ["Category mix", "Dining leads", "42% share"],
    ],
  },
  partners: {
    eyebrow: "Partner network",
    title: "Buildings, venues, hotels, brands, and civic partners.",
    body: "Manage the full downtown ecosystem from one place: partner status, content health, campaign eligibility, and map visibility.",
    metrics: [
      { label: "Partners", value: "31" },
      { label: "Active offers", value: "46" },
      { label: "Live events", value: "18" },
      { label: "Needs review", value: "5" },
    ],
    rows: [
      ["Jo's Coffee", "Venue", "Strong performer"],
      ["The Ashton", "Building", "Active QR source"],
      ["Hotel Van Zandt", "Hospitality", "Guest layer"],
      ["Fine Eyewear", "Brand", "Campaign ready"],
    ],
  },
};

function DashCapability({ capabilityId }) {
  const capability = CAPABILITY_DETAILS[capabilityId] || CAPABILITY_DETAILS.reports;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-6xl space-y-7">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(40,62%,42%)] mb-3">
          {capability.eyebrow}
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em] text-foreground mb-3">
          {capability.title}
        </h2>
        <p className="max-w-3xl text-[13px] leading-6 text-muted-foreground">{capability.body}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {capability.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[20px] bg-white/32 p-5 backdrop-blur-md">
            <div className="font-heading text-3xl font-semibold tracking-[-0.055em] text-foreground">{metric.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[24px] bg-white/34 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-[rgba(11,31,51,0.08)] px-5 py-4">
            <ClipboardList className="h-4 w-4 text-[hsl(40,62%,42%)]" strokeWidth={1.75} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.52)]">
              Operating queue
            </span>
          </div>
          <div className="divide-y divide-[rgba(11,31,51,0.07)]">
            {capability.rows.map(([name, detail, status]) => (
              <div key={`${name}-${detail}`} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <div className="text-sm font-semibold tracking-[-0.02em] text-foreground">{name}</div>
                <div className="text-[12px] text-muted-foreground">{detail}</div>
                <span className="w-fit rounded-full bg-[rgba(11,31,51,0.06)] px-3 py-1 text-[11px] font-medium text-[rgba(11,31,51,0.66)]">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-[var(--dp-navy,#0B1F33)] p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,62%)]">
            Intelligence output
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.045em]">
            What should the operator do next?
          </h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/68">
            <p>Prioritize high-intent residents, keep map content current, and convert property activity into partner action.</p>
            <p>Use this surface for decisions, not just reporting: launch a campaign, tune an offer, flag a partner, or follow up with a building.</p>
          </div>
          <Link
            to="/partner-workspace"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-[12px] bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-[hsl(42,24%,96%)]"
          >
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function DashPartners() {
  const partnerCards = PARTNER_TYPE_ORDER.map((id) => PARTNER_TYPE_CONTENT[id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl space-y-7"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(40,62%,42%)] mb-3">
          Partner overview
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em] text-foreground mb-3">
          One system, five partner roles.
        </h2>
        <p className="max-w-3xl text-[13px] leading-6 text-muted-foreground">
          Residential, hospitality, venues, brands, and civic all run through the same downtown map,
          measurement layer, and activation model. This tab should open on the full partner overview,
          not a placeholder capability card.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {PARTNER_PLATFORM_MODULES.map((item) => (
          <div key={item.title} className="rounded-[20px] bg-white/32 p-5 backdrop-blur-md">
            <div className="font-heading text-3xl font-semibold tracking-[-0.055em] text-foreground">{item.body}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{item.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {partnerCards.map((card, index) => (
          <PartnerTypeCard
            key={card.id}
            type={card.shortLabel}
            label={card.label}
            description={card.heroDescription}
            headline={card.heroStats?.[0] ? `${card.heroStats[0].value} ${card.heroStats[0].label.toLowerCase()}` : "Learn more"}
            proofLine="Open role"
            icon={card.icon}
            href={card.route}
            delay={index * 0.04}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PARTNER_LANDING_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[22px] bg-white/28 p-5 backdrop-blur-md">
              <Icon className="h-4 w-4 text-[hsl(40,62%,42%)]" strokeWidth={1.75} />
              <h3 className="mt-4 text-base font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.body}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PARTNER_ROLE_PROOF.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="rounded-[22px] bg-white/28 p-5 backdrop-blur-md transition hover:bg-white/40"
          >
            <div className="text-[11px] uppercase tracking-[0.16em] text-[hsl(40,62%,42%)]">{item.type}</div>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-foreground">{item.name}</h3>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.summary}</p>
            <div className="mt-4 text-[12px] font-medium text-foreground">{item.proof}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] bg-white/30 p-6 backdrop-blur-md">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.52)]">
            Quick actions
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Open partner landing", sub: "See all partner types", href: "/partners", icon: Building2 },
              { label: "Open workspace", sub: "Manage perks and events", href: "/partner-workspace", icon: Zap },
              { label: "Open map activity", sub: "Inspect live intelligence", href: "/dashboard", icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/50 p-4 transition hover:bg-white"
                >
                  <Icon className="h-4 w-4 text-[hsl(40,62%,42%)]" />
                  <div className="mt-3 text-[12px] font-medium text-foreground">{item.label}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{item.sub}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] bg-[var(--dp-navy,#0B1F33)] p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,62%)]">
            Partner intelligence
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.045em]">
            Start with the partner model, then go role-specific.
          </h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/68">
            <p>
              This dashboard tab should explain the whole ecosystem first. From there, each role
              drills into its own operating logic, proof, and map behavior.
            </p>
            <p>
              The map stays shared. The behavior changes by role. That is the product structure.
            </p>
          </div>
          <Link
            to="/partners"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-[12px] bg-white px-4 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--dp-navy,#0B1F33)] transition hover:bg-[hsl(42,24%,96%)]"
          >
            View partner overview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAP ACTIVITY ─────────────────────────────────────────────────────────────

function DashMap() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="-m-6">
      <PartnerInsightMap
        partnerType="dashboard"
        title="Map-backed business intelligence"
        description="Partner mode shows where engagement, campaign lift, coverage gaps, and opportunity zones are forming across downtown."
      />
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
        <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          Manage perks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-[13px]">No perks yet.</p>
          <Link to="/partner-workspace" className="text-primary text-[13px] hover:underline underline-offset-4">Add one in the workspace →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {perks.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-medium text-sm text-foreground">{p.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{p.venue_name}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  p.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
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
        <Link to="/partner-workspace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          Manage events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-[13px]">No events yet.</p>
          <Link to="/partner-workspace" className="text-primary text-[13px] hover:underline underline-offset-4">Add one in the workspace →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="p-4 rounded-xl border border-border/50 bg-card/40">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-green-500 animate-pulse" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{e.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{e.venue_name || "—"} · {e.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-medium text-foreground">{e.rsvp_count || 0}</div>
                  <div className="text-[10px] text-muted-foreground">RSVPs</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  e.status === "live" ? "bg-green-500/20 text-green-400 border-green-500/30" :
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

function DashPerformance() {
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
          <p className="text-muted-foreground text-[13px]">How your downtown presence is converting to real activity.</p>
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
            <div className="text-[11px] text-green-400 mt-1.5">{m.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 rounded-xl border border-border/50 bg-card/40">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-4">Top performing content</div>
        <div className="space-y-3">
          {[
            { name: "Happy Hour offer", type: "Perk", metric: "34 redemptions", bar: 84 },
            { name: "Wellness Walk Club", type: "Event", metric: "71 RSVPs", bar: 68 },
            { name: "Fine Eyewear offer", type: "Perk", metric: "28 saves", bar: 52 },
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

        <div className="w-full p-4 rounded-xl border border-border/50 bg-card/40 text-[13px] text-muted-foreground">
          This dashboard runs in public preview mode. Admin-only write protection should stay on the backend, not in the browsing shell.
        </div>
      </div>
    </motion.div>
  );
}
