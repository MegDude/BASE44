export interface BehaviorEvent {
  type: "click" | "go_now";
  payload: { id: string; category?: string; [key: string]: unknown };
  ts: number;
}

export interface BehaviorProfile {
  category: Record<string, number>;
  venue: Record<string, number>;
}

const MAX_EVENTS = 200;
const STORAGE_KEY = "dp_events";

export function trackEvent(
  type: BehaviorEvent["type"],
  payload: BehaviorEvent["payload"],
): void {
  if (typeof window === "undefined") return;
  try {
    const events: BehaviorEvent[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    events.push({ type, payload, ts: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events.slice(-MAX_EVENTS)),
    );
  } catch {
    // localStorage unavailable (private browsing, SSR guard missed)
  }
}

export function buildProfile(): BehaviorProfile {
  if (typeof window === "undefined") return { category: {}, venue: {} };
  try {
    const events: BehaviorEvent[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    const profile: BehaviorProfile = { category: {}, venue: {} };
    for (const e of events) {
      if (e.type === "click" || e.type === "go_now") {
        const cat = e.payload.category?.toLowerCase();
        if (cat) profile.category[cat] = (profile.category[cat] ?? 0) + 1;
        profile.venue[e.payload.id] = (profile.venue[e.payload.id] ?? 0) + 1;
      }
    }
    return profile;
  } catch {
    return { category: {}, venue: {} };
  }
}
