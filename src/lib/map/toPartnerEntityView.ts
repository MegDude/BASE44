export function toPartnerEntityView(entity: any = {}, signals: any = {}) {
  return {
    title: entity.title || entity.name || "Downtown signal",
    category: entity.category || entity.categoryLabel || entity.kind || "Opportunity",
    opportunitySignal: signals.opportunityLabel || entity.partnerSignal || entity.campaignSignal || "",
    coverageGap: signals.coverageGapLabel || entity.coverageGap || "",
    demandTrend: signals.demandTrend || signals.trendLabel || entity.demandTrend || "",
    recommendation: entity.partnerRecommendation || entity.recommendation || "",
    actions: ["Review Signal", "Launch Campaign", "Compare Nearby"],
  };
}
