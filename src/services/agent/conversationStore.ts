const SESSION_KEY = "downtown-perks-agent-session-id";
const CONVERSATION_KEY_PREFIX = "downtown-perks-agent-conversation";

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

function conversationStorageKey(mode = "resident", organizationId = "") {
  return `${CONVERSATION_KEY_PREFIX}:${mode}:${organizationId || "public"}`;
}

export function getAgentConversationId(mode = "resident", organizationId = "") {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(conversationStorageKey(mode, organizationId)) || "";
}

export function setAgentConversationId(conversationId: string, mode = "resident", organizationId = "") {
  if (typeof window === "undefined" || !conversationId) return;
  window.sessionStorage.setItem(conversationStorageKey(mode, organizationId), conversationId);
}

export function resetAgentConversationId(mode = "resident", organizationId = "") {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(conversationStorageKey(mode, organizationId));
}
