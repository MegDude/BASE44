import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Trash2, ChevronRight, Calendar, Star, LayoutDashboard, Check, MapPin, MessageSquareText, Navigation, Users, CreditCard, UserPlus, LogIn, ArrowRight, Bot, Bell, Search, ShieldCheck, WalletCards, Lock } from "lucide-react";
import { daaDashboardContent, daaExplorerQuestions, daaTourDistricts, daaTourProgress, daaTourStops } from "@/data/daaArtParksTour";
import { PARTNER_WORKSPACE_COPY, PARTNER_WORKSPACE_NAV } from "@/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry";
import {
  demoOrganizations,
  getOrganizationEntities,
  workspaceStatusCopy,
} from "@/config/workspaceArchitecture";

// ─── ENTITIES ─────────────────────────────────────────────────────────────────
// We use Perk, Event, and Venue entities which already exist.
// Partner profile is stored on the user object.

const TABS = PARTNER_WORKSPACE_NAV;

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
  email: "downtown-perks-workspace",
  full_name: "Partner Workspace",
  partner_name: "Downtown Perks Partner",
  partner_type: "neighborhood",
};

const WORKSPACE_CATEGORIES = [
  { label: "Properties", href: "/partners/properties", description: "Connect your building to nearby experiences, resident perks, events, and neighborhood activity." },
  { label: "Hotels", href: "/partners/hotels", description: "Help guests discover what is happening nearby while measuring engagement beyond the hotel lobby." },
  { label: "Venues", href: "/partners/venues", description: "Appear when people nearby are deciding where to eat, drink, meet, or explore." },
  { label: "Brands", href: "/partners/brands", description: "Reach people in real places during real decision-making moments." },
  { label: "Civic", href: "/partners/civic", description: "Promote public spaces, cultural destinations, and community participation throughout downtown." },
  { label: "Real Estate", href: "/partners/real-estate", description: "Show available properties alongside the places, amenities, and activity that shape buyer decisions." },
];

const FRIENDLY_ENTITLEMENTS = ["Map Listing", "Campaigns", "Offers", "Events", "Surveys", "Reports", "QR Experiences", "Audience", "Media"];
const PARTNER_SETUP_KEY = "dp_partner_lifecycle_setup";
const WORKSPACE_ACTIVATION_KEY = "dp_partner_workspace:activation";
const PARTNER_SESSION_KEY = "dp_partner_workspace:session";

const PARTNER_LIFECYCLE_LINKS = [
  { label: "Partner Type", href: "/partners/start", detail: "Choose the lane, workspace template, recommended plan, and default modules.", icon: UserPlus },
  { label: "Registration", href: "/partners/register", detail: "Confirm organization, contact, location, profile, and setup details.", icon: ShieldCheck },
  { label: "Pricing", href: "/partners/pricing", detail: "Compare annual plans, modules, limits, and upgrade paths.", icon: CreditCard },
  { label: "Checkout", href: "/partners/checkout", detail: "Confirm subscription, invoice, tax, coupon, and billing details.", icon: WalletCards },
  { label: "Workspace", href: "/partners/provision", detail: "Provision profile, modules, team, reporting, billing, and AI context.", icon: LayoutDashboard },
];

const WORKSPACE_CAPABILITY_LINKS = [
  { label: "Map Listing", href: "/partner-workspace/map", description: "Manage the public map listing, placement, images, categories, and live preview." },
  { label: "Offers", href: "/partner-workspace/offers", description: "Create and manage perks, resident benefits, validations, and in-market offers." },
  { label: "Events", href: "/partner-workspace/events", description: "Publish events and keep them connected to map discovery and reporting." },
  { label: "Surveys", href: "/partner-workspace/surveys", description: "Build surveys, choose an audience, send a test, and launch when ready." },
  { label: "Campaigns", href: "/partner-workspace/campaigns", description: "Plan placements, messages, QR codes, events, and offers from one workflow." },
  { label: "Broadcasts", href: "/partner-workspace/broadcasts", description: "Create email and SMS campaigns when the Broadcasts add-on is active.", lockedByDefault: true, addonId: "broadcasts" },
  { label: "Audience", href: "/partner-workspace/audience", description: "Choose districts, buildings, segments, uploaded contacts, and saved audiences." },
  { label: "Media", href: "/partner-workspace/media", description: "Keep logos, photos, videos, copy, and QR assets ready to publish." },
  { label: "Reports", href: "/partner-workspace/reports", description: "See monthly performance, saves, redemptions, activity, and recommendations." },
  { label: "Analytics", href: "/partner-workspace/analytics", description: "Understand what people view, save, open, scan, and act on." },
  { label: "Profile", href: "/partner-workspace/profile", description: "Keep organization details, contacts, listings, and workspace context current." },
  { label: "Team", href: "/partner-workspace/team", description: "Manage roles, permissions, and workspace access." },
  { label: "Billing", href: "/partner-workspace/billing", description: "Review plan access, invoices, subscriptions, and checkout status." },
];

const WORKSPACE_MODULE_GROUPS = [
  {
    label: "Operations",
    items: [
      { label: "Offers", href: "/partner-workspace/offers", description: "Create and manage resident benefits." },
      { label: "Events", href: "/partner-workspace/events", description: "Publish plans that should appear nearby." },
      { label: "Campaigns", href: "/partner-workspace/campaigns", description: "Build moments around places and timing." },
      { label: "QR", href: "/partner-workspace/sources", description: "Generate entry points for lobbies, counters, and events." },
      { label: "Listings", href: "/partner-workspace/sources", description: "Connect property or listing context to the map." },
    ],
  },
  {
    label: "Media",
    items: [
      { label: "Gallery", href: "/partner-workspace/profile", description: "Keep images and media current." },
      { label: "Brand", href: "/partner-workspace/profile", description: "Manage public identity and map copy." },
      { label: "Profile", href: "/partner-workspace/profile", description: "Update organization details." },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Audience", href: "/partner-workspace/analytics", description: "Read saves, scans, visits, and source paths." },
      { label: "Followers", href: "/partner-workspace/analytics", description: "Understand who keeps coming back." },
      { label: "Saved", href: "/partner-workspace/reports", description: "Review saved places and offers." },
      { label: "Reviews", href: "/partner-workspace/reports", description: "Summarize feedback and survey signal." },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports", href: "/partner-workspace/reports", description: "Summarize what changed and what to do next." },
      { label: "Performance", href: "/partner-workspace/analytics", description: "Track views, directions, scans, and redemptions." },
      { label: "Exports", href: "/partner-workspace/reports", description: "Prepare CSV, PDF, and email-ready reads." },
      { label: "Growth", href: "/partner-workspace/analytics", description: "Find where to improve next." },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Team", href: "/partner-workspace/team", description: "Invite teammates and assign roles." },
      { label: "Permissions", href: "/partner-workspace/team", description: "Control workspace access." },
      { label: "Billing", href: "/partner-workspace/billing", description: "Review plan, subscription, invoices, and seats." },
      { label: "Integrations", href: "/partner-workspace/profile", description: "Connect API, domains, notifications, and tools." },
      { label: "Settings", href: "/partner-workspace/profile", description: "Manage organization settings and audit context." },
    ],
  },
];

const ROLE_LABELS = {
  owner: "Owner",
  admin: "Administrator",
  manager: "Workspace Manager",
  editor: "Marketing Lead",
};

function friendlyRoleLabel(role) {
  return ROLE_LABELS[String(role || "").toLowerCase()] || "Workspace Manager";
}

function friendlyWorkspaceStatus(status) {
  return String(status || "").toLowerCase() === "trial" ? "Trial Workspace" : "Active Workspace";
}

const WORKSPACE_STORAGE_PREFIX = "dp_partner_workspace";

function getWorkspaceTabFromPath(pathname) {
  if (pathname.includes("/map")) return "map";
  if (pathname.includes("/offers") || pathname.includes("/perks")) return "offers";
  if (pathname.includes("/campaigns")) return "campaigns";
  if (pathname.includes("/events")) return "events";
  if (pathname.includes("/surveys")) return "surveys";
  if (pathname.includes("/broadcasts") || pathname.includes("/messages")) return "broadcasts";
  if (pathname.includes("/audience") || pathname.includes("/segmentation")) return "audience";
  if (pathname.includes("/media")) return "media";
  if (pathname.includes("/properties") || pathname.includes("/hotels") || pathname.includes("/venues") || pathname.includes("/brands") || pathname.includes("/civic") || pathname.includes("/real-estate") || pathname.includes("/sources") || pathname.includes("/residents") || pathname.includes("/buildings")) return "sources";
  if (pathname.includes("/reports")) return "reports";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/profile")) return "profile";
  if (pathname.includes("/team") || pathname.includes("/messages")) return "team";
  if (pathname.includes("/billing")) return "billing";
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

function readPartnerSetup() {
  return getStoredJson(PARTNER_SETUP_KEY, {});
}

function readCheckoutSetup(search = "") {
  const params = new URLSearchParams(search);
  const setup = readPartnerSetup();
  const modules = params.get("modules");
  const moduleLabels = params.get("moduleLabels");

  return {
    ...setup,
    partnerType: params.get("partnerType") || setup.partnerType,
    plan: params.get("plan") || setup.plan,
    sku: params.get("sku") || setup.sku,
    checkoutKey: params.get("sku") || setup.checkoutKey,
    modules: modules ? modules.split(",").map((module) => module.trim()).filter(Boolean) : setup.modules,
    moduleLabels: moduleLabels ? moduleLabels.split(",").map((label) => label.trim()).filter(Boolean) : setup.moduleLabels,
    annualTotal: params.get("annualTotal") || setup.annualTotal,
    recurringAnnualTotal: params.get("recurringAnnualTotal") || setup.recurringAnnualTotal,
    oneTimeTotal: params.get("oneTimeTotal") || setup.oneTimeTotal,
    annualAddOnTotal: params.get("annualAddOnTotal") || setup.annualAddOnTotal,
  };
}

function normalizeBusinessName(setup = {}) {
  return (
    setup.businessName ||
    setup.organizationName ||
    setup.companyName ||
    setup.partnerName ||
    (setup.partnerType ? `${setup.partnerType} Workspace` : "") ||
    "Downtown Perks Partner"
  );
}

function getPurchasedModules(setup = {}) {
  const modules = Array.isArray(setup.modules)
    ? setup.modules
    : String(setup.modules || "")
        .split(",")
        .map((module) => module.trim())
        .filter(Boolean);

  return Array.from(new Set([
    "map",
    "offers",
    "events",
    "campaigns",
    "surveys",
    "reports",
    "qr",
    "audience",
    "media",
    ...modules,
  ]));
}

function getWorkspaceActivation() {
  return getStoredJson(WORKSPACE_ACTIVATION_KEY, null);
}

function writePartnerWorkspaceSession(profile = {}, activation = {}) {
  if (typeof window === "undefined") return;
  const organizationName = profile.organization_name || profile.partner_name || activation.organizationName || "Downtown Perks Partner";
  const session = {
    type: "partner",
    user: {
      id: profile.email || organizationName,
      email: profile.email || "",
      full_name: profile.full_name || profile.contact_name || organizationName,
      organization_name: organizationName,
      partner_type: profile.partner_type || activation.partnerType || "partner",
      role: "partner",
    },
    checkoutSessionId: activation.id,
    createdAt: activation.createdAt || new Date().toISOString(),
  };
  setStoredJson(PARTNER_SESSION_KEY, session);
}

function provisionWorkspaceFromCheckout(search = "") {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(search);
  const hasCheckoutSignal = params.get("checkout") === "success" || params.get("provisioned") === "1";
  const existing = getWorkspaceActivation();
  if (!hasCheckoutSignal && existing) return existing;
  if (!hasCheckoutSignal) return null;

  const setup = readCheckoutSetup(search);
  const businessName = normalizeBusinessName(setup);
  const modules = getPurchasedModules(setup);
  const activation = {
    id: params.get("session_id") || existing?.id || `workspace-${Date.now()}`,
    organizationName: businessName,
    partnerType: setup.partnerType || setup.organizationType || "Partner",
    plan: setup.plan || "Workspace plan",
    sku: setup.sku || setup.checkoutKey || "workspace",
    modules,
    moduleLabels: Array.isArray(setup.moduleLabels) ? setup.moduleLabels : [],
    annualTotal: setup.annualTotal || "configured",
    status: "active",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "profile", label: "Complete business profile", done: Boolean(setup.businessName || setup.organizationName || setup.partnerName) },
      { id: "map", label: "Publish map listing", done: modules.includes("map") },
      { id: "offer", label: "Create first offer", done: modules.includes("offers") },
      { id: "campaign", label: "Launch first campaign", done: modules.includes("campaigns") },
      { id: "audience", label: "Choose target audience", done: modules.includes("audience") },
      { id: "media", label: "Add media and QR assets", done: modules.includes("media") || modules.includes("qr") },
    ],
  };

  const profile = {
    partner_name: businessName,
    organization_name: businessName,
    full_name: setup.contactName || setup.contact || businessName,
    email: setup.email || PUBLIC_PARTNER_USER.email,
    partner_type: activation.partnerType,
    planInterest: activation.plan,
    selectedPlan: activation.plan,
    website: setup.website || "",
    phone: setup.phone || "",
    address: setup.address || "",
    district: setup.district || "Downtown Austin",
  };

  setStoredJson(WORKSPACE_ACTIVATION_KEY, activation);
  setStoredJson(workspaceKey("profile"), profile);
  setStoredJson("dp_partner_workspace:profile:current", profile);
  writePartnerWorkspaceSession(profile, activation);
  return activation;
}

function hasWorkspaceModule(activation, moduleId) {
  if (!activation) return moduleId !== "broadcasts";
  const modules = activation.modules || [];
  return modules.includes(moduleId) || modules.includes(moduleId.replace(/s$/, ""));
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
  const [activation, setActivation] = useState(() => getWorkspaceActivation());
  const navigate = useNavigate();
  const workspaceDisplayName = activation?.organizationName || user.organization_name || user.partner_name || user.full_name || user.email?.split("@")[0] || "Your workspace";
  const isPublicWorkspaceUser = !activation && user.email === PUBLIC_PARTNER_USER.email;
  const isReportsTab = tab === "reports";

  useEffect(() => {
    const nextActivation = provisionWorkspaceFromCheckout(location.search);
    if (!nextActivation) return;
    setActivation(nextActivation);
    setUser((currentUser) => ({
      ...currentUser,
      ...(getStoredProfile() || {}),
      partner_name: nextActivation.organizationName,
      organization_name: nextActivation.organizationName,
      partner_type: nextActivation.partnerType,
    }));
  }, [location.search]);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setUser({ ...PUBLIC_PARTNER_USER, ...(u || {}), ...(getStoredProfile() || {}) }))
      .catch(() => setUser((currentUser) => ({ ...currentUser, ...(getStoredProfile() || {}) })));
  }, []);

  useEffect(() => {
    setTab(getWorkspaceTabFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const activeItem = PARTNER_WORKSPACE_NAV.find((item) => item.id === tab);
    if (!activeItem || location.pathname === activeItem.href) return;
    if (!location.pathname.startsWith("/partner-workspace")) return;
    navigate(activeItem.href, { replace: true });
  }, [tab, location.pathname, navigate]);

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
    <div className={`dp-partner-page dp-partner-workspace-page min-h-screen bg-white text-[#0B1F33] ${isReportsTab ? "dp-partner-workspace-page--reports" : ""}`}>
      {/* Header */}
      <div className="dp-partner-workspace-header pt-20 pb-0 px-5 bg-white border-b border-[rgba(11,31,51,0.07)] shadow-[0_1px_0_rgba(11,31,51,0.04),0_4px_16px_rgba(11,31,51,0.03)]">
        <div className="dp-partner-workspace-header-inner max-w-6xl mx-auto">
          <div className="dp-partner-workspace-title-row flex items-end justify-between mb-5 gap-4">
            <div className="dp-partner-workspace-title-copy">
              <span className="dp-partner-workspace-eyebrow text-[10.5px] font-semibold text-[#C8A96A] uppercase tracking-[0.18em] block mb-1.5">Partner Workspace</span>
              <h1 className="dp-partner-workspace-title font-heading text-[22px] md:text-[28px] font-medium tracking-[-0.01em] leading-tight text-[#0B1F33]">
                {isReportsTab ? "Monthly Reports" : tab === "overview" ? `${workspaceDisplayName} Home` : workspaceDisplayName}
              </h1>
              <p className="dp-partner-workspace-support text-[#0B1F33]/52 text-[12.5px] mt-1 font-normal">
                {isReportsTab
                  ? "Readable partner reports organized around what changed, what worked, and what to do next."
                  : activation
                    ? `${activation.plan} is active. Start with profile, map listing, offers, events, campaigns, and reporting from this workspace.`
                    : "Registration, pricing, checkout, provisioning, and daily operations now move through one connected workspace path."}
              </p>
            </div>
            <div className="dp-partner-workspace-header-tools" aria-label="Workspace utilities">
              <button type="button" aria-label="Search workspace"><Search aria-hidden="true" /></button>
              <button type="button" aria-label="Workspace assistant"><Bot aria-hidden="true" /></button>
              <button type="button" aria-label="Notifications"><Bell aria-hidden="true" /></button>
              <button
                type="button"
                onClick={isPublicWorkspaceUser ? handleSignIn : handleSignOut}
                className="dp-partner-workspace-signin"
              >
                {isPublicWorkspaceUser ? "Sign in" : "Sign out"}
              </button>
            </div>
          </div>

          <nav className="dp-partner-lifecycle-rail" aria-label="Partner lifecycle">
            {PARTNER_LIFECYCLE_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.href}>
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Tabs — animated sliding indicator */}
          <div className="dp-partner-workspace-tabs relative flex gap-0 -mb-px overflow-x-auto scrollbar-none">
            {TABS.map(t => (
              <button
                key={t.id}
                title={t.helper}
                onClick={() => {
                  setTab(t.id);
                  navigate(t.href);
                }}
                className={`dp-partner-workspace-tab relative flex-shrink-0 px-4 py-2.5 text-[12px] font-medium transition-colors duration-150 focus-visible:outline-none ${
                  tab === t.id
                    ? "text-[#0B1F33]"
                    : "text-[#0B1F33]/46 hover:text-[#0B1F33]/72"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="workspace-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8A96A] rounded-[2px]"
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
          {tab === "overview" && <WorkspaceOverview key="overview" user={user} setTab={setTab} mode={isPublicWorkspaceUser && !activation ? "unlinked" : "active"} activation={activation} />}
          {tab === "map" && <WorkspaceRegistryPanel key="map" tabId="map" />}
          {tab === "campaigns" && <WorkspaceRegistryPanel key="campaigns" tabId="campaigns" />}
          {tab === "offers" && <PerksManager key="offers" user={user} />}
          {tab === "events" && <EventsManager key="events" user={user} />}
          {tab === "surveys" && <WorkspaceRegistryPanel key="surveys" tabId="surveys" />}
          {tab === "broadcasts" && <WorkspaceRegistryPanel key="broadcasts" tabId="broadcasts" />}
          {tab === "audience" && <WorkspaceRegistryPanel key="audience" tabId="audience" />}
          {tab === "media" && <WorkspaceRegistryPanel key="media" tabId="media" />}
          {tab === "sources" && <WorkspaceRegistryPanel key="sources" tabId="sources" />}
          {tab === "reports" && <WorkspaceReports key="reports" />}
          {tab === "analytics" && <WorkspaceAnalytics key="analytics" />}
          {tab === "profile" && <ProfileSection key="profile" user={user} setUser={setUser} />}
          {tab === "team" && <WorkspaceRegistryPanel key="team" tabId="team" />}
          {tab === "billing" && <WorkspaceRegistryPanel key="billing" tabId="billing" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function getWorkspacePanelItems(copy = {}) {
  return [
    ...(copy.prompts || []),
    ...(copy.actions || []),
    ...(copy.columns || []),
    ...(copy.types || []),
    ...(copy.steps || []),
    ...(copy.sections || []),
    ...(copy.filters || []),
    ...(copy.ctas || []),
    ...(copy.roles || []),
  ].filter(Boolean).slice(0, 8);
}

function WorkspaceRegistryPanel({ tabId }) {
  const copy = PARTNER_WORKSPACE_COPY[tabId] || PARTNER_WORKSPACE_COPY.overview;
  const items = getWorkspacePanelItems(copy);
  const primaryLabel = copy.createCta || copy.primaryCta?.label || copy.actions?.[0] || copy.ctas?.[0] || "Open map view";
  const primaryHref = copy.primaryCta?.href || (tabId === "map" ? "/map?mode=partner&tab=map&filter=All" : "/map?mode=partner&tab=map&filter=All");

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="dp-workspace-registry-panel"
    >
      <header className="dp-workspace-panel-header">
        <span>Partner Workspace</span>
        <h2>{copy.headline}</h2>
        <p>{copy.body || copy.emptyState}</p>
        <div className="dp-workspace-panel-actions">
          <Link to={primaryHref}>{primaryLabel}</Link>
          <Link to="/map?mode=partner&tab=map&filter=All">Open map</Link>
        </div>
      </header>

      {items.length > 0 && (
        <div className="dp-workspace-row-list">
          {items.map((item) => (
            <article key={item} className="dp-workspace-row">
              <strong>{item}</strong>
              <small>{copy.emptyState || "Use this when people nearby are deciding what to do next."}</small>
            </article>
          ))}
        </div>
      )}

      {copy.missingStripe && (
        <p className="dp-workspace-note">{copy.missingStripe}</p>
      )}
    </motion.section>
  );
}

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
      readout: [
        ["Observation", "Weekday evening decisions are clustering around dining and live plans."],
        ["Recommendation", "Lead with one after-work offer tied to a walkable route."],
        ["Likely next signal", "More saves, directions, and clearer campaign attribution."],
      ],
      action: "View report",
    },
    {
      section: "Trend Visuals",
      value: "+18%",
      headline: "Walkable moments are outperforming broad reach.",
      copy: "Rainey, Seaholm, Congress, and Waterloo show the cleanest activity patterns.",
      readout: [
        ["Trend", "Short-distance discovery is converting better than broad awareness."],
        ["Recommendation", "Keep placements near active pedestrian corridors."],
      ],
      action: "Review trend",
    },
    {
      section: "Campaign Performance",
      value: "6.8%",
      headline: "Simple timed offers are easiest to act on.",
      copy: "Campaigns with one clear save, RSVP, scan, or direction action perform best.",
      readout: [
        ["Observation", "One-action campaigns are easier for residents to understand."],
        ["Recommendation", "Use a single CTA and a narrow time window."],
        ["Likely next signal", "Higher completion and fewer drop-offs."],
      ],
      action: "Plan offer",
    },
    {
      section: "Resident Behavior",
      value: "312",
      headline: "People save first, then decide.",
      copy: "Saved places are becoming the bridge between discovery and visits.",
      readout: [
        ["Trend", "Saves are acting as intent signals before directions or scans."],
        ["Recommendation", "Retarget saved audiences with a timely reason to return."],
      ],
      action: "Review behavior",
    },
    {
      section: "Recommendations",
      value: "3",
      headline: "Run the next test near the busiest walk path.",
      copy: "Anchor the next placement to movement that is already happening nearby.",
      readout: [
        ["Recommendation", "Start with Rainey, Seaholm, or Congress based on current movement."],
        ["Likely next signal", "Faster learning with less wasted reach."],
      ],
      action: "Open campaigns",
    },
    {
      section: "Next Actions",
      value: "4",
      headline: "Move from insight to one live campaign.",
      copy: "Pick a place, timing, audience, and action from the monthly readout.",
      readout: [
        ["Observation", "The next step is operational, not another report."],
        ["Recommendation", "Launch one campaign and review it next week."],
      ],
      action: "Start next step",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="dp-workspace-reports"
    >
      <div className="dp-workspace-reports-hero mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between rounded-[12px] border border-[rgba(11,31,51,0.07)] bg-white p-6 shadow-[0_2px_8px_rgba(11,31,51,0.04),0_8px_28px_rgba(11,31,51,0.05)]">
        <div>
          <span className="dp-workspace-report-label text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">Reporting & Analytics</span>
          <h2 className="mt-2 font-body text-[20px] font-semibold leading-tight tracking-[-0.005em] text-[#0B1F33]">Track visibility, participation, and follow-through.</h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.65] text-[#0B1F33]/58">
            See what people viewed, saved, scanned, opened, requested directions to, redeemed, and returned to. Use each signal to decide what to launch, improve, or repeat next.
          </p>
        </div>
        <Link
          to="/map?mode=partner&tab=reports"
          className="dp-partner-workspace-button inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[7px] border border-[rgba(11,31,51,0.09)] bg-white px-4 text-[12px] font-semibold text-[#0B1F33]/68 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[#C8A96A]/50 hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50"
        >
          Open map reports
        </Link>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Visibility", "Views, map opens, listing activity, and featured placement reach."],
          ["Engagement", "Saves, scans, RSVPs, event opens, and offer interest."],
          ["Visits", "Directions, verified visits, redemptions, and repeat activity."],
          ["Next Action", "Recommendations tied to campaign, offer, event, and reporting signals."],
        ].map(([label, copy]) => (
          <article key={label} className="rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-4 shadow-[0_1px_4px_rgba(11,31,51,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{label}</p>
            <p className="mt-2 text-[13px] leading-[1.55] text-[#0B1F33]/64">{copy}</p>
          </article>
        ))}
      </div>
      <div className="dp-workspace-report-grid grid gap-2.5">
        {monthlyReports.map((item) => (
          <article
            key={item.section}
            className="dp-workspace-report-card group grid gap-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-5 shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] transition-all duration-150 hover:border-[rgba(200,169,106,0.28)] hover:shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)] md:grid-cols-[0.22fr_1fr_auto] md:items-start md:gap-6"
          >
            <div>
              <p className="dp-workspace-report-label text-[10px] font-semibold tracking-[0.12em] uppercase text-[#C8A96A]">{item.section}</p>
              <div className="dp-workspace-report-metric mt-2 text-[24px] font-bold leading-none tracking-tight text-[#0B1F33] tabular-nums">{item.value}</div>
            </div>
            <div>
              <h3 className="font-body text-[14.5px] font-semibold leading-snug tracking-tight text-[#0B1F33]">{item.headline}</h3>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#0B1F33]/60">{item.copy}</p>
              <dl className="dp-workspace-report-readout mt-3.5 grid gap-2 text-[12px] leading-[1.55] md:grid-cols-2">
                {item.readout.map(([label, detail]) => (
                  <div key={`${item.section}-${label}`} className="p-2.5 rounded-[6px] bg-[#F7F8FB]">
                    <dt className="font-semibold text-[#0B1F33]/50 text-[10.5px] uppercase tracking-[0.08em]">{label}</dt>
                    <dd className="text-[#0B1F33]/70 mt-0.5">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Link
              to="/map?mode=partner&tab=reports"
              className="dp-workspace-report-link shrink-0 text-[12px] font-semibold text-[#0B1F33]/60 underline decoration-[#C8A96A]/50 underline-offset-4 transition-colors hover:text-[#0B1F33] hover:decoration-[#C8A96A]"
            >
              {item.action}
            </Link>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function WorkspaceAnalytics() {
  const launchMetrics = [
    ["35", "Active partners", "Venues, hotels, properties, civic spaces, and brands currently represented."],
    ["1,284", "Resident reach", "People who can enter from buildings, QR links, campaigns, and the map."],
    ["81,904", "Views", "Map, campaign, event, and partner detail views available for review."],
    ["31,511", "Discovery actions", "Searches, saves, directions, scans, RSVPs, and offer opens."],
  ];

  const reportStreams = [
    ["Performance report", "Partner activity by views, saves, directions, redemptions, and campaign action.", "/partner-workspace/reports"],
    ["Map reports", "Open partner-mode reports directly on the live downtown map.", "/map?mode=partner&tab=reports"],
    ["Campaign report", "Review what a campaign changed across source points, timing, and nearby activity.", "/partners/campaigns"],
  ];

  const onboardingTargets = [
    ["Venues", "Bars, restaurants, coffee, live music, happy hours, and event-friendly places."],
    ["Hotels", "Lobby QR, guest discovery, concierge prompts, and nearby recommendations."],
    ["Residential", "Resident onboarding, building links, lobby QR, and neighborhood planning."],
    ["Civic and parks", "Waterloo, trails, public spaces, art, events, and downtown participation."],
  ];

  const launchTasks = [
    ["Reviewer link", "Send the latest app link plus this analytics tab so navigation and performance can be tested."],
    ["Report visibility", "Keep reports reachable from workspace analytics and the partner map."],
    ["Venue inputs", "Add bars and Sixth Street candidates once names, offers, images, and event hooks are ready."],
    ["Photo queue", "Attach current, approved imagery before pushing partner campaigns wider."],
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="dp-workspace-analytics"
    >
      <header className="dp-workspace-analytics-header">
        <span>Analytics</span>
        <h2>Review the launch signal from one place.</h2>
        <p>
          Use this section to test the app link, inspect reporting, and see which partners, source points, and campaigns need attention before launch.
        </p>
        <div className="dp-workspace-analytics-actions">
          <Link to="/partner-workspace/reports">View reports</Link>
          <Link to="/map?mode=partner&tab=reports">Open map reports</Link>
        </div>
      </header>

      <div className="dp-workspace-analytics-metrics" aria-label="Launch analytics snapshot">
        {launchMetrics.map(([value, label, detail]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{detail}</p>
          </article>
        ))}
      </div>

      <div className="dp-workspace-analytics-grid">
        <section>
          <p className="dp-workspace-analytics-kicker">Reports</p>
          <h3>Reports are viewable from the workspace and map.</h3>
          <div className="dp-workspace-analytics-list">
            {reportStreams.map(([label, detail, href]) => (
              <Link key={label} to={href}>
                <strong>{label}</strong>
                <span>{detail}</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <p className="dp-workspace-analytics-kicker">Onboarding</p>
          <h3>Focus the next three months on places that make the map useful.</h3>
          <div className="dp-workspace-analytics-list is-static">
            {onboardingTargets.map(([label, detail]) => (
              <article key={label}>
                <strong>{label}</strong>
                <span>{detail}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="dp-workspace-analytics-next">
        <p className="dp-workspace-analytics-kicker">Launch follow-up</p>
        <h3>Keep testing tied to the work that matters.</h3>
        <div>
          {launchTasks.map(([label, detail]) => (
            <article key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </section>
    </motion.section>
  );
}

function WorkspaceOverview({ user, setTab, mode = "active", activation = null }) {
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(demoOrganizations[0]?.id);
  const [upgradePrompt, setUpgradePrompt] = useState(null);

  useEffect(() => {
    listWorkspaceItems("Perk", "perks", user.email).then(setPerks);
    listWorkspaceItems("Event", "events", user.email).then(setEvents);
  }, [user.email]);

  const selectedOrganization = demoOrganizations.find((organization) => organization.id === selectedOrganizationId) || demoOrganizations[0];
  const ownedEntities = selectedOrganization ? getOrganizationEntities(selectedOrganization.id) : [];
  const isPreviewMode = mode === "unlinked";
  const workspaceStatus = selectedOrganization?.status || (isPreviewMode ? "unlinked" : "active");
  const workspaceCopy = workspaceStatusCopy[workspaceStatus];
  const activePerks = perks.filter(p => p.status === "active").length;
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "live").length;

  const QUICK_STATS = [
    { label: "Active Offers", value: activePerks || 0 },
    { label: "Upcoming Events", value: upcomingEvents || 0 },
    { label: "Saves", value: 0 },
    { label: "Actions Taken", value: 0 },
  ];

  const QUICK_ACTIONS = [
    { label: "Create offer", sub: "Launch a resident benefit, validation, or limited-time reason to visit.", icon: Star, tab: "offers" },
    { label: "Create event", sub: "Publish programming that should appear in local recommendations.", icon: Calendar, tab: "events" },
    { label: "Launch campaign", sub: "Connect a message, audience, placement, and measurable action.", icon: LayoutDashboard, tab: "campaigns" },
    { label: "Generate report", sub: "Review performance, attribution, and the next best action.", icon: ShieldCheck, tab: "reports" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      {activation && (
        <section className="dp-workspace-overview-section dp-workspace-activation-panel">
          <div>
            <p className="dp-workspace-eyebrow">Workspace ready</p>
            <h2>{activation.organizationName} is active.</h2>
            <p>
              Your plan is connected. Start with the map listing, then publish the first offer, event, survey, or campaign when the content is ready.
            </p>
          </div>
          <div className="dp-workspace-activation-status" aria-label="Workspace activation checklist">
            {activation.checklist?.map((item) => (
              <span key={item.id} className={item.done ? "is-done" : ""}>
                <Check aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
          <div className="dp-workspace-link-row" aria-label="Workspace first actions">
            <Link to="/partner-workspace/profile">Finish profile</Link>
            <Link to="/partner-workspace/map">Preview map listing</Link>
            <Link to="/partner-workspace/campaigns">Create campaign</Link>
          </div>
        </section>
      )}

      {isPreviewMode && (
        <section className="dp-workspace-overview-section dp-workspace-intake-panel">
          <div className="dp-workspace-section-copy">
            <p className="dp-workspace-eyebrow">Partner lifecycle</p>
            <h2>Start once. Operate from one workspace.</h2>
            <p>
              Move from registration into pricing, checkout, provisioning, and daily operations without jumping between disconnected pages.
            </p>
          </div>
          <div className="dp-workspace-lifecycle-list" aria-label="Partner setup lifecycle">
            {PARTNER_LIFECYCLE_LINKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Link key={step.label} to={step.href} className="dp-workspace-lifecycle-card">
                  <span className="dp-workspace-lifecycle-count">{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>
          <div className="dp-workspace-link-row" aria-label="Partner account actions">
            <Link to="/partners/sign-in">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to an existing workspace
            </Link>
            <Link to="/partners/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Open partner dashboard
            </Link>
          </div>

          <div className="dp-workspace-category-grid" aria-label="Partner lanes">
            {WORKSPACE_CATEGORIES.map((category) => (
              <Link key={category.label} to={category.href} className="dp-workspace-category-link">
                <span>{category.label}</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dp-workspace-overview-section dp-workspace-switcher-section">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="dp-workspace-eyebrow">Organizations & Workspaces</p>
            <h2 className="dp-workspace-section-title">Manage multiple organizations from a single account.</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#0B1F33]/60">
              Switch between properties, venues, hotels, brands, civic programs, and listings without creating separate logins.
            </p>
          </div>
          <div className="dp-workspace-status-chip">
            <span className="font-semibold text-[#0B1F33]">{workspaceCopy.label}</span>
            <span className="mx-2 text-[#C8A96A]">/</span>
            {selectedOrganization?.plan || "free"} plan
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-2">
            {demoOrganizations.map((organization) => {
              const isSelected = organization.id === selectedOrganization?.id;
              return (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => setSelectedOrganizationId(organization.id)}
                  className={`rounded-[4px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/60 ${
                    isSelected
                      ? "border-[#C8A96A]/55 bg-[rgba(200,169,106,0.10)]"
                      : "border-[rgba(11,31,51,0.08)] bg-[#F7F8FB] hover:border-[#C8A96A]/45 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-[13px] font-semibold text-[#0B1F33]">{organization.name}</strong>
                    <span className="rounded-[3px] border border-[rgba(11,31,51,0.08)] bg-white px-2 py-1 text-[10.5px] font-semibold uppercase tracking-normal text-[#0B1F33]/56">
                      Role: {friendlyRoleLabel(organization.role)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#0B1F33]/58">
                    {friendlyWorkspaceStatus(organization.status)}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="dp-workspace-selected-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[15px] font-semibold leading-snug text-[#0B1F33]">{selectedOrganization?.name}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#0B1F33]/58">
                  Manage the entities, campaigns, reports, people, and billing connected to this workspace.
                </p>
              </div>
              <span className="w-fit rounded-[3px] border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0B1F33]/62">
                {friendlyWorkspaceStatus(selectedOrganization?.status)}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ownedEntities.map((entity) => (
                <div key={entity.id} className="rounded-[4px] border border-[rgba(11,31,51,0.08)] bg-white p-3">
                  <p className="text-[12.5px] font-semibold text-[#0B1F33]">{entity.display_name}</p>
                  <p className="mt-1 text-[11.5px] uppercase tracking-normal text-[#0B1F33]/48">{entity.entity_type}</p>
                </div>
              ))}
            </div>

            <div className="dp-workspace-inline-actions" aria-label="Selected workspace actions">
              <button type="button" onClick={() => setTab("profile")}>Profile</button>
              <button type="button" onClick={() => setTab("billing")}>Billing</button>
              <button type="button" onClick={() => setTab("reports")}>Reports</button>
            </div>
          </div>
        </div>
      </section>

      <section className="dp-workspace-overview-section dp-workspace-module-section">
        <div className="dp-workspace-section-head">
          <div>
            <p className="dp-workspace-eyebrow">Workspace Capabilities</p>
            <h2 className="dp-workspace-section-title">One operating system for partner work.</h2>
          </div>
          <p>
            Each capability routes to a real workspace surface. Pricing and registration stay connected to the public onboarding flow,
            while billing, reports, campaigns, offers, events, and team access stay inside the workspace.
          </p>
        </div>
        <div className="dp-workspace-module-grid">
          {WORKSPACE_CAPABILITY_LINKS.map((capability) => {
            const locked = capability.lockedByDefault && !hasWorkspaceModule(activation, capability.addonId || capability.label.toLowerCase());
            if (locked) {
              return (
                <button
                  key={capability.label}
                  type="button"
                  className="dp-workspace-module-card is-locked"
                  onClick={() => setUpgradePrompt(capability)}
                >
                  <span>{capability.label}</span>
                  <p>{capability.description}</p>
                  <small><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Add-on</small>
                </button>
              );
            }

            return (
              <Link key={capability.label} to={capability.href} className="dp-workspace-module-card">
                <span>{capability.label}</span>
                <p>{capability.description}</p>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
        <div className="dp-workspace-entitlement-row" aria-label="Included plan access">
          {FRIENDLY_ENTITLEMENTS.map((entitlement) => (
            <span key={entitlement}>{entitlement}</span>
          ))}
        </div>
      </section>

      {upgradePrompt && (
        <div className="dp-workspace-upgrade-backdrop" role="presentation" onClick={() => setUpgradePrompt(null)}>
          <section
            className="dp-workspace-upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-upgrade-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="dp-workspace-upgrade-close" aria-label="Close upgrade prompt" onClick={() => setUpgradePrompt(null)}>
              <X aria-hidden="true" />
            </button>
            <p className="dp-workspace-eyebrow">Add-on</p>
            <h2 id="workspace-upgrade-title">Unlock {upgradePrompt.label}</h2>
            <p>
              Reach the right residents, guests, buildings, or districts with a focused email and SMS campaign. Preview it, send a test, schedule it, then measure opens, clicks, and actions.
            </p>
            <ul>
              <li>Target by district, building, segment, or uploaded list.</li>
              <li>Preview and test before anything goes live.</li>
              <li>Track opens, clicks, saves, scans, and conversions.</li>
            </ul>
            <div className="dp-workspace-upgrade-actions">
              <Link to="/partner-workspace/billing?addon=broadcasts">Unlock Broadcasts</Link>
              <button type="button" onClick={() => setUpgradePrompt(null)}>Maybe later</button>
            </div>
          </section>
        </div>
      )}

      <DaaCivicWorkspacePanel />

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const content = (
            <>
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(11,31,51,0.05)] border border-[rgba(11,31,51,0.06)] group-hover:bg-[rgba(200,169,106,0.12)] group-hover:border-[rgba(200,169,106,0.25)] transition-all duration-150">
                <Icon className="w-4 h-4 text-[#0B1F33]/60 group-hover:text-[#C8A96A] transition-colors duration-150" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[#0B1F33] mb-0.5 leading-snug">{a.label}</div>
                <div className="text-[12px] text-[#0B1F33]/52 leading-snug">{a.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B1F33]/28 mt-0.5 shrink-0 group-hover:translate-x-0.5 group-hover:text-[#C8A96A] transition-all duration-150" />
            </>
          );
          const className = "group flex items-start gap-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-5 text-left shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(200,169,106,0.4)] hover:shadow-[0_4px_16px_rgba(11,31,51,0.07),0_10px_30px_rgba(11,31,51,0.06)] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]/50";
          return a.href ? (
            <Link key={i} to={a.href} className={className}>
              {content}
            </Link>
          ) : (
            <button
              key={i}
              onClick={() => setTab(a.tab)}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Recent perks */}
      {perks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-[13px] font-semibold leading-snug tracking-normal text-foreground">Recent perks</h3>
            <button onClick={() => setTab("offers")} className="text-[12px] text-primary hover:underline underline-offset-4">See all</button>
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
      title: "What Motivates Visits",
      icon: MessageSquareText,
      support: "Understand the reasons people engage with locations across the experience.",
      items: daaExplorerQuestions[0].options.map((label) => ({
        label,
        meta: "Survey answer",
        detail: `${label} helps explain what draws people into a civic stop before they save, check in, or ask for directions.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "Requested Improvements",
      icon: MessageSquareText,
      support: "Identify opportunities for future programming, amenities, and placemaking.",
      items: daaExplorerQuestions[1].options.map((label) => ({
        label,
        meta: "Requested more",
        detail: `${label} is useful for future programming, wayfinding, partner prompts, and public-space planning.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "Audience Frequency",
      icon: Users,
      support: "Understand whether activity comes from residents, regular visitors, workers, or occasional guests.",
      items: daaExplorerQuestions[2].options.map((label) => ({
        label,
        meta: "Visit frequency",
        detail: `${label} gives civic partners a clearer sense of whether the tour is serving regular downtown routines or bringing people back in.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Highest Performing Locations",
      icon: MapPin,
      support: "Identify the places generating the strongest engagement across discovery, saves, directions, and repeat visits.",
      items: daaDashboardContent.placesPeopleUseMost.map((label) => ({
        label,
        meta: "Place behavior",
        detail: `${label} connects tour behavior to a practical next action: visit, save, return, get directions, or learn more.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Most Visited Locations",
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
      title: "Most Saved Locations",
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
      title: "Highest Repeat Engagement",
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
      title: "Top Direction Requests",
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
      title: "High-Interest Content",
      icon: MessageSquareText,
      support: "Locations where people actively seek additional information, history, or context.",
      items: learningStops.map((label) => ({
        label,
        meta: "Learn more",
        detail: `${label} is a strong candidate for richer interpretive copy, QR prompts, and nearby tour context.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Activity by Time of Day",
      icon: Calendar,
      support: "Understand when audiences are most active across discovery, saves, visits, and directions.",
      items: daaDashboardContent.timeAnalysis.buckets.map((label) => ({
        label,
        meta: "Time window",
        detail: `${label} activity helps civic partners understand when people are most likely to explore, save, or continue to another stop.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "Engagement Funnel",
      icon: Check,
      support: "Track movement from discovery through participation and real-world visitation.",
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
          <h3 className="font-body mt-2 text-[23px] font-semibold leading-snug tracking-normal text-[#0B1F33]">How People Engage With This Experience</h3>
          <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-[#0B1F33]/66">
            Track discovery, saves, visits, directions, and participation across the Downtown Austin Art & Parks Tour. Understand which locations attract attention, where people return, and what drives engagement.
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
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-[8px] animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <EmptyState icon={Star} headline="No offers yet" body="Create your first offer and it will appear in the Downtown Perks discovery experience." action="Create Offer" onAction={handleAdd} />
      ) : (
        <div className="space-y-3">
          {perks.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-[3px] shrink-0 ${p.status === "active" ? "bg-[#C8A96A] shadow-[0_0_4px_rgba(200,169,106,0.5)]" : p.status === "paused" ? "bg-[#C8A96A]/50" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{p.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
              </div>
              <span className="text-[11.5px] font-semibold text-[#8B6B2F] border border-[rgba(200,169,106,0.35)] bg-[rgba(200,169,106,0.08)] px-2.5 py-0.5 rounded-[6px] shrink-0 hidden sm:block">{p.value}</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[6px] border capitalize shrink-0 ${
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
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center bg-transparent text-[#0B1F33] transition-colors hover:text-[#C8A96A]"><X className="w-4 h-4" /></button>
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
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-[8px] animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} headline="No events yet" body="Add your first event and it will appear on the downtown map with RSVP support." action="Add an event" onAction={() => { setEditing(null); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-[3px] shrink-0 ${e.status === "live" ? "bg-[#C8A96A] shadow-[0_0_4px_rgba(200,169,106,0.5)]" : e.status === "upcoming" ? "bg-[#0B1F33]/40" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{e.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
              </div>
              <span className="text-[11px] font-medium text-[#0B1F33]/40 hidden md:block shrink-0">{e.rsvp_count || 0} RSVPs</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[6px] border capitalize shrink-0 ${
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
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center bg-transparent text-[#0B1F33] transition-colors hover:text-[#C8A96A]"><X className="w-4 h-4" /></button>
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
