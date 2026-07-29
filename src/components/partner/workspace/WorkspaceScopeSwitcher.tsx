import { useId } from "react";
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
  const portfolios = scope.organizationId ? getOrganizationPortfolios(scope.organizationId) : [];
  const listings = scope.organizationId
    ? getOrganizationListings(scope.organizationId, scope.portfolioId)
    : [];

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
        <p>{accessMode === "admin" ? "Admin viewing" : "Partner workspace"}</p>
        <strong>{scope.listingId ? "One place" : scope.organizationId ? "Combined organization" : "Choose an organization"}</strong>
        {accessMode === "partner" && organizationName ? <span>{organizationName}</span> : null}
      </div>
      {accessMode === "admin" ? (
        <label id={organizationLabelId}>
          <span>Organization</span>
          <select
            aria-labelledby={organizationLabelId}
            value={scope.organizationId || ""}
            onChange={(event) => selectOrganization(event.target.value)}
          >
            <option value="">Choose organization</option>
            {demoOrganizations.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </label>
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
        <Link className="dp-workspace-scope__accounts" to="/admin-studio/residents">
          Registered users
        </Link>
      ) : null}
    </section>
  );
}
