const env = globalThis.process?.env || {};
const DEFAULT_BASE_URL = "https://api.luxurypresence.com/cms/v1";

export class LuxuryPresenceApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "LuxuryPresenceApiError";
    this.status = status;
    this.body = body;
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function luxuryPresenceRequest(endpoint, options = {}) {
  const baseUrl = env.LUXURY_PRESENCE_API_BASE_URL || env.LUXURY_PRESENCE_API_BASE || DEFAULT_BASE_URL;
  const apiKey = env.LUXURY_PRESENCE_API_KEY;

  if (!apiKey) {
    throw new LuxuryPresenceApiError("Luxury Presence API key is not configured", { status: 503 });
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      ...(options.headers || {}),
    },
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    throw new LuxuryPresenceApiError(`Luxury Presence API error ${response.status}`, {
      status: response.status,
      body: retryAfter ? { ...body, retryAfter } : body,
    });
  }

  return body;
}

export async function fetchLuxuryPresenceAgents(params = {}) {
  const query = buildQuery({
    offset: params.offset,
    limit: params.limit,
    search: params.search,
    tags: params.tags,
    tagsMode: params.tagsMode,
    externalSource: params.externalSource,
    externalIds: params.externalIds,
  });

  return luxuryPresenceRequest(`/agents${query}`);
}