const clean = (value, max = 180) => String(value || "").trim().slice(0, max);

export const ADMIN_SCOPE_LEVELS = Object.freeze(["platform", "organization", "portfolio", "listing", "none"]);
export const ADMIN_SCOPE_EVENTS = Object.freeze({
  requested: "admin_scope_requested",
  resolved: "admin_scope_resolved",
  denied: "admin_scope_denied",
  failed: "admin_scope_failed",
});

const SCOPE_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,179}$/;

export function parseAdminScopeQuery(query = {}) {
  return {
    organizationId: clean(query.organizationId),
    portfolioId: clean(query.portfolioId),
    listingId: clean(query.listingId),
  };
}

export function validateAdminScopeInput(scope = {}) {
  for (const key of ["organizationId", "portfolioId", "listingId"]) {
    const value = clean(scope[key]);
    if (value && !SCOPE_ID_PATTERN.test(value)) {
      return { ok: false, code: "ADMIN_SCOPE_INVALID", message: "Administrator scope is invalid." };
    }
  }
  if ((scope.portfolioId || scope.listingId) && !scope.organizationId) {
    return { ok: false, code: "ADMIN_SCOPE_ORGANIZATION_REQUIRED", message: "Choose an organization before choosing a narrower scope." };
  }
  return { ok: true };
}

export function adminScopeLevel(scope = {}) {
  if (scope.listingId) return "listing";
  if (scope.portfolioId) return "portfolio";
  if (scope.organizationId) return "organization";
  return "platform";
}

export function serializeAdminOrganizations(organizations = []) {
  return organizations.map((item) => ({
    id: clean(item.id),
    name: clean(item.name, 240),
    external_id: clean(item.external_id, 180) || undefined,
    status: clean(item.status, 80) || undefined,
    legacy_partner_id: clean(item.legacy_partner_id, 180) || undefined,
  }));
}

export function serializeAdminPortfolios(portfolios = []) {
  return portfolios.map((item) => ({
    id: clean(item.id),
    organization_id: clean(item.organization_id),
    name: clean(item.name, 240),
    status: clean(item.status, 80) || undefined,
  }));
}

export function serializeAdminListings(listings = []) {
  return listings.map((item) => ({
    id: clean(item.id),
    organization_id: clean(item.organization_id),
    portfolio_id: clean(item.portfolio_id) || undefined,
    name: clean(item.name, 240),
    status: clean(item.status, 80) || undefined,
    entity_id: clean(item.entity_id, 180) || undefined,
  }));
}

export function serializeAdminScopeResponse({ role = "", organizations = [], portfolios = [], listings = [], activeScope = {} } = {}) {
  const normalizedScope = {};
  const organizationId = clean(activeScope.organizationId);
  const portfolioId = clean(activeScope.portfolioId);
  const listingId = clean(activeScope.listingId);
  if (organizationId) normalizedScope.organizationId = organizationId;
  if (portfolioId) normalizedScope.portfolioId = portfolioId;
  if (listingId) normalizedScope.listingId = listingId;
  return {
    role: clean(role, 80),
    organizations: serializeAdminOrganizations(organizations),
    portfolios: serializeAdminPortfolios(portfolios),
    listings: serializeAdminListings(listings),
    activeScope: normalizedScope,
  };
}

export function emptyAdminScopeResponse(role = "") {
  return serializeAdminScopeResponse({ role });
}
