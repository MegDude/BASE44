const DEFAULT_PLATFORM_BASE_URL = "https://downtown-perks-live.base44.app";

const SAFE_SUMMARY_FIELDS = [
  "entities",
  "contacts",
  "pipeline",
  "campaigns",
  "content",
  "media",
  "routes",
  "governance",
  "qualityFlags",
  "relationships",
  "documents",
  "models",
  "portfolios",
  "portfolioEntities",
];

function getPlatformBaseUrl() {
  return (
    process.env.BACKEND_PLATFORM_API_BASE_URL ||
    process.env.BACKEND_AGENT_API_BASE_URL ||
    process.env.PLATFORM_API_BASE_URL ||
    DEFAULT_PLATFORM_BASE_URL
  ).replace(/\/$/, "");
}

function safeCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function normalizeResearchSummary(payload = {}) {
  const source = payload?.summary && typeof payload.summary === "object" ? payload.summary : {};
  const summary = Object.fromEntries(
    SAFE_SUMMARY_FIELDS.map((field) => [field, safeCount(source[field])]),
  );

  return {
    generatedAt: typeof payload.generatedAt === "string" ? payload.generatedAt : null,
    summary,
    reviewRequired: payload.reviewRequired !== false,
    consumerDataIncluded: false,
  };
}

export function isResearchSummaryPayload(payload) {
  return Boolean(
    payload?.summary &&
    typeof payload.summary === "object" &&
    SAFE_SUMMARY_FIELDS.some((field) => Number(payload.summary[field]) > 0),
  );
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(`${getPlatformBaseUrl()}/api/research-intelligence/summary`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !isResearchSummaryPayload(payload)) {
      return res.status(502).json({ error: "Research coverage is not available." });
    }

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json(normalizeResearchSummary(payload));
  } catch {
    return res.status(502).json({ error: "Research coverage is not available." });
  }
}
