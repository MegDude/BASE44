import { supabaseClient } from "@/lib/supabase/client";
import type { PartnerWorkspaceScope } from "@/lib/partnerWorkspaceContext";

async function workspaceHeaders() {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error("Sign in with an authorized workspace account to continue.");
  return { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function scopedQuery(scope: PartnerWorkspaceScope = {}) {
  const params = new URLSearchParams();
  if (scope.organizationId) params.set("organizationId", scope.organizationId);
  if (scope.portfolioId) params.set("portfolioId", scope.portfolioId);
  if (scope.listingId) params.set("listingId", scope.listingId);
  if (scope.range) params.set("range", scope.range);
  return params.toString();
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Workspace request failed with ${response.status}`);
  return body?.data || body;
}

export async function getWorkspaceAudience(scope: PartnerWorkspaceScope = {}, signal?: AbortSignal) {
  const query = scopedQuery(scope);
  const response = await fetch(`/api/partner/audience${query ? `?${query}` : ""}`, {
    cache: "no-store",
    signal,
    headers: await workspaceHeaders(),
  });
  return readJson(response);
}

export async function getWorkspaceConnections(scope: PartnerWorkspaceScope = {}, signal?: AbortSignal) {
  const query = scopedQuery(scope);
  const response = await fetch(`/api/partner/connections${query ? `?${query}` : ""}`, {
    cache: "no-store",
    signal,
    headers: await workspaceHeaders(),
  });
  return readJson(response);
}

export async function requestWorkspaceConnection(scope: PartnerWorkspaceScope = {}, provider: string, note?: string) {
  const query = scopedQuery(scope);
  const response = await fetch(`/api/partner/connections${query ? `?${query}` : ""}`, {
    method: "POST",
    cache: "no-store",
    headers: await workspaceHeaders(),
    body: JSON.stringify({ provider, note }),
  });
  return readJson(response);
}
