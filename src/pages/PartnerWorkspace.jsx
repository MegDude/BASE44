import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Trash2, ChevronRight, ChevronLeft, ChevronDown, Calendar, Star, LayoutDashboard, Check, MapPin, Megaphone, MessageSquareText, Navigation, Users, CreditCard, UserPlus, ArrowRight, Bell, Search, ShieldCheck, WalletCards, Menu } from "lucide-react";
import "@/styles/workspace-profile-editor.css";
import { PartnerMobileTabBar } from "@/components/partner/PartnerMobileTabBar";
import {
  ActivityTimeline,
  EntityRail,
  FeaturedResult,
  InsightCard,
  MetricRow,
  ModuleStatusRow,
  NextActionCard,
  SectionHeader,
  WorkspaceHeader,
  WorkspaceSummaryStrip,
} from "@/components/partner/workspace/WorkspaceOperatingSystem";
import { WorkspaceSheetProvider, useWorkspaceSheet } from "@/components/partner/workspace/WorkspaceSheetSystem";
import { GlobalWorkspaceSearch, WorkspaceDestinationRoot } from "@/components/partner/workspace/WorkspaceDestinationRoot";
import WorkspaceExperienceSystem from "@/components/partner/workspace/WorkspaceExperienceSystem";
import WorkspaceLaunchBrief from "@/components/partner/workspace/WorkspaceLaunchBrief";
import PartnerAnalyticsPage from "@/components/analytics/PartnerAnalyticsPage";
import { daaDashboardContent, daaExplorerQuestions, daaTourDistricts, daaTourProgress, daaTourStops } from "@/data/daaArtParksTour";
import { larryAndGuyWorkspaceCampaign } from "@/data/larryAndGuyRestaurantLayer";
import { legendsLuxuryPresenceSeoSnapshot } from "@/data/luxuryPresenceSeoSnapshot";
import { luxuryPresenceInventorySummary } from "@/data/luxuryPresenceInventory";
import { legendsTopListingPlaces } from "@/data/legendsListings";
import { PARTNER_WORKSPACE_COPY, PARTNER_WORKSPACE_NAV } from "@/content/downtown-perks/downtownPerksPartnerWorkspaceRegistry";
import {
  demoOrganizations,
  getOrganizationEntities,
  workspaceStatusCopy,
} from "@/config/workspaceArchitecture";
import {
  canUseProductionAccountAccess,
  markLocalRecord,
} from "@/lib/productionGuards";
import { canViewEverything } from "@/lib/auth/session";
import { useAuth } from "@/lib/AuthContext";
import {
  LEGENDS_WORKSPACE_ORGANIZATION_ID,
  readPartnerWorkspaceOrganizationId,
  withPartnerWorkspaceContext,
  writePartnerWorkspaceOrganizationId,
} from "@/lib/partnerWorkspaceContext";
import { normalizeLuxuryPresenceSeoSnapshot } from "@/lib/analytics/seoMetrics";
import { buildLocations } from "@/lib/useLocations";

// ─── ENTITIES ─────────────────────────────────────────────────────────────────
// We use Perk, Event, and Venue entities which already exist.
// Partner profile is stored on the user object.

const LAUNCH_WORKSPACE_NAV_ITEM = { id: "launch", label: "Launch", href: "/partner-workspace/launch", helper: "Decisions, relationships, and proof." };

const WORKSPACE_NAV_GROUPS = [
  { label: "Workspace", ids: ["overview", "launch", "map", "profile"] },
  { label: "Publish", ids: ["offers", "events", "campaigns", "broadcasts"] },
  { label: "Review", ids: ["audience", "surveys", "analytics", "reports"] },
  { label: "Manage", ids: ["media", "team", "billing"] },
].map((group) => ({
  ...group,
  items: group.ids.map((id) => id === "launch" ? LAUNCH_WORKSPACE_NAV_ITEM : PARTNER_WORKSPACE_NAV.find((item) => item.id === id)).filter(Boolean),
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

const PUBLIC_PARTNER_USER = {
  email: "downtown-perks-workspace",
  full_name: "Partner Workspace",
  partner_name: "Downtown Perks",
  partner_type: "neighborhood",
};

const WORKSPACE_CATEGORIES = [
  { label: "Properties", href: "/partners/properties", description: "Connect your building to nearby places, resident perks, events, and neighborhood updates." },
  { label: "Hotels", href: "/partners/hotels", description: "Help guests find what is nearby and see what they choose after they leave the lobby." },
  { label: "Venues", href: "/partners/venues", description: "Appear when people nearby are deciding where to eat, drink, meet, or explore." },
  { label: "Brands", href: "/partners/brands", description: "Reach people downtown when they are choosing where to go next." },
  { label: "Civic", href: "/partners/civic", description: "Promote public spaces, cultural destinations, and ways to take part downtown." },
  { label: "Real Estate", href: "/partners/real-estate", description: "Show available properties alongside the places, amenities, and neighborhood details buyers care about." },
];

const FRIENDLY_ENTITLEMENTS = ["Map Listing", "Campaigns", "Offers", "Events", "Surveys", "Reports", "QR Experiences", "People", "Media"];
const PARTNER_SETUP_KEY = "dp_partner_lifecycle_setup";
const WORKSPACE_ACTIVATION_KEY = "dp_partner_workspace:activation";
const PARTNER_SESSION_KEY = "dp_partner_workspace:session";
const LEGENDS_WORKSPACE_SEO_REPORT = normalizeLuxuryPresenceSeoSnapshot(legendsLuxuryPresenceSeoSnapshot);
const WORKSPACE_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const WORKSPACE_PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});
const WORKSPACE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatWorkspaceNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? WORKSPACE_NUMBER_FORMATTER.format(number) : fallback;
}

function formatWorkspacePercent(value) {
  if (value === null || value === undefined) return "Not available";
  const number = Number(value);
  return Number.isFinite(number) ? WORKSPACE_PERCENT_FORMATTER.format(number) : "Not available";
}

function formatWorkspaceDate(value) {
  if (!value) return "Snapshot date pending";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Snapshot date pending" : WORKSPACE_DATE_FORMATTER.format(date);
}

const PARTNER_LIFECYCLE_LINKS = [
  { label: "Partner Type", href: "/partners/start", detail: "Choose the kind of business, workspace, recommended plan, and included tools.", icon: UserPlus },
  { label: "Registration", href: "/partners/register", detail: "Confirm organization, contact, location, profile, and setup details.", icon: ShieldCheck },
  { label: "Pricing", href: "/partners/pricing", detail: "Compare annual plans, included tools, limits, and upgrade options.", icon: CreditCard },
  { label: "Checkout", href: "/partners/checkout", detail: "Confirm subscription, invoice, tax, coupon, and billing details.", icon: WalletCards },
  { label: "Workspace", href: "/partners/provision", detail: "Set up the profile, tools, team, reports, and billing details.", icon: LayoutDashboard },
];

const WORKSPACE_CAPABILITY_LINKS = [
  { label: "Map Listing", href: "/partner-workspace/map", description: "Manage the public map listing, placement, images, categories, and live preview." },
  { label: "Offers", href: "/partner-workspace/offers", description: "Create and manage perks, resident benefits, approvals, and live offers." },
  { label: "Events", href: "/partner-workspace/events", description: "Publish events and see how people find them on the map." },
  { label: "Surveys", href: "/partner-workspace/surveys", description: "Build surveys, choose who should see them, review the preview, and publish when ready." },
  { label: "Campaigns", href: "/partner-workspace/campaigns", description: "Plan placements, messages, QR codes, events, and offers in one place." },
  { label: "Broadcasts", href: "/partner-workspace/broadcasts", description: "Create email and SMS sends when the Broadcasts add-on is active.", lockedByDefault: true, addonId: "broadcasts" },
  { label: "People", href: "/partner-workspace/audience", description: "Choose districts, buildings, saved groups, and uploaded contacts." },
  { label: "Media", href: "/partner-workspace/media", description: "Keep logos, photos, videos, copy, and QR assets ready to publish." },
  { label: "Reports", href: "/partner-workspace/reports", description: "See monthly results, saves, redemptions, activity, and suggested next steps." },
  { label: "Results", href: "/partner-workspace/analytics", description: "See what people view, save, open, scan, and act on." },
  { label: "Profile", href: "/partner-workspace/profile", description: "Keep organization details, contacts, listings, and workspace information current." },
  { label: "Team", href: "/partner-workspace/team", description: "Manage roles, permissions, and workspace access." },
  { label: "Billing", href: "/partner-workspace/billing", description: "Review plan access, invoices, subscriptions, and checkout status." },
];

const WORKSPACE_MODULE_GROUPS = [
  {
    label: "Operations",
    items: [
      { label: "Offers", href: "/partner-workspace/offers", description: "Create and manage resident benefits." },
      { label: "Events", href: "/partner-workspace/events", description: "Publish plans that should appear nearby." },
      { label: "Campaigns", href: "/partner-workspace/campaigns", description: "Plan a clear reason to visit." },
      { label: "QR", href: "/partner-workspace/sources", description: "Generate entry points for lobbies, counters, and events." },
      { label: "Listings", href: "/partner-workspace/sources", description: "Connect property or listing details to the map." },
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
      { label: "Audience", href: "/partner-workspace/analytics", description: "Read saves, scans, visits, and where people came from." },
      { label: "Followers", href: "/partner-workspace/analytics", description: "Understand who keeps coming back." },
      { label: "Saved", href: "/partner-workspace/reports", description: "Review saved places and offers." },
      { label: "Reviews", href: "/partner-workspace/reports", description: "Summarize feedback and survey responses." },
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

const WORKSPACE_HOME_COPY = {
  "demo-org-legends-real-estate": {
    summary: "Manage downtown listings, map placement, showing requests, and the SEO Snapshot in one workspace.",
    focus: "Listings, reports, and buyer interest",
    nextStep: "Review the downtown listings that should appear on the map first.",
    publicLabel: "View Legends on the map",
  },
  "demo-org-larry-and-guy": {
    summary: "Manage restaurant listings, resident offers, campaign timing, and what guests see before they choose dinner.",
    focus: "Dining offers and restaurant campaigns",
    nextStep: "Keep each restaurant profile current, then publish one clear offer or event.",
    publicLabel: "View restaurant group",
  },
  "demo-org-hotel-van-zandt": {
    summary: "Manage the hotel profile, guest guide, local perks, and nearby experiences guests can use during their stay.",
    focus: "Guest discovery and hotel perks",
    nextStep: "Connect the guest guide to dining, music, wellness, and resident-access offers nearby.",
    publicLabel: "View hotel profile",
  },
  "demo-org-yeti": {
    summary: "Manage campaigns, placements, partner locations, and the actions residents can take.",
    focus: "Brand moments and downtown campaigns",
    nextStep: "Choose the campaign location, then connect it to nearby routes and offers.",
    publicLabel: "View brand placement",
  },
};

function friendlyRoleLabel(role) {
  return ROLE_LABELS[String(role || "").toLowerCase()] || "Workspace Manager";
}

const CANONICAL_WORKSPACE_MAP_ENTITIES = buildLocations();

function workspaceMapEntityText(entity = {}) {
  return [
    entity.workspace_id,
    entity.workspaceId,
    entity.organization_id,
    entity.organizationId,
    entity.partner_id,
    entity.partnerId,
    entity.partner,
    entity.partnerName,
    entity.brand,
    entity.source,
    entity.raw?.workspace_id,
    entity.raw?.organization_id,
    entity.raw?.partner_id,
    entity.raw?.partner,
    entity.raw?.brand,
    entity.raw?.source,
  ].filter(Boolean).join(" ").toLowerCase();
}

function mapEntityBelongsToWorkspace(entity, organization, ownedEntityIds) {
  const id = String(entity?.id || entity?.entity_id || entity?.slug || "").toLowerCase();
  if (!id) return false;
  if (ownedEntityIds.has(id)) return true;

  const organizationId = String(organization?.id || "").toLowerCase();
  const organizationName = String(organization?.name || "").toLowerCase();
  const relationshipText = workspaceMapEntityText(entity);
  if (organizationId && relationshipText.includes(organizationId)) return true;
  if (organizationName && relationshipText.includes(organizationName)) return true;

  if (organizationId === "demo-org-legends-real-estate") {
    return Boolean(entity.legendsListing || entity.raw?.legendsListing || /luxury presence|legends real estate/.test(relationshipText) || id.startsWith("luxury-presence-"));
  }
  if (organizationId === "demo-org-larry-and-guy") return id.startsWith("larry-guy-");
  if (organizationId === "demo-org-waterloo-greenway") return /waterloo/.test(id) || /waterloo greenway/.test(relationshipText);
  if (organizationId === "demo-org-hotel-van-zandt") return id === "hotel-van-zandt" || /hotel van zandt/.test(relationshipText);
  if (organizationId === "demo-org-yeti") return id === "brand-yeti" || /\byeti\b/.test(relationshipText);
  return false;
}

function getCanonicalWorkspaceEntities(organizationId) {
  const organization = demoOrganizations.find((item) => item.id === organizationId);
  const configuredEntities = getOrganizationEntities(organizationId);
  const ownedEntityIds = new Set(configuredEntities.map((entity) => String(entity.entity_id || "").toLowerCase()));
  const canonicalMatches = CANONICAL_WORKSPACE_MAP_ENTITIES.filter((entity) =>
    mapEntityBelongsToWorkspace(entity, organization, ownedEntityIds),
  );
  const byEntityId = new Map();

  configuredEntities.forEach((entity) => byEntityId.set(String(entity.entity_id), entity));
  canonicalMatches.forEach((entity) => {
    const entityId = String(entity.id || entity.entity_id || entity.slug || "");
    if (!entityId) return;
    const configured = byEntityId.get(entityId);
    byEntityId.set(entityId, {
      id: configured?.id || `map-${entityId}`,
      organization_id: organizationId,
      entity_id: entityId,
      entity_type: configured?.entity_type || entity.entity_type || entity.sourceType || entity.type || "venue",
      display_name: entity.name || entity.title || entity.displayName || configured?.display_name || entityId,
      map_filter: configured?.map_filter || entity.mapFilter || entity.category || "All",
      perk_summary: configured?.perk_summary || entity.offer?.title || entity.perk?.title || entity.summary || "Map entity",
      map_visibility: entity.mapVisibility || entity.map_visibility || entity.visibility || "public",
      map_entity: entity,
    });
  });

  return Array.from(byEntityId.values());
}

function friendlyWorkspaceStatus(status) {
  return String(status || "").toLowerCase() === "trial" ? "Trial Workspace" : "Active Workspace";
}

const WORKSPACE_STORAGE_PREFIX = "dp_partner_workspace";

function getWorkspaceTabFromPath(pathname) {
  if (pathname.includes("/partner-workspace/launch")) return "launch";
  if (pathname.includes("/partner-workspace/publish")) return "publish";
  if (pathname.includes("/partner-workspace/performance")) return "performance";
  if (pathname.includes("/partner-workspace/workspace")) return "workspace";
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
    "Downtown Perks"
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
  if (!canUseProductionAccountAccess()) return;
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
  const activationBase = {
    id: params.get("session_id") || existing?.id || `workspace-${Date.now()}`,
    organizationName: businessName,
    partnerType: setup.partnerType || setup.organizationType || "Partner",
    plan: setup.plan || "Workspace plan",
    sku: setup.sku || setup.checkoutKey || "workspace",
    modules,
    moduleLabels: Array.isArray(setup.moduleLabels) ? setup.moduleLabels : [],
    annualTotal: setup.annualTotal || "selected",
    status: "active",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "profile", label: "Complete business profile", done: Boolean(setup.businessName || setup.organizationName || setup.partnerName) },
      { id: "map", label: "Publish map listing", done: modules.includes("map") },
      { id: "offer", label: "Create first offer", done: modules.includes("offers") },
      { id: "campaign", label: "Publish first campaign", done: modules.includes("campaigns") },
      { id: "audience", label: "Choose who should see it", done: modules.includes("audience") },
      { id: "media", label: "Add media and QR assets", done: modules.includes("media") || modules.includes("qr") },
    ],
  };
  const activation = canUseProductionAccountAccess()
    ? activationBase
    : markLocalRecord(activationBase);

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

function getStoredProfile(organizationId = "") {
  const scopedProfile = organizationId ? getStoredJson(workspaceKey(`profile:${organizationId}`), null) : null;
  const profile = scopedProfile || getStoredJson(workspaceKey("profile"), null);
  if (!profile) return null;
  const { email, id, created_by, created_date, updated_date, ...profileFields } = profile;
  return profileFields;
}

function saveStoredProfile(profile, organizationId = "") {
  const { email, id, created_by, created_date, updated_date, ...profileFields } = profile || {};
  if (organizationId) setStoredJson(workspaceKey(`profile:${organizationId}`), profileFields);
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
    const localItem = markLocalRecord(enriched);
    const nextItems = [localItem, ...getStoredItems(kind, email)];
    setStoredItems(kind, email, nextItems);
    return localItem;
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
    const localPendingUpdate = markLocalRecord(localUpdate);
    setStoredItems(kind, email, localItems.map((item) => (item.id === id ? { ...item, ...localPendingUpdate } : item)));
    return localPendingUpdate;
  }

  try {
    const remoteItem = await base44.entities[entityName].update(id, payload);
    return normalizeWorkspaceItem(remoteItem || localUpdate, email);
  } catch {
    const exists = localItems.some((item) => item.id === id);
    const localPendingUpdate = markLocalRecord(localUpdate);
    const nextItems = exists
      ? localItems.map((item) => (item.id === id ? { ...item, ...localPendingUpdate } : item))
      : [localPendingUpdate, ...localItems];
    setStoredItems(kind, email, nextItems);
    return localPendingUpdate;
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
  return <WorkspaceSheetProvider><PartnerWorkspaceContent /></WorkspaceSheetProvider>;
}

function PartnerWorkspaceContent() {
  const location = useLocation();
  const { user: authenticatedUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(() => ({ ...PUBLIC_PARTNER_USER, ...(getStoredProfile() || {}) }));
  const [tab, setTab] = useState(() => getWorkspaceTabFromPath(location.pathname));
  const [activation, setActivation] = useState(() => getWorkspaceActivation());
  const navigate = useNavigate();
  const requestedOrganizationId = readPartnerWorkspaceOrganizationId(location.search);
  const activeOrganizationId = demoOrganizations.some((organization) => organization.id === requestedOrganizationId)
    ? requestedOrganizationId
    : LEGENDS_WORKSPACE_ORGANIZATION_ID;
  const isPublicWorkspaceUser = !activation && user.email === PUBLIC_PARTNER_USER.email;
  const isReportsTab = tab === "reports";
  const isWorkspaceHome = location.pathname === "/partner-workspace/overview";
  const hasPrivilegedWorkspaceAccess = canViewEverything(user);
  const isPartnerLoggedIn = !isPublicWorkspaceUser || Boolean(activation);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [persistentWorkspaceMenuOpen, setPersistentWorkspaceMenuOpen] = useState(false);
  const [persistentWorkspaceSearch, setPersistentWorkspaceSearch] = useState("");
  const [workspaceSearchOpen, setWorkspaceSearchOpen] = useState(false);
  const activeOrganization = demoOrganizations.find((organization) => organization.id === activeOrganizationId) || demoOrganizations[0];
  const persistentWorkspaceOptions = demoOrganizations.filter((organization) =>
    organization.name.toLowerCase().includes(persistentWorkspaceSearch.trim().toLowerCase()),
  );
  const selectWorkspaceTab = (nextTab) => {
    const activeItem = PARTNER_WORKSPACE_NAV.find((item) => item.id === nextTab);
    if (activeItem?.href) {
      navigate(withPartnerWorkspaceContext(activeItem.href, activeOrganizationId));
      return;
    }
    setTab(nextTab);
  };

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
    if (isAuthenticated && authenticatedUser) {
      setUser((currentUser) => ({
        ...PUBLIC_PARTNER_USER,
        ...currentUser,
        ...(getStoredProfile() || {}),
        ...authenticatedUser,
      }));
      return;
    }

    base44.auth.me()
      .then((u) => setUser((currentUser) => {
        const activeWorkspace = getWorkspaceActivation();
        return {
          ...PUBLIC_PARTNER_USER,
          ...currentUser,
          ...(u || {}),
          ...(getStoredProfile() || {}),
          ...(activeWorkspace ? {
            partner_name: activeWorkspace.organizationName,
            organization_name: activeWorkspace.organizationName,
            partner_type: activeWorkspace.partnerType,
          } : {}),
        };
      }))
      .catch(() => setUser((currentUser) => {
        const activeWorkspace = getWorkspaceActivation();
        return {
          ...currentUser,
          ...(getStoredProfile() || {}),
          ...(activeWorkspace ? {
            partner_name: activeWorkspace.organizationName,
            organization_name: activeWorkspace.organizationName,
            partner_type: activeWorkspace.partnerType,
          } : {}),
        };
      }));
  }, [authenticatedUser, isAuthenticated]);

  useEffect(() => {
    setTab(getWorkspaceTabFromPath(location.pathname));
    setMobileNavOpen(false);
    setPersistentWorkspaceMenuOpen(false);
    setPersistentWorkspaceSearch("");
  }, [location.pathname]);

  useEffect(() => {
    writePartnerWorkspaceOrganizationId(activeOrganizationId);
    const params = new URLSearchParams(location.search);
    if (params.get("organizationId") === activeOrganizationId) return;
    params.set("organizationId", activeOrganizationId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [activeOrganizationId, location.pathname, location.search, navigate]);

  useEffect(() => {
    const activeItem = PARTNER_WORKSPACE_NAV.find((item) => item.id === tab);
    if (!activeItem || location.pathname === activeItem.href || location.pathname.startsWith(`${activeItem.href}/`)) return;
    if (!location.pathname.startsWith("/partner-workspace")) return;
    if (getWorkspaceTabFromPath(location.pathname) !== tab) return;
    navigate(withPartnerWorkspaceContext(activeItem.href, activeOrganizationId), { replace: true });
  }, [activeOrganizationId, tab, location.pathname, navigate]);

  function handleWorkspaceBack() {
    const fallback = location.pathname === "/partner-workspace/overview" ? "/partners" : "/partner-workspace/overview";
    const routerHistoryIndex = window.history.state?.idx;
    if (Number.isInteger(routerHistoryIndex) && routerHistoryIndex > 0) {
      navigate(-1);
      return;
    }
    navigate(withPartnerWorkspaceContext(fallback, activeOrganizationId));
  }

  function handleWorkspaceSearch() {
    setWorkspaceSearchOpen(true);
  }

  function handleAccount() {
    navigate(withPartnerWorkspaceContext("/partner-workspace/profile?section=account", activeOrganizationId));
  }

  function handlePersistentWorkspaceSelect(organizationId) {
    writePartnerWorkspaceOrganizationId(organizationId);
    setPersistentWorkspaceMenuOpen(false);
    setPersistentWorkspaceSearch("");
    navigate(withPartnerWorkspaceContext("/partner-workspace/overview", organizationId));
  }

  return (
    <div data-workspace-tab={tab} className={`dp-partner-page dp-partner-workspace-page min-h-screen text-[#0B1F33] ${isReportsTab ? "dp-partner-workspace-page--reports" : ""}`}>
      <header className="dp-partner-workspace-header">
        <div className="dp-partner-workspace-header-inner">
          <button className="dp-workspace-mobile-menu" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open workspace navigation">
            <Menu aria-hidden="true" />
          </button>
          <Link className="dp-partner-workspace-brand" to={withPartnerWorkspaceContext("/partner-workspace/overview", activeOrganizationId)} aria-label="Downtown Perks workspace overview">
            <strong>Downtown Perks</strong>
            <span>Workspace</span>
          </Link>
          {!isWorkspaceHome ? <div className="dp-persistent-workspace-switcher">
            <button
              type="button"
              className="dp-persistent-workspace-switcher-trigger"
              aria-label={`Switch workspace. Current workspace: ${activeOrganization?.name || "Partner workspace"}`}
              aria-expanded={persistentWorkspaceMenuOpen}
              aria-controls="persistent-workspace-menu"
              onClick={() => setPersistentWorkspaceMenuOpen((open) => !open)}
            >
              <span><small>Workspace</small><strong>{activeOrganization?.name || "Partner workspace"}</strong></span>
              <ChevronDown aria-hidden="true" />
            </button>
            {persistentWorkspaceMenuOpen ? (
              <div className="dp-persistent-workspace-switcher-menu" id="persistent-workspace-menu">
                <Link to={withPartnerWorkspaceContext("/partner-workspace/overview", activeOrganizationId)} onClick={() => setPersistentWorkspaceMenuOpen(false)}>
                  <LayoutDashboard aria-hidden="true" />
                  <span><strong>Workspace overview</strong><small>Return to your workspace home</small></span>
                  <ChevronRight aria-hidden="true" />
                </Link>
                <label>
                  <Search aria-hidden="true" />
                  <input value={persistentWorkspaceSearch} onChange={(event) => setPersistentWorkspaceSearch(event.target.value)} placeholder="Search workspaces" aria-label="Search available workspaces" />
                </label>
                <div role="listbox" aria-label="Available partner workspaces">
                  {persistentWorkspaceOptions.map((organization) => (
                    <button key={organization.id} type="button" role="option" aria-selected={organization.id === activeOrganizationId} onClick={() => handlePersistentWorkspaceSelect(organization.id)}>
                      <span><strong>{organization.name}</strong><small>{friendlyRoleLabel(organization.role)}</small></span>
                      {organization.id === activeOrganizationId ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div> : null}
          <div className="dp-partner-workspace-header-tools" aria-label="Workspace utilities">
            {!isWorkspaceHome ? <button type="button" className="dp-partner-workspace-back" onClick={handleWorkspaceBack} aria-label="Go back"><ChevronLeft aria-hidden="true" /><span>Back</span></button> : null}
            <button type="button" onClick={handleWorkspaceSearch} aria-label="Search workspace"><Search aria-hidden="true" /></button>
            {isPartnerLoggedIn ? <button type="button" aria-label="Notifications"><Bell aria-hidden="true" /></button> : null}
            <button type="button" onClick={handleAccount} className="dp-partner-workspace-signin">Account</button>
          </div>
        </div>
      </header>

      <div className="dp-workspace-shell">
        {mobileNavOpen ? <button className="dp-workspace-sidebar-backdrop" type="button" aria-label="Close workspace navigation" onClick={() => setMobileNavOpen(false)} /> : null}
        <aside className="dp-workspace-sidebar" data-open={mobileNavOpen ? "true" : "false"}>
          <div className="dp-workspace-sidebar-head">
            <span>Workspace</span>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close workspace navigation"><X aria-hidden="true" /></button>
          </div>
          <nav aria-label="Workspace navigation">
            {WORKSPACE_NAV_GROUPS.map((group) => (
              <div className="dp-workspace-nav-group" key={group.label}>
                <p>{group.label}</p>
                {group.items.map((item) => (
                  <Link key={item.id} to={withPartnerWorkspaceContext(item.href, activeOrganizationId)} className={tab === item.id ? "is-active" : ""} aria-current={tab === item.id ? "page" : undefined}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="dp-workspace-main">
          <div className="dp-workspace-content">
        <AnimatePresence mode="wait">
          {tab === "overview" && <WorkspaceOverview key="overview" user={user} setTab={selectWorkspaceTab} organizationId={activeOrganizationId} mode={isPublicWorkspaceUser && !activation ? "unlinked" : "active"} activation={activation} hasPrivilegedAccess={hasPrivilegedWorkspaceAccess} />}
          {tab === "launch" && <WorkspaceLaunchBrief key="launch" organizationId={activeOrganizationId} />}
          {tab === "publish" && <WorkspaceDestinationRoot key="publish" destination="publish" organizationId={activeOrganizationId} />}
          {tab === "performance" && <WorkspaceDestinationRoot key="performance" destination="performance" organizationId={activeOrganizationId} />}
          {tab === "workspace" && <WorkspaceDestinationRoot key="workspace" destination="workspace" organizationId={activeOrganizationId} />}
          {tab === "map" && <WorkspaceRegistryPanel key="map" tabId="map" organizationId={activeOrganizationId} />}
          {tab === "campaigns" && <WorkspaceExperienceSystem key="campaigns" organizationId={activeOrganizationId} view="campaigns" />}
          {tab === "offers" && <PerksManager key="offers" user={user} />}
          {tab === "events" && <EventsManager key="events" user={user} />}
          {tab === "surveys" && <WorkspaceExperienceSystem key="surveys" organizationId={activeOrganizationId} view="surveys" />}
          {tab === "broadcasts" && <WorkspaceRegistryPanel key="broadcasts" tabId="broadcasts" />}
          {tab === "audience" && <WorkspaceRegistryPanel key="audience" tabId="audience" organizationId={activeOrganizationId} />}
          {tab === "media" && <WorkspaceRegistryPanel key="media" tabId="media" />}
          {tab === "sources" && <WorkspaceRegistryPanel key="sources" tabId="sources" />}
          {tab === "reports" && <WorkspaceReports key="reports" organizationId={activeOrganizationId} />}
          {tab === "analytics" && <WorkspaceAnalytics key="analytics" organizationId={activeOrganizationId} />}
          {tab === "profile" && <ProfileSection key="profile" user={user} setUser={setUser} organization={demoOrganizations.find((item) => item.id === activeOrganizationId)} />}
          {tab === "team" && <WorkspaceRegistryPanel key="team" tabId="team" />}
          {tab === "billing" && <WorkspaceRegistryPanel key="billing" tabId="billing" />}
        </AnimatePresence>
          </div>
        </main>
      </div>
      <PartnerMobileTabBar activeTab={tab === "launch" ? "overview" : tab} />
      <GlobalWorkspaceSearch open={workspaceSearchOpen} onClose={() => setWorkspaceSearchOpen(false)} organizationId={activeOrganizationId} />
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

const WORKSPACE_REGISTRY_BLUEPRINTS = {
  map: {
    eyebrow: "Map",
    title: "Manage your map presence.",
    description: "Review the places, offers, events, and links connected to this workspace.",
    primaryLabel: "Open partner map",
    primaryHref: "/map?mode=partner&tab=map&filter=All",
    secondaryLabel: "Create offer",
    secondaryHref: "/partner-workspace/offers?intent=new",
    rows: [
      ["Places", "Review linked locations, listings, and map visibility."],
      ["Offers", "Check which resident offers are ready to appear nearby."],
      ["Events", "Review events connected to your places and dates."],
      ["Entry links", "Test the resident and partner paths before sharing."],
    ],
  },
  audience: {
    eyebrow: "Audience",
    title: "Choose who should see it.",
    description: "Use workspace-scoped location and activity signals when you publish.",
    primaryLabel: "Review audience activity",
    primaryHref: "/partner-workspace/analytics?view=audience",
    secondaryLabel: "Create campaign",
    secondaryHref: "/partner-workspace/campaigns?intent=new",
    rows: [
      ["Districts", "Reach people based on the downtown areas connected to the campaign."],
      ["Buildings", "Choose linked residential, hotel, or workplace locations."],
      ["Guests and visitors", "Use consented visit and event context when it is available."],
      ["Saved groups", "Reuse an existing workspace group without rebuilding it."],
      ["Uploaded contacts", "Use only contacts the workspace is permitted to reach."],
    ],
  },
};

function WorkspaceRegistryPanel({ tabId, organizationId = "" }) {
  const copy = PARTNER_WORKSPACE_COPY[tabId] || PARTNER_WORKSPACE_COPY.overview;
  const blueprint = WORKSPACE_REGISTRY_BLUEPRINTS[tabId];
  const items = blueprint?.rows || getWorkspacePanelItems(copy).map((item) => [item, copy.emptyState || "Open this workspace tool when it is relevant to the work."]);
  const primaryLabel = blueprint?.primaryLabel || copy.createCta || copy.primaryCta?.label || copy.actions?.[0] || copy.ctas?.[0] || "Open map view";
  const primaryHref = blueprint?.primaryHref || copy.primaryCta?.href || "/map?mode=partner&tab=map&filter=All";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="dp-workspace-registry-panel"
    >
      <header className="dp-workspace-panel-header">
        <span>{blueprint?.eyebrow || "Workspace"}</span>
        <h1>{blueprint?.title || copy.headline}</h1>
        <p>{blueprint?.description || copy.body || copy.emptyState}</p>
        <div className="dp-workspace-panel-actions">
          <Link to={withPartnerWorkspaceContext(primaryHref, organizationId)}>{primaryLabel}</Link>
          {blueprint?.secondaryHref ? <Link to={withPartnerWorkspaceContext(blueprint.secondaryHref, organizationId)}>{blueprint.secondaryLabel}</Link> : null}
        </div>
      </header>

      {items.length > 0 && (
        <div className="dp-workspace-row-list">
          {items.map(([label, detail]) => (
            <article key={label} className="dp-workspace-row">
              <strong>{label}</strong>
              <small>{detail}</small>
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
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#BFA46A]">{eyebrow}</span>
      <h2 className="mt-2 font-body text-[20px] font-semibold leading-snug tracking-[-0.005em] text-[#0B1F33]">{title}</h2>
      <p className="mt-2.5 max-w-2xl text-[13.5px] leading-[1.65] text-[#0B1F33]/60">{description}</p>
      <div className="mt-6 grid gap-2.5 md:grid-cols-3">
        {actions.map((action, i) => (
          <div
            key={action}
            className="group flex items-start gap-3 rounded-[8px] border border-[rgba(11,31,51,0.07)] bg-[#F7F8FB] p-4 transition-all duration-150 hover:border-[rgba(191,164,106,0.35)] hover:bg-white hover:shadow-[0_2px_12px_rgba(11,31,51,0.06)]"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[rgba(191,164,106,0.12)]">
              <Check className="h-3.5 w-3.5 text-[#BFA46A]" />
            </div>
            <p className="text-[13px] font-medium leading-snug text-[#0B1F33] group-hover:text-[#0B1F33]">{action}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function WorkspaceReports({ organizationId = "" }) {
  const reportLinks = [
    ["Monthly performance", "Recorded opens, saves, directions, redemptions, and campaign actions.", "/partner-workspace/analytics"],
    ["Map activity", "Pin opens, saves, directions, and geographic discovery.", "/map?mode=partner&tab=activity"],
    ["Campaign results", "Recorded actions tied to a stable campaign identifier.", "/partner-workspace/analytics?view=campaigns"],
  ];
  const reportCoverage = [
    ["Places", "Activity tied to a canonical map entity."],
    ["Campaigns", "Actions tied to a stable campaign record."],
    ["Offers", "Offer opens and confirmed redemptions remain separate."],
    ["Events", "Event opens and completed RSVPs remain separate."],
  ];
  const reportChecks = [
    ["Period", "Confirm the reporting dates before sharing."],
    ["Source", "Show where each recorded metric came from."],
    ["Scope", "Keep the report limited to this workspace."],
    ["Limits", "State when a metric is unavailable or incomplete."],
  ];
  const reportSections = [
    {
      section: "Executive read",
      headline: "Review the clearest recorded change.",
      copy: "Use verified workspace activity to decide what to approve next.",
      action: "Open analytics",
      href: "/partner-workspace/analytics",
    },
    {
      section: "Campaign read",
      headline: "Compare campaigns with recorded actions.",
      copy: "Keep campaigns separate when their identifiers or reporting periods differ.",
      action: "Review campaigns",
      href: "/partner-workspace/analytics?view=campaigns",
    },
    {
      section: "Place read",
      headline: "Review activity tied to one place.",
      copy: "Open the live map with the current workspace context preserved.",
      action: "Open map activity",
      href: "/map?mode=partner&tab=activity",
    },
    {
      section: "Source read",
      headline: "Check attribution before sharing.",
      copy: "Unavailable metrics remain unavailable rather than being estimated.",
      action: "Review sources",
      href: "/partner-workspace/sources",
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
      <div className="dp-workspace-reports-hero">
        <div>
          <span className="dp-workspace-report-label">Reports</span>
          <h1>Review recorded results.</h1>
          <p>Open a workspace-scoped read without estimating missing activity.</p>
        </div>
        <div className="dp-workspace-report-actions">
          <Link to={withPartnerWorkspaceContext("/partner-workspace/analytics", organizationId)} className="dp-partner-workspace-button">Open analytics</Link>
          <Link to={withPartnerWorkspaceContext("/map?mode=partner&tab=activity", organizationId)} className="dp-partner-workspace-button">Open map activity</Link>
        </div>
      </div>
      <div className="dp-workspace-report-links">
        {reportLinks.map(([label, copy, href]) => (
          <Link key={label} to={withPartnerWorkspaceContext(href, organizationId)} className="rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-4 shadow-[0_1px_4px_rgba(11,31,51,0.04)]">
            <strong className="text-[13px] text-[#0B1F33]">{label}</strong>
            <p className="mt-2 text-[13px] leading-[1.55] text-[#0B1F33]/64">{copy}</p>
          </Link>
        ))}
      </div>
      <div className="dp-workspace-analytics-grid">
        <section>
          <p className="dp-workspace-analytics-kicker">Coverage</p>
          <h2>Keep each outcome distinct.</h2>
          <div className="dp-workspace-analytics-list is-static">
            {reportCoverage.map(([label, detail]) => <article key={label}><strong>{label}</strong><span>{detail}</span></article>)}
          </div>
        </section>
        <section>
          <p className="dp-workspace-analytics-kicker">Before sharing</p>
          <h2>Check the reporting context.</h2>
          <div className="dp-workspace-analytics-list is-static">
            {reportChecks.map(([label, detail]) => <article key={label}><strong>{label}</strong><span>{detail}</span></article>)}
          </div>
        </section>
      </div>
      <div className="dp-workspace-report-grid">
        {reportSections.map((item) => (
          <section
            key={item.section}
            className="dp-workspace-report-card"
          >
            <div>
              <p className="dp-workspace-report-label">{item.section}</p>
            </div>
            <div>
              <h2>{item.headline}</h2>
              <p>{item.copy}</p>
            </div>
            <Link
              to={withPartnerWorkspaceContext(item.href, organizationId)}
              className="dp-workspace-report-link"
            >
              {item.action}
            </Link>
          </section>
        ))}
      </div>
    </motion.section>
  );
}

function WorkspaceAnalytics({ organizationId }) {
  const location = useLocation();
  const workspace = demoOrganizations.find((organization) => organization.id === organizationId) || demoOrganizations[0];
  const entities = getCanonicalWorkspaceEntities(workspace.id);
  if (workspace.id === "demo-org-waterloo-greenway" && location.pathname.includes("/analytics/experiences/downtown-art-parks-tour")) {
    return (
      <motion.section className="dp-workspace-experience-report" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <header className="dp-workspace-experience-report-header">
          <p className="dp-workspace-eyebrow">Experience report</p>
          <h1>Downtown Austin Art & Parks Tour</h1>
          <p>A clear read on visits, survey answers, directions, and the downtown areas people used most.</p>
          <Link to={withPartnerWorkspaceContext("/partner-workspace/overview", workspace.id)}>Back to overview</Link>
        </header>
        <DaaApprovedExperienceReport />
      </motion.section>
    );
  }
  const isLegendsWorkspace = workspace.id === LEGENDS_WORKSPACE_ORGANIZATION_ID;
  return (
    <div className="dp-workspace-analytics-stack">
      <PartnerAnalyticsPage workspace={workspace} entities={entities} />
      {isLegendsWorkspace ? (
        <section className="dp-legends-analytics-preserved" aria-labelledby="dp-legends-analytics-title">
          <SectionHeader
            title="SEO Snapshot"
            description="Search demand, listing opportunities, and next actions from the latest connected report."
          />
          <MetricRow metrics={[
            { label: "Tracked clicks", value: formatWorkspaceNumber(LEGENDS_WORKSPACE_SEO_REPORT.summary.organicClicks) },
            { label: "Impressions", value: formatWorkspaceNumber(LEGENDS_WORKSPACE_SEO_REPORT.summary.organicImpressions) },
            { label: "Branded position", value: formatWorkspaceNumber(LEGENDS_WORKSPACE_SEO_REPORT.summary.brandedAveragePosition) },
            { label: "Non-branded position", value: formatWorkspaceNumber(LEGENDS_WORKSPACE_SEO_REPORT.summary.nonBrandedAveragePosition) },
          ]} />
          <WorkspaceAnalyticsSnapshotGraphs report={LEGENDS_WORKSPACE_SEO_REPORT} />
          <WorkspaceLegendsSeoPanel report={LEGENDS_WORKSPACE_SEO_REPORT} />
          <p className="dp-legends-analytics-source">Source: {LEGENDS_WORKSPACE_SEO_REPORT.source} · Captured {formatWorkspaceDate(LEGENDS_WORKSPACE_SEO_REPORT.capturedAt)}</p>
        </section>
      ) : null}
    </div>
  );
}

function WorkspaceLegendsSeoPanel({ report }) {
  const priorityKeywords = [...(report.keywordMetrics || [])]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);
  const nextActions = (report.opportunities || []).slice(0, 3);

  return (
    <section className="dp-legends-workspace-seo" aria-labelledby="legends-seo-workspace-title">
      <div className="dp-legends-workspace-seo-heading">
        <div>
          <span>SEO Snapshot</span>
          <h2 id="legends-seo-workspace-title">What people are already searching for downtown.</h2>
          <p>
            This view uses the current SEO Snapshot for Legends Real Estate. It shows which searches
            are already working, which pages need care, and which updates should appear on the map next.
          </p>
        </div>
        <Link to="/map?mode=partner&tab=reports">Open map report <ArrowRight aria-hidden="true" /></Link>
      </div>

      <div className="dp-legends-workspace-keywords" aria-label="Priority keyword rows">
        {priorityKeywords.map((metric) => (
          <article key={metric.normalizedKeyword}>
            <div>
              <strong>{metric.keyword}</strong>
              <span>{metric.clusterLabel} · {metric.keywordType === "branded" ? "Branded" : "Non-branded"}</span>
            </div>
            <dl>
              <div><dt>Clicks</dt><dd>{formatWorkspaceNumber(metric.clicks)}</dd></div>
              <div><dt>Impressions</dt><dd>{formatWorkspaceNumber(metric.impressions)}</dd></div>
              <div><dt>CTR</dt><dd>{formatWorkspacePercent(metric.ctr)}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <div className="dp-legends-workspace-actions" aria-label="SEO next steps">
        {nextActions.map((metric) => (
          <article key={metric.normalizedKeyword}>
            <span>{metric.owner}</span>
            <strong>{metric.landingPage}</strong>
            <p>{metric.recommendedAction}</p>
          </article>
        ))}
      </div>

      <p className="dp-legends-workspace-sync-note">{report.accessMethod.note}</p>
    </section>
  );
}

function WorkspaceAnalyticsSnapshotGraphs({ report }) {
  const keywordMetrics = (report.keywordMetrics || []).filter(
    (metric) => metric.intentCluster !== "neighborhood_clarksville",
  );
  const impressionRows = [...keywordMetrics]
    .filter((metric) => Number(metric.impressions || 0) > 0)
    .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
    .slice(0, 5);
  const clickRows = [...keywordMetrics]
    .filter((metric) => Number(metric.clicks || 0) > 0)
    .sort((a, b) => Number(b.clicks || 0) - Number(a.clicks || 0))
    .slice(0, 5);
  const maxImpressions = Math.max(...impressionRows.map((metric) => Number(metric.impressions || 0)), 1);
  const maxClicks = Math.max(...clickRows.map((metric) => Number(metric.clicks || 0)), 1);
  const rankRows = [
    ["Branded", report.summary.brandedAveragePosition, "Searches with the Legends name"],
    ["Neighborhood", report.summary.nonBrandedAveragePosition, "Homes, places, and lifestyle searches"],
  ];
  const rankMax = Math.max(...rankRows.map(([, value]) => Number(value || 0)), 1);

  const renderBarRows = (rows, valueKey, maxValue) => rows.map((metric) => {
    const value = Number(metric[valueKey] || 0);
    const width = Math.max(4, Math.round((value / maxValue) * 100));
    return (
      <li key={`${valueKey}-${metric.normalizedKeyword}`}>
        <div>
          <span>{metric.keyword}</span>
          <strong>{formatWorkspaceNumber(value)}</strong>
        </div>
        <i aria-hidden="true"><b style={{ width: `${width}%` }} /></i>
      </li>
    );
  });

  return (
    <section className="dp-workspace-analytics-snapshot" aria-labelledby="workspace-analytics-graph-title">
      <div className="dp-workspace-analytics-heading">
        <div>
          <p className="dp-workspace-eyebrow">SEO Snapshot</p>
          <h2 id="workspace-analytics-graph-title">Search activity at a glance.</h2>
          <p>These charts use the current snapshot only. They show searches, clicks, and average rank without guessing at trends that are not connected yet.</p>
        </div>
      </div>

      <div className="dp-workspace-analytics-graph-grid">
        <article className="dp-workspace-analytics-graph" aria-label="Top keyword impressions">
          <div className="dp-workspace-analytics-graph-title">
            <span>Searches</span>
            <strong>Most seen terms</strong>
          </div>
          <ol>{renderBarRows(impressionRows, "impressions", maxImpressions)}</ol>
        </article>

        <article className="dp-workspace-analytics-graph" aria-label="Top keyword clicks">
          <div className="dp-workspace-analytics-graph-title">
            <span>Clicks</span>
            <strong>Most clicked terms</strong>
          </div>
          <ol>{renderBarRows(clickRows, "clicks", maxClicks)}</ol>
        </article>

        <article className="dp-workspace-analytics-graph dp-workspace-rank-graph" aria-label="Average rank comparison">
          <div className="dp-workspace-analytics-graph-title">
            <span>Rank</span>
            <strong>Average position</strong>
          </div>
          <ol>
            {rankRows.map(([label, value, note]) => {
              const number = Number(value || 0);
              const width = Math.max(4, Math.round((number / rankMax) * 100));
              return (
                <li key={label}>
                  <div>
                    <span>{label}</span>
                    <strong>{formatWorkspaceNumber(number)}</strong>
                    <small>{note}</small>
                  </div>
                  <i aria-hidden="true"><b style={{ width: `${width}%` }} /></i>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </section>
  );
}

function WorkspaceOverview({ user, setTab, organizationId, activation = null }) {
  const navigate = useNavigate();
  const { openSheet, closeSheet } = useWorkspaceSheet();
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(() => {
    const requestedOrganization = organizationId || readPartnerWorkspaceOrganizationId(window.location.search);
    return demoOrganizations.some((organization) => organization.id === requestedOrganization)
      ? requestedOrganization
      : LEGENDS_WORKSPACE_ORGANIZATION_ID;
  });
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  useEffect(() => {
    listWorkspaceItems("Perk", "perks", user.email).then(setPerks);
    listWorkspaceItems("Event", "events", user.email).then(setEvents);
  }, [user.email]);

  useEffect(() => {
    const requestedOrganization = organizationId || readPartnerWorkspaceOrganizationId(window.location.search);
    if (demoOrganizations.some((organization) => organization.id === requestedOrganization)) {
      setSelectedOrganizationId(requestedOrganization);
      writePartnerWorkspaceOrganizationId(requestedOrganization);
    }
  }, [organizationId]);

  const selectedOrganization = demoOrganizations.find((organization) => organization.id === selectedOrganizationId) || demoOrganizations[0];
  const ownedEntities = selectedOrganization ? getCanonicalWorkspaceEntities(selectedOrganization.id) : [];
  const filteredOrganizations = demoOrganizations.filter((organization) => organization.name.toLowerCase().includes(workspaceSearch.trim().toLowerCase()));
  const workspaceHomeCopy = WORKSPACE_HOME_COPY[selectedOrganization?.id] || {
    summary: "Manage your downtown presence, publishing, people, and reports from one focused workspace.",
    focus: "Workspace setup and publishing",
    nextStep: "Choose what should be published first.",
    publicLabel: "View public listing",
  };
  const isLegends = selectedOrganization?.id === "demo-org-legends-real-estate";
  const isLarryAndGuy = selectedOrganization?.id === "demo-org-larry-and-guy";
  const legendsSeoReport = LEGENDS_WORKSPACE_SEO_REPORT;
  const metrics = isLegends
    ? [
        ["Branded avg position", formatWorkspaceNumber(legendsSeoReport.summary.brandedAveragePosition)],
        ["Non-branded avg position", formatWorkspaceNumber(legendsSeoReport.summary.nonBrandedAveragePosition)],
        ["Branded top 10", formatWorkspaceNumber(legendsSeoReport.summary.brandedTop10KeywordCount)],
        ["Non-branded top 10", formatWorkspaceNumber(legendsSeoReport.summary.nonBrandedTop10KeywordCount)],
        ["Tracked keyword clicks", formatWorkspaceNumber(legendsSeoReport.summary.organicClicks)],
        ["Tracked impressions", formatWorkspaceNumber(legendsSeoReport.summary.organicImpressions)],
      ]
    : [];
  const activePerks = perks.filter((perk) => perk.status === "active");
  const upcomingEvents = events.filter((event) => event.status === "upcoming" || event.status === "live");
  const operatingMetrics = isLegends
    ? metrics
    : [
        ["Linked entities", formatWorkspaceNumber(ownedEntities.length)],
        ["Active offers", formatWorkspaceNumber(activePerks.length)],
        ["Upcoming events", formatWorkspaceNumber(upcomingEvents.length)],
        ["Live campaigns", formatWorkspaceNumber(isLarryAndGuy ? 1 : 0)],
      ];
  const createActions = [
    ["Create offer", "/partner-workspace/offers"],
    ["Create event", "/partner-workspace/events"],
    ["Create campaign", "/partner-workspace/campaigns"],
    ["Send broadcast", "/partner-workspace/broadcasts"],
    ["Create survey", "/partner-workspace/surveys"],
  ];
  const handleOrganizationSelect = (organizationId) => {
    setSelectedOrganizationId(organizationId);
    writePartnerWorkspaceOrganizationId(organizationId);
    setWorkspaceMenuOpen(false);
    setWorkspaceSearch("");
    const params = new URLSearchParams(window.location.search);
    params.set("organizationId", organizationId);
    navigate(`/partner-workspace/overview?${params.toString()}`, { replace: true });
  };
  const selectedEntityHref = ownedEntities[0]
    ? withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(ownedEntities[0].map_filter || "All")}&entityId=${encodeURIComponent(ownedEntities[0].entity_id)}`, selectedOrganizationId)
    : withPartnerWorkspaceContext("/map?mode=partner&tab=map&filter=All", selectedOrganizationId);

  if (!selectedOrganization) return (
    <motion.div className="dp-operating-overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
      <section className="dp-operating-header">
        <div>
          <p className="dp-workspace-eyebrow">Overview</p>
          <h1>{selectedOrganization?.name || activation?.organizationName || "Partner workspace"}</h1>
          <p>{workspaceHomeCopy.summary}</p>
          <dl className="dp-operating-status-line" aria-label="Workspace status">
            <div><dt>Role</dt><dd>{friendlyRoleLabel(selectedOrganization?.role)}</dd></div>
            <div><dt>Plan</dt><dd>{selectedOrganization?.plan || activation?.plan || "Enterprise"}</dd></div>
            <div><dt>Status</dt><dd>{friendlyWorkspaceStatus(selectedOrganization?.status).replace(" Workspace", "")}</dd></div>
          </dl>
        </div>
        <div className="dp-operating-header-actions">
          <div className="dp-create-menu-wrap">
            <button className="dp-button-primary" type="button" onClick={() => setCreateMenuOpen((open) => !open)} aria-expanded={createMenuOpen}>
              Create <ChevronDown aria-hidden="true" />
            </button>
            {createMenuOpen ? (
              <div className="dp-create-menu" role="menu">
                {createActions.map(([label, href]) => <Link key={label} to={withPartnerWorkspaceContext(href, selectedOrganizationId)} role="menuitem">{label}</Link>)}
              </div>
            ) : null}
          </div>
          <Link className="dp-button-secondary" to={selectedEntityHref}>{workspaceHomeCopy.publicLabel}</Link>
        </div>
      </section>

      <section className="dp-workspace-context" aria-labelledby="workspace-context-title">
        <div className="dp-workspace-switcher-compact">
          <span id="workspace-context-title">Workspace</span>
          <button type="button" onClick={() => setWorkspaceMenuOpen((open) => !open)} aria-expanded={workspaceMenuOpen} aria-controls="workspace-context-menu">
            <strong>{selectedOrganization?.name || "Partner workspace"}</strong>
            <small>{friendlyRoleLabel(selectedOrganization?.role)} · {friendlyWorkspaceStatus(selectedOrganization?.status).replace(" Workspace", "")}</small>
            <ChevronDown aria-hidden="true" />
          </button>
          {workspaceMenuOpen ? (
            <div className="dp-workspace-switcher-menu" id="workspace-context-menu">
              <label>
                <Search aria-hidden="true" />
                <input value={workspaceSearch} onChange={(event) => setWorkspaceSearch(event.target.value)} placeholder="Search workspaces" aria-label="Search workspaces" />
              </label>
              <div role="listbox" aria-label="Available partner workspaces">
                {filteredOrganizations.map((organization) => (
                  <button key={organization.id} type="button" role="option" aria-selected={organization.id === selectedOrganizationId} onClick={() => handleOrganizationSelect(organization.id)}>
                    <span><strong>{organization.name}</strong><small>{friendlyRoleLabel(organization.role)}</small></span>
                    {organization.id === selectedOrganizationId ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="dp-workspace-entities-compact">
          <span>Entities</span>
          <div>
            {ownedEntities.map((entity) => (
              <Link key={entity.id} to={withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(entity.map_filter || "All")}&entityId=${encodeURIComponent(entity.entity_id)}`, selectedOrganizationId)}>
                <strong>{entity.display_name}</strong>
                <small>{entity.perk_summary || entity.entity_type}</small>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
            {!ownedEntities.length ? <p>No linked entities yet.</p> : null}
          </div>
        </div>

        <div className="dp-workspace-context-actions">
          <button type="button" onClick={() => setWorkspaceMenuOpen(true)}>Switch workspace</button>
          <button type="button" onClick={() => navigate(withPartnerWorkspaceContext("/partner-workspace/profile?section=workspace", selectedOrganizationId))}>Manage workspace</button>
        </div>
      </section>

      {isLegends ? (
        <section className="dp-legends-inventory-home" aria-labelledby="legends-inventory-title">
          <header className="dp-legends-inventory-heading">
            <div>
              <p className="dp-workspace-eyebrow">Luxury Presence feed</p>
              <h2 id="legends-inventory-title">Legends inventory is connected.</h2>
              <p>Listings are synced to the map and reports.</p>
            </div>
            <span>Updated {formatWorkspaceDate(luxuryPresenceInventorySummary.generatedAt)}</span>
          </header>

          <dl className="dp-legends-inventory-summary" aria-label="Luxury Presence inventory status">
            <div><dt>Listings</dt><dd>{formatWorkspaceNumber(luxuryPresenceInventorySummary.listingCount)}</dd></div>
            <div><dt>Buildings</dt><dd>{formatWorkspaceNumber(luxuryPresenceInventorySummary.buildingCount)}</dd></div>
            <div><dt>Featured</dt><dd>{formatWorkspaceNumber(legendsTopListingPlaces.length)}</dd></div>
            <div><dt>Source</dt><dd>Luxury Presence</dd></div>
          </dl>

          <div className="dp-legends-inventory-rail" aria-label="Featured Legends listings">
            {legendsTopListingPlaces.slice(0, 6).map((listing) => (
              <Link
                key={listing.id}
                to={withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=Properties&entityId=${encodeURIComponent(listing.id)}&listingId=${encodeURIComponent(listing.id)}`, selectedOrganizationId)}
              >
                <img src={listing.image} alt="" loading="lazy" />
                <span>
                  <small>{listing.legendsListing?.listingTypeLabel || "Active listing"}</small>
                  <strong>{listing.buildingName || listing.name}</strong>
                  <em>{listing.legendsListing?.priceDisplay || listing.address}</em>
                  <b>{listing.legendsListing?.beds || "Studio"} bd · {listing.legendsListing?.baths || 1} ba</b>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>

          <footer className="dp-legends-inventory-actions">
            <Link to={withPartnerWorkspaceContext("/map?mode=partner&tab=map&filter=Properties", selectedOrganizationId)}>Review all on the map</Link>
            <Link to={withPartnerWorkspaceContext("/partner-workspace/reports", selectedOrganizationId)}>Open workspace reports</Link>
          </footer>
        </section>
      ) : null}

      <section className="dp-operating-section" aria-labelledby="performance-summary-title">
        <div className="dp-operating-section-header">
          <div><p className="dp-workspace-eyebrow">Results for</p><h2 id="performance-summary-title">{selectedOrganization?.name}</h2></div>
          {isLegends ? (
            <span className="dp-seo-period-note">Updated {formatWorkspaceDate(legendsSeoReport.capturedAt)}</span>
          ) : (
            <label className="dp-period-select">Period<select defaultValue="30"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select></label>
          )}
        </div>
        <div className="dp-metric-grid">
          {operatingMetrics.map(([label, value]) => <div className="dp-metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        {isLegends ? <WorkspaceAnalyticsSnapshotGraphs report={legendsSeoReport} /> : null}
      </section>

      {isLegends ? (
        <WorkspaceLegendsSeoPanel report={legendsSeoReport} />
      ) : (
        <section className="dp-operating-analysis">
          <article className="dp-performance-trend">
            <div className="dp-panel-heading"><div><p className="dp-workspace-eyebrow">Results trend</p><h2>More people are finding the listing.</h2></div><span>+18% vs. prior period</span></div>
            <svg viewBox="0 0 760 220" role="img" aria-label="Map views rising over the last 30 days" preserveAspectRatio="none">
              <path d="M0 188 C80 174 108 182 170 151 S280 163 352 119 S470 132 536 84 S650 91 760 34" fill="none" stroke="#C8A96A" strokeWidth="5" />
              <path d="M0 188 C80 174 108 182 170 151 S280 163 352 119 S470 132 536 84 S650 91 760 34 L760 220 L0 220 Z" fill="rgba(200,169,106,.10)" />
            </svg>
            <div className="dp-chart-axis"><span>30 days ago</span><span>Today</span></div>
          </article>
          <aside className="dp-recommended-action">
            <p className="dp-workspace-eyebrow">Suggested next step</p>
            <h2>Publish a resident event between 3–6 PM.</h2>
            <p>Afternoons are strongest near Waterloo Park. Pair the event with one active offer so people have a clear reason to go.</p>
            <Link to="/partner-workspace/events">Create event <ArrowRight aria-hidden="true" /></Link>
          </aside>
        </section>
      )}

      <section className="dp-operating-section" aria-labelledby="current-work-title">
        <div className="dp-operating-section-header"><div><p className="dp-workspace-eyebrow">Live now</p><h2 id="current-work-title">What people can use today.</h2></div></div>
        <div className="dp-current-work-grid">
          <WorkspaceActivityPanel title="Offers" items={activePerks} empty="No active offers" emptyAction="Create an offer residents can use." actionLabel="Create offer" href="/partner-workspace/offers" />
          <WorkspaceActivityPanel title="Events" items={upcomingEvents} empty="No upcoming events" emptyAction="Publish your next event." actionLabel="Publish event" href="/partner-workspace/events" />
          <WorkspaceActivityPanel title="Campaigns" items={isLarryAndGuy ? [larryAndGuyWorkspaceCampaign] : []} empty="No live campaigns" emptyAction="Launch one campaign around a clear action." actionLabel="Create campaign" href="/partner-workspace/campaigns" />
        </div>
      </section>

      <section className="dp-featured-experience">
        <div><p className="dp-workspace-eyebrow">Featured guide</p><h2>Downtown Austin Art & Parks Tour</h2><p>Afternoons are when people use this guide most.</p></div>
        <dl><div><dt>Opens</dt><dd>4,820</dd></div><div><dt>Verified visits</dt><dd>1,148</dd></div><div><dt>Survey completions</dt><dd>641</dd></div><div><dt>Directions</dt><dd>1,376</dd></div></dl>
        <div className="dp-featured-actions"><Link to="/partner-workspace/analytics/experiences/downtown-art-parks-tour">Open experience report</Link><Link to="/map?mode=partner&tab=map&filter=Civic">View on map</Link></div>
      </section>

      <section className="dp-operating-section dp-recent-activity" aria-labelledby="recent-activity-title">
        <div className="dp-operating-section-header"><div><p className="dp-workspace-eyebrow">Recent activity</p><h2 id="recent-activity-title">Latest workspace changes.</h2></div></div>
        <ol><li><span>Offer updated</span><time>Today, 9:42 AM</time></li><li><span>Campaign published</span><time>Yesterday</time></li><li><span>Report created</span><time>Jul 8</time></li><li><span>Team member invited</span><time>Jul 6</time></li></ol>
      </section>
    </motion.div>
  );

  const roleLabel = friendlyRoleLabel(selectedOrganization.role);
  const statusLabel = friendlyWorkspaceStatus(selectedOrganization.status).replace(" Workspace", "");
  const moduleRows = [
    { icon: Star, title: "Offers", status: activePerks.length ? `${activePerks.length} live` : "None live", description: activePerks.length ? "Resident offers visible on the map." : "Create an offer residents can use.", actionLabel: activePerks.length ? "Review offers" : "Create offer", route: withPartnerWorkspaceContext("/partner-workspace/offers", selectedOrganizationId) },
    { icon: Calendar, title: "Events", status: upcomingEvents.length ? `${upcomingEvents.length} upcoming` : "None scheduled", description: upcomingEvents.length ? "Events with a current or upcoming date." : "Publish your next event.", actionLabel: upcomingEvents.length ? "Review events" : "Publish event", route: withPartnerWorkspaceContext("/partner-workspace/events", selectedOrganizationId) },
    { icon: Megaphone, title: "Campaigns", status: isLarryAndGuy ? "1 live" : "None live", description: isLarryAndGuy ? "One campaign is live." : "Launch one campaign around a clear action.", actionLabel: isLarryAndGuy ? "Review campaign" : "Create campaign", route: withPartnerWorkspaceContext("/partner-workspace/campaigns", selectedOrganizationId) },
  ];
  const summaryMetrics = isLegends
    ? [
        { label: "Listings", value: formatWorkspaceNumber(luxuryPresenceInventorySummary.listingCount) },
        { label: "Buildings", value: formatWorkspaceNumber(luxuryPresenceInventorySummary.buildingCount) },
        { label: "Featured", value: formatWorkspaceNumber(legendsTopListingPlaces.length) },
        { label: "Feed", value: "Connected" },
      ]
    : [
        { label: "Places", value: formatWorkspaceNumber(ownedEntities.length) },
        { label: "Offers", value: formatWorkspaceNumber(activePerks.length) },
        { label: "Events", value: formatWorkspaceNumber(upcomingEvents.length) },
        { label: "Status", value: statusLabel },
      ];
  const performanceMetrics = isLegends
    ? [
        { label: "Tracked clicks", value: formatWorkspaceNumber(legendsSeoReport.summary.organicClicks) },
        { label: "Impressions", value: formatWorkspaceNumber(legendsSeoReport.summary.organicImpressions) },
        { label: "Branded position", value: formatWorkspaceNumber(legendsSeoReport.summary.brandedAveragePosition) },
        { label: "Non-branded position", value: formatWorkspaceNumber(legendsSeoReport.summary.nonBrandedAveragePosition) },
      ]
    : operatingMetrics.slice(0, 4).map(([label, value]) => ({ label, value }));
  const searchOpportunity = isLegends
    ? [...(legendsSeoReport.keywordMetrics || [])]
        .filter((metric) => Number(metric.impressions || 0) > 0 && Number(metric.clicks || 0) === 0)
        .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))[0]
    : null;
  const entityCards = (isLegends ? legendsTopListingPlaces : ownedEntities.map((entity) => entity.map_entity || entity))
    .slice(0, 8)
    .map((entity) => {
      const entityId = entity.id || entity.entity_id;
      const configured = ownedEntities.find((item) => item.entity_id === entityId);
      return {
        id: entityId,
        name: entity.buildingName || entity.name || entity.display_name || configured?.display_name,
        image: entity.image || entity.imageUrl || entity.images?.[0] || entity.gallery?.[0],
        meta: entity.legendsListing?.listingTypeLabel || configured?.entity_type || entity.category || "Map place",
        value: entity.legendsListing?.priceDisplay || configured?.perk_summary || entity.status || "Profile live",
        href: withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(configured?.map_filter || entity.category || "All")}&entityId=${encodeURIComponent(entityId)}`, selectedOrganizationId),
      };
    });
  const nextAction = isLegends
    ? {
        title: searchOpportunity ? `Review ${searchOpportunity.keyword}` : "Review the next listing priority",
        description: searchOpportunity ? `${formatWorkspaceNumber(searchOpportunity.impressions)} impressions and no recorded clicks. Update the connected page or launch a focused map campaign.` : "Choose the listing or page that should receive the next campaign.",
        label: "Review search performance",
        href: withPartnerWorkspaceContext("/partner-workspace/analytics?view=seo", selectedOrganizationId),
      }
    : activePerks.length === 0
      ? { title: "Publish your first active offer", description: "Give nearby residents one clear reason to visit and track what happens next.", label: "Create offer", href: withPartnerWorkspaceContext("/partner-workspace/offers", selectedOrganizationId) }
      : { title: workspaceHomeCopy.nextStep, description: "Keep the public profile current, then focus the next publish action on one useful resident decision.", label: "Open workspace", href: withPartnerWorkspaceContext("/partner-workspace/profile", selectedOrganizationId) };

  const openWorkspaceSwitcher = () => openSheet({
    eyebrow: "Workspace",
    title: "Switch workspace",
    state: "working",
    content: (
      <div className="dp-os-sheet-list" role="listbox" aria-label="Available partner workspaces">
        {demoOrganizations.map((organization) => (
          <button key={organization.id} type="button" role="option" aria-selected={organization.id === selectedOrganizationId} onClick={() => { handleOrganizationSelect(organization.id); closeSheet(); }}>
            <span><strong>{organization.name}</strong><small>{friendlyRoleLabel(organization.role)} · {friendlyWorkspaceStatus(organization.status).replace(" Workspace", "")}</small></span>
            {organization.id === selectedOrganizationId ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          </button>
        ))}
      </div>
    ),
  });
  const openEntityActions = (entity) => openSheet({
    eyebrow: "Place",
    title: entity.name,
    content: (
      <div className="dp-os-sheet-list">
        <Link to={entity.href} onClick={closeSheet}>View on map<ArrowRight aria-hidden="true" /></Link>
        <Link to={withPartnerWorkspaceContext("/partner-workspace/campaigns", selectedOrganizationId)} onClick={closeSheet}>Create campaign<ArrowRight aria-hidden="true" /></Link>
        <Link to={withPartnerWorkspaceContext("/partner-workspace/reports", selectedOrganizationId)} onClick={closeSheet}>Open report<ArrowRight aria-hidden="true" /></Link>
      </div>
    ),
  });

  return (
    <motion.div className="dp-os-overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
      <WorkspaceHeader organization={selectedOrganization} role={roleLabel} status={statusLabel} onSwitchWorkspace={openWorkspaceSwitcher} />
      <NextActionCard title={nextAction.title} description={nextAction.description} actionLabel={nextAction.label} href={nextAction.href} />
      <WorkspaceSummaryStrip metrics={summaryMetrics} />

      <section className="dp-os-section" aria-labelledby="dp-os-live-now-title">
        <SectionHeader title="Live now" compact />
        <div className="dp-os-module-list" id="dp-os-live-now-title">
          {moduleRows.map((row) => <ModuleStatusRow key={row.title} {...row} />)}
        </div>
      </section>

      <EntityRail entities={entityCards} onOpenMenu={openEntityActions} viewAllHref={withPartnerWorkspaceContext("/map?mode=partner&tab=map&filter=All", selectedOrganizationId)} />

      <section className="dp-os-section dp-os-performance" aria-labelledby="dp-os-performance-title">
        <SectionHeader title="Performance" description={isLegends ? "Based on the latest connected search report." : "A concise read on current workspace activity."} compact />
        <div id="dp-os-performance-title"><MetricRow metrics={performanceMetrics} /></div>
        <InsightCard
          category={isLegends ? "Search opportunity" : "Next opportunity"}
          title={searchOpportunity?.keyword || "Turn current activity into one focused publish action"}
          description={searchOpportunity ? `${formatWorkspaceNumber(searchOpportunity.impressions)} impressions and no recorded clicks.` : "Review the strongest place, offer, or event before publishing the next update."}
          actionLabel={isLegends ? "Review page" : "Open analytics"}
          href={withPartnerWorkspaceContext("/partner-workspace/analytics", selectedOrganizationId)}
        />
      </section>

      <FeaturedResult
        title="Downtown Austin Art & Parks Tour"
        description="Afternoons are the strongest window for this guide."
        metrics={[{ label: "Opens", value: "4,820" }, { label: "Verified visits", value: "1,148" }, { label: "Survey completions", value: "641" }]}
        actionLabel="Open report"
        href={withPartnerWorkspaceContext("/partner-workspace/analytics/experiences/downtown-art-parks-tour", selectedOrganizationId)}
      />

      <ActivityTimeline groups={[
        { label: "Today", items: [{ title: "Offer updated", time: "9:42 AM" }] },
        { label: "Yesterday", items: [{ title: "Campaign published", time: "Yesterday" }] },
        { label: "Earlier", items: [{ title: "Report created", time: "Jul 8" }, { title: "Team member invited", time: "Jul 6" }] },
      ]} />
    </motion.div>
  );
}

function WorkspaceActivityPanel({ title, items, empty, emptyAction, actionLabel, href }) {
  return (
    <article className="dp-work-activity-panel">
      <header><h3>{title}</h3>{items.length ? <Link to={href}>View all</Link> : null}</header>
      {items.length ? <ul>{items.slice(0, 3).map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.status}</span></li>)}</ul> : <div className="dp-work-empty"><strong>{empty}</strong><p>{emptyAction}</p><Link to={href}>{actionLabel}</Link></div>}
    </article>
  );
}

function DaaApprovedExperienceReport() {
  const summaryMetrics = [
    ["Guide opens", "4,820", "Views"],
    ["Verified visits", "1,148", "Visits"],
    ["Survey completions", "641", "Feedback"],
    ["Direction requests", "1,376", "Directions"],
  ];
  const timeBuckets = [["Morning", 48], ["Lunch", 66], ["Afternoon", 100], ["Evening", 78], ["Weekend", 72]];
  const surveyThemes = [["Public art", 82], ["Park space", 71], ["Walking route", 58], ["More shade and seating", 46], ["Family-friendly stops", 39]];
  const rankedLocations = [
    ["Waterloo Park", "1,284 visits", "+18%"],
    ["Republic Square", "972 visits", "+11%"],
    ["Moody Amphitheater", "846 visits", "+7%"],
    ["Paramount Theatre", "731 visits", "+4%"],
    ["Congress Avenue Bridge", "692 visits", "+3%"],
  ];
  const funnel = [["Opened the guide", 4820], ["Saved a stop", 2190], ["Asked for directions", 1376], ["Visited", 1148], ["Answered the survey", 641]];
  const districts = [["Downtown Core", 88], ["Congress", 76], ["Waterloo", 69], ["Republic Square", 58], ["Red River", 43]];

  return (
    <div className="dp-approved-experience-report">
      <section className="dp-experience-summary" aria-labelledby="experience-summary-title">
        <div className="dp-experience-section-header">
          <div><p className="dp-workspace-eyebrow">Last 30 days</p><h2 id="experience-summary-title">How the guide performed</h2></div>
          <label>Period<select defaultValue="30"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select></label>
        </div>
        <div className="dp-experience-metric-grid">
          {summaryMetrics.map(([label, value, context]) => <div key={label}><span>{context}</span><strong>{value}</strong><small>{label}</small></div>)}
        </div>
      </section>

      <section className="dp-experience-two-column">
        <article className="dp-experience-panel dp-time-analysis">
          <div className="dp-experience-panel-heading"><p className="dp-workspace-eyebrow">Activity pattern</p><h2>Afternoon is the strongest window.</h2><span>Share of peak activity</span></div>
          <div className="dp-column-chart" role="img" aria-label="Activity by time of day, with afternoon highest">
            {timeBuckets.map(([label, value]) => <div key={label}><span style={{ height: `${value}%` }}><i>{value}%</i></span><small>{label}</small></div>)}
          </div>
        </article>
        <article className="dp-experience-panel dp-survey-analysis">
          <div className="dp-experience-panel-heading"><p className="dp-workspace-eyebrow">Survey themes</p><h2>What motivates visits.</h2><span>Relative response strength</span></div>
          <ol className="dp-horizontal-bars">
            {surveyThemes.map(([label, value]) => <li key={label}><div><strong>{label}</strong><span>{value}%</span></div><i><b style={{ width: `${value}%` }} /></i></li>)}
          </ol>
        </article>
      </section>

      <section className="dp-experience-two-column">
        <article className="dp-experience-panel">
          <div className="dp-experience-panel-heading"><p className="dp-workspace-eyebrow">Places</p><h2>Most visited locations</h2><span>Verified visits and change</span></div>
          <ol className="dp-ranked-locations">
            {rankedLocations.map(([label, value, change], index) => <li key={label}><b>{index + 1}</b><strong>{label}</strong><span>{value}</span><em>{change}</em></li>)}
          </ol>
        </article>
        <article className="dp-experience-panel">
          <div className="dp-experience-panel-heading"><p className="dp-workspace-eyebrow">Progress</p><h2>From opening the guide to leaving feedback</h2><span>People completing each step</span></div>
          <ol className="dp-experience-funnel">
            {funnel.map(([label, value], index) => <li key={label} style={{ width: `${100 - index * 10}%` }}><span>{label}</span><strong>{Number(value).toLocaleString()}</strong></li>)}
          </ol>
        </article>
      </section>

      <section className="dp-experience-panel dp-district-analysis">
        <div className="dp-experience-panel-heading"><p className="dp-workspace-eyebrow">District activity</p><h2>Where people used the guide most</h2><span>Activity by district</span></div>
        <ol className="dp-district-distribution">
          {districts.map(([label, value], index) => <li key={label}><b>{index + 1}</b><strong>{label}</strong><i><span style={{ width: `${value}%` }} /></i><em>{value}</em></li>)}
        </ol>
      </section>

      <footer className="dp-experience-report-actions">
        <div><p className="dp-workspace-eyebrow">Next action</p><h2>Use the afternoon window to connect the tour with nearby programming.</h2></div>
        <div><Link className="dp-button-primary" to="/partner-workspace/campaigns">Create campaign</Link><Link className="dp-button-secondary" to="/map?mode=partner&tab=map&filter=Civic">View on map</Link></div>
      </footer>
    </div>
  );
}

function LegacyWorkspaceOverview({ user, setTab, mode = "active", activation = null, hasPrivilegedAccess = false }) {
  const [perks, setPerks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(demoOrganizations[0]?.id);
  const [upgradePrompt, setUpgradePrompt] = useState(null);

  useEffect(() => {
    listWorkspaceItems("Perk", "perks", user.email).then(setPerks);
    listWorkspaceItems("Event", "events", user.email).then(setEvents);
  }, [user.email]);

  const selectedOrganization = demoOrganizations.find((organization) => organization.id === selectedOrganizationId) || demoOrganizations[0];
  const ownedEntities = selectedOrganization ? getCanonicalWorkspaceEntities(selectedOrganization.id) : [];
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
    { label: "Create offer", sub: "Give residents a clear reason to visit this week.", icon: Star, tab: "offers" },
    { label: "Create event", sub: "Add something happening soon so people can find it nearby.", icon: Calendar, tab: "events" },
    { label: "Create campaign", sub: "Choose the message, where it appears, and what people should do next.", icon: LayoutDashboard, tab: "campaigns" },
    { label: "Create report", sub: "Review the results and choose the next practical update.", icon: ShieldCheck, tab: "reports" },
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
          <div className="dp-workspace-activation-status" aria-label="Workspace setup checklist">
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
            <p className="dp-workspace-eyebrow">Partner setup</p>
            <h2>Start once. Run it from one workspace.</h2>
            <p>
              Move from signup to plan, checkout, setup, and everyday updates without jumping between disconnected pages.
            </p>
          </div>
          <div className="dp-workspace-lifecycle-list" aria-label="Partner setup steps">
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
            <Link to="/partner-workspace/overview">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Open workspace
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
            <p className="dp-workspace-eyebrow">Organizations and workspaces</p>
            <h2 className="dp-workspace-section-title">Manage multiple organizations from a single account.</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#0B1F33]/60">
              Switch between properties, venues, hotels, brands, civic programs, and listings without creating separate logins.
            </p>
          </div>
          <div className="dp-workspace-status-chip">
            <span className="font-semibold text-[#0B1F33]">{workspaceCopy.label}</span>
            <span className="mx-2 text-[#BFA46A]">/</span>
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
                  className={`rounded-[4px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/60 ${
                    isSelected
                      ? "border-[#BFA46A]/55 bg-[rgba(191,164,106,0.10)]"
                      : "border-[rgba(11,31,51,0.08)] bg-[#F7F8FB] hover:border-[#BFA46A]/45 hover:bg-white"
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
                  Manage the places, campaigns, reports, team, and billing connected to this workspace.
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
            <p className="dp-workspace-eyebrow">Workspace tools</p>
            <h2 className="dp-workspace-section-title">One place for partner work.</h2>
          </div>
          <p>
            Each tool opens the right part of the workspace. Plans and signup stay on the public pages,
            while billing, reports, campaigns, offers, events, and team access stay here.
          </p>
        </div>
        <div className="dp-workspace-module-grid">
          {WORKSPACE_CAPABILITY_LINKS.map((capability) => {
            const locked = !hasPrivilegedAccess && capability.lockedByDefault && !hasWorkspaceModule(activation, capability.addonId || capability.label.toLowerCase());
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
                  <small>Available with Plus</small>
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
            <h2 id="workspace-upgrade-title">Add {upgradePrompt.label}</h2>
            <p>
              Send a focused email or text to the residents, guests, buildings, or districts that matter. Preview it, schedule it, then see how people responded.
            </p>
            <ul>
              <li>Choose a district, building, group, or uploaded list.</li>
              <li>Review the preview before anything goes live.</li>
              <li>See opens, clicks, saves, scans, and follow-up actions.</li>
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
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[rgba(11,31,51,0.05)] border border-[rgba(11,31,51,0.06)] group-hover:bg-[rgba(191,164,106,0.12)] group-hover:border-[rgba(191,164,106,0.25)] transition-all duration-150">
                <Icon className="w-4 h-4 text-[#0B1F33]/60 group-hover:text-[#BFA46A] transition-colors duration-150" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[#0B1F33] mb-0.5 leading-snug">{a.label}</div>
                <div className="text-[12px] text-[#0B1F33]/52 leading-snug">{a.sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B1F33]/28 mt-0.5 shrink-0 group-hover:translate-x-0.5 group-hover:text-[#BFA46A] transition-all duration-150" />
            </>
          );
          const className = "group flex items-start gap-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white p-5 text-left shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_14px_rgba(11,31,51,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(191,164,106,0.4)] hover:shadow-[0_4px_16px_rgba(11,31,51,0.07),0_10px_30px_rgba(11,31,51,0.06)] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50";
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
                <div className={`w-2 h-2 rounded-[2px] shrink-0 ${p.status === "active" ? "bg-[#BFA46A]" : "bg-muted-foreground/40"}`} />
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
                <div className={`w-2 h-2 rounded-[2px] shrink-0 ${e.status === "live" ? "bg-[#BFA46A]" : e.status === "upcoming" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground truncate">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] border capitalize shrink-0 ${
                  e.status === "live" ? "bg-[#0B1F33]/20 text-[#BFA46A] border-[#BFA46A]/30" :
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
      support: "See what people want more of, from events and shade to easier routes.",
      items: daaExplorerQuestions[1].options.map((label) => ({
        label,
        meta: "Requested more",
        detail: `${label} is useful for future programming, wayfinding, partner prompts, and public-space planning.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "How Often People Visit",
      icon: Users,
      support: "See whether people are residents, regular visitors, workers, or occasional guests.",
      items: daaExplorerQuestions[2].options.map((label) => ({
        label,
        meta: "Visit frequency",
        detail: `${label} helps civic partners see whether the tour fits everyday downtown routines or brings people back in.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Most Used Places",
      icon: MapPin,
      support: "See which places people open, save, visit, and return to most.",
      items: daaDashboardContent.placesPeopleUseMost.map((label) => ({
        label,
        meta: "Place behavior",
        detail: `${label} shows what people do next: visit, save, return, get directions, or open details.`,
        href: "/map?mode=partner&tab=map&filter=Civic",
      })),
    },
    {
      title: "Most Visited Locations",
      icon: MapPin,
      support: "Stops people open and then visit in person.",
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
      title: "Most Returned-To Stops",
      icon: Check,
      support: "Stops people come back to as part of their downtown routine.",
      items: returnStops.map((label) => ({
        label,
        meta: "Return use",
        detail: `${label} shows repeat interest, which is useful for events, signs, and nearby partner suggestions.`,
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
        detail: `${label} gets direction requests, which usually means people are ready to visit.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Most Requested Context",
      icon: MessageSquareText,
      support: "Places where people want more history, detail, or visitor information.",
      items: learningStops.map((label) => ({
        label,
        meta: "View details",
        detail: `${label} is a good place for richer copy, better QR prompts, and nearby tour details.`,
        href: stopHref(label),
      })),
    },
    {
      title: "Activity by Time of Day",
      icon: Calendar,
      support: "See when people are most likely to open, save, visit, and ask for directions.",
      items: daaDashboardContent.timeAnalysis.buckets.map((label) => ({
        label,
        meta: "Time window",
        detail: `${label} helps civic partners see when people are most likely to explore, save, or continue to another stop.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
    {
      title: "Visit Progress",
      icon: Check,
      support: "Follow the path from opening the guide to visiting a stop.",
      items: [
        { label: `Visited ${daaTourProgress.visited} / ${daaTourProgress.total}`, meta: "Check-ins", detail: "Visited stops show where the guide is helping people go in person.", href: "/map?mode=partner&tab=map&filter=Civic" },
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
        detail: `${label} groups stops, saves, directions, and learning into a downtown area people can understand.`,
        href: `/map?mode=partner&tab=map&filter=Civic&q=${encodeURIComponent(label)}`,
      })),
    },
  ];
  const [activeRailItem, setActiveRailItem] = useState(railSections[0].items[0]);

  return (
    <section className="mb-8 rounded-[10px] border border-[rgba(11,31,51,.06)] bg-[#F7F8FB] p-5 shadow-[0_8px_24px_rgba(11,31,51,.04)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">Downtown Austin Art & Parks Tour</div>
          <h3 className="font-body mt-2 text-[23px] font-semibold leading-snug tracking-normal text-[#0B1F33]">How People Use This Guide</h3>
          <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-[#0B1F33]/66">
            See opens, saves, visits, directions, and survey answers across the Downtown Austin Art & Parks Tour. Learn which places draw attention and where people come back.
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">{label}</div>
            <p className="mt-1 text-[20px] font-semibold leading-tight tracking-normal text-[#0B1F33]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">{activeRailItem.meta}</div>
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
        <Icon className="h-4 w-4 text-[#BFA46A]" />
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
                  ? "border-[#BFA46A]/70 bg-white text-[#0B1F33] shadow-[0_8px_24px_rgba(11,31,51,.055)]"
                  : "border-[rgba(11,31,51,.06)] bg-[#F7F8FB] text-[#0B1F33]/70 hover:border-[#BFA46A]/45 hover:text-[#0B1F33]"
              }`}
            >
              <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">{item.meta}</span>
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
  const [showForm, setShowForm] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("intent") === "new");
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    listWorkspaceItems("Perk", "perks", user.email)
      .then(data => { setPerks(data || []); setLoading(false); })
      .catch(() => { setPerks(getStoredItems("perks", user.email)); setLoading(false); });
  };

  useEffect(() => { load(); }, [user.email]);

  function setPublisherIntent(open) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (open) url.searchParams.set("intent", "new");
    else url.searchParams.delete("intent");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function closePublisher() { setPublisherIntent(false); setShowForm(false); setEditing(null); }
  function handleEdit(perk) { setEditing(perk); setShowForm(true); }
  function handleAdd() { setPublisherIntent(true); setEditing(null); setShowForm(true); }
  async function handleDelete(id) {
    await deleteWorkspaceItem("Perk", "perks", user.email, id);
    load();
  }

  return (
    <motion.section className="dp-workspace-module-page dp-workspace-offers-page" aria-labelledby="workspace-offers-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <header className="dp-workspace-module-header">
        <div>
          <p>Offers</p>
          <h1 id="workspace-offers-title">Create an offer residents can use.</h1>
          <span>Manage the offer, eligibility, timing, and map placement from one place.</span>
        </div>
        <button onClick={handleAdd} className="dp-workspace-module-primary">
          <Plus aria-hidden="true" /> Create offer
        </button>
      </header>

      {showForm && (
        <PerkForm user={user} perk={editing} onClose={closePublisher} onSave={() => { closePublisher(); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-[8px] animate-spin" />
        </div>
      ) : perks.length === 0 ? (
        <EmptyState icon={Star} headline="No active offers" body="Create an offer residents can use." action="Create offer" onAction={handleAdd} />
      ) : (
        <div className="space-y-3">
          {perks.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-[3px] shrink-0 ${p.status === "active" ? "bg-[#BFA46A] shadow-[0_0_4px_rgba(191,164,106,0.5)]" : p.status === "paused" ? "bg-[#BFA46A]/50" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{p.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{p.venue_name} · {CAT_LABELS[p.category] || p.category}</div>
              </div>
              <span className="text-[11.5px] font-semibold text-[#8B6B2F] border border-[rgba(191,164,106,0.35)] bg-[rgba(191,164,106,0.08)] px-2.5 py-0.5 rounded-[6px] shrink-0 hidden sm:block">{p.value}</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[6px] border capitalize shrink-0 ${
                p.status === "active" ? "bg-[rgba(191,164,106,0.1)] text-[#8B6B2F] border-[rgba(191,164,106,0.3)]" :
                p.status === "paused" ? "bg-[rgba(11,31,51,0.05)] text-[#0B1F33]/50 border-[rgba(11,31,51,0.1)]" :
                "bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/40 border-[rgba(11,31,51,0.08)]"
              }`}>{p.status}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.title}`} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.title}`} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

function PerkForm({ user, perk, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: perk?.title || "",
    venue_name: perk?.venue_name || "",
    category: perk?.category || "discount",
    value: perk?.value || "",
    description: perk?.description || "",
    terms: perk?.terms || "",
    status: perk?.status || "active",
    eligibility: perk?.eligibility || "all_residents",
    redemption_type: perk?.redemption_type || "resident_card",
    start_date: perk?.start_date || "",
    end_date: perk?.end_date || "",
    available_hours: perk?.available_hours || "All day",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }
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
      className="dp-native-publisher mb-6 p-6 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <div><p className="dp-native-publisher__step">{step} of 4</p><h3 className="text-[17px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{perk ? "Edit offer" : "New offer"}</h3></div>
        <button type="button" onClick={onClose} aria-label="Close offer editor" className="flex h-11 w-11 items-center justify-center bg-transparent text-[#0B1F33] transition-colors hover:text-[#BFA46A]"><X className="w-4 h-4" /></button>
      </div>
      <div className="dp-native-publisher__progress" aria-label={`Perk creation step ${step} of 4`}>{[1, 2, 3, 4].map((item) => <i key={item} className={item <= step ? "is-active" : ""} />)}</div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {step === 1 ? <>
          <h4>Offer basics</h4>
          <FormField label="Offer title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
          <FormField label="Short description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <FormField label="Offer value (e.g. 15% off)" value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} required />
          <PublisherSelect label="Offer type" value={form.category} onChange={value => setForm(f => ({ ...f, category: value }))} options={PERK_CATEGORIES.map(value => ({ value, label: CAT_LABELS[value] }))} />
        </> : null}
        {step === 2 ? <>
          <h4>Eligibility and use</h4>
          <PublisherSelect label="Who can use this?" value={form.eligibility} onChange={value => setForm(f => ({ ...f, eligibility: value }))} options={[{ value: "all_residents", label: "All residents" }, { value: "selected_properties", label: "Selected properties" }, { value: "selected_districts", label: "Selected districts" }, { value: "card_holders", label: "Perks Card holders" }]} />
          <PublisherSelect label="How is it redeemed?" value={form.redemption_type} onChange={value => setForm(f => ({ ...f, redemption_type: value }))} options={[{ value: "resident_card", label: "Show resident card" }, { value: "qr", label: "Scan QR" }, { value: "external", label: "Use external link" }, { value: "staff", label: "Ask staff" }]} />
          <FormField label="Terms" value={form.terms} onChange={v => setForm(f => ({ ...f, terms: v }))} />
        </> : null}
        {step === 3 ? <>
          <h4>Timing and location</h4>
          <div className="dp-native-publisher__dates"><FormField label="Start date" type="date" value={form.start_date} onChange={v => setForm(f => ({ ...f, start_date: v }))} /><FormField label="End date" type="date" value={form.end_date} onChange={v => setForm(f => ({ ...f, end_date: v }))} /></div>
          <FormField label="Available hours" value={form.available_hours} onChange={v => setForm(f => ({ ...f, available_hours: v }))} />
          <FormField label="Location" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} required />
        </> : null}
        {step === 4 ? <>
          <h4>Preview and publish</h4>
          <article className="dp-native-perk-preview" aria-label="Resident perk preview"><span>Resident preview</span><strong>{form.title || "Your perk title"}</strong><p>{form.value || form.description || "Resident offer"}</p><small>{form.venue_name || "Your location"} · {form.redemption_type === "resident_card" ? "Show your Perks Card" : "Show the offer details"}</small></article>
          <PublisherSelect label="Publish" value={form.status} onChange={value => setForm(f => ({ ...f, status: value }))} options={[{ value: "active", label: "Publish now" }, { value: "paused", label: "Save as draft" }]} />
        </> : null}
        <div className="dp-native-publisher__actions pt-2">
          {step > 1 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="dp-native-publisher__back"><ChevronLeft aria-hidden="true" /> Back</button> : <button type="button" onClick={onClose} className="dp-native-publisher__back">Cancel</button>}
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50">
            {saving ? "Publishing…" : step < 4 ? "Continue" : perk ? "Save changes" : "Publish perk"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function PublisherSelect({ label, value, onChange, options }) {
  return <label className="dp-native-publisher__field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

// ─── EVENTS MANAGER ───────────────────────────────────────────────────────────

function EventsManager({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("intent") === "new");
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

  function setPublisherIntent(open) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (open) url.searchParams.set("intent", "new");
    else url.searchParams.delete("intent");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function openPublisher(event = null) { setPublisherIntent(true); setEditing(event); setShowForm(true); }
  function closePublisher() { setPublisherIntent(false); setShowForm(false); setEditing(null); }

  return (
    <motion.section className="dp-workspace-module-page dp-workspace-events-page" aria-labelledby="workspace-events-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <header className="dp-workspace-module-header">
        <div>
          <p>Events</p>
          <h1 id="workspace-events-title">Publish your next event.</h1>
          <span>Keep the date, location, audience, and RSVP path together.</span>
        </div>
        <button onClick={() => openPublisher()} className="dp-workspace-module-primary">
          <Plus aria-hidden="true" /> Create event
        </button>
      </header>

      {showForm && (
        <EventForm user={user} event={editing} onClose={closePublisher} onSave={() => { closePublisher(); load(); }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[rgba(11,31,51,0.12)] border-t-[#0B1F33] rounded-[8px] animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} headline="No upcoming events" body="Publish an event when the date and location are ready." action="Create event" onAction={() => openPublisher()} />
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 rounded-[10px] border border-[rgba(11,31,51,0.07)] bg-white shadow-[0_1px_4px_rgba(11,31,51,0.04),0_4px_12px_rgba(11,31,51,0.04)] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07),0_6px_18px_rgba(11,31,51,0.06)] hover:-translate-y-px transition-all duration-150">
              <div className={`w-1.5 h-1.5 rounded-[3px] shrink-0 ${e.status === "live" ? "bg-[#BFA46A] shadow-[0_0_4px_rgba(191,164,106,0.5)]" : e.status === "upcoming" ? "bg-[#0B1F33]/40" : "bg-[rgba(11,31,51,0.2)]"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[#0B1F33]">{e.title}</div>
                <div className="text-[12px] text-[#0B1F33]/50 mt-0.5">{e.venue_name || "—"} · {CAT_LABELS[e.category] || e.category}</div>
              </div>
              <span className="text-[11px] font-medium text-[#0B1F33]/40 hidden md:block shrink-0">{e.rsvp_count || 0} RSVPs</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[6px] border capitalize shrink-0 ${
                e.status === "live" ? "bg-[rgba(191,164,106,0.1)] text-[#8B6B2F] border-[rgba(191,164,106,0.3)]" :
                e.status === "upcoming" ? "bg-[rgba(11,31,51,0.05)] text-[#0B1F33]/60 border-[rgba(11,31,51,0.12)]" :
                "bg-[rgba(11,31,51,0.04)] text-[#0B1F33]/40 border-[rgba(11,31,51,0.08)]"
              }`}>{e.status}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openPublisher(e)} aria-label={`Edit ${e.title}`} className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(e.id)} aria-label={`Delete ${e.title}`} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
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
      className="dp-native-publisher dp-native-event-publisher mb-6 p-6 rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_2px_12px_rgba(11,31,51,0.06),0_8px_24px_rgba(11,31,51,0.05)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{event ? "Edit event" : "New event"}</h3>
        <button type="button" onClick={onClose} aria-label="Close event editor" className="flex h-11 w-11 items-center justify-center bg-transparent text-[#0B1F33] transition-colors hover:text-[#BFA46A]"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Event title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <FormField label="Venue name" value={form.venue_name} onChange={v => setForm(f => ({ ...f, venue_name: v }))} />
        <div>
          <label className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(191,164,106,0.5)] focus:ring-2 focus:ring-[rgba(191,164,106,0.15)] transition-colors">
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
            className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(191,164,106,0.5)] focus:ring-2 focus:ring-[rgba(191,164,106,0.15)] transition-colors">
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
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50">
            {saving ? "Saving…" : event ? "Save changes" : "Create event"}
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center px-4 h-9 rounded-[7px] border border-[rgba(11,31,51,0.10)] bg-white text-[12.5px] font-semibold text-[#0B1F33]/62 transition-all duration-150 hover:-translate-y-px hover:border-[rgba(11,31,51,0.16)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.06)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

function getOrganizationProfileDefaults(organization) {
  if (!organization) return {};
  const base = {
    organization_id: organization.id,
    partner_name: organization.name,
    organization_name: organization.name,
    membership_plan: organization.plan ? `${organization.plan.charAt(0).toUpperCase()}${organization.plan.slice(1)}` : "Enterprise",
    best_contact: `${organization.name} team`,
  };
  if (organization.id !== LEGENDS_WORKSPACE_ORGANIZATION_ID) return base;
  return {
    ...base,
    partner_category: "Real Estate",
    partner_type: "real-estate",
    district: "Downtown Austin",
    primary_location: "Downtown Austin, TX",
    audience_size: "Downtown buyers, sellers, renters, and residents",
    public_summary: "Legends Real Estate connects people with current downtown Austin homes, building context, and private showing options.",
    public_action: "Compare current listings, explore what is nearby, save a home, or request a private showing.",
    operating_hours: "Showing times by appointment",
    neighborhood: "Downtown Austin",
    nearby_landmarks: "Seaholm, 2nd Street, Rainey, Congress Avenue",
    keywords: "downtown Austin real estate, condos, homes, rentals, Legends Real Estate",
    category: "Downtown real estate",
    map_visibility: "Appears on the partner map, property search, listing details, and reports",
  };
}

function ProfileSection({ user, setUser, organization }) {
  const storedProfile = getStoredProfile(organization?.id) || {};
  const storedProfileMatchesOrganization = storedProfile.organization_id === organization?.id || storedProfile.partner_name === organization?.name;
  const organizationProfile = {
    ...getOrganizationProfileDefaults(organization),
    ...(storedProfileMatchesOrganization ? storedProfile : {}),
  };
  const defaultStory = "Waterloo Greenway connects downtown visitors with park experiences, outdoor events, cultural programming, and public spaces throughout the Greenway.";
  const defaultAction = "Attend events, discover public art, join programs, read updates, volunteer, and support local work.";
  const [form, setForm] = useState(() => ({
    ...(organizationProfile),
    partner_name: organizationProfile.partner_name || user?.partner_name || user?.organization_name || "Waterloo Greenway",
    organization_name: organizationProfile.organization_name || user?.organization_name || user?.partner_name || "Waterloo Greenway",
    partner_category: organizationProfile.partner_category || user?.partner_category || user?.partner_type || "Civic / Community",
    partner_type: organizationProfile.partner_type || user?.partner_type || "civic",
    district: organizationProfile.district || user?.district || "Waterloo",
    primary_location: organizationProfile.primary_location || user?.primary_location || user?.address || "Waterloo Park, Austin, TX",
    membership_plan: organizationProfile.membership_plan || user?.membership_plan || user?.plan || "Founding Partner",
    best_contact: organizationProfile.best_contact || user?.best_contact || user?.full_name || "Waterloo Greenway team",
    email: user?.email || user?.contact_email || storedProfile.email || "",
    contact_email: user?.contact_email || user?.email || storedProfile.contact_email || "",
    phone: user?.phone || user?.contact_phone || storedProfile.phone || "",
    website: user?.website || storedProfile.website || "",
    audience_size: organizationProfile.audience_size || user?.audience_size || user?.audience_reach || "Downtown residents, visitors, event guests, and park supporters",
    public_summary: organizationProfile.public_summary || user?.public_summary || user?.bio || defaultStory,
    public_action: organizationProfile.public_action || user?.public_action || defaultAction,
    operating_hours: organizationProfile.operating_hours || user?.operating_hours || "Daily park hours with event-specific schedules",
    neighborhood: organizationProfile.neighborhood || user?.neighborhood || "Waterloo Park and Red River",
    nearby_landmarks: organizationProfile.nearby_landmarks || user?.nearby_landmarks || "Moody Amphitheater, Texas Capitol, Red River Cultural District",
    keywords: organizationProfile.keywords || user?.keywords || "parks, public art, events, trails, community",
    category: organizationProfile.category || user?.category || "Parks and culture",
    map_visibility: organizationProfile.map_visibility || user?.map_visibility || "Appears on the map, search, events, offers, and QR links",
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const latestStoredProfile = getStoredProfile(organization?.id) || {};
    const latestProfileMatchesOrganization = latestStoredProfile.organization_id === organization?.id || latestStoredProfile.partner_name === organization?.name;
    const latestOrganizationProfile = {
      ...getOrganizationProfileDefaults(organization),
      ...(latestProfileMatchesOrganization ? latestStoredProfile : {}),
    };
    setForm({
      ...(latestOrganizationProfile),
      partner_name: latestOrganizationProfile.partner_name || user?.partner_name || user?.organization_name || "Waterloo Greenway",
      organization_name: latestOrganizationProfile.organization_name || user?.organization_name || user?.partner_name || "Waterloo Greenway",
      partner_category: latestOrganizationProfile.partner_category || user?.partner_category || user?.partner_type || "Civic / Community",
      partner_type: latestOrganizationProfile.partner_type || user?.partner_type || "civic",
      district: latestOrganizationProfile.district || user?.district || "Waterloo",
      primary_location: latestOrganizationProfile.primary_location || user?.primary_location || user?.address || "Waterloo Park, Austin, TX",
      membership_plan: latestOrganizationProfile.membership_plan || user?.membership_plan || user?.plan || "Founding Partner",
      best_contact: latestOrganizationProfile.best_contact || user?.best_contact || user?.full_name || "Waterloo Greenway team",
      email: user?.email || user?.contact_email || latestStoredProfile.email || "",
      contact_email: user?.contact_email || user?.email || latestStoredProfile.contact_email || "",
      phone: user?.phone || user?.contact_phone || latestStoredProfile.phone || "",
      website: user?.website || latestStoredProfile.website || "",
      audience_size: latestOrganizationProfile.audience_size || user?.audience_size || user?.audience_reach || "Downtown residents, visitors, event guests, and park supporters",
      public_summary: latestOrganizationProfile.public_summary || user?.public_summary || user?.bio || defaultStory,
      public_action: latestOrganizationProfile.public_action || user?.public_action || defaultAction,
      operating_hours: latestOrganizationProfile.operating_hours || user?.operating_hours || "Daily park hours with event-specific schedules",
      neighborhood: latestOrganizationProfile.neighborhood || user?.neighborhood || "Waterloo Park and Red River",
      nearby_landmarks: latestOrganizationProfile.nearby_landmarks || user?.nearby_landmarks || "Moody Amphitheater, Texas Capitol, Red River Cultural District",
      keywords: latestOrganizationProfile.keywords || user?.keywords || "parks, public art, events, trails, community",
      category: latestOrganizationProfile.category || user?.category || "Parks and culture",
      map_visibility: latestOrganizationProfile.map_visibility || user?.map_visibility || "Appears on the map, search, events, offers, and QR links",
    });
    setDirty(false);
  }, [organization, user.email, user.organization_name, user.partner_name, user.full_name, user.partner_type]);

  useEffect(() => {
    setSaved(false);
  }, [organization?.id]);

  function update(field, value) {
    setDirty(true);
    setSaved(false);
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "partner_name" ? { organization_name: value } : {}),
      ...(field === "email" ? { contact_email: value } : {}),
      ...(field === "phone" ? { contact_phone: value } : {}),
      ...(field === "public_summary" ? { bio: value } : {}),
      ...(field === "membership_plan" ? { plan: value } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const nextUser = {
      ...PUBLIC_PARTNER_USER,
      ...user,
      ...form,
      organization_id: organization?.id || form.organization_id,
      full_name: form.best_contact || user.full_name || PUBLIC_PARTNER_USER.full_name,
      organization_name: form.partner_name,
      partner_name: form.partner_name,
      contact_email: form.email,
      contact_phone: form.phone,
      audience_reach: form.audience_size,
      bio: form.public_summary,
    };

    try {
      const updated = await base44.auth.updateMe(nextUser);
      const normalizedUser = { ...nextUser, ...(updated || {}) };
      saveStoredProfile(normalizedUser, organization?.id);
      setUser(normalizedUser);
    } catch {
      const localUser = markLocalRecord(nextUser);
      saveStoredProfile(localUser, organization?.id);
      setUser(localUser);
    } finally {
      setSaving(false);
      setSaved(true);
      setDirty(false);
    }
  }

  const PARTNER_TYPES = [
    { value: "property", label: "Property" },
    { value: "hotel", label: "Hotel" },
    { value: "venue", label: "Venue" },
    { value: "restaurant", label: "Restaurant" },
    { value: "retail", label: "Retail" },
    { value: "brand", label: "Brand" },
    { value: "civic", label: "Civic / Community" },
    { value: "real-estate", label: "Real Estate" },
  ];

  return (
    <motion.div className="dp-profile-editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="dp-profile-editor__intro">
        <div>
          <p className="dp-profile-editor__eyebrow">Partner Page</p>
          <h2 className="dp-profile-editor__title">Your public profile</h2>
          <p>Everything residents see across the map, search results, events, offers, and QR experiences starts here.</p>
        </div>
        <span className="dp-profile-editor__status">Founding Partner</span>
      </div>

      <form onSubmit={handleSubmit} className={`dp-profile-editor__layout ${dirty ? "is-dirty" : ""}`}>
        <div className="dp-profile-editor__sections">
          <section className="dp-profile-editor__section">
            <header>
              <p>Identity</p>
              <h3 className="dp-profile-section-title">Partner identity</h3>
            </header>
            <div className="dp-profile-editor__grid">
              <ProfileField label="Partner Name" value={form.partner_name} onChange={value => update("partner_name", value)} required />
              <ProfileSelect label="Partner Category" value={form.partner_type} onChange={value => update("partner_type", value)} options={PARTNER_TYPES} />
              <ProfileField label="District" value={form.district} onChange={value => update("district", value)} />
              <ProfileField label="Primary Location" value={form.primary_location} onChange={value => update("primary_location", value)} />
              <ProfileField label="Membership Plan" value={form.membership_plan} onChange={value => update("membership_plan", value)} />
            </div>
          </section>

          <section className="dp-profile-editor__section">
            <header>
              <p>Contact</p>
              <h3 className="dp-profile-section-title">Contact information</h3>
            </header>
            <div className="dp-profile-editor__grid">
              <ProfileField label="Best Contact" value={form.best_contact} onChange={value => update("best_contact", value)} />
              <ProfileField label="Email" value={form.email} onChange={value => update("email", value)} type="email" />
              <ProfileField label="Phone" value={form.phone} onChange={value => update("phone", value)} type="tel" />
              <ProfileField label="Website" value={form.website} onChange={value => update("website", value)} type="url" />
              <ProfileField label="People you reach" value={form.audience_size} onChange={value => update("audience_size", value)} />
            </div>
          </section>

          <section className="dp-profile-editor__section">
            <header>
              <p>Story</p>
              <h3 className="dp-profile-section-title">Public story</h3>
            </header>
            <ProfileTextarea
              label="About this place"
              helper="Help visitors understand why they should stop here."
              value={form.public_summary}
              onChange={value => update("public_summary", value)}
              placeholder="Describe the experience, atmosphere, community value, or what makes this place worth discovering."
            />
            <ProfileTextarea
              label="What can people do here?"
              value={form.public_action}
              onChange={value => update("public_action", value)}
              placeholder="Attend events, discover public art, join programs, reserve tickets, read updates, volunteer, or support local work."
            />
          </section>

          <section className="dp-profile-editor__section">
            <header>
              <p>Discovery</p>
              <h3 className="dp-profile-section-title">Discovery settings</h3>
            </header>
            <div className="dp-profile-editor__grid">
              <ProfileField label="Operating Hours" value={form.operating_hours} onChange={value => update("operating_hours", value)} />
              <ProfileField label="Neighborhood" value={form.neighborhood} onChange={value => update("neighborhood", value)} />
              <ProfileField label="Nearby Landmarks" value={form.nearby_landmarks} onChange={value => update("nearby_landmarks", value)} />
              <ProfileField label="Keywords" value={form.keywords} onChange={value => update("keywords", value)} />
              <ProfileField label="Category" value={form.category} onChange={value => update("category", value)} />
              <ProfileField label="Where it appears" value={form.map_visibility} onChange={value => update("map_visibility", value)} />
            </div>
          </section>

          <div className="dp-profile-editor__actions">
            <button type="submit" disabled={saving} className="dp-profile-editor__primary">
              {saved ? <><Check aria-hidden="true" /> Changes saved</> : saving ? "Saving..." : "Save changes"}
            </button>
            <Link to="/map?mode=resident&tab=map&filter=All" className="dp-profile-editor__secondary">
              Preview public page
            </Link>
            <span className={`dp-profile-editor__save-state ${dirty ? "is-dirty" : ""}`} role="status" aria-live="polite">
              {saving ? "Saving this workspace…" : saved ? "Saved to this workspace." : dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
        </div>

        <aside className="dp-profile-preview" aria-label="Live profile preview">
          <div className="dp-profile-preview__phone">
            <div className="dp-profile-preview__image">
              <span>{form.partner_type || "partner"}</span>
            </div>
            <div className="dp-profile-preview__body">
              <p className="dp-profile-preview__meta">{form.category || form.partner_type} / {form.district || "Downtown Austin"}</p>
              <h3>{form.partner_name || "Partner Name"}</h3>
              <p className="dp-profile-preview__location">{form.neighborhood || form.primary_location}</p>
              <p className="dp-profile-preview__description">{form.public_summary || defaultStory}</p>
              <button type="button">Open on map</button>
              <div className="dp-profile-preview__nearby">
                <span>Nearby suggestions</span>
                <p>{form.nearby_landmarks || "Moody Amphitheater, Texas Capitol, Red River Cultural District"}</p>
              </div>
              <dl>
                <div>
                  <dt>Likely visitors</dt>
                  <dd>{form.audience_size}</dd>
                </div>
                <div>
                  <dt>Visible across</dt>
                  <dd>Map, search, events, offers, and QR links</dd>
                </div>
                <div>
                  <dt>Suggested improvement</dt>
                  <dd>Publish updates that help visitors discover upcoming events, seasonal experiences, and ways to explore {form.partner_name || "this place"}.</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </form>
    </motion.div>
  );
}

function ProfileField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="dp-profile-field">
      <span>{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={event => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function ProfileSelect({ label, value, onChange, options }) {
  return (
    <label className="dp-profile-field">
      <span>{label}</span>
      <select value={value || ""} onChange={event => onChange(event.target.value)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ProfileTextarea({ label, helper, value, onChange, placeholder }) {
  return (
    <label className="dp-profile-field dp-profile-field--textarea">
      <span>{label}</span>
      {helper && <em>{helper}</em>}
      <textarea value={value || ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows={5} />
    </label>
  );
}

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

function FormField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-[#0B1F33]/44 uppercase tracking-[0.1em] mb-1.5">{label}</span>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-white border border-[rgba(11,31,51,0.12)] rounded-[7px] px-3.5 py-2.5 text-[13px] text-[#0B1F33] outline-none focus:border-[rgba(191,164,106,0.5)] focus:ring-2 focus:ring-[rgba(191,164,106,0.15)] transition-colors placeholder:text-[#0B1F33]/25"
      />
    </label>
  );
}

function EmptyState({ icon: Icon, headline, body, action, onAction }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-12 rounded-[10px] border border-[rgba(191,164,106,0.25)] bg-[rgba(191,164,106,0.07)] flex items-center justify-center mx-auto mb-4 shadow-[0_2px_8px_rgba(191,164,106,0.1)]">
        <Icon className="w-5 h-5 text-[#BFA46A]" />
      </div>
      <h3 className="mb-1.5 text-[15px] font-semibold text-[#0B1F33] tracking-[-0.01em]">{headline}</h3>
      <p className="text-[13px] text-[#0B1F33]/50 mb-6 max-w-sm mx-auto leading-relaxed">{body}</p>
      <button onClick={onAction} className="inline-flex items-center gap-2 px-5 h-9 rounded-[7px] bg-[#0B1F33] text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(11,31,51,0.18),0_6px_16px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50">
        <Plus className="w-3.5 h-3.5" /> {action}
      </button>
    </div>
  );
}
