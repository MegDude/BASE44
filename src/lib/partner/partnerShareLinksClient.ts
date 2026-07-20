import { supabaseClient } from "@/lib/supabase/client";
import { getPartnerContentApiBaseUrl } from "./partnerMapContentClient";

export type PartnerShareLink = {
  id: string;
  name: string;
  placement_type: string;
  destination_type: string;
  destination_path: string;
  status: "draft" | "live" | "paused" | "archived";
  shareUrl: string;
  qrUrl: string;
  qrDownloadUrl: string;
  analytics?: { opens?: number; qrOpens?: number };
};

async function authorizedHeaders() {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  return { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request(path: string, init?: RequestInit) {
  const baseUrl = getPartnerContentApiBaseUrl();
  if (!baseUrl) throw new Error("Share links are not connected to the publishing service yet.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...(await authorizedHeaders()), ...(init?.headers || {}) } });
  } catch {
    throw new Error("The publishing service is unavailable. Your link has not been created.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "We could not complete that share-link action.");
  return body;
}

export async function listPartnerShareLinks(organizationId: string): Promise<PartnerShareLink[]> {
  const body = await request(`/api/partner/share-links?organizationId=${encodeURIComponent(organizationId)}`);
  return Array.isArray(body?.shareLinks) ? body.shareLinks : [];
}

export async function createPartnerShareLink(input: {
  organizationId: string;
  name: string;
  placementType: string;
  destinationType: string;
  destinationPath: string;
  linkedContentId?: string;
  publishNow: boolean;
}) {
  const body = await request("/api/partner/share-links", { method: "POST", body: JSON.stringify(input) });
  return body as { shareLink: PartnerShareLink; message: string };
}

export async function updatePartnerShareLink(id: string, organizationId: string, status: PartnerShareLink["status"]) {
  const body = await request(`/api/partner/share-links/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ organizationId, status }) });
  return body as { shareLink: PartnerShareLink; message: string };
}
