export const STRATEGIC_INTELLIGENCE_REQUIRED_OUTPUTS = [
  "whatChanged",
  "whyItMatters",
  "evidenceUsed",
  "scopeAndReportingPeriod",
  "confidenceLevel",
  "recommendedAction",
  "expectedOutcome",
  "measurementPlan",
  "riskOrLimitation",
];

export const PRIVACY_SAFE_BENCHMARK_POLICY = {
  minimumEligibleOrganizations: 5,
  minimumReportingWindowDays: 30,
  insufficientDataMessage: "Insufficient anonymized market data for this comparison. Expand the reporting period or await more qualifying activity.",
};

export function canShowPrivacySafeBenchmark({ eligibleOrganizationCount = 0, reportingWindowDays = 0 } = {}) {
  return (
    Number(eligibleOrganizationCount) >= PRIVACY_SAFE_BENCHMARK_POLICY.minimumEligibleOrganizations
    && Number(reportingWindowDays) >= PRIVACY_SAFE_BENCHMARK_POLICY.minimumReportingWindowDays
  );
}

export function privacySafeBenchmarkMessage(input = {}) {
  return canShowPrivacySafeBenchmark(input) ? "Benchmark available" : PRIVACY_SAFE_BENCHMARK_POLICY.insufficientDataMessage;
}

export function buildStrategicIntelligenceDisclosure({ organizationId = "", scope = {}, sources = [], reportingPeriod = "30 days", freshness = "source freshness pending" } = {}) {
  return {
    organizationId,
    scope: {
      organizationId: scope.organizationId || organizationId || "",
      portfolioId: scope.portfolioId || "",
      listingId: scope.listingId || "",
      locationId: scope.locationId || "",
      campaignId: scope.campaignId || "",
      offerId: scope.offerId || "",
      eventId: scope.eventId || "",
      accessScope: scope.accessScope || "organization",
    },
    reportingPeriod,
    freshness,
    sources: sources.map((source) => ({
      id: String(source.id || source.name || "source"),
      label: String(source.label || source.name || source.id || "Source"),
      metricDefinition: String(source.metricDefinition || "Verified partner-owned or privacy-safe aggregate signal"),
    })),
  };
}
