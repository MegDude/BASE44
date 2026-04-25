import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PARTNER_DASHBOARD_LINK } from "@/lib/partnerContent";
import { ROUTES } from "@/lib/routes";
import { partnerPlatformRepository } from "@/lib/repositories/partnerPlatformRepository";
import { PARTNER_WORKSPACE_MODULES } from "@/lib/partner/workspaceModules";
import { Plus, X, Edit2, Trash2, ChevronRight, Calendar, Star, LayoutDashboard, Building2, Check, QrCode, Users, BarChart3 } from "lucide-react";

// ─── ENTITIES ─────────────────────────────────────────────────────────────────
// We use Perk, Event, and Venue entities which already exist.
// Partner profile is stored on the user object.

const TABS = PARTNER_WORKSPACE_MODULES.map((module) => ({
  id: module.id,
  label: module.label,
}));

const PERK_CATEGORIES = ["discount", "free_item", "priority_access", "members_rate", "experience", "class_pass"];
const EVENT_CATEGORIES = ["fitness", "wellness", "social", "dining", "nightlife", "arts", "networking", "class", "run_club", "yoga"];

const CAT_LABELS = {
  discount: "Discount", free_item: "Free Item", priority_access: "Priority Access",
  members_rate: "Members Rate", experience: "Experience", class_pass: "Class Pass",
  fitness: "Fitness", wellness: "Wellness", social: "Social", dining: "Dining",
  nightlife: "Nightlife", arts: "Arts", networking: "Networking", class: "Class",
  run_club: "Run Club", yoga: "Yoga",
};

export default function PartnerWorkspace() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setUser(u || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <div className="pt-24 pb-0 px-6 border-b border-border/40">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="dp-micro-label block mb-1">Partner workspace</span>
              <h1 className="font-display text-[2.2rem] text-foreground md:text-[2.8rem]">
                Partner workspace
              </h1>
              <p className="text-muted-foreground text-[13px] mt-2">Manage what appears on the map and track what happens next.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/partners" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                Partner types
              </Link>
              <Link to={PARTNER_DASHBOARD_LINK} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3.5 text-[12px] font-medium border-b-2 transition-all ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {!user ? (
          <WorkspaceAccessRequired />
        ) : (
          <AnimatePresence mode="wait">
            {tab === "overview" && <WorkspaceOverview key="overview" user={user} setTab={setTab} />}
            {tab === "offers" && <PerksManager key="offers" user={user} />}
            {tab === "events" && <EventsManager key="events" user={user} />}
            {tab === "sources" && <SourcesManager key="sources" user={user} />}
            {tab === "analytics" && <AnalyticsManager key="analytics" user={user} />}
            {tab === "team" && <TeamManager key="team" user={user} />}
            {tab === "profile" && <ProfileSection key="profile" user={user} setUser={setUser} />}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function WorkspaceAccessRequired() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="max-w-2xl rounded-[22px] border border-border/50 bg-white p-8 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
        <div className="dp-micro-label mb-2">Partner workspace</div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Sign in with your partner account to manage perks, events, and profile settings.
        </h2>
        <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
          This workspace is now account-bound. Public visitors can browse the partner overview and dashboard, but publishing and editing surfaces require the authenticated production actor flow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={PARTNER_DASHBOARD_LINK}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            View dashboard
          </Link>
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:text-foreground"
          >
            Partner types
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function WorkspaceOverview({ user, setTab }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    partnerPlatformRepository
      .getWorkspaceSnapshot({ user })
      .then((data) => {
        if (alive) setSnapshot(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user.email]);

  const offers = snapshot?.offers || [];
  const events = snapshot?.events || [];
  const sources = snapshot?.sources || [];
  const analytics = snapshot?.analytics;
  const recommendations = analytics?.recommended_actions || [];
  const activePerks = offers.filter((perk) => perk.status === "active" || perk.visibility_status === "active").length;
  const upcomingEvents = events.filter((event) => event.status === "upcoming" || event.status === "live").length;

  const QUICK_STATS = [
    { label: "Active perks", value: activePerks },
    { label: "Upcoming events", value: upcomingEvents },
    { label: "Source points", value: sources.length },
    { label: "Conversion rate", value: analytics ? `${analytics.totals.conversion_rate}%` : "0%" },
  ];

  const QUICK_ACTIONS = [
    { label: "Add a perk", sub: "Publish an offer for downtown visitors", icon: Star, tab: "offers" },
    { label: "Create an event", sub: "Add an upcoming event to the map", icon: Calendar, tab: "events" },
    { label: "Add a source point", sub: "Keep QR and entry attribution wired", icon: QrCode, tab: "sources" },
    { label: "Review analytics", sub: "See performance and recommendations", icon: BarChart3, tab: "analytics" },
    { label: "Manage team", sub: "Assign roles and access", icon: Users, tab: "team" },
    { label: "Update profile", sub: "Keep your venue or organization info current", icon: Building2, tab: "profile" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {QUICK_STATS.map((s, i) => (
          <div key={i} className="p-5 rounded-[18px] border border-border/50 bg-white text-left shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
            <div className="text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={() => setTab(a.tab)}
              className="p-5 rounded-[18px] border border-border/50 bg-white hover:border-primary/30 transition-all text-left group flex items-start gap-4 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{a.label}</div>
                <div className="text-[12px] text-muted-foreground">{a.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-0.5 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
            </button>
          );
        })}
      </div>

      <div className="rounded-[22px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)] mb-8">
        <div className="flex items-start justify-between gap-6 mb-5">
          <div>
            <div className="dp-micro-label mb-2">Workspace modules</div>
            <h3 className="text-lg font-semibold text-foreground">One canonical partner control surface</h3>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
              Offers, events, sources, analytics, team access, and profile settings now resolve through one partner platform model instead of scattered page logic.
            </p>
          </div>
          <Link to={ROUTES.partnerDashboard} className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-[12px] font-medium text-foreground/70 transition-all hover:text-foreground">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Open dashboard
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {snapshot?.modules?.map((module) => (
            <button
              key={module.id}
              onClick={() => setTab(module.id)}
              className="rounded-[18px] border border-border/40 bg-[rgba(247,249,252,0.9)] p-4 text-left transition-all hover:border-primary/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">{module.label}</div>
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{module.owner.replace("_", " ")}</span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{module.description}</p>
              <div className="mt-3 text-[11px] font-medium text-primary">{module.cta}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent perks */}
      {offers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent offers</h3>
            <button onClick={() => setTab("offers")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {offers.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === "active" ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
                </div>
                <span className="text-[11px] font-medium text-primary border border-primary/30 px-2 py-0.5 rounded-full shrink-0">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent events */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent events</h3>
            <button onClick={() => setTab("events")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-green-500 animate-pulse" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  e.status === "live" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  e.status === "upcoming" ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-muted text-muted-foreground border-border/50"
                }`}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6 mt-8">
        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Attribution and recommendations</h3>
            <button onClick={() => setTab("analytics")} className="text-[12px] text-primary hover:underline underline-offset-4">Open analytics</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[16px] border border-border/40 bg-card/20 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">Top sources</div>
              <div className="space-y-2">
                {(analytics?.top_sources || []).slice(0, 3).map((source) => (
                  <div key={source.id} className="flex items-center justify-between gap-3 text-[12px]">
                    <div>
                      <div className="font-medium text-foreground">{source.label}</div>
                      <div className="text-muted-foreground">{source.source_type.replace("_", " ")}</div>
                    </div>
                    <div className="font-semibold text-foreground">{source.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] border border-border/40 bg-card/20 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">Recommended next actions</div>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={`${rec}-${index}`} className="text-[12px] leading-5 text-muted-foreground">
                    <span className="font-medium text-foreground">{index + 1}.</span> {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">Canonical route</div>
          <div className="text-lg font-semibold text-foreground mb-1">{snapshot?.canonicalRoute || ROUTES.partnerWorkspace}</div>
          <p className="text-[12px] leading-5 text-muted-foreground mb-4">
            Partner routing now normalizes to the same canonical model that powers navigation, forms, dashboard context, and workspace modules.
          </p>
          <div className="space-y-2 text-[12px] text-muted-foreground">
            <div>Partner type: <span className="font-medium text-foreground">{snapshot?.partnerType || "venue"}</span></div>
            <div>Source points tracked: <span className="font-medium text-foreground">{sources.length}</span></div>
            <div>Team seats: <span className="font-medium text-foreground">{snapshot?.team?.length || 0}</span></div>
          </div>
        </div>
      </div>

      {offers.length === 0 && events.length === 0 && (
        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">Overview</div>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Your presence is live once you publish a perk or event.</h3>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">Start by adding a perk or event. It will appear on the map for people nearby.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setTab("offers")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> Add a perk
            </button>
            <button onClick={() => setTab("events")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 text-sm font-medium hover:text-foreground transition-all">
              <Plus className="w-4 h-4" /> Create an event
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── PERKS MANAGER ────────────────────────────────────────────────────────────

function PerksManager({ user }) {
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    partnerPlatformRepository
      .listOffers({ createdBy: user.email, partnerId: user?.partner_id || user?.id })
      .then(data => { setPerks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function handleEdit(perk) { setEditing(perk); setShowForm(true); }
  function handleAdd() { setEditing(null); setShowForm(true); }
  async function handleDelete(id) {
    await partnerPlatformRepository.deleteOffer(id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Perks</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Offers that appear on the downtown map for people nearby.</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add perk
        </button>
      </div>

      {showForm && (
        <PerkForm user={user} perk={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <EmptyState icon={Star} headline="No perks yet" body="Add your first perk and it will appear on the downtown map." action="Add a perk" onAction={handleAdd} />
      ) : (
        <div className="space-y-3">
          {perks.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/40 hover:border-border/70 transition-all">
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === "active" ? "bg-green-500" : p.status === "paused" ? "bg-yellow-500" : "bg-muted-foreground/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{p.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
              </div>
              <span className="text-[12px] font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-full shrink-0 hidden sm:block">{p.value}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                p.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                p.status === "paused" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                "bg-muted text-muted-foreground border-border/50"
              }`}>{p.status}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PerkForm({ user, perk, onClose, onSave }) {
  const [form, setForm] = useState({
    title: perk?.title || "",
    venue_name: perk?.venue_name || "",
    category: perk?.category || "discount",
    value: perk?.value || "",
    description: perk?.description || "",
    terms: perk?.terms || "",
    status: perk?.status || "active",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    if (perk?.id) {
      await partnerPlatformRepository.updateOffer(perk.id, {
        ...form,
        partner_id: user?.partner_id || user?.id,
      });
    } else {
      await partnerPlatformRepository.createOffer({
        ...form,
        partner_id: user?.partner_id || user?.id,
      });
    }
    onSave();
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mb-6 rounded-[22px] border border-[rgba(13,27,42,0.10)] bg-white p-6 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">{perk ? "Edit perk" : "New perk"}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Perk title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <FormField label="Venue name" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} required />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            {PERK_CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </div>
        <FormField label="Value (e.g. 15% off)" value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} required />
        <FormField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <FormField label="Terms & conditions" value={form.terms} onChange={v => setForm(f => ({ ...f, terms: v }))} />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            {saving ? "Saving…" : perk ? "Save changes" : "Create perk"}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full border border-border/60 text-foreground/70 text-sm font-medium hover:text-foreground transition-all">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── EVENTS MANAGER ───────────────────────────────────────────────────────────

function EventsManager({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    partnerPlatformRepository
      .listEvents({ createdBy: user.email, partnerId: user?.partner_id || user?.id })
      .then(data => { setEvents(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    await partnerPlatformRepository.deleteEvent(id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Events</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Events that appear on the downtown map with RSVP and discovery.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add event
        </button>
      </div>

      {showForm && (
        <EventForm user={user} event={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} headline="No events yet" body="Add your first event and it will appear on the downtown map with RSVP support." action="Add an event" onAction={() => { setEditing(null); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/40 hover:border-border/70 transition-all">
              <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-green-500 animate-pulse" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{e.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
              </div>
              <span className="text-[11px] text-muted-foreground hidden md:block shrink-0">{e.rsvp_count || 0} RSVPs</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                e.status === "live" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                e.status === "upcoming" ? "bg-primary/20 text-primary border-primary/30" :
                "bg-muted text-muted-foreground border-border/50"
              }`}>{e.status}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setEditing(e); setShowForm(true); }} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function EventForm({ user, event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: event?.title || "",
    venue_name: event?.venue_name || "",
    category: event?.category || "social",
    address: event?.address || "",
    description: event?.description || "",
    date: event?.date ? event.date.slice(0, 16) : "",
    status: event?.status || "upcoming",
    is_members_only: event?.is_members_only ?? true,
    capacity: event?.capacity || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
    if (event?.id) {
      await partnerPlatformRepository.updateEvent(event.id, {
        ...data,
        partner_id: user?.partner_id || user?.id,
      });
    } else {
      await partnerPlatformRepository.createEvent({
        ...data,
        partner_id: user?.partner_id || user?.id,
      });
    }
    onSave();
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-[22px] border border-[rgba(13,27,42,0.10)] bg-white p-6 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">{event ? "Edit event" : "New event"}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Event title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <FormField label="Venue name" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </div>
        <FormField label="Date & time" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="datetime-local" required />
        <FormField label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
        <FormField label="Capacity" value={form.capacity} onChange={v => setForm(f => ({ ...f, capacity: v }))} type="number" />
        <div className="md:col-span-2">
          <FormField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <input type="checkbox" id="members-only" checked={form.is_members_only} onChange={e => setForm(f => ({ ...f, is_members_only: e.target.checked }))}
            className="w-4 h-4 rounded border-border/60 bg-muted/30 accent-primary" />
          <label htmlFor="members-only" className="text-[13px] text-muted-foreground">Members only</label>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full border border-border/60 text-foreground/70 text-sm font-medium hover:text-foreground transition-all">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── SOURCES ──────────────────────────────────────────────────────────────────

function SourcesManager({ user }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    partnerPlatformRepository
      .listSourcePoints({
        partnerId: user?.partner_id || user?.id,
        partnerType: user?.partner_type,
      })
      .then((data) => {
        setSources(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.id, user?.partner_id, user?.partner_type]);

  async function handleDelete(id) {
    await partnerPlatformRepository.deleteSourcePoint(id);
    setSources((current) => current.filter((source) => source.id !== id));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Source points</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">QR, building, and campaign entries that preserve attribution through the partner funnel.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add source point
        </button>
      </div>

      {showForm && (
        <SourcePointForm
          user={user}
          sourcePoint={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={(nextPoint) => {
            setShowForm(false);
            setEditing(null);
            setSources((current) => {
              const next = Array.isArray(current) ? [...current] : [];
              const index = next.findIndex((item) => item.id === nextPoint.id);
              if (index >= 0) next[index] = nextPoint;
              else next.unshift(nextPoint);
              return next;
            });
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : sources.length === 0 ? (
        <EmptyState icon={QrCode} headline="No source points yet" body="Add QR and placement nodes so attribution stays intact from entry to action." action="Add a source point" onAction={() => { setEditing(null); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/40 hover:border-border/70 transition-all">
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${source.is_active ? "bg-green-500" : "bg-muted-foreground/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{source.label}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{source.source_type.replace("_", " ")} · {source.source_key}</div>
                {source.placement_description ? (
                  <div className="text-[12px] text-muted-foreground mt-2 leading-5">{source.placement_description}</div>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                source.is_active ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-muted text-muted-foreground border-border/50"
              }`}>
                {source.is_active ? "active" : "paused"}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setEditing(source); setShowForm(true); }} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(source.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SourcePointForm({ user, sourcePoint, onClose, onSave }) {
  const [form, setForm] = useState({
    label: sourcePoint?.label || "",
    source_type: sourcePoint?.source_type || "qr",
    source_key: sourcePoint?.source_key || "",
    placement_description: sourcePoint?.placement_description || "",
    is_active: sourcePoint?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      partner_id: user?.partner_id || user?.id,
      partner_type: user?.partner_type,
    };
    const nextPoint = sourcePoint?.id
      ? await partnerPlatformRepository.updateSourcePoint(sourcePoint.id, payload)
      : await partnerPlatformRepository.createSourcePoint(payload);
    onSave(nextPoint);
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[22px] border border-[rgba(13,27,42,0.10)] bg-white p-6 shadow-[0_12px_28px_rgba(11,26,43,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">{sourcePoint ? "Edit source point" : "New source point"}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Label" value={form.label} onChange={(value) => setForm((current) => ({ ...current, label: value }))} required />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Source type</label>
          <select value={form.source_type} onChange={(e) => setForm((current) => ({ ...current, source_type: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            <option value="qr">QR</option>
            <option value="building">Building</option>
            <option value="campaign">Campaign</option>
            <option value="nav">Navigation</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="staff_share">Staff share</option>
            <option value="lobby_signage">Lobby signage</option>
            <option value="room_card">Room card</option>
            <option value="key_sleeve">Key sleeve</option>
          </select>
        </div>
        <FormField label="Source key" value={form.source_key} onChange={(value) => setForm((current) => ({ ...current, source_key: value }))} required />
        <div className="flex items-center gap-3 pt-5">
          <input type="checkbox" id="source-active" checked={form.is_active} onChange={(e) => setForm((current) => ({ ...current, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-border/60 bg-muted/30 accent-primary" />
          <label htmlFor="source-active" className="text-[13px] text-muted-foreground">Source point active</label>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Placement description</label>
          <textarea rows={3} value={form.placement_description} onChange={(e) => setForm((current) => ({ ...current, placement_description: e.target.value }))}
            placeholder="Describe where this source appears and what context it should preserve."
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            {saving ? "Saving…" : sourcePoint ? "Save source point" : "Create source point"}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full border border-border/60 text-foreground/70 text-sm font-medium hover:text-foreground transition-all">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

function AnalyticsManager({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([
      partnerPlatformRepository.getAnalyticsSummary({
        partnerId: user?.partner_id || user?.id,
        partnerType: user?.partner_type,
        createdBy: user?.email,
      }),
      partnerPlatformRepository.getRecommendations({
        partnerId: user?.partner_id || user?.id,
        partnerType: user?.partner_type,
        createdBy: user?.email,
      }),
    ])
      .then(([summary, nextRecommendations]) => {
        if (!alive) return;
        setAnalytics(summary);
        setRecommendations(nextRecommendations || []);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.email, user?.id, user?.partner_id, user?.partner_type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Normalized partner intelligence for views, saves, redemptions, sources, and repeat behavior.</p>
        </div>
        <Link to={ROUTES.partnerDashboard} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-all">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Open full dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Map opens" value={analytics?.totals?.map_opens} />
        <MetricCard label="Views" value={analytics?.totals?.views} />
        <MetricCard label="Saves / RSVPs" value={analytics?.totals?.saves_or_rsvps} />
        <MetricCard label="Redemptions" value={analytics?.totals?.redemptions} />
        <MetricCard label="Conversion" value={`${analytics?.totals?.conversion_rate || 0}%`} />
        <MetricCard label="Repeat" value={`${analytics?.totals?.repeat_rate || 0}%`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="text-sm font-semibold text-foreground mb-4">Top sources and entities</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[16px] border border-border/40 bg-card/20 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">Source breakdown</div>
              <div className="space-y-3">
                {(analytics?.top_sources || []).map((source) => (
                  <div key={source.id} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{source.label}</div>
                      <div className="text-[11px] text-muted-foreground">{source.source_type.replace("_", " ")}</div>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{source.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] border border-border/40 bg-card/20 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">Top entities</div>
              <div className="space-y-3">
                {(analytics?.top_entities || []).map((entity) => (
                  <div key={entity.id} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{entity.title}</div>
                      <div className="text-[11px] text-muted-foreground capitalize">{entity.entity_type}</div>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{entity.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="text-sm font-semibold text-foreground mb-4">Recommended actions</div>
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-[16px] border border-border/40 bg-card/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-medium text-foreground">{recommendation.title}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-[0.12em] ${
                    recommendation.priority === "high"
                      ? "border-accent/40 text-accent"
                      : recommendation.priority === "medium"
                        ? "border-primary/30 text-primary"
                        : "border-border/60 text-muted-foreground"
                  }`}>
                    {recommendation.priority}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{recommendation.summary}</p>
                {recommendation.action_href ? (
                  <Link to={recommendation.action_href} className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-primary">
                    {recommendation.action_label || "Open"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────

function TeamManager({ user }) {
  const [team, setTeam] = useState([]);
  const [invite, setInvite] = useState({ email: "", full_name: "", role: "viewer" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    partnerPlatformRepository
      .listPartnerUsers({ partnerId: user?.partner_id || user?.id, user })
      .then((data) => {
        if (alive) setTeam(data || []);
      });
    return () => {
      alive = false;
    };
  }, [user?.id, user?.partner_id]);

  async function handleInvite(e) {
    e.preventDefault();
    setSaving(true);
    const nextUser = await partnerPlatformRepository.invitePartnerUser({
      partner_id: user?.partner_id || user?.id,
      email: invite.email,
      full_name: invite.full_name,
      role: invite.role,
    });
    setTeam((current) => [nextUser, ...current]);
    setInvite({ email: "", full_name: "", role: "viewer" });
    setSaving(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team access</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Owner, manager, editor, analyst, and viewer roles all resolve through one workspace model.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <form onSubmit={handleInvite} className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)] space-y-4">
          <div className="text-sm font-semibold text-foreground">Invite teammate</div>
          <FormField label="Full name" value={invite.full_name} onChange={(value) => setInvite((current) => ({ ...current, full_name: value }))} />
          <FormField label="Email" value={invite.email} onChange={(value) => setInvite((current) => ({ ...current, email: value }))} type="email" required />
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Role</label>
            <select value={invite.role} onChange={(e) => setInvite((current) => ({ ...current, role: e.target.value }))}
              className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="editor">Editor</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            <Plus className="w-4 h-4" />
            {saving ? "Inviting…" : "Invite teammate"}
          </button>
        </form>

        <div className="rounded-[20px] border border-border/50 bg-white p-6 shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
          <div className="text-sm font-semibold text-foreground mb-4">Current access</div>
          <div className="space-y-3">
            {team.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-border/40 bg-card/20 p-4">
                <div>
                  <div className="text-[13px] font-medium text-foreground">{member.full_name || member.email}</div>
                  <div className="text-[11px] text-muted-foreground">{member.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{member.status || "active"}</span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary capitalize">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function ProfileSection({ user, setUser }) {
  const [form, setForm] = useState({
    organization_name: user?.organization_name || "",
    partner_type: user?.partner_type || "venue",
    website: user?.website || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const updated = await partnerPlatformRepository.updatePartnerProfile(form);
    setUser(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const PARTNER_TYPES = [
    { value: "property", label: "Property / Building" },
    { value: "hotel", label: "Hotel" },
    { value: "venue", label: "Venue" },
    { value: "bars_restaurants", label: "Bars & Restaurants" },
    { value: "local_business", label: "Local business" },
    { value: "brand", label: "Brand" },
    { value: "civic", label: "Civic / Community" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
        <p className="text-muted-foreground text-[13px] mt-0.5">Your organization info shown on the downtown map.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="p-4 rounded-xl border border-border/40 bg-card/20 mb-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">Account</div>
          <div className="text-sm text-foreground">{user.full_name}</div>
          <div className="text-[12px] text-muted-foreground">{user.email}</div>
        </div>

        <FormField label="Organization name" value={form.organization_name} onChange={v => setForm(f => ({ ...f, organization_name: v }))} />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">Partner type</label>
          <select value={form.partner_type} onChange={e => setForm(f => ({ ...f, partner_type: e.target.value }))}
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors">
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <FormField label="Website" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} type="url" />
        <FormField label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">About</label>
          <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Describe your organization, venue, or program."
            className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors resize-none placeholder-muted-foreground/30" />
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </motion.div>
  );
}

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

function FormField({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-muted/30 border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground outline-none focus:border-primary/40 transition-colors"
      />
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="p-5 rounded-[18px] border border-border/50 bg-white text-left shadow-[0_8px_20px_rgba(11,26,43,0.04)]">
      <div className="text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground">{value ?? 0}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, headline, body, action, onAction }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-12 rounded-full border border-border/40 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{headline}</h3>
      <p className="text-muted-foreground text-[13px] mb-6 max-w-sm mx-auto">{body}</p>
      <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
        <Plus className="w-4 h-4" /> {action}
      </button>
    </div>
  );
}
