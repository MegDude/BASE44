import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";

export async function trackEvent(eventType, payload = {}) {
  await trackAnalyticsEvent(eventType, {
    source: payload.source || (typeof window !== "undefined" ? window.location.pathname : null),
    ...payload,
  });
}
