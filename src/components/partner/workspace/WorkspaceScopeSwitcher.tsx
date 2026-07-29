import { useId, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  demoOrganizations,
  getOrganizationListings,
  getOrganizationPortfolios,
} from "@/config/workspaceArchitecture";
import {
  type PartnerWorkspaceScope,
  replacePartnerWorkspaceScope,
  writePartnerWorkspaceScope,
} from "@/lib/partnerWorkspaceContext";

type WorkspaceScopeSwitcherProps = {
  scope: PartnerWorkspaceScope;
  accessMode: "admin" | "partner";
  organizationName?: string;
};

export function WorkspaceScopeSwitcher({ scope, accessMode, organizationName }: WorkspaceScopeSwitcherProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const organizationLabelId = useId();
  const portfolioLabelId = useId();
  const listingLabelId = useId();
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const [scopeSearch, setScopeSearch] = useState("");
  const portfolios = scope.organizationId ? getOrganizationPortfolios(scope.organizationId) : [];
  const listings = scope.organizationId
    ? getOrganizationListings(scope.organizationId, scope.portfolioId)
    : [];
  const selectedOrganizationName = demoOrganizations.find(
    (organization) => organization.id === scope.organizationId,
  )?.name;
  const visibleOrganizations = useMemo(() => {
    const query = scopeSearch.trim().toLowerCase();
    if (!query) return demoOrganizations;
    return demoOrganizations.filter((organization) => {
      const hierarchy = [
        organization.name,
        ...getOrganizationPortfolios(organization.id).map((portfolio) => portfolio.name),
        ...getOrganizationListings(organization.id).map((listing) => listing.name),
      ].join(" ").toLowerCase();
      return hierarchy.includes(query);
    });
  }, [scopeSearch]);

  function updateScope(nextScope: PartnerWorkspaceScope) {
    writePartnerWorkspaceScope(nextScope);
    navigate(replacePartnerWorkspaceScope(`${location.pathname}${location.search}${location.hash}`, nextScope), {
      replace: true,
    });
  }

  function selectOrganization(organizationId: string) {
    updateScope({
      organizationId: organizationId || undefined,
      range: scope.range,
    });
    setScopeMenuOpen(false);
    setScopeSearch("");
  }

  function selectPortfolio(portfolioId: string) {
    updateScope({
      ...scope,
      portfolioId: portfolioId || undefined,
      listingId: undefined,
    });
  }

  function selectListing(listingId: string) {
    updateScope({
      ...scope,
      listingId: listingId || undefined,
    });
  }

  return (
    <section
      className={`dp-workspace-scope dp-workspace-scope--${accessMode}`}
      aria-label={accessMode === "admin" ? "Choose admin workspace scope" : "Partner workspace scope"}
    >
      <div className="dp-workspace-scope__summary">
        <p>{accessMode === "admin" ? "Admin workspace" : "Partner workspace"}</p>
        <strong>
          {accessMode === "admin"
            ? selectedOrganizationName || "All organizations"
            : scope.listingId ? "One place" : scope.organizationId ? "Combined organization" : "Choose an organization"}
        </strong>
        {accessMode === "admin" ? <span>Authorized platform scope</span> : null}
        {accessMode === "partner" && organizationName ? <span>{organizationName}</span> : null}
      </div>
      {accessMode === "admin" ? (
        <div className="dp-workspace-scope__organization">
          <span>Organization</span>
          <button
            id={organizationLabelId}
            type="button"
            className="dp-workspace-scope__trigger"
            aria-haspopup="dialog"
            aria-expanded={scopeMenuOpen}
            onClick={() => setScopeMenuOpen(true)}
          >
            {selectedOrganizationName || "All organizations"}
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
      ) : null}
      {scope.organizationId && portfolios.length ? (
        <label id={portfolioLabelId}>
          <span>Portfolio</span>
          <select
            aria-labelledby={portfolioLabelId}
            value={scope.portfolioId || ""}
            onChange={(event) => selectPortfolio(event.target.value)}
          >
            <option value="">All portfolios</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      {scope.organizationId && listings.length > 1 ? (
        <label id={listingLabelId}>
          <span>Place or listing</span>
          <select
            aria-labelledby={listingLabelId}
            value={scope.listingId || ""}
            onChange={(event) => selectListing(event.target.value)}
          >
            <option value="">Combined view</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>{listing.name}</option>
            ))}
          </select>
        </label>
      ) : null}
      {accessMode === "admin" ? (
        <div className="dp-workspace-scope__admin-actions">
          <Link className="dp-workspace-scope__accounts" to={replacePartnerWorkspaceScope("/partner-workspace/residents", scope)}>
            People & access
          </Link>
          <button className="dp-workspace-scope__admin-link" type="button" onClick={() => selectOrganization("")}>
            Platform overview
          </button>
        </div>
      ) : null}
      {accessMode === "admin" && scopeMenuOpen ? (
        <div className="dp-workspace-scope-sheet" role="dialog" aria-modal="true" aria-labelledby={`${organizationLabelId}-title`}>
          <button className="dp-workspace-scope-sheet__backdrop" type="button" aria-label="Close organization selector" onClick={() => setScopeMenuOpen(false)} />
          <section className="dp-workspace-scope-sheet__panel">
            <div className="dp-workspace-scope-sheet__grabber" aria-hidden="true" />
            <header>
              <div>
                <p>Admin workspace</p>
                <h2 id={`${organizationLabelId}-title`}>Choose organization</h2>
              </div>
              <button type="button" onClick={() => setScopeMenuOpen(false)} aria-label="Close organization selector">×</button>
            </header>
            <label className="dp-workspace-scope-sheet__search">
              <span>Search organizations, portfolios, and listings</span>
              <input autoFocus value={scopeSearch} onChange={(event) => setScopeSearch(event.target.value)} placeholder="Search workspace scope" />
            </label>
            <div className="dp-workspace-scope-sheet__results">
              <button type="button" className={!scope.organizationId ? "is-selected" : ""} onClick={() => selectOrganization("")}>
                <strong>All organizations</strong><span>Platform-wide overview</span>
              </button>
              {visibleOrganizations.map((organization) => {
                const organizationPortfolios = getOrganizationPortfolios(organization.id);
                const organizationListings = getOrganizationListings(organization.id);
                return (
                  <button key={organization.id} type="button" className={scope.organizationId === organization.id ? "is-selected" : ""} onClick={() => selectOrganization(organization.id)}>
                    <strong>{organization.name}</strong>
                    <span>
                      {organizationPortfolios.length
                        ? `${organizationPortfolios.map((portfolio) => portfolio.name).join(", ")} → ${organizationListings.map((listing) => listing.name).join(", ") || "No listings"}`
                        : organizationListings.map((listing) => listing.name).join(", ") || "Organization workspace"}
                    </span>
                  </button>
                );
              })}
              {!visibleOrganizations.length ? <p>No matching workspace scope.</p> : null}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
