export function trackEvent(eventName, payload = {}) {
  try {
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      console.info("[analytics]", eventName, payload);
    }

    const body = JSON.stringify({
      eventName,
      page: typeof window !== "undefined" ? window.location.pathname : null,
      ...payload,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return Promise.resolve();
    }

    return fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}
