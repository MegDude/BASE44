import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";
import { supabaseClient } from "@/lib/supabase/client";

export type MembershipBuilding = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  district?: string | null;
  partner_status: "active" | "inactive" | "pending" | "archived";
  resident_membership_included: boolean;
  resident_price_override?: number | null;
};

async function membershipRequest<T>(path: string, init?: RequestInit, requiresAccount = false): Promise<T> {
  const baseUrl = getPartnerContentApiBaseUrl();
  if (!baseUrl) throw new Error("Resident membership is not connected on this preview.");
  const session = requiresAccount ? await supabaseClient?.auth.getSession().catch(() => null) : null;
  const token = session?.data?.session?.access_token;
  if (requiresAccount && !token) throw new Error("Sign in to continue.");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "We could not complete that request.");
  return body as T;
}

export function searchMembershipBuildings(query: string) {
  return membershipRequest<{ buildings: MembershipBuilding[] }>(`/api/residents/buildings/search?q=${encodeURIComponent(query)}`);
}

export function checkMembershipEligibility(buildingId: string) {
  return membershipRequest<{ building: MembershipBuilding; source: "free_building" | "paid"; price: number; currency: string }>("/api/residents/membership/eligibility", {
    method: "POST", body: JSON.stringify({ buildingId }),
  });
}

export function startResidentMembership(buildingId: string, email: string) {
  return membershipRequest<{ source: "free_building" | "paid"; checkoutUrl?: string; nextUrl?: string }>("/api/residents/membership/start", {
    method: "POST", body: JSON.stringify({ buildingId, email }),
  });
}

export function completeResidentMembership(registration: string) {
  return membershipRequest<{ ok: boolean; membershipId: string; nextUrl: string }>("/api/residents/membership/complete", {
    method: "POST", body: JSON.stringify({ registration }),
  }, true);
}

export function getResidentMembership() {
  return membershipRequest<{ profile: Record<string, unknown>; membership: Record<string, unknown> | null; saved: unknown[]; preferences: Record<string, unknown> | null; mapContext: { path: string; personalized: boolean } }>("/api/residents/membership", undefined, true);
}

export function saveResidentProfile(payload: Record<string, unknown>) {
  return membershipRequest<{ ok: boolean; profileCompletion: number }>("/api/residents/profile", {
    method: "POST", body: JSON.stringify(payload),
  }, true);
}

export function openResidentBilling() {
  return membershipRequest<{ portalUrl: string }>("/api/residents/membership/portal", { method: "POST" }, true);
}
