import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Trash2, ChevronRight, Calendar, Star, Zap, LayoutDashboard, Building2, Check } from "lucide-react";

// ─── ENTITIES ─────────────────────────────────────────────────────────────────
// We use Perk, Event, and Venue entities which already exist.
// Partner profile is stored on the user object.

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "perks", label: "Perks" },
  { id: "events", label: "Events" },
  { id: "profile", label: "Profile" },
];

const PERK_CATEGORIES = ["discount", "free_item", "priority_access", "members_rate", "experience", "class_pass"];
const EVENT_CATEGORIES = ["fitness", "wellness", "social", "dining", "nightlife", "arts", "networking", "class", "run_club", "yoga"];

const CAT_LABELS = {
  discount: "Discount", free_item: "Free Item", priority_access: "Priority Access",
  members_rate: "Members Rate", experience: "Experience", class_pass: "Class Pass",
  fitness: "Fitness", wellness: "Wellness", social: "Social", dining: "Dining",
  nightlife: "Nightlife", arts: "Arts", networking: "Networking", class: "Class",
  run_club: "Run Club", yoga: "Yoga",
};

const PUBLIC_PARTNER_USER = {
  email: "partner@downtownperks.local",
  full_name: "Partner Workspace",
  partner_name: "Downtown Perks Partner",
  partner_type: "neighborhood",
};

export default function PartnerWorkspace() {
  const [user, setUser] = useState(PUBLIC_PARTNER_USER);
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => setUser(u || PUBLIC_PARTNER_USER)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="pt-24 pb-0 px-5 border-b border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-1">Partner Workspace</span>
              <h1 className="font-heading text-2xl md:text-3xl font-medium tracking-normal">
                {user.full_name || user.email?.split("@")[0] || "Your workspace"}
              </h1>
              <p className="text-muted-foreground text-[13px] mt-1">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/partners" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                Partner types
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 text-[12px] font-medium border-b-2 transition-all ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-5 py-10">
        <AnimatePresence mode="wait">
          {tab === "overview" && <WorkspaceOverview key="overview" user={user} setTab={setTab} />}
          {tab === "perks" && <PerksManager key="perks" user={user} />}
          {tab === "events" && <EventsManager key="events" user={user} />}
          {tab === "profile" && <ProfileSection key="profile" user={user} setUser={setUser} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function WorkspaceOverview({ user, setTab }) {
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.Perk.filter({ created_by: user.email }).then(setPerks).catch(() => {});
    base44.entities.Event.filter({ created_by: user.email }).then(setEvents).catch(() => {});
  }, [user.email]);

  const activePerks = perks.filter(p => p.status === "active").length;
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "live").length;

  const QUICK_STATS = [
    { label: "Active perks", value: activePerks || 0 },
    { label: "Upcoming events", value: upcomingEvents || 0 },
    { label: "Total perks", value: perks.length },
    { label: "Total events", value: events.length },
  ];

  const QUICK_ACTIONS = [
    { label: "Add a perk", sub: "Publish an offer for downtown visitors", icon: Star, tab: "perks" },
    { label: "Create an event", sub: "Add an upcoming event to the map", icon: Calendar, tab: "events" },
    { label: "Update profile", sub: "Keep your venue or organization info current", icon: Building2, tab: "profile" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {QUICK_STATS.map((s, i) => (
          <div key={i} className="p-5 rounded-xl border border-border/50 bg-card/40 text-center">
            <div className="font-heading text-2xl font-medium text-foreground">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={() => setTab(a.tab)}
              className="p-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 transition-all text-left group flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-[13px] text-foreground mb-1 group-hover:text-primary transition-colors">{a.label}</div>
                <div className="text-[12px] text-muted-foreground">{a.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-0.5 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
            </button>
          );
        })}
      </div>

      {/* Recent perks */}
      {perks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-medium text-[13px] text-foreground">Recent perks</h3>
            <button onClick={() => setTab("perks")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {perks.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === "active" ? "bg-[#B38F4F]" : "bg-muted-foreground/40"}`} />
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
            <h3 className="font-heading font-medium text-[13px] text-foreground">Recent events</h3>
            <button onClick={() => setTab("events")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-[#B38F4F]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  e.status === "live" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
                  e.status === "upcoming" ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-muted text-muted-foreground border-border/50"
                }`}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {perks.length === 0 && events.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-10 rounded-full border border-border/40 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <h3 className="font-heading font-medium text-foreground mb-2">Start building your presence</h3>
          <p className="text-muted-foreground text-[13px] mb-6 max-w-sm mx-auto">Add your first perk or event and it will appear on the downtown map for people nearby.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setTab("perks")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> Add a perk
            </button>
            <button onClick={() => setTab("events")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[13px] font-medium hover:text-foreground transition-all">
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
    base44.entities.Perk.filter({ created_by: user.email })
      .then(data => { setPerks(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function handleEdit(perk) { setEditing(perk); setShowForm(true); }
  function handleAdd() { setEditing(null); setShowForm(true); }
  async function handleDelete(id) {
    await base44.entities.Perk.delete(id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-medium text-xl text-foreground">Perks</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Offers that appear on the downtown map for people nearby.</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add perk
        </button>
      </div>

      {showForm && (
        <PerkForm perk={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
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
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === "active" ? "bg-[#B38F4F]" : p.status === "paused" ? "bg-[#B38F4F]" : "bg-muted-foreground/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13px] text-foreground">{p.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
              </div>
              <span className="text-[12px] font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-full shrink-0 hidden sm:block">{p.value}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                p.status === "active" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
                p.status === "paused" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
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

function PerkForm({ perk, onClose, onSave }) {
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
      await base44.entities.Perk.update(perk.id, form);
    } else {
      await base44.entities.Perk.create(form);
    }
    onSave();
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mb-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-medium text-foreground">{perk ? "Edit perk" : "New perk"}</h3>
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
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            {saving ? "Saving…" : perk ? "Save changes" : "Create perk"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[13px] font-medium hover:text-foreground transition-all">
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
    base44.entities.Event.filter({ created_by: user.email })
      .then(data => { setEvents(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    await base44.entities.Event.delete(id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-medium text-xl text-foreground">Events</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Events that appear on the downtown map with RSVP and discovery.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add event
        </button>
      </div>

      {showForm && (
        <EventForm event={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
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
              <div className={`w-2 h-2 rounded-full shrink-0 ${e.status === "live" ? "bg-[#B38F4F]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13px] text-foreground">{e.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
              </div>
              <span className="text-[11px] text-muted-foreground hidden md:block shrink-0">{e.rsvp_count || 0} RSVPs</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                e.status === "live" ? "bg-[#0B1F33]/20 text-[#B38F4F] border-[#B38F4F]/30" :
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

function EventForm({ event, onClose, onSave }) {
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
      await base44.entities.Event.update(event.id, data);
    } else {
      await base44.entities.Event.create(data);
    }
    onSave();
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-medium text-foreground">{event ? "Edit event" : "New event"}</h3>
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
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full border border-border/60 text-foreground/70 text-[13px] font-medium hover:text-foreground transition-all">
            Cancel
          </button>
        </div>
      </form>
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
    const updated = await base44.auth.updateMe(form);
    setUser(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const PARTNER_TYPES = [
    { value: "property", label: "Property / Building" },
    { value: "hotel", label: "Hotel" },
    { value: "venue", label: "Venue" },
    { value: "brand", label: "Brand" },
    { value: "civic", label: "Civic / Community" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h2 className="font-heading font-medium text-xl text-foreground">Profile</h2>
        <p className="text-muted-foreground text-[13px] mt-0.5">Your organization info shown on the downtown map.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="p-4 rounded-xl border border-border/40 bg-card/20 mb-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">Account</div>
          <div className="text-[13px] text-foreground">{user.full_name}</div>
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

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all disabled:opacity-60">
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

function EmptyState({ icon: Icon, headline, body, action, onAction }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-10 rounded-full border border-border/40 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading font-medium text-foreground mb-2">{headline}</h3>
      <p className="text-muted-foreground text-[13px] mb-6 max-w-sm mx-auto">{body}</p>
      <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-all">
        <Plus className="w-4 h-4" /> {action}
      </button>
    </div>
  );
}
