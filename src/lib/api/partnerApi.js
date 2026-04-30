import { partnerPlatformApi } from "@/lib/api/partnerPlatformApi";

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function buildFallbackInsights(payload = {}, recommendationPayload = {}) {
  const metrics = payload?.metrics || payload?.summary || payload?.data || {};
  const recommendations = recommendationPayload?.recommendations || recommendationPayload?.data?.recommendations || [];

  return {
    seen: toNumber(metrics.seen || metrics.impressions || metrics.views),
    saved: toNumber(metrics.saved || metrics.saves),
    visited: toNumber(metrics.visited || metrics.visits),
    redeemed: toNumber(metrics.redeemed || metrics.redemptions),
    topIntent: metrics.topIntent || metrics.top_intent || "dining",
    lowTraffic: Boolean(metrics.lowTraffic || metrics.low_traffic),
    recommendations: Array.isArray(recommendations) ? recommendations : [],
  };
}

export async function fetchPartnerInsights(payload = {}) {
  const [analytics, recommendations] = await Promise.all([
    partnerPlatformApi.getDashboardAnalytics(payload),
    partnerPlatformApi.getPartnerRecommendations(payload),
  ]);

  if (analytics?.error && recommendations?.error) {
    return {
      seen: 0,
      saved: 0,
      visited: 0,
      redeemed: 0,
      topIntent: "dining",
      lowTraffic: false,
      recommendations: [],
    };
  }

  return buildFallbackInsights(analytics?.data, recommendations?.data);
}

export async function pushPartnerOffer(payload = {}) {
  return partnerPlatformApi.createOffer(payload);
}
