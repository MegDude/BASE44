import { useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
};

export function WorkspaceScopeSwitcher({ scope }: WorkspaceScopeSwitcherProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const organizationLabelId = useId();
  const portfolioLabelId = useId();
  const listingLabelId = useId();

  const selectedOrganization = scope.organizationId
    ? demoOrganizations.find((organization) => organization.id === scope.organizationId)
    : undefined;
  const portfolios = scope.organizationId ? getOrganizationPortfolios(scope.organizationId) : [];
  const listings = scope.organizationId
    ? getOrganizationListings(scope.organizationId, scope.portfolioId)
    : [];
  const selectedPortfolio = scope.portfolioId
    ? portfolios.find((portfolio) => portfolio.id === scope.portfolioId)
    : undefined;
  const selectedListing = scope.listingId
    ? listings.find((listing) => listing.id === scope.listingId)
    : undefined;

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

  const scopeTitle = selectedListing?.name || selectedPortfolio?.name || selectedOrganization?.name || "Choose an organization";
  const scopeDetail = selectedListing
    ? "One place"
    : selectedPortfolio
      ? "Portfolio view"
      : selectedOrganization
        ? "Organization view"
        : "No workspace selected";

  return (
    <section className="dp-workspace-scope" aria-label="Choose workspace scope">
      <div className="dp-workspace-scope__summary">
        <p>Workspace</p>
        <strong>{scopeTitle}</strong>
        <span>{scopeDetail}</span>
      </div>

      <div className="dp-workspace-scope__controls">
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
      </div>
    </section>
  );
}
