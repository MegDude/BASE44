import { ChevronRight, Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getWorkspaceModulesForDestination } from "@/config/workspaceModuleRegistry";
import { withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";

const COPY = {
  publish: ["Publish", "Create and manage what residents see."],
  performance: ["Performance", "See what people find, open, save, and use."],
  workspace: ["Workspace", "Manage your organization, data, people, and settings."],
};

export function WorkspaceDestinationRoot({ destination, organizationId }) {
  const [title, description] = COPY[destination];
  const modules = getWorkspaceModulesForDestination(destination);
  return <section className="dp-workspace-destination" aria-labelledby={`workspace-${destination}-title`}>
    <header><p>Partner workspace</p><h1 id={`workspace-${destination}-title`}>{title}</h1><span>{description}</span></header>
    <div className="dp-workspace-destination-list">
      {modules.map((module) => <Link key={module.id} to={withPartnerWorkspaceContext(module.href, organizationId)}>
        <span><strong>{module.label}</strong><small>{module.description}</small></span><ChevronRight aria-hidden="true" />
      </Link>)}
    </div>
  </section>;
}

export function GlobalWorkspaceSearch({ open, onClose, organizationId }) {
  if (!open || typeof document === "undefined") return null;
  const modules = ["home", "publish", "performance", "workspace"].flatMap(getWorkspaceModulesForDestination);
  return createPortal(<div className="dp-workspace-search-layer" role="dialog" aria-modal="true" aria-label="Search workspace">
    <button className="dp-workspace-search-backdrop" type="button" onClick={onClose} aria-label="Close search" />
    <section className="dp-workspace-search-sheet">
      <header><Search aria-hidden="true" /><input autoFocus type="search" placeholder="Search tools, reports, places, and actions" aria-label="Search workspace" onInput={(event) => {
        const query = event.currentTarget.value.trim().toLowerCase();
        event.currentTarget.closest("section")?.querySelectorAll("[data-search-text]").forEach((row) => { row.hidden = Boolean(query) && !row.dataset.searchText.includes(query); });
      }} /><button type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></header>
      <div className="dp-workspace-destination-list" aria-label="Workspace tools">
        {modules.map((module) => <Link key={module.id} data-search-text={`${module.label} ${module.description}`.toLowerCase()} to={withPartnerWorkspaceContext(module.href, organizationId)} onClick={onClose}><span><strong>{module.label}</strong><small>{module.description}</small></span><ChevronRight aria-hidden="true" /></Link>)}
      </div>
    </section>
  </div>, document.body);
}
