import { getOperationsApiBaseUrl, requestOperationsApi } from "@/lib/backendWorkflows";

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

async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getOperationsApiBaseUrl()}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "We could not complete that request.");
  return body as T;
}

export function searchMembershipBuildings(query: string) {
  return publicRequest<{ buildings: MembershipBuilding[] }>(`/api/residents/buildings/search?q=${encodeURIComponent(query)}`);
}

export function checkMembershipEligibility(buildingId: string) {
  return publicRequest<{ building: MembershipBuilding; source: "free_building" | "paid"; price: number; currency: string }>("/api/residents/membership/eligibility", {
    method: "POST", body: JSON.stringify({ buildingId }),
  });
}

export function startResidentMembership(buildingId: string, email: string) {
  return publicRequest<{ source: "free_building" | "paid"; checkoutUrl?: string; nextUrl?: string }>("/api/residents/membership/start", {
    method: "POST", body: JSON.stringify({ buildingId, email }),
  });
}

export function completeResidentMembership(registration: string) {
  return requestOperationsApi<{ ok: boolean; membershipId: string; nextUrl: string }>("/api/residents/membership/complete", {
    method: "POST", body: JSON.stringify({ registration }),
  });
}

export function getResidentMembership() {
  return requestOperationsApi<{ profile: Record<string, unknown>; membership: Record<string, unknown> | null; saved: unknown[]; preferences: Record<string, unknown> | null; mapContext: { path: string; personalized: boolean } }>("/api/residents/membership");
}

export function saveResidentProfile(payload: Record<string, unknown>) {
  return requestOperationsApi<{ ok: boolean; profileCompletion: number }>("/api/residents/profile", {
    method: "POST", body: JSON.stringify(payload),
  });
}

export function openResidentBilling() {
  return requestOperationsApi<{ portalUrl: string }>("/api/residents/membership/portal", { method: "POST" });
}
