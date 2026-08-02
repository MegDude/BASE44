import { supabaseClient } from "@/lib/supabase/client";

type Scope = { organizationId?: string; portfolioId?: string; listingId?: string };

async function token() {
  const session = await supabaseClient?.auth?.getSession().catch(() => null);
  return session?.data?.session?.access_token || "";
}
function url(scope: Scope = {}) {
  const params = new URLSearchParams();
  if (scope.organizationId) params.set("organization", scope.organizationId);
  if (scope.portfolioId) params.set("portfolioId", scope.portfolioId);
  if (scope.listingId) params.set("listingId", scope.listingId);
  return `/api/partner/connections?${params.toString()}`;
}
export async function getWorkspaceConnections(scope: Scope = {}) {
  const accessToken = await token();
  if (!accessToken) return null;
  const response = await fetch(url(scope), { headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Connections could not be loaded.");
  return body?.data || null;
}
export async function requestWorkspaceConnection(scope: Scope, provider: string, note = "") {
  const accessToken = await token();
  if (!accessToken) throw new Error("Sign in to request a connection.");
  const response = await fetch(url(scope), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ action: "request_connection", provider, note }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "The connection request could not be sent.");
  return body?.data || null;
}
