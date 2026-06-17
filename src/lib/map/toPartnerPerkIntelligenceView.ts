export function toPartnerPerkIntelligenceView(perk: any = {}, signals: any = {}) {
  return {
    title: perk.title || perk.perkTitle || perk.offerTitle || "Perk performance",
    views: perk.views || perk.impressions || 0,
    saves: perk.saves || 0,
    redemptions: perk.redemptions || 0,
    nearbyDemand: signals.nearbyDemand || signals.demandTrend || "",
    bestTiming: signals.bestTiming || perk.bestTiming || "",
    recommendedAction: signals.recommendedAction || perk.recommendedAction || "Review campaign timing",
    expectedOutcome: signals.expectedOutcome || perk.expectedOutcome || "",
    actions: ["Review Signal", "Launch Campaign", "Compare Nearby"],
  };
}
