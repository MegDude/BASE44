import { supabaseClient } from "@/lib/supabase/client";

export type MemberHubItem = {
  id?: string;
  entity_id?: string;
  entity_type?: string;
  status?: string;
  source_context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  events?: { id?: string; title?: string; start_time?: string; end_time?: string; address?: string };
  perks?: { id?: string; title?: string; description?: string; start_date?: string; end_date?: string };
};

export type MemberHub = {
  saved: MemberHubItem[];
  activePerks: MemberHubItem[];
  upcomingBookings: MemberHubItem[];
};

export async function getMemberHub(signal?: AbortSignal): Promise<MemberHub> {
  const session = await supabaseClient?.auth.getSession();
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error("Sign in to view member activity.");
  const response = await fetch("/api/resident/member-hub", {
    signal,
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Member activity is unavailable.");
  return {
    saved: Array.isArray(body.saved) ? body.saved : [],
    activePerks: Array.isArray(body.activePerks) ? body.activePerks : [],
    upcomingBookings: Array.isArray(body.upcomingBookings) ? body.upcomingBookings : [],
  };
}
