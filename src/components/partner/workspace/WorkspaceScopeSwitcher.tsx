import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdminScopeSwitcher } from "@/components/admin/AdminScopeSwitcher";
import {
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
  onAdminScopeResolved?: (scope: PartnerWorkspaceScope) => void;
};

export function WorkspaceScopeSwitcher({ scope, accessMode, organizationName, onAdminScopeResolved }: WorkspaceScopeSwitcherProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const portfolioLabelId = useId();
  const listingLabelId = useId();
  const [adminScopeOpen, setAdminScopeOpen] = useState(false);
  const portfolios = scope.organizationId ? getOrganizationPortfolios(scope.organizationId) : [];
  const listings = scope.organizationId
    ? getOrganizationListings(scope.organizationId, scope.portfolioId)
    : [];
  if (accessMode === "admin") {
    return (
      <section className="dp-workspace-scope dp-workspace-scope--admin" aria-label="Choose admin workspace scope" data-expanded={adminScopeOpen}>
        <header className="dp-workspace-scope__admin-summary">
          <div className="dp-workspace-scope__summary">
            <p>Admin workspace</p>
            <strong>Authorized platform scope</strong>
            <span>Organizations, portfolios, and listings from your verified access.</span>
          </div>
          <button
            type="button"
            className="dp-workspace-scope__toggle"
            aria-expanded={adminScopeOpen}
            aria-controls="admin-workspace-scope-controls"
            onClick={() => setAdminScopeOpen((open) => !open)}
          >
            {adminScopeOpen ? "Hide controls" : "Choose scope"}
          </button>
        </header>
        {adminScopeOpen ? (
          <div className="dp-workspace-scope__admin-controls" id="admin-workspace-scope-controls">
            <AdminScopeSwitcher onScopeResolved={onAdminScopeResolved} />
            <div className="dp-workspace-scope__admin-actions">
              <Link className="dp-workspace-scope__accounts" to={replacePartnerWorkspaceScope("/partner-workspace/residents", scope)}>
                People & access
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  function updateScope(nextScope: PartnerWorkspaceScope) {
    writePartnerWorkspaceScope(nextScope);
    navigate(replacePartnerWorkspaceScope(`${location.pathname}${location.search}${location.hash}`, nextScope), {
      replace: true,
    });
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
      aria-label="Partner workspace scope"
    >
      <div className="dp-workspace-scope__summary">
        <p>Partner workspace</p>
        <strong>{scope.listingId ? "One place" : scope.organizationId ? "Combined organization" : "Choose an organization"}</strong>
        {organizationName ? <span>{organizationName}</span> : null}
      </div>
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
    </section>
  );
}
