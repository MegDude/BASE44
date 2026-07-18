export type ResearchCoverageSummary = {
  generatedAt: string | null;
  reviewRequired: boolean;
  consumerDataIncluded: false;
  summary: {
    entities: number;
    contacts: number;
    pipeline: number;
    campaigns: number;
    content: number;
    media: number;
    routes: number;
    governance: number;
    qualityFlags: number;
    relationships: number;
    documents: number;
    models: number;
    portfolios: number;
    portfolioEntities: number;
  };
};

export async function getResearchCoverageSummary(signal?: AbortSignal): Promise<ResearchCoverageSummary> {
  const response = await fetch("/api/research-intelligence/summary", {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("Research coverage is not available.");
  }

  return response.json();
}
