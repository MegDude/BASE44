export const LEGENDS_WORKSPACE_ORGANIZATION_ID = "demo-org-legends-real-estate";
export const PARTNER_WORKSPACE_CONTEXT_KEY = "dp_partner_workspace:selected_organization";

export function readPartnerWorkspaceOrganizationId(search = "") {
  const requested = new URLSearchParams(search).get("organizationId") || new URLSearchParams(search).get("workspaceId");
  if (requested) return requested;
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(PARTNER_WORKSPACE_CONTEXT_KEY) || LEGENDS_WORKSPACE_ORGANIZATION_ID;
  }
  return LEGENDS_WORKSPACE_ORGANIZATION_ID;
}

export function writePartnerWorkspaceOrganizationId(organizationId: string) {
  if (typeof window === "undefined" || !organizationId) return;
  window.localStorage.setItem(PARTNER_WORKSPACE_CONTEXT_KEY, organizationId);
}

export function withPartnerWorkspaceContext(href: string, organizationId: string) {
  if (!organizationId || !href.startsWith("/")) return href;
  const [pathAndSearch, hash = ""] = href.split("#");
  const [pathname, search = ""] = pathAndSearch.split("?");
  const params = new URLSearchParams(search);
  params.set("organizationId", organizationId);
  if (pathname === "/map" || pathname === "/app/map") params.set("workspaceId", organizationId);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
}
