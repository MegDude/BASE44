export const SEO_KEYWORD_CLUSTERS = {
  brand_legends: {
    label: "Legends brand",
    owner: "Marketing",
    recommendedPage: "/",
    action: "Consolidate brand variants and strengthen homepage, about, schema, and canonical signals.",
    match: [/^legends? real estate/i, /^legends? realty/i],
  },
  agent_nina_seely: {
    label: "Nina Seely",
    owner: "Agent marketing",
    recommendedPage: "/agents/nina-seely",
    action: "Strengthen Nina Seely profile, Austin expertise, author links, schema, and related listings.",
    match: [/nina seely/i],
  },
  agent_frank_seely: {
    label: "Frank Seely",
    owner: "Agent marketing",
    recommendedPage: "/agents/frank-seely",
    action: "Optimize Frank Seely profile and handle Frank Seeley as an alternate spelling without duplicate pages.",
    match: [/frank see?ley/i],
  },
  neighborhood_clarksville: {
    label: "Adjacent neighborhood signal",
    owner: "Content review",
    recommendedPage: "/neighborhoods/clarksville",
    action: "Keep Clarksville as a secondary SEO signal. Do not let it drive the Downtown Austin map report unless active inventory or a partner brief requires it.",
    match: [/clarksville/i, /walk score/i],
  },
  neighborhood_tarrytown: {
    label: "Tarrytown homes",
    owner: "Listings",
    recommendedPage: "/homes-for-sale/tarrytown-austin",
    action: "Prioritize the transactional Tarrytown listings page with live inventory, market context, and FAQ schema.",
    match: [/tarrytown/i],
  },
  family_lifestyle_austin: {
    label: "Austin family lifestyle",
    owner: "Editorial",
    recommendedPage: "/guides/family-activities-austin",
    action: "Build useful family activities and family-friendly Austin content tied to neighborhoods and seasonal updates.",
    match: [/family/i],
  },
  luxury_home_improvement: {
    label: "Luxury home improvement",
    owner: "Editorial",
    recommendedPage: "/guides/luxury-home-improvements",
    action: "Create Austin-specific home improvement guidance without unsupported ROI claims.",
    match: [/luxury home (improvements|upgrades)/i],
  },
  property_address: {
    label: "Downtown address demand",
    owner: "Listings",
    recommendedPage: "/downtown-austin-listings",
    action: "Use Downtown Austin address searches to strengthen listing pages, map pins, showing paths, schema, media, and agent attribution.",
    match: [/\b\d{3,5}\b/, /\bst\b/i, /\bbauerle\b/i],
  },
  other_non_branded: {
    label: "Other non-branded",
    owner: "Marketing",
    recommendedPage: "/guides",
    action: "Review intent before creating or expanding a page.",
    match: [],
  },
};

export function normalizeKeyword(keyword = "") {
  return String(keyword || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function classifyKeyword(keyword = "") {
  const normalized = normalizeKeyword(keyword);
  const entry = Object.entries(SEO_KEYWORD_CLUSTERS).find(([, cluster]) =>
    cluster.match.some((pattern) => pattern.test(normalized)),
  );
  return entry?.[0] || "other_non_branded";
}

export function keywordTypeForCluster(clusterId) {
  return clusterId === "brand_legends" ? "branded" : "non_branded";
}

function getBusinessRelevance(clusterId) {
  if (clusterId === "neighborhood_tarrytown") return 5;
  if (["agent_nina_seely", "agent_frank_seely", "property_address", "brand_legends"].includes(clusterId)) return 4;
  if (clusterId === "luxury_home_improvement") return 3;
  if (clusterId === "family_lifestyle_austin") return 2;
  if (clusterId === "neighborhood_clarksville") return 1;
  return 1;
}

function getContentReadiness(clusterId) {
  if (["brand_legends", "agent_nina_seely", "agent_frank_seely"].includes(clusterId)) return 4;
  if (["neighborhood_tarrytown", "property_address"].includes(clusterId)) return 3;
  if (clusterId === "neighborhood_clarksville") return 1;
  return 2;
}

export function scoreSeoOpportunity(metric) {
  const impressions = Number(metric.impressions || 0);
  const clicks = Number(metric.clicks || 0);
  const ctr = impressions > 0 ? clicks / impressions : null;
  const impressionPotential = impressions >= 500 ? 5 : impressions >= 400 ? 4 : impressions >= 250 ? 3 : clicks >= 20 ? 2 : 1;
  const rankingProximity = metric.averagePosition && metric.averagePosition <= 10 ? 4 : 3;
  const ctrGap = ctr === null ? 2 : ctr < 0.02 ? 5 : ctr < 0.05 ? 4 : ctr < 0.1 ? 3 : 1;
  const businessRelevance = getBusinessRelevance(metric.intentCluster);
  const contentReadiness = getContentReadiness(metric.intentCluster);
  const score = Math.round((impressionPotential * rankingProximity * ctrGap * businessRelevance * contentReadiness) / 10);
  const priority = score >= 36 ? "High" : score >= 20 ? "Medium" : "Low";
  return { score, priority };
}

export function normalizeLuxuryPresenceSeoSnapshot(snapshot) {
  const byKeyword = new Map();

  for (const row of snapshot.topKeywordsByClicks || []) {
    const normalized = normalizeKeyword(row.keyword);
    byKeyword.set(normalized, {
      keyword: row.keyword,
      normalizedKeyword: normalized,
      clicks: Number(row.clicks || 0),
      impressions: null,
    });
  }

  for (const row of snapshot.topKeywordsByImpressions || []) {
    const normalized = normalizeKeyword(row.keyword);
    const existing = byKeyword.get(normalized) || {
      keyword: row.keyword,
      normalizedKeyword: normalized,
      clicks: null,
    };
    byKeyword.set(normalized, {
      ...existing,
      impressions: Number(row.impressions || 0),
    });
  }

  const keywordMetrics = Array.from(byKeyword.values()).map((metric) => {
    const intentCluster = classifyKeyword(metric.keyword);
    const cluster = SEO_KEYWORD_CLUSTERS[intentCluster] || SEO_KEYWORD_CLUSTERS.other_non_branded;
    const clicks = metric.clicks === null ? null : Number(metric.clicks);
    const impressions = metric.impressions === null ? null : Number(metric.impressions);
    const ctr = clicks !== null && impressions ? clicks / impressions : null;
    const scored = scoreSeoOpportunity({ ...metric, clicks, impressions, intentCluster });
    return {
      ...metric,
      clicks,
      impressions,
      ctr,
      averagePosition: null,
      trend: "Baseline",
      keywordType: keywordTypeForCluster(intentCluster),
      intentCluster,
      clusterLabel: cluster.label,
      landingPage: cluster.recommendedPage,
      recommendedAction: cluster.action,
      owner: cluster.owner,
      status: "Mapped",
      opportunityScore: scored.score,
      opportunityPriority: scored.priority,
    };
  });

  const organicClicks = keywordMetrics.reduce((sum, metric) => sum + Number(metric.clicks || 0), 0);
  const organicImpressions = keywordMetrics.reduce((sum, metric) => sum + Number(metric.impressions || 0), 0);

  return {
    connection: {
      id: "legends-luxury-presence-seo",
      organizationId: snapshot.organizationId,
      provider: snapshot.provider,
      status: "snapshot_current",
      authType: "pending_api_or_export_discovery",
      lastSuccessfulSyncAt: snapshot.summary.lastSuccessfulSyncAt,
      errorCode: null,
    },
    syncRun: {
      id: `${snapshot.id}:sync`,
      provider: snapshot.provider,
      status: "snapshot_imported",
      recordsReceived: keywordMetrics.length,
      recordsWritten: keywordMetrics.length,
      completedAt: snapshot.capturedAt,
      errorSummary: null,
    },
    summary: {
      ...snapshot.summary,
      organicClicks,
      organicImpressions,
    },
    keywordMetrics,
    opportunities: keywordMetrics
      .filter((metric) => metric.opportunityPriority !== "Low")
      .sort((a, b) => b.opportunityScore - a.opportunityScore),
    accessMethod: snapshot.accessMethod,
    source: snapshot.source,
    rawSnapshotId: snapshot.id,
    capturedAt: snapshot.capturedAt,
    periodLabel: snapshot.periodLabel,
  };
}
