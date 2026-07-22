import { supabaseClient } from "@/lib/supabase/client";

export type FoundingPartnerOperations = {
  operatingGoals: Array<{ value: string; label: string }>;
  priorityTargets: Array<Record<string, any>>;
  residentialRoutes: Array<Record<string, string>>;
  additionalRoutes: Array<Record<string, string>>;
  technicalNotes: Array<Record<string, string>>;
  launchSequence: Array<Record<string, string>>;
  successMeasures: string[][];
  workingRecords: string[][];
  reconciledAt: string;
};

export async function fetchFoundingPartnerOperations(): Promise<FoundingPartnerOperations> {
  const session = await supabaseClient?.auth.getSession().catch(() => null);
  const token = session?.data?.session?.access_token;
  if (!token) throw new Error("AUTH_REQUIRED");

  const response = await fetch("/api/founding-partner-operations", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data) {
    const error = new Error(body?.error || "Founding Partner operations could not be loaded.");
    (error as any).code = body?.code || `HTTP_${response.status}`;
    throw error;
  }
  return body.data as FoundingPartnerOperations;
}
