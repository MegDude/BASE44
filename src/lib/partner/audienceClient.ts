import { supabaseClient } from "@/lib/supabase/client";

type AudienceScope = {
  organizationId?: string;
  portfolioId?: string;
  listingId?: string;
};

async function getAccessToken() {
  const session = supabaseClient?.auth
    ? await supabaseClient.auth.getSession().catch(() => null)
    : null;
  return session?.data?.session?.access_token || "";
}

function audienceUrl({ organizationId, portfolioId, listingId }: AudienceScope = {}) {
  const params = new URLSearchParams();
  if (organizationId) params.set("organization", organizationId);
  if (portfolioId) params.set("portfolioId", portfolioId);
  if (listingId) params.set("listingId", listingId);
  return `/api/partner/audience?${params.toString()}`;
}

export async function getPartnerAudience(scope: AudienceScope = {}) {
  const token = await getAccessToken();
  if (!token) return null;
  const response = await fetch(audienceUrl(scope), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Audience data could not be loaded.");
  return body?.data || null;
}

export async function connectAudienceBuilding(scope: AudienceScope, buildingId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("Sign in to continue.");
  const response = await fetch(audienceUrl(scope), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "connect_building", buildingId }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "The building could not be connected.");
  return body?.data || null;
}
