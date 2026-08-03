import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "@/lib/partner/partnerMapContentClient";

export type WorkspaceReportScope = {
  organizationId?: string;
  portfolioId?: string;
  listingId?: string;
  startDate: string;
  endDate: string;
  compareTo?: string;
};

async function authorizedHeaders() {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function query(scope: WorkspaceReportScope) {
  const params = new URLSearchParams({
    startDate: scope.startDate,
    endDate: scope.endDate,
    compareTo: scope.compareTo || "previous_period",
  });
  if (scope.organizationId) params.set("organizationId", scope.organizationId);
  if (scope.portfolioId) params.set("portfolioId", scope.portfolioId);
  if (scope.listingId) params.set("listingId", scope.listingId);
  return params.toString();
}

async function request(path: string, signal?: AbortSignal) {
  const response = await fetch(`${getPartnerContentApiBaseUrl()}${path}`, {
    headers: await authorizedHeaders(),
    signal,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error || "Reports are unavailable right now.");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return body;
}

export async function getWorkspaceReport(scope: WorkspaceReportScope, signal?: AbortSignal) {
  return request(`/api/workspace/reports?${query(scope)}`, signal);
}

export async function downloadWorkspaceReport(scope: WorkspaceReportScope) {
  const response = await fetch(`${getPartnerContentApiBaseUrl()}/api/workspace/reports?${query(scope)}&format=csv`, {
    headers: await authorizedHeaders(),
  });
  if (!response.ok) throw new Error("The CSV export is unavailable right now.");
  return response.blob();
}
