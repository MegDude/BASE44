import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";

export type PartnerRedemptionOverview = {
  range: { from: string; to: string };
  metrics: {
    completedRedemptions: number;
    uniqueResidents: number;
    repeatResidentRate: number;
    conversionRate: number;
    discountValue: number;
    finalTransactionValue: number;
  };
  trend: Array<{ date: string; completedRedemptions: number; uniqueResidents: number }>;
  topPerks: Array<{ perkId: string; title: string; redemptions: number; conversionRate: number }>;
  audience: { peakDay?: string; peakTime?: string; distinctResidentMinimum: number };
  liveActivity: Array<{ id: string; status: string; perkId: string; occurredAt: string }>;
};

export async function getPartnerRedemptionOverview(organizationId: string, range = "30d", signal?: AbortSignal): Promise<PartnerRedemptionOverview> {
  if (!supabaseClient) throw new Error("Partner analytics are not connected.");
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session?.access_token) throw new Error("Sign in with a partner account to see verified results.");
  const query = new URLSearchParams({ organizationId, range });
  const response = await fetch(`${getPartnerContentApiBaseUrl()}/api/partner/analytics/overview?${query.toString()}`, {
    headers: { Authorization: `Bearer ${data.session.access_token}` },
    signal,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Verified results are not available yet.");
  return body;
}

