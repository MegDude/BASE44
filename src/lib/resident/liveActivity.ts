export type ResidentLiveActivityItem = {
  id: string;
  kind: "perk" | "event";
  place: string;
  action: string;
  status: string;
  href: string;
  startsAt?: string | null;
  updatedAt?: string | null;
};

export type ResidentLiveActivityResponse = {
  status: "ready" | "empty" | "unavailable";
  items: ResidentLiveActivityItem[];
  updatedAt: string;
};

export async function getResidentLiveActivity(signal?: AbortSignal): Promise<ResidentLiveActivityResponse> {
  const response = await fetch("/api/resident/live-activity", {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error("Live activity could not be loaded.");
  const body = await response.json();
  return {
    status: ["ready", "empty", "unavailable"].includes(body?.status) ? body.status : "unavailable",
    items: Array.isArray(body?.items) ? body.items : [],
    updatedAt: typeof body?.updatedAt === "string" ? body.updatedAt : new Date().toISOString(),
  };
}
