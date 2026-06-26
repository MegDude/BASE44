const SESSION_KEY = "downtown-perks-agent-session-id";

export function getAgentSessionId() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(SESSION_KEY) || "";
}

export function setAgentSessionId(sessionId: string) {
  if (typeof window === "undefined" || !sessionId) return;
  window.sessionStorage.setItem(SESSION_KEY, sessionId);
}

export function resetAgentSessionId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
