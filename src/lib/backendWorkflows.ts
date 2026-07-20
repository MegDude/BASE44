type JsonRecord = Record<string, unknown>;

const SESSION_KEY = "dp_session_id";
const PROFILE_KEY = "dp_profile_id";
const DEFAULT_LOCAL_OPERATIONS_URL = "http://localhost:3014";

function getOperationsApiBaseUrl() {
  const configured = import.meta.env.VITE_OPERATIONS_API_BASE_URL || import.meta.env.VITE_BACKEND_PLATFORM_URL;
  if (configured) return String(configured).replace(/\/$/, "");

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return DEFAULT_LOCAL_OPERATIONS_URL;
  }

  return "";
}

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
  const authHeaders: Record<string, string> = {};
  try {
    const { supabaseClient } = await import("@/lib/supabase/client");
    const { data } = supabaseClient ? await supabaseClient.auth.getSession() : { data: null };
    if (data?.session?.access_token) authHeaders.Authorization = `Bearer ${data.session.access_token}`;
  } catch {
    // Public map actions remain available; protected endpoints return a clear sign-in response.
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
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

async function postOperationsAudit(endpoint: string, payload: JsonRecord, status: "attempted" | "completed" | "failed", error?: unknown) {
  const operationsBaseUrl = getOperationsApiBaseUrl();
  if (!operationsBaseUrl) return;

  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : getWorkflowSessionId();
  const profileId = typeof payload.profileId === "string" ? payload.profileId : getWorkflowProfileId();
  const action = typeof payload.type === "string" ? payload.type : endpoint.replace(/^\/api\//, "").replace(/\//g, ".");

  await fetch(`${operationsBaseUrl}/api/entities/TenantAuditLog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenant_id: typeof payload.tenantId === "string" ? payload.tenantId : "tenant_platform",
      workspace_id: typeof payload.workspaceId === "string" ? payload.workspaceId : "workspace_platform",
      actor_id: profileId,
      source: "5173-product",
      action,
      status,
      target_endpoint: endpoint,
      session_id: sessionId,
      metadata: {
        ...payload,
        mirrored_from: "localhost:5173",
        error: error instanceof Error ? error.message : error ? String(error) : undefined,
      },
      created_by: "5173-product",
      updated_by: "5173-product",
    }),
  });
}

export function fireWorkflow(endpoint: string, payload: JsonRecord) {
  void postOperationsAudit(endpoint, payload, "attempted").catch((error) => {
    if (import.meta.env.DEV) console.warn(`[operations-audit] ${endpoint}`, error);
  });

  void postWorkflow(endpoint, payload).then(() => {
    void postOperationsAudit(endpoint, payload, "completed").catch((error) => {
      if (import.meta.env.DEV) console.warn(`[operations-audit] ${endpoint}`, error);
    });
  }).catch((error) => {
    void postOperationsAudit(endpoint, payload, "failed", error).catch((auditError) => {
      if (import.meta.env.DEV) console.warn(`[operations-audit] ${endpoint}`, auditError);
    });
    if (import.meta.env.DEV) console.warn(`[workflow] ${endpoint}`, error);
  });
}
