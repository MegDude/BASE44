import { supabaseClient } from "@/lib/supabase/client";

export async function getPartnerWorkspaceAnalytics(scope: { organizationId?: string; portfolioId?: string; listingId?: string } = {}) {
  const session = await supabaseClient?.auth?.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  if (!token) return null;
  const params = new URLSearchParams();
  if (scope.organizationId) params.set("organization", scope.organizationId);
  if (scope.portfolioId) params.set("portfolioId", scope.portfolioId);
  if (scope.listingId) params.set("listingId", scope.listingId);
  const response = await fetch(`/api/partner/analytics?${params.toString()}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Analytics could not be loaded.");
  return body?.data || null;
}
