import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";

export type GovernanceRecord = {
  id: string;
  organization_id: string;
  title?: string;
  summary?: string;
  question?: string;
  answer?: string | null;
  category?: string;
  work_status?: string;
  publication_status?: string;
  moderation_status?: string;
  status?: string;
  starts_at?: string;
  closes_at?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  public_update?: string | null;
  governance_question_supports?: Array<{ count: number }>;
};

export type ResidentGovernanceResponse = {
  initiatives: GovernanceRecord[];
  meetings: GovernanceRecord[];
  consultations: GovernanceRecord[];
  questions: GovernanceRecord[];
  yourQuestions: GovernanceRecord[];
  yourReports: GovernanceRecord[];
  followedInitiativeIds: string[];
  neutrality: string;
};

export type PartnerGovernanceResponse = {
  organization: { id: string; name: string };
  initiatives: GovernanceRecord[];
  meetings: GovernanceRecord[];
  consultations: GovernanceRecord[];
  questions: GovernanceRecord[];
  reports: GovernanceRecord[];
};

async function authorizedHeaders(idempotencyKey?: string) {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
  };
}

async function governanceRequest<T>(path: string, init?: RequestInit, idempotencyKey?: string): Promise<T> {
  const baseUrl = getPartnerContentApiBaseUrl();
  if (!baseUrl) throw new Error("Community updates are not connected on this preview.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...(await authorizedHeaders(idempotencyKey)), ...(init?.headers || {}) } });
  } catch {
    throw new Error("Community updates are unavailable right now. Try again shortly.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "We could not complete that action. Try again.");
  return body as T;
}

export function getResidentGovernance() {
  return governanceRequest<ResidentGovernanceResponse>("/api/resident/governance");
}

export function sendResidentGovernanceAction(input: Record<string, unknown>) {
  const idempotencyKey = String(input.idempotencyKey || crypto.randomUUID());
  return governanceRequest<{ message: string }>("/api/resident/governance", { method: "POST", body: JSON.stringify({ ...input, idempotencyKey }) }, idempotencyKey);
}

export function getPartnerGovernance(organizationId: string, portfolioId?: string | null, listingId?: string | null) {
  const params = new URLSearchParams({ organizationId });
  if (portfolioId) params.set("portfolioId", portfolioId);
  if (listingId) params.set("listingId", listingId);
  return governanceRequest<PartnerGovernanceResponse>(`/api/partner/governance?${params.toString()}`);
}

export function sendPartnerGovernanceAction(input: Record<string, unknown>) {
  return governanceRequest<{ message: string; record: GovernanceRecord }>("/api/partner/governance", { method: "POST", body: JSON.stringify(input) });
}
