type JsonRecord = Record<string, unknown>;

const SESSION_KEY = "dp_session_id";
const PROFILE_KEY = "dp_profile_id";

function getOrCreateBrowserId(key: string, prefix: string) {
  if (typeof window === "undefined") return `${prefix}-server`;

  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;

    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `${prefix}-${crypto.randomUUID()}`
        : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return `${prefix}-${Date.now()}`;
  }
}

export function getWorkflowSessionId() {
  return getOrCreateBrowserId(SESSION_KEY, "session");
}

export function getWorkflowProfileId() {
  return getOrCreateBrowserId(PROFILE_KEY, "profile");
}

export async function postWorkflow(endpoint: string, payload: JsonRecord) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body ? String((body as { error: unknown }).error) : "Workflow request failed";
    throw new Error(message);
  }

  return body;
}

export function fireWorkflow(endpoint: string, payload: JsonRecord) {
  void postWorkflow(endpoint, payload).catch((error) => {
    if (import.meta.env.DEV) console.warn(`[workflow] ${endpoint}`, error);
  });
}
