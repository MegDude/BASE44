import { supabaseClient } from "@/lib/supabase/client";

const ORGANIZATION_SLUG_BY_LEGACY_ID = {
  "demo-org-legends-real-estate": "legends-real-estate",
  "demo-org-the-shore": "the-shore",
  "demo-org-downtown-perks": "downtown-perks",
};

type WorkspaceSummaryScope = {
  organizationId?: string;
  portfolioId?: string;
  listingId?: string;
};

export async function getPartnerWorkspaceSummary({ organizationId, portfolioId, listingId }: WorkspaceSummaryScope = {}) {
  const session = supabaseClient?.auth
    ? await supabaseClient.auth.getSession().catch(() => null)
    : null;
  const token = session?.data?.session?.access_token;
  if (!token) return null;

  const organization = ORGANIZATION_SLUG_BY_LEGACY_ID[organizationId] || organizationId;
  const params = new URLSearchParams();
  if (organization) params.set("organization", organization);
  if (portfolioId) params.set("portfolioId", portfolioId);
  if (listingId) params.set("listingId", listingId);

  const response = await fetch(`/api/partner/workspace-summary?${params.toString()}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Workspace summary could not be loaded.");
  return body?.data || null;
}
