import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Trash2, ChevronRight, Calendar, Star, Zap, LayoutDashboard, Building2, Check, MapPin, MessageSquareText, Navigation, ArrowLeft, Users } from "lucide-react";
import { daaDashboardContent, daaExplorerQuestions, daaTourDistricts, daaTourProgress, daaTourStops } from "@/data/daaArtParksTour";

// ─── ENTITIES ─────────────────────────────────────────────────────────────────
// We use Perk, Event, and Venue entities which already exist.
// Partner profile is stored on the user object.

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "perks", label: "Perks" },
  { id: "events", label: "Events" },
  { id: "residents", label: "Residents" },
  { id: "buildings", label: "Buildings" },
  { id: "reports", label: "Reports" },
  { id: "messages", label: "Messages" },
  { id: "surveys", label: "Surveys" },
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

const WORKSPACE_STORAGE_PREFIX = "dp_partner_workspace";

function getWorkspaceTabFromPath(pathname) {
  if (pathname.includes("/campaigns")) return "campaigns";
  if (pathname.includes("/perks")) return "perks";
  if (pathname.includes("/events")) return "events";
  if (pathname.includes("/residents")) return "residents";
  if (pathname.includes("/buildings")) return "buildings";
  if (pathname.includes("/reports")) return "reports";
  if (pathname.includes("/messages")) return "messages";
  if (pathname.includes("/surveys")) return "surveys";
  if (pathname.includes("/profile")) return "profile";
  return "overview";
}

function workspaceKey(kind, email = PUBLIC_PARTNER_USER.email) {
  return `${WORKSPACE_STORAGE_PREFIX}:${kind}:${email || PUBLIC_PARTNER_USER.email}`;
}

function getStoredJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

function getStoredProfile() {
  const profile = getStoredJson(workspaceKey("profile"), null);
  if (!profile) return null;
  const { email, id, created_by, created_date, updated_date, ...profileFields } = profile;
  return profileFields;
}

function saveStoredProfile(profile) {
  const { email, id, created_by, created_date, updated_date, ...profileFields } = profile || {};
  setStoredJson(workspaceKey("profile"), profileFields);
}

function getStoredItems(kind, email) {
  return getStoredJson(workspaceKey(kind, email), []);
}

function setStoredItems(kind, email, items) {
  setStoredJson(workspaceKey(kind, email), items);
}

function normalizeWorkspaceItem(item, email) {
  return {
    ...item,
    id: item.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_by: item.created_by || email || PUBLIC_PARTNER_USER.email,
    created_date: item.created_date || new Date().toISOString(),
  };
}

function mergeWorkspaceItems(remoteItems = [], localItems = []) {
  const seen = new Set();
  return [...localItems, ...remoteItems]
    .map((item) => normalizeWorkspaceItem(item, item.created_by))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

async function listWorkspaceItems(entityName, kind, email) {
  const localItems = getStoredItems(kind, email);
  try {
    const remoteItems = await base44.entities[entityName].filter({ created_by: email });
    return mergeWorkspaceItems(remoteItems || [], localItems);
  } catch {
    return localItems;
  }
}

async function createWorkspaceItem(entityName, kind, email, payload) {
  const enriched = normalizeWorkspaceItem(payload, email);
  try {
    const remoteItem = await base44.entities[entityName].create({
      ...payload,
      created_by: email,
    });
    return normalizeWorkspaceItem(remoteItem || enriched, email);
  } catch {
    const nextItems = [enriched, ...getStoredItems(kind, email)];
    setStoredItems(kind, email, nextItems);
    return enriched;
  }
}

async function updateWorkspaceItem(entityName, kind, email, id, payload) {
  const localItems = getStoredItems(kind, email);
  const localUpdate = normalizeWorkspaceItem(
    {
      ...payload,
      id,
      updated_date: new Date().toISOString(),
    },
    email,
  );

  if (!id || String(id).startsWith("local-")) {
    setStoredItems(kind, email, localItems.map((item) => (item.id === id ? { ...item, ...localUpdate } : item)));
    return localUpdate;
  }

  try {
    const remoteItem = await base44.entities[entityName].update(id, payload);
    return normalizeWorkspaceItem(remoteItem || localUpdate, email);
  } catch {
    const exists = localItems.some((item) => item.id === id);
    const nextItems = exists
      ? localItems.map((item) => (item.id === id ? { ...item, ...localUpdate } : item))
      : [localUpdate, ...localItems];
    setStoredItems(kind, email, nextItems);
    return localUpdate;
  }
}

async function deleteWorkspaceItem(entityName, kind, email, id) {
  if (id && !String(id).startsWith("local-")) {
    try {
      await base44.entities[entityName].delete(id);
    } catch {
      // Keep the local UI responsive even when the hosted entity API is unavailable.
    }
  }

  setStoredItems(
    kind,
    email,
    getStoredItems(kind, email).filter((item) => item.id !== id),
  );
}

export default function PartnerWorkspace() {
  const location = useLocation();
  const [user, setUser] = useState(() => ({ ...PUBLIC_PARTNER_USER, ...(getStoredProfile() || {}) }));
  const [tab, setTab] = useState(() => getWorkspaceTabFromPath(location.pathname));
  const navigate = useNavigate();
  const isPublicWorkspaceUser = user.email === PUBLIC_PARTNER_USER.email;

  useEffect(() => {
    base44.auth.me()
      .then((u) => setUser({ ...PUBLIC_PARTNER_USER, ...(getStoredProfile() || {}), ...(u || {}) }))
      .catch(() => setUser((currentUser) => ({ ...currentUser, ...(getStoredProfile() || {}) })));
  }, []);

  useEffect(() => {
    setTab(getWorkspaceTabFromPath(location.pathname));
  }, [location.pathname]);

  function handleSignIn() {
    navigate("/partners/sign-in");
  }

  function handleSignOut() {
    try {
      base44.auth.logout();
    } catch {
      // The public workspace remains usable even if the SDK has no active session.
    }
    setUser({ ...PUBLIC_PARTNER_USER, ...(getStoredProfile() || {}) });
  }

  return (
    <div className="dp-partner-page min-h-screen bg-[#F7F8FB] text-[#0B1F33]">
      {/* Header */}
      <div className="pt-20 pb-0 px-5 bg-white border-b border-[rgba(11,31,51,0.07)] shadow-[0_1px_0_rgba(11,31,51,0.04),0_4px_16px_rgba(11,31,51,0.03)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/map?mode=partner&tab=map&filter=All")}
              className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[rgba(11,31,51,0.09)] bg-white px-2.5 text-[11.5px] font-semibold text-[#0B1F33]/60 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
            >
              <ArrowLeft className="h-3 w-3 text-[#C8A96A]" />
              Back to map
            </button>
            <button
              type="button"
              onClick={() => navigate("/map?mode=partner&tab=map&filter=All")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(11,31,51,0.09)] bg-white text-[#0B1F33]/54 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
              aria-label="Close partner workspace"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-end justify-between mb-5 gap-4">
            <div>
              <span className="text-[10.5px] font-semibold text-[#C8A96A] uppercase tracking-[0.18em] block mb-1.5">Partner Workspace</span>
              <h1 className="font-heading text-[22px] md:text-[28px] font-medium tracking-[-0.01em] leading-tight text-[#0B1F33]">
                {user.full_name || user.email?.split("@")[0] || "Your workspace"}
              </h1>
              <p className="text-[#0B1F33]/52 text-[12.5px] mt-1 font-normal">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={isPublicWorkspaceUser ? handleSignIn : handleSignOut}
                className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[rgba(11,31,51,0.09)] bg-white px-3 text-[11.5px] font-semibold text-[#0B1F33]/60 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
              >
                {isPublicWorkspaceUser ? "Sign in" : "Sign out"}
              </button>
              <Link
                to="/partners/dashboard"
                className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[rgba(11,31,51,0.09)] bg-white px-3 text-[11.5px] font-semibold text-[#0B1F33]/60 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#C8A96A]" /> Dashboard
              </Link>
            </div>
          </div>

          {/* Tabs — animated sliding indicator */}
          <div className="relative flex gap-0 -mb-px overflow-x-auto scrollbar-none">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex-shrink-0 px-4 py-2.5 text-[12px] font-medium transition-colors duration-150 focus-visible:outline-none ${
                  tab === t.id
                    ? "text-[#0B1F33]"
                    : "text-[#0B1F33]/46 hover:text-[#0B1F33]/72"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="workspace-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8A96A] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {tab === "overview" && <WorkspaceOverview key="overview" user={user} setTab={setTab} />}
          {tab === "campaigns" && <WorkspaceCapability key="campaigns" title="Campaigns" eyebrow="Partner workflow" description="Plan, publish, and review offers or events that should appear on the downtown map." actions={["Create a map offer", "Promote an event", "Review active placements"]} />}
          {tab === "perks" && <PerksManager key="perks" user={user} />}
          {tab === "events" && <EventsManager key="events" user={user} />}
          {tab === "residents" && <WorkspaceCapability key="residents" title="Residents" eyebrow="Resident activity" description="Understand what residents are saving, using, and asking for near your place." actions={["Track saves", "Review perk interest", "Identify popular offers"]} />}
          {tab === "buildings" && <WorkspaceCapability key="buildings" title="Buildings" eyebrow="Nearby buildings" description="See which buildings and residential communities are closest to your downtown activity." actions={["Review nearby buildings", "Plan building outreach", "Compare local demand"]} />}
          {tab === "reports" && <WorkspaceReports key="reports" />}
          {tab === "messages" && <WorkspaceCapability key="messages" title="Messages" eyebrow="Partner communication" description="Prepare simple updates for residents, guests, or nearby teams without creating another dashboard task." actions={["Draft update", "Review replies", "Plan next message"]} />}
          {tab === "surveys" && <WorkspaceCapability key="surveys" title="Surveys" eyebrow="Resident feedback" description="Collect direct feedback about perks, events, places, and next moves that would make downtown easier to use." actions={["Create survey", "Review responses", "Plan follow-up"]} />}
          {tab === "profile" && <ProfileSection key="profile" user={user} setUser={setUser} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function WorkspaceCapability({ eyebrow, title, description, actions = [] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[12px] border border-[rgba(11,31,51,0.07)] bg-white p-6 md:p-8 shadow-[0_2px_8px_rgba(11,31,51,0.04),0_8px_28px_rgba(11,31,51,0.05)]"
    >
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">{eyebrow}</span>
      <h2 className="mt-2 font-body text-[20px] font-semibold leading-snug tracking-[-0.005em] text-[#0B1F33]">{title}</h2>
      <p className="mt-2.5 max-w-2xl text-[13.5px] leading-[1.65] text-[#0B1F33]/60">{description}</p>
      <div className="mt-6 grid gap-2.5 md:grid-cols-3">
        {actions.map((action, i) => (
          <div
            key={action}
            className="group flex items-start gap-3 rounded-[8px] border border-[rgba(11,31,51,0.07)] bg-[#F7F8FB] p-4 transition-all duration-150 hover:border-[rgba(200,169,106,0.35)] hover:bg-white hover:shadow-[0_2px_12px_rgba(11,31,51,0.06)]"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[rgba(200,169,106,0.12)]">
              <Check className="h-3.5 w-3.5 text-[#C8A96A]" />
            </div>
            <p className="text-[13px] font-medium leading-snug text-[#0B1F33] group-hover:text-[#0B1F33]">{action}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function WorkspaceReports() {
  const monthlyReports = [
    {
      section: "Executive Summary",
      value: "42%",
      headline: "After-work activity is leading the month.",
      copy: "Dinner, events, and nearby offers are driving the strongest resident intent.",
      action: "View report",
    },
    {
      section: "Trend Visuals",
      value: "+18%",
      headline: "Walkable moments are outperforming broad reach.",
      copy: "Rainey, Seaholm, Congress, and Waterloo show the cleanest activity patterns.",
      action: "Review trend",
    },
    {
      section: "Campaign Performance",
      value: "6.8%",
      headline: "Simple timed offers are easiest to act on.",
      copy: "Campaigns with one clear save, RSVP, scan, or direction action perform best.",
      action: "Plan offer",
    },
    {
      section: "Resident Behavior",
      value: "312",
      headline: "People save first, then decide.",
      copy: "Saved places are becoming the bridge between discovery and visits.",
      action: "Review behavior",
    },
    {
      section: "Recommendations",
      value: "3",
      headline: "Run the next test near the busiest walk path.",
      copy: "Anchor the next placement to movement that is already happening nearby.",
      action: "Open campaigns",
    },
    {
      section: "Next Actions",
      value: "4",
      headline: "Move from insight to one live campaign.",
      copy: "Pick a place, timing, audience, and action from the monthly readout.",
      action: "Start next step",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between rounded-[12px] border border-[rgba(11,31,51,0.07)] bg-white p-6 shadow-[0_2px_8px_rgba(11,31,51,0.04),0_8px_28px_rgba(11,31,51,0.05)]">
        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">Monthly report</span>
          <h2 className="mt-2 font-body text-[20px] font-semibold leading-tight tracking-[-0.005em] text-[#0B1F33]">What changed and what to do next</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.65] text-[#0B1F33]/58">
            A readable partner report organized around observations, trends, recommendations, and expected outcomes.
          </p>
        </div>
        <Link
          to="/map?mode=partner&tab=reports"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[7px] border border-[rgba(11,31,51,0.09)] bg-white px-4 text-[12px] font-semibold text-[#0B1F33]/68 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
        >
          Open map reports
        </Link>
      </div>
      <div className="grid gap-2.5">
        {monthlyReports.map((item) => (
          <article
            key={item.section}
            className="group grid gap-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-5 shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] transition-all duration-150 hover:border-[rgba(200,169,106,0.28)] hover:shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)] md:grid-cols-[0.22fr_1fr_auto] md:items-start md:gap-6"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#C8A96A]">{item.section}</p>
              <div className="mt-2 text-[24px] font-bold leading-none tracking-tight text-[#0B1F33] tabular-nums">{item.value}</div>
            </div>
            <div>
              <h3 className="font-body text-[14.5px] font-semibold leading-snug tracking-tight text-[#0B1F33]">{item.headline}</h3>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#0B1F33]/60">{item.copy}</p>
              <dl className="mt-3.5 grid gap-2 text-[12px] leading-[1.55] md:grid-cols-2">
                <div className="p-2.5 rounded-[6px] bg-[#F7F8FB]"><dt className="font-semibold text-[#0B1F33]/50 text-[10.5px] uppercase tracking-[0.08em]">Observation</dt><dd className="text-[#0B1F33]/70 mt-0.5">Activity is clustered around reachable downtown moments.</dd></div>
                <div className="p-2.5 rounded-[6px] bg-[#F7F8FB]"><dt className="font-semibold text-[#0B1F33]/50 text-[10.5px] uppercase tracking-[0.08em]">Trend</dt><dd className="text-[#0B1F33]/70 mt-0.5">Saved places and directions rise together after work.</dd></div>
                <div className="p-2.5 rounded-[6px] bg-[#F7F8FB]"><dt className="font-semibold text-[#0B1F33]/50 text-[10.5px] uppercase tracking-[0.08em]">Recommendation</dt><dd className="text-[#0B1F33]/70 mt-0.5">Keep the next offer close, timely, and easy to act on.</dd></div>
                <div className="p-2.5 rounded-[6px] bg-[#F7F8FB]"><dt className="font-semibold text-[#0B1F33]/50 text-[10.5px] uppercase tracking-[0.08em]">Expected Outcome</dt><dd className="text-[#0B1F33]/70 mt-0.5">Cleaner attribution and a more repeatable next campaign.</dd></div>
              </dl>
            </div>
            <Link
              to="/map?mode=partner&tab=reports"
              className="shrink-0 text-[12px] font-semibold text-[#0B1F33]/60 underline decoration-[#C8A96A]/50 underline-offset-4 transition-colors hover:text-[#0B1F33] hover:decoration-[#C8A96A]"
            >
              {item.action}
            </Link>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function WorkspaceOverview({ user, setTab }) {
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    listWorkspaceItems("Perk", "perks", user.email).then(setPerks);
    listWorkspaceItems("Event", "events", user.email).then(setEvents);
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {QUICK_STATS.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-5 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] text-center"
          >
            <div className="font-body text-[26px] font-semibold leading-none tracking-tight text-[#0B1F33] tabular-nums">{s.value}</div>
            <div className="text-[11px] font-medium text-[#0B1F33]/50 mt-1.5 uppercase tracking-[0.08em]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={() => setTab(a.tab)}
              className="group flex items-start gap-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-5 text-left shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(200,169,106,0.4)] hover:shadow-[0_4px_16px_rgba(11,31,51,0.07),0_10px_30px_rgba(11,31,51,0.06)] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(11,31,51,0.05)] border border-[rgba(11,31,51,0.06)] group-hover:bg-[rgba(200,169,106,0.12)] group-hover:border-[rgba(200,169,106,0.25)] transition-all duration-150">
                <Icon className="w-4 h-4 text-[#0B1F33]/60 group-hover:text-[#C8A96A] transition-colors duration-150" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[#0B1F33] mb-0.5 leading-snug">{a.label}</div>
                <div className="text-[12px] text-[#0B1F33]/52 leading-snug">{a.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B1F33]/28 mt-0.5 shrink-0 group-hover:translate-x-0.5 group-hover:text-[#C8A96A] transition-all duration-150" />
            </button>
          );
        })}
      </div>

      <DaaCivicWorkspacePanel />

      {/* Recent perks */}
      {perks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-[13px] font-semibold leading-snug tracking-normal text-foreground">Recent perks</h3>
            <button onClick={() => setTab("perks")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {perks.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-[2px] shrink-0 ${p.status === "active" ? "bg-[#C8A96A]" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
                </div>
                <span className="text-[11px] font-medium text-primary border border-primary/30 px-2 py-0.5 rounded-[2px] shrink-0">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent events */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-[13px] font-semibold leading-snug tracking-normal text-foreground">Recent events</h3>
            <button onClick={() => setTab("events")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-lg border border-border/40 bg-card/20">
                <div className={`w-2 h-2 rounded-[2px] shrink-0 ${e.status === "live" ? "bg-[#C8A96A]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] border capitalize shrink-0 ${
                  e.status === "live" ? "bg-[#0B1F33]/20 text-[#C8A96A] border-[#C8A96A]/30" :
                  e.status === "upcoming" ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-muted text-muted-foreground border-border/50"
                }`}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {perks.length === 0 && events.length === 0 && (
        <div className="flex flex-col items-center text-center py-14 px-6 rounded-[12px] border border-dashed border-[rgba(11,31,51,0.12)] bg-white/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-[12px] border border-[rgba(200,169,106,0.25)] bg-[rgba(200,169,106,0.08)] mb-4">
            <Zap className="w-6 h-6 text-[#C8A96A]" />
          </div>
          <h3 className="font-body mb-2 text-[16px] font-semibold leading-snug tracking-tight text-[#0B1F33]">Start building your presence</h3>
          <p className="text-[#0B1F33]/54 text-[13.5px] leading-relaxed mb-6 max-w-sm">Add your first perk or event and it will appear on the downtown map for people nearby.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => setTab("perks")}
              className="inline-flex h-9 items-center gap-1.5 rounded-[7px] bg-[#0B1F33] px-4 text-[12.5px] font-semibold text-white shadow-[0_2px_8px_rgba(11,31,51,0.18)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
            >
              <Plus className="w-3.5 h-3.5" /> Add a perk
            </button>
            <button
              onClick={() => setTab("events")}
              className="inline-flex h-9 items-center gap-1.5 rounded-[7px] border border-[rgba(11,31,51,0.10)] bg-white px-4 text-[12.5px] font-semibold text-[#0B1F33]/68 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/45 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5" /> Create an event
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function DaaCivicWorkspacePanel() {
  const mostVisitedStops = ["Waterloo Park", "Republic Square", "Moody Amphitheater", "The Paramount Theatre", "Congress Avenue Bridge"];
  const mostSavedStops = ["Treehouse at Pease Park", "Central Library Plaza", "Waller Creek Trail", "Mexic-Arte Museum", "Austin City Hall Plaza"];
  const returnStops = ["Republic Square", "Waterloo Park", "Rainey Street Trailhead", "Red River Cultural District", "Seaholm Power Plant"];
  const directionStops = ["Waterloo Park", "Pease Park", "The Driskill", "Bullock Museum Grounds", "Saltillo Plaza"];
  const learningStops = ["Writing on the Walls", "Malin's Fountain", "Ellsworth Kelly's Austin", "Seaholm Intake Facility", "Old Bakery and Emporium"];

  const stopHref = (label) => {
    const stop = daaTourStops.find((item) => item.name === label);
    if (!stop) return `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`;
    return `/map?mode=partner&tab=map&filter=Civic&entityId=${stop.id}`;
  };

  const railSections = [
    {
      title: "What People Are Telling Us",
      icon: MessageSquareText,
      support: "Survey themes from people opening, saving, checking in, and answering prompts on the tour.",
      items: daaDashboardContent.whatPeopleAreTellingUs.map((label) => ({
        label,
        meta: "Survey view",
        detail: `${label} opens the relevant survey summary so civic partners can understand why people stop, what they want, and how often they return downtown.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Why People Stop",
      icon: MessageSquareText,
      support: "Common reasons people pause at tour stops.",
      items: daaExplorerQuestions[0].options.map((label) => ({
        label,
        meta: "Survey answer",
        detail: `${label} helps explain what draws people into a civic stop before they save, check in, or ask for directions.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "What People Want More Of",
      icon: MessageSquareText,
      support: "Requested additions from downtown visitors, workers, and residents.",
      items: daaExplorerQuestions[1].options.map((label) => ({
        label,
        meta: "Requested more",
        detail: `${label} is useful for future programming, wayfinding, partner prompts, and public-space planning.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "How Often People Visit Downtown",
      icon: Users,
      support: "Visit frequency helps separate residents, regulars, and occasional visitors.",
      items: daaExplorerQuestions[2].options.map((label) => ({
        label,
        meta: "Visit frequency",
        detail: `${label} gives civic partners a clearer sense of whether the tour is serving regular downtown routines or bringing people back in.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Places People Use Most",
      icon: MapPin,
      support: "The main ways people interact with civic stops after opening the map.",
      items: daaDashboardContent.placesPeopleUseMost.map((label) => ({
        label,
        meta: "Place behavior",
        detail: `${label} connects tour behavior to a practical next action: visit, save, return, get directions, or learn more.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Most Visited Stops",
      icon: MapPin,
      support: "Stops that convert tour opens into real-world visits.",
      items: mostVisitedStops.map((label) => ({
        label,
        meta: "Visited stop",
        detail: `${label} is one of the civic places people are most likely to open and visit from the tour.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Most Saved Stops",
      icon: Star,
      support: "Stops people keep for later.",
      items: mostSavedStops.map((label) => ({
        label,
        meta: "Saved stop",
        detail: `${label} is being saved as a place people want to remember, revisit, or fold into a downtown plan.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Places People Return To",
      icon: Check,
      support: "Stops that become part of repeated downtown movement.",
      items: returnStops.map((label) => ({
        label,
        meta: "Return use",
        detail: `${label} shows repeat interest, which is useful for programming, signage, and nearby partner prompts.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Places People Ask Directions To",
      icon: Navigation,
      support: "Stops where wayfinding matters most.",
      items: directionStops.map((label) => ({
        label,
        meta: "Directions",
        detail: `${label} creates directions intent, meaning people are ready to move from interest to a real visit.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Places People Want To Understand",
      icon: MessageSquareText,
      support: "Stops where context, history, art, or public-space storytelling matters.",
      items: learningStops.map((label) => ({
        label,
        meta: "Learn more",
        detail: `${label} is a strong candidate for richer interpretive copy, QR prompts, and nearby tour context.`,
        href: stopHref(label),
      })),
    },
    {
      title: "When People Explore Downtown",
      icon: Calendar,
      support: "Time windows for tour opens, stop opens, saves, and directions.",
      items: daaDashboardContent.timeAnalysis.buckets.map((label) => ({
        label,
        meta: "Time window",
        detail: `${label} activity helps civic partners understand when people are most likely to explore, save, or continue to another stop.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "Tour Progress",
      icon: Check,
      support: "A quick read on how far the tour has moved from open to save to visit.",
      items: [
        { label: `Visited ${daaTourProgress.visited} / ${daaTourProgress.total}`, meta: "Check-ins", detail: "Visited stops show where tour discovery is turning into real-world movement.", href: "/map?mode=partner&tab=map&filter=Civic" },
        { label: `Saved ${daaTourProgress.saved}`, meta: "Saved", detail: "Saved stops show which places people want to remember or return to later.", href: "/map?mode=partner&tab=map&filter=Civic" },
        { label: `Nearby ${daaTourProgress.nearby}`, meta: "Nearby", detail: "Nearby stops show where people can continue the tour without starting over.", href: "/map?mode=partner&tab=map&filter=Civic" },
        { label: `Last Visited: ${daaTourProgress.lastVisited}`, meta: "Latest", detail: `${daaTourProgress.lastVisited} is the latest visited stop in this civic workspace view.`, href: stopHref(daaTourProgress.lastVisited) },
      ],
    },
    {
      title: "Areas of Downtown",
      icon: Navigation,
      support: "District context for where civic tour activity is happening.",
      items: daaTourDistricts.map((label) => ({
        label,
        meta: "District",
        detail: `${label} groups stops, saves, directions, and learning moments into a downtown area people can understand.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
  ];
  const [activeRailItem, setActiveRailItem] = useState(railSections[0].items[0]);

  return (
    <section className="mb-8 rounded-[10px] border border-[rgba(11,31,51,.06)] bg-[#F7F8FB] p-5 shadow-[0_8px_24px_rgba(11,31,51,.04)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Downtown Austin Art & Parks Tour</div>
          <h3 className="font-body mt-2 text-[23px] font-semibold leading-snug tracking-normal text-[#0B1F33]">{daaDashboardContent.title}</h3>
          <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-[#0B1F33]/66">
            A civic view for tour opens, stop opens, saved stops, check-ins, survey completions, directions, areas of downtown, and when people explore.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/map?mode=partner&tab=map&filter=Civic" className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#0B1F33] px-3 text-[12px] font-semibold text-white">
            Open DAA Explorer
          </Link>
          <Link to="/map?mode=resident&tab=map&filter=Civic&entityId=daa-stop-01-malin-s-fountain" className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[rgba(11,31,51,.08)] bg-white px-3 text-[12px] font-semibold text-[#0B1F33]">
            View First Stop
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {daaDashboardContent.overview.slice(0, 8).map(([label, value]) => (
          <div key={label} className="rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/86 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{label}</div>
            <p className="mt-1 text-[20px] font-semibold leading-tight tracking-normal text-[#0B1F33]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">{activeRailItem.meta}</div>
            <h4 className="font-body mt-1 text-[16px] font-semibold leading-snug tracking-normal text-[#0B1F33]">{activeRailItem.label}</h4>
            <p className="mt-2 max-w-[64ch] text-[13px] leading-6 text-[#0B1F33]/66">{activeRailItem.detail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to={activeRailItem.href} className="inline-flex h-8 items-center justify-center rounded-[6px] bg-[#0B1F33] px-3 text-[11px] font-semibold text-white">
              View on map
            </Link>
            <Link to="/map?mode=partner&tab=map&filter=Civic" className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[rgba(11,31,51,.08)] bg-white px-3 text-[11px] font-semibold text-[#0B1F33]">
              Open explorer
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {railSections.map((section) => (
          <DaaInsightRail
            key={section.title}
            section={section}
            activeLabel={activeRailItem.label}
            onSelect={setActiveRailItem}
          />
        ))}
      </div>
    </section>
  );
}

function DaaInsightRail({ section, activeLabel, onSelect }) {
  const Icon = section.icon;

  return (
    <div className="rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/74 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#C8A96A]" />
        <h4 className="font-body text-[14px] font-semibold leading-snug tracking-normal text-[#0B1F33]">{section.title}</h4>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/58">{section.support}</p>
      <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {section.items.map((item) => {
          const isActive = activeLabel === item.label;
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(item)}
              className={`min-w-[150px] snap-start rounded-[6px] border px-2.5 py-2 text-left text-[12px] font-medium leading-snug transition ${
                isActive
                  ? "border-[#C8A96A]/70 bg-white text-[#0B1F33] shadow-[0_8px_24px_rgba(11,31,51,.055)]"
                  : "border-[rgba(11,31,51,.06)] bg-[#F7F8FB] text-[#0B1F33]/70 hover:border-[#C8A96A]/45 hover:text-[#0B1F33]"
              }`}
            >
              <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{item.meta}</span>
              <span className="mt-1 block">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
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
    listWorkspaceItems("Perk", "perks", user.email)
      .then(data => { setPerks(data || []); setLoading(false); })
      .catch(() => { setPerks(getStoredItems("perks", user.email)); setLoading(false); });
  };

  useEffect(() => { load(); }, [user.email]);

  function handleEdit(perk) { setEditing(perk); setShowForm(true); }
  function handleAdd() { setEditing(null); setShowForm(true); }
  async function handleDelete(id) {
    await deleteWorkspaceItem("Perk", "perks", user.email, id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-body text-xl font-semibold leading-snug tracking-normal text-foreground">Perks</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Offers that appear on the downtown map for people nearby.</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(11,31,51,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
          <Plus className="w-3.5 h-3.5" /> Add perk
        </button>
      </div>

      {showForm && (
        <PerkForm user={user} perk={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <EmptyState icon={Star} headline="No perks yet" body="Add your first perk and it will appear on the downtown map." action="Add a perk" onAction={handleAdd} />
      ) : (
        <div className="space-y-3">
          {perks.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "active" ? "bg-[#C8A96A] shadow-[0_0_4px_rgba(200,169,106,0.5)]" : p.status === "paused" ? "bg-[#C8A96A]/50" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{p.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
              </div>
              <span className="text-[11.5px] font-semibold text-[#8B6B2F] border border-[rgba(200,169,106,0.35)] bg-[rgba(200,169,106,0.08)] px-2.5 py-0.5 rounded-full shrink-0 hidden sm:block">{p.value}</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
                p.status === "active" ? "bg-[rgba(200,169,106,0.1)] text-[#8B6B2F] border-[rgba(200,169,106,0.3)]" :
                p.status === "paused" ? "bg-[rgba(11,31,51,0.05)] text-[#0B1F33]/50 border-[rgba(11,31,51,0.1)]" :
                "bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/40 border-[rgba(11,31,51,0.08)]"
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
    try {
      if (perk?.id) {
        await updateWorkspaceItem("Perk", "perks", user.email, perk.id, form);
      } else {
        await createWorkspaceItem("Perk", "perks", user.email, form);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mb-6 p-6 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{perk ? "Edit perk" : "New perk"}</h3>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/50 hover:bg-[rgba(11,31,51,0.08)] hover:text-[#0B1F33] transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Perk title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <FormField label="Venue name" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} required />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors">
            {PERK_CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </div>
        <FormField label="Value (e.g. 15% off)" value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} required />
        <FormField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <FormField label="Terms & conditions" value={form.terms} onChange={v => setForm(f => ({ ...f, terms: v }))} />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
            {saving ? "Saving…" : perk ? "Save changes" : "Create perk"}
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center px-4 h-9 rounded-[7px] border border-[rgba(11,31,51,0.10)] bg-white text-[12.5px] font-semibold text-[#0B1F33]/62 transition-all duration-150 hover:-translate-y-px hover:border-[rgba(11,31,51,0.16)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
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
    listWorkspaceItems("Event", "events", user.email)
      .then(data => { setEvents(data || []); setLoading(false); })
      .catch(() => { setEvents(getStoredItems("events", user.email)); setLoading(false); });
  };

  useEffect(() => { load(); }, [user.email]);

  async function handleDelete(id) {
    await deleteWorkspaceItem("Event", "events", user.email, id);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-body text-xl font-semibold leading-snug tracking-normal text-foreground">Events</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Events that appear on the downtown map with RSVP and discovery.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(11,31,51,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
          <Plus className="w-3.5 h-3.5" /> Add event
        </button>
      </div>

      {showForm && (
        <EventForm user={user} event={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={() => { setShowForm(false); setEditing(null); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} headline="No events yet" body="Add your first event and it will appear on the downtown map with RSVP support." action="Add an event" onAction={() => { setEditing(null); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.status === "live" ? "bg-[#C8A96A] shadow-[0_0_4px_rgba(200,169,106,0.5)]" : e.status === "upcoming" ? "bg-[#0B1F33]/40" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{e.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
              </div>
              <span className="text-[11px] font-medium text-[#0B1F33]/40 hidden md:block shrink-0">{e.rsvp_count || 0} RSVPs</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
                e.status === "live" ? "bg-[rgba(200,169,106,0.1)] text-[#8B6B2F] border-[rgba(200,169,106,0.3)]" :
                e.status === "upcoming" ? "bg-[rgba(11,31,51,0.05)] text-[#0B1F33]/60 border-[rgba(11,31,51,0.12)]" :
                "bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/40 border-[rgba(11,31,51,0.08)]"
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
    try {
      if (event?.id) {
        await updateWorkspaceItem("Event", "events", user.email, event.id, data);
      } else {
        await createWorkspaceItem("Event", "events", user.email, data);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-6 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{event ? "Edit event" : "New event"}</h3>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/50 hover:bg-[rgba(11,31,51,0.08)] hover:text-[#0B1F33] transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Event title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <FormField label="Venue name" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors">
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
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors">
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <input type="checkbox" id="members-only" checked={form.is_members_only} onChange={e => setForm(f => ({ ...f, is_members_only: e.target.checked }))}
            className="w-4 h-4 rounded border-[rgba(11,31,51,0.2)] accent-[#0B1F33]" />
          <label htmlFor="members-only" className="text-[13px] text-[#0B1F33]/60">Members only</label>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center px-4 h-9 rounded-[7px] border border-[rgba(11,31,51,0.10)] bg-white text-[12.5px] font-semibold text-[#0B1F33]/62 transition-all duration-150 hover:-translate-y-px hover:border-[rgba(11,31,51,0.16)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function ProfileSection({ user, setUser }) {
  const [form, setForm] = useState(() => ({
    organization_name: user?.organization_name || "",
    partner_type: user?.partner_type || "venue",
    website: user?.website || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    ...(getStoredProfile() || {}),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      organization_name: user?.organization_name || "",
      partner_type: user?.partner_type || "venue",
      website: user?.website || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      ...(getStoredProfile() || {}),
    });
  }, [user.email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const nextUser = {
      ...PUBLIC_PARTNER_USER,
      ...user,
      ...form,
      full_name: form.organization_name || user.full_name || PUBLIC_PARTNER_USER.full_name,
    };

    try {
      const updated = await base44.auth.updateMe(form);
      const normalizedUser = { ...nextUser, ...(updated || {}) };
      saveStoredProfile(normalizedUser);
      setUser(normalizedUser);
    } catch {
      saveStoredProfile(nextUser);
      setUser(nextUser);
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
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
        <h2 className="font-body text-xl font-semibold leading-snug tracking-normal text-foreground">Profile</h2>
        <p className="text-muted-foreground text-[13px] mt-0.5">Your organization info shown on the downtown map.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-[#F7F8FB] mb-2">
          <div className="text-[10.5px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.12em] mb-1.5">Account</div>
          <div className="text-[13px] font-medium text-[#0B1F33]">{user.full_name}</div>
          <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{user.email}</div>
        </div>

        <FormField label="Organization name" value={form.organization_name} onChange={v => setForm(f => ({ ...f, organization_name: v }))} />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Partner type</label>
          <select value={form.partner_type} onChange={e => setForm(f => ({ ...f, partner_type: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors">
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <FormField label="Website" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} type="url" />
        <FormField label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">About</label>
          <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Describe your organization, venue, or program."
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors resize-none placeholder:text-[#0B1F33]/25" />
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </motion.div>
  );
}

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

function FormField({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(200,169,106,0.5)] focus:ring-2 focus:ring-[rgba(200,169,106,0.15)] transition-colors placeholder:text-[#0B1F33]/25"
      />
    </div>
  );
}

function EmptyState({ icon: Icon, headline, body, action, onAction }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-12 rounded-[10px] border border-[rgba(200,169,106,0.25)] bg-[rgba(200,169,106,0.07)] flex items-center justify-center mx-auto mb-4 shadow-[0_2px_8px_rgba(200,169,106,0.1)]">
        <Icon className="w-5 h-5 text-[#C8A96A]" />
      </div>
      <h3 className="mb-1.5 text-[15px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{headline}</h3>
      <p className="text-[13px] text-[#0B1F33]/50 mb-6 max-w-sm mx-auto leading-relaxed">{body}</p>
      <button onClick={onAction} className="inline-flex items-center gap-2 px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50">
        <Plus className="w-3.5 h-3.5" /> {action}
      </button>
    </div>
  );
}
