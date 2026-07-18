import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  CreditCard,
  FileText,
  Image,
  ListChecks,
  MapPinned,
  Megaphone,
  Plug,
  QrCode,
  Radio,
  Route,
  Search,
  Sparkles,
  UserCog,
  UserRound,
  Users,
  Workflow,
  X,
  ChevronRight,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getWorkspaceModulesForDestination } from "@/config/workspaceModuleRegistry";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

const DESTINATIONS = {
  publish: {
    eyebrow: "Create",
    title: "Publish",
    description: "Put offers, events, campaigns, and map guides in front of the right people.",
    next: { id: "offers", title: "Create an offer", description: "Give nearby residents one clear reason to visit." },
    groups: [
      { title: "Publish", ids: ["events", "campaigns", "broadcasts", "surveys"] },
      { title: "Map content", ids: ["listings", "routes"] },
    ],
  },
  performance: {
    eyebrow: "Results",
    title: "Performance",
    description: "See what people find, open, save, and use across the map and your campaigns.",
    next: { id: "analytics", title: "Review results", description: "See the latest activity and the next decision it supports." },
    groups: [
      { title: "Results", ids: ["reports", "audience"] },
      { title: "Discovery", ids: ["seo", "map_activity"] },
    ],
  },
  workspace: {
    eyebrow: "Manage",
    title: "Workspace",
    description: "Keep your organization, places, people, and connected systems current.",
    next: { id: "profile", title: "Review your profile", description: "Confirm the details people see before you publish." },
    groups: [
      { title: "Presence", ids: ["entities", "media"] },
      { title: "People and access", ids: ["people", "team", "notifications"] },
      { title: "Systems", ids: ["sources", "automations", "ai", "qr"] },
      { title: "Account", ids: ["billing", "support"] },
    ],
  },
};

const MODULE_ICONS = {
  offers: BadgePercent,
  events: CalendarDays,
  campaigns: Megaphone,
  broadcasts: Radio,
  surveys: ListChecks,
  listings: Building2,
  routes: Route,
  analytics: BarChart3,
  reports: FileText,
  audience: Users,
  seo: Search,
  map_activity: MapPinned,
  profile: UserRound,
  entities: Building2,
  people: Users,
  media: Image,
  team: UserCog,
  sources: Plug,
  automations: Workflow,
  ai: Sparkles,
  qr: QrCode,
  notifications: Bell,
  billing: CreditCard,
  support: CircleHelp,
};

function WorkspaceModuleRow({ module, organizationId, onClick }) {
  const Icon = MODULE_ICONS[module.id] || ChartNoAxesCombined;
  return (
    <Link
      className="dp-workspace-destination-row"
      data-search-text={`${module.label} ${module.description}`.toLowerCase()}
      to={withPartnerWorkspaceContext(module.href, organizationId)}
      onClick={onClick}
    >
      <Icon aria-hidden="true" />
      <span><strong>{module.label}</strong><small>{module.description}</small></span>
      <ChevronRight aria-hidden="true" />
    </Link>
  );
}

export function WorkspaceDestinationRoot({ destination, organizationId }) {
  const content = DESTINATIONS[destination];
  const modules = getWorkspaceModulesForDestination(destination);
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const nextModule = moduleById.get(content.next.id);

  return <section className="dp-workspace-destination" aria-labelledby={`workspace-${destination}-title`}>
    <header className="dp-workspace-destination-hero">
      <p>{content.eyebrow}</p>
      <h1 id={`workspace-${destination}-title`}>{content.title}</h1>
      <span>{content.description}</span>
    </header>

    {nextModule ? <section className="dp-workspace-destination-next" aria-labelledby={`workspace-${destination}-next`}>
      <p>Start here</p>
      <h2 id={`workspace-${destination}-next`}>{content.next.title}</h2>
      <span>{content.next.description}</span>
      <Link to={withPartnerWorkspaceContext(nextModule.href, organizationId)}>{nextModule.label}<ArrowRight aria-hidden="true" /></Link>
    </section> : null}

    <div className="dp-workspace-destination-groups">
      {content.groups.map((group) => {
        const groupModules = group.ids.map((id) => moduleById.get(id)).filter(Boolean);
        if (!groupModules.length) return null;
        return <section className="dp-workspace-destination-group" key={group.title} aria-labelledby={`workspace-${destination}-${group.title.replace(/\s+/g, "-").toLowerCase()}`}>
          <h2 id={`workspace-${destination}-${group.title.replace(/\s+/g, "-").toLowerCase()}`}>{group.title}</h2>
          <div className="dp-workspace-destination-list">
            {groupModules.map((module) => <WorkspaceModuleRow key={module.id} module={module} organizationId={organizationId} />)}
          </div>
        </section>;
      })}
    </div>
  </section>;
}

export function GlobalWorkspaceSearch({ open, onClose, organizationId }) {
  if (!open || typeof document === "undefined") return null;
  const modules = ["home", "publish", "performance", "workspace"].flatMap(getWorkspaceModulesForDestination);
  return createPortal(<div className="dp-workspace-search-layer" role="dialog" aria-modal="true" aria-label="Search workspace">
    <button className="dp-workspace-search-backdrop" type="button" onClick={onClose} aria-label="Close search" />
    <section className="dp-workspace-search-sheet">
      <header><Search aria-hidden="true" /><input autoFocus type="search" placeholder="Search workspace" aria-label="Search workspace" onInput={(event) => {
        const query = event.currentTarget.value.trim().toLowerCase();
        event.currentTarget.closest("section")?.querySelectorAll("[data-search-text]").forEach((row) => { row.hidden = Boolean(query) && !row.dataset.searchText.includes(query); });
      }} /><button type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></header>
      <div className="dp-workspace-destination-list" aria-label="Workspace tools">
        {modules.map((module) => <WorkspaceModuleRow key={module.id} module={module} organizationId={organizationId} onClick={onClose} />)}
      </div>
    </section>
  </div>, document.body);
}
