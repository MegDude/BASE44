export async function trackEvent(eventType, payload = {}) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType,
        page: window.location.pathname,
        source: payload.source || window.location.pathname,
        ...payload
      })
    });
  } catch {
    // Do not block user interactions because analytics failed.
  }
}
