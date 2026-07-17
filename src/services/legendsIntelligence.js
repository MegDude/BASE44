import { legendsLuxuryPresenceSeoSnapshot } from "@/data/luxuryPresenceSeoSnapshot";

export const LEGENDS_AWARENESS_ENDPOINT =
  "/api/integrations/luxury-presence/building-awareness";

function asFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asKeywordRows(rows, metric) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      keyword: String(row?.keyword || "").trim(),
      [metric]: asFiniteNumber(row?.[metric]),
    }))
    .filter((row) => row.keyword && row[metric] !== null);
}

export function buildLegendsFallbackAwareness() {
  const snapshot = legendsLuxuryPresenceSeoSnapshot;
  return {
    brandedAveragePosition: snapshot.summary.brandedAveragePosition,
    nonBrandedAveragePosition: snapshot.summary.nonBrandedAveragePosition,
    brandedKeywordCount: snapshot.summary.brandedTop10KeywordCount,
    nonBrandedKeywordCount: snapshot.summary.nonBrandedTop10KeywordCount,
    impressionsByMonth: [],
    cumulativeImpressions: snapshot.summary.cumulativeImpressions,
    topKeywordsByClicks: snapshot.topKeywordsByClicks,
    topKeywordsByImpressions: snapshot.topKeywordsByImpressions,
    capturedAt: snapshot.capturedAt,
    source: snapshot.source,
    sourceReportUrl: snapshot.sourceReportUrl,
    sourceStatus: "fallback",
  };
}

export function normalizeLegendsAwareness(payload) {
  const source = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object") return null;

  const normalized = {
    brandedAveragePosition: asFiniteNumber(source.brandedAveragePosition),
    nonBrandedAveragePosition: asFiniteNumber(source.nonBrandedAveragePosition),
    brandedKeywordCount: asFiniteNumber(source.brandedKeywordCount),
    nonBrandedKeywordCount: asFiniteNumber(source.nonBrandedKeywordCount),
    impressionsByMonth: Array.isArray(source.impressionsByMonth)
      ? source.impressionsByMonth
          .map((row) => ({
            month: String(row?.month || "").trim(),
            impressions: asFiniteNumber(row?.impressions),
          }))
          .filter((row) => row.month && row.impressions !== null)
      : [],
    cumulativeImpressions: asFiniteNumber(source.cumulativeImpressions),
    topKeywordsByClicks: asKeywordRows(source.topKeywordsByClicks, "clicks"),
    topKeywordsByImpressions: asKeywordRows(source.topKeywordsByImpressions, "impressions"),
    capturedAt: source.capturedAt || null,
    source: source.source || "Luxury Presence reporting dashboard",
    sourceReportUrl: source.sourceReportUrl || null,
    sourceStatus: source.sourceStatus || "live",
  };

  const hasAwarenessMetrics = [
    normalized.brandedAveragePosition,
    normalized.nonBrandedAveragePosition,
    normalized.brandedKeywordCount,
    normalized.nonBrandedKeywordCount,
  ].some((value) => value !== null);

  return hasAwarenessMetrics ? normalized : null;
}

export async function loadLegendsAwareness({ signal } = {}) {
  try {
    const response = await fetch(LEGENDS_AWARENESS_ENDPOINT, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) throw new Error(`Awareness API returned ${response.status}`);
    const normalized = normalizeLegendsAwareness(await response.json());
    if (!normalized) throw new Error("Awareness API returned an incomplete payload");
    return { data: normalized, isFallback: normalized.sourceStatus === "fallback" };
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    return { data: buildLegendsFallbackAwareness(), isFallback: true };
  }
}
