import { supabaseClient } from "@/lib/supabase/client";

type PublishedKind = "perks" | "events";

async function publishingHeaders() {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

async function publishingRequest(method: string, kind: PublishedKind, payload?: Record<string, unknown>, id?: string) {
  const authorization = await publishingHeaders();
  if (!authorization) return null;
  const params = new URLSearchParams({ kind });
  if (id) params.set("id", id);
  const response = await fetch(`/api/partner/published-content?${params.toString()}`, {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authorization },
    body: payload ? JSON.stringify({ kind, payload }) : undefined,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Published content could not be saved.");
  return body;
}

export async function listPublishedWorkspaceItems(kind: PublishedKind) {
  const body = await publishingRequest("GET", kind);
  return body ? (Array.isArray(body.data) ? body.data : []) : null;
}

export async function createPublishedWorkspaceItem(kind: PublishedKind, payload: Record<string, unknown>) {
  const body = await publishingRequest("POST", kind, payload);
  return body?.data || null;
}

export async function updatePublishedWorkspaceItem(kind: PublishedKind, id: string, payload: Record<string, unknown>) {
  const body = await publishingRequest("PATCH", kind, payload, id);
  return body?.data || null;
}

export async function deletePublishedWorkspaceItem(kind: PublishedKind, id: string) {
  const body = await publishingRequest("DELETE", kind, undefined, id);
  return body?.data || null;
}
