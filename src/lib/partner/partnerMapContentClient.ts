import { supabaseClient } from "@/lib/supabase/client";

const DEFAULT_LOCAL_PLATFORM_URL = "http://localhost:3014";
const DEFAULT_PRODUCTION_PLATFORM_URL = "https://downtown-perks-backend.vercel.app";

export function getPartnerContentApiBaseUrl() {
  const configured = import.meta.env.VITE_OPERATIONS_API_BASE_URL || import.meta.env.VITE_BACKEND_PLATFORM_URL;
  if (configured) return String(configured).replace(/\/$/, "");
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) return DEFAULT_LOCAL_PLATFORM_URL;
  return DEFAULT_PRODUCTION_PLATFORM_URL;
}

async function authorizationHeaders() {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPartnerMapContent(slug?: string) {
  const baseUrl = getPartnerContentApiBaseUrl();
  if (!baseUrl) return [];
  const query = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const response = await fetch(`${baseUrl}/api/map-content${query}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Partner content could not be loaded.");
  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
}

export async function updatePartnerMapContent(slug: string, content: Record<string, unknown>) {
  const baseUrl = getPartnerContentApiBaseUrl();
  if (!baseUrl) throw new Error("Partner content service is not configured.");
  const response = await fetch(`${baseUrl}/api/map-content`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authorizationHeaders()) },
    body: JSON.stringify({ slug, ...content }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Partner content could not be updated.");
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("downtown-perks:partner-content-updated", { detail: body?.data }));
  return body?.data;
}

