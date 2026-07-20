import {
  demoOrganizations,
  getOrganizationListings,
  getOrganizationPortfolios,
} from "../config/workspaceArchitecture";

export const PARTNER_WORKSPACE_CONTEXT_KEY = "dp_partner_workspace:selected_scope";

export const PARTNER_WORKSPACE_SCOPE_KEYS = [
  "organizationId",
  "portfolioId",
  "listingId",
  "view",
  "section",
  "range",
] as const;

export type PartnerWorkspaceScope = {
  organizationId?: string;
  portfolioId?: string;
  listingId?: string;
  view?: string;
  section?: string;
  range?: string;
};

export type ResolvedPartnerWorkspaceScope = PartnerWorkspaceScope & {
  type: "unscoped" | "organization" | "portfolio" | "listing";
  listingIds: string[];
};

function cleanScopeValue(value: string | null | undefined) {
  const cleaned = String(value || "").trim();
  return cleaned || undefined;
}

function readStoredScope(): PartnerWorkspaceScope {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(PARTNER_WORKSPACE_CONTEXT_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function readPartnerWorkspaceScope(search = "", includeStored = true): PartnerWorkspaceScope {
  const params = new URLSearchParams(search);
  const stored = includeStored ? readStoredScope() : {};
  const requestedOrganizationId = cleanScopeValue(params.get("organizationId") || params.get("workspaceId"));
  const requestedListingId = cleanScopeValue(params.get("listingId") || params.get("entityId"));

  return {
    organizationId: requestedOrganizationId || cleanScopeValue(stored.organizationId),
    portfolioId: cleanScopeValue(params.get("portfolioId")) || cleanScopeValue(stored.portfolioId),
    listingId: requestedListingId || cleanScopeValue(stored.listingId),
    view: cleanScopeValue(params.get("view")),
    section: cleanScopeValue(params.get("section")),
    range: cleanScopeValue(params.get("range")) || cleanScopeValue(stored.range),
  };
}

export function readPartnerWorkspaceOrganizationId(search = "") {
  return readPartnerWorkspaceScope(search).organizationId || "";
}

export function resolvePartnerWorkspaceScope(scope: PartnerWorkspaceScope): ResolvedPartnerWorkspaceScope {
  const organization = demoOrganizations.find((item) => item.id === cleanScopeValue(scope.organizationId));
  if (!organization) {
    return {
      type: "unscoped",
      listingIds: [],
      view: cleanScopeValue(scope.view),
      section: cleanScopeValue(scope.section),
      range: cleanScopeValue(scope.range),
    };
  }

  const portfolio = getOrganizationPortfolios(organization.id)
    .find((item) => item.id === cleanScopeValue(scope.portfolioId));
  const listings = getOrganizationListings(organization.id, portfolio?.id);
  const listing = listings.find((item) => item.id === cleanScopeValue(scope.listingId));

  return {
    organizationId: organization.id,
    portfolioId: portfolio?.id,
    listingId: listing?.id,
    view: cleanScopeValue(scope.view),
    section: cleanScopeValue(scope.section),
    range: cleanScopeValue(scope.range),
    type: listing ? "listing" : portfolio ? "portfolio" : "organization",
    listingIds: listing ? [listing.id] : listings.map((item) => item.id),
  };
}

export function writePartnerWorkspaceScope(scope: PartnerWorkspaceScope) {
  if (typeof window === "undefined") return;
  const persistentScope = {
    organizationId: cleanScopeValue(scope.organizationId),
    portfolioId: cleanScopeValue(scope.portfolioId),
    listingId: cleanScopeValue(scope.listingId),
    range: cleanScopeValue(scope.range),
  };
  try {
    window.localStorage.setItem(PARTNER_WORKSPACE_CONTEXT_KEY, JSON.stringify(persistentScope));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function writePartnerWorkspaceOrganizationId(organizationId: string) {
  writePartnerWorkspaceScope({ ...readStoredScope(), organizationId });
}

export function withPartnerWorkspaceScope(href: string, scope: PartnerWorkspaceScope) {
  if (!href.startsWith("/")) return href;
  const [pathAndSearch, hash = ""] = href.split("#");
  const [pathname, search = ""] = pathAndSearch.split("?");
  const params = new URLSearchParams(search);

  PARTNER_WORKSPACE_SCOPE_KEYS.forEach((key) => {
    const value = cleanScopeValue(scope[key]);
    if (value && !params.has(key)) params.set(key, value);
  });

  if (scope.organizationId && (pathname === "/map" || pathname === "/app/map")) {
    params.set("workspaceId", scope.organizationId);
  }
  if (scope.listingId && !params.has("entityId") && (pathname === "/map" || pathname === "/app/map")) {
    params.set("entityId", scope.listingId);
  }

  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function replacePartnerWorkspaceScope(href: string, scope: PartnerWorkspaceScope) {
  if (!href.startsWith("/")) return href;
  const [pathAndSearch, hash = ""] = href.split("#");
  const [pathname, search = ""] = pathAndSearch.split("?");
  const params = new URLSearchParams(search);
  [...PARTNER_WORKSPACE_SCOPE_KEYS, "workspaceId", "entityId"].forEach((key) => params.delete(key));
  const query = params.toString();
  return withPartnerWorkspaceScope(
    `${pathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`,
    scope,
  );
}

export function withPartnerWorkspaceContext(
  href: string,
  organizationOrScope: string | PartnerWorkspaceScope,
) {
  const scope = typeof organizationOrScope === "string"
    ? { organizationId: organizationOrScope }
    : organizationOrScope;
  return withPartnerWorkspaceScope(href, scope);
}
