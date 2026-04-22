export async function trackPartnerEvent(payload) {
  try {
    await fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Analytics should never block UX.
  }
}

export function ensurePartnerSessionId() {
  if (typeof window === "undefined") return null;
  const key = "dp_partner_session_id";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  window.sessionStorage.setItem(key, next);
  return next;
}
