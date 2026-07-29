import { supabaseClient } from "@/lib/supabase/client";

export type AdminOrganization = { id: string; name: string; external_id?: string; status?: string };
export type AdminPortfolio = { id: string; organization_id: string; name: string; status?: string };
export type AdminListing = { id: string; organization_id: string; portfolio_id?: string; name: string; address?: string; status?: string; entity_id?: string };
export type AdminScope = { organizationId?: string; portfolioId?: string; listingId?: string };
export type AdminScopeResponse = {
  role: string; organizations: AdminOrganization[]; portfolios: AdminPortfolio[]; listings: AdminListing[]; activeScope: AdminScope;
};

export async function getAuthorizedAdminScope(scope: AdminScope, signal?: AbortSignal): Promise<AdminScopeResponse> {
  const session = await supabaseClient?.auth.getSession();
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error("Sign in again to load administrator scope.");
  const query = new URLSearchParams();
  Object.entries(scope).forEach(([key, value]) => { if (value) query.set(key, value); });
  const response = await fetch(`/api/admin/scope?${query}`, {
    signal, cache: "no-store", headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Administrator scope could not be loaded.");
  return body;
}
