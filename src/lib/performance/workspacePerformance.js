export const PERFORMANCE_THRESHOLDS = Object.freeze({
  minimumComparisonEvents: 10,
  minimumTrendEvents: 20,
  earlySignalMinimum: 5,
  strongSignalMinimum: 25,
  meaningfulDeclinePercent: -20,
  meaningfulGrowthPercent: 20,
});

const STATUS_LABELS = {
  not_started: "Not live yet",
  setup_needed: "Setup needed",
  collecting: "Gathering activity",
  early_signal: "Early response",
  working: "Working",
  needs_refresh: "Needs attention",
  paused: "Paused",
  insufficient_data: "Not enough activity yet",
};

const SIGNAL_CONFIG = {
  qr_activity: {
    label: "QR activity",
    emptyExplanation: "Scans appear after a workspace, offer, campaign, or event QR code is placed in a sign, flyer, resident message, table card, or event material.",
    setupAction: { label: "Get the QR code", href: "/partner-workspace/sources" },
    liveExplanation: "Valid QR and approved trackable-link opens associated with this workspace.",
  },
  discovery: {
    label: "People discovered this",
    emptyExplanation: "Privacy-safe discovery appears after the workspace is visible through the resident map, search, a guide, a route, an event, a campaign, or a shared link.",
    setupAction: { label: "Review map presence", href: "/partner-workspace/map" },
    liveExplanation: "Privacy-safe openings and views from approved Downtown Perks discovery surfaces.",
  },
  saves: {
    label: "Saved for later",
    emptyExplanation: "Saves appear when someone intentionally saves a partner profile, offer, event, route, or campaign moment.",
    setupAction: { label: "Create an offer", href: "/partner-workspace/offers" },
    liveExplanation: "Deduplicated saves that show an intention to return later.",
  },
  redemptions: {
    label: "Perks redeemed",
    emptyExplanation: "Redemptions appear only after an offer is live and its use is confirmed, validated, or completed.",
    setupAction: { label: "Review offers", href: "/partner-workspace/offers" },
    liveExplanation: "Confirmed, validated, or completed offer use. Opens, attempts, cancellations, and expirations are excluded.",
  },
};

function scorecardValue(scorecard, id) {
  return Number(scorecard?.find((metric) => metric.id === id)?.value || 0);
}

function percentChange(current, previous) {
  if (!previous || previous < PERFORMANCE_THRESHOLDS.minimumComparisonEvents) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function interpretStatus(current, previous, changePercent, key) {
  if (current === 0) return key === "qr_activity" ? "setup_needed" : "not_started";
  if (current < PERFORMANCE_THRESHOLDS.earlySignalMinimum) return "collecting";
  if (current < PERFORMANCE_THRESHOLDS.strongSignalMinimum) return "early_signal";
  if (changePercent !== null && changePercent <= PERFORMANCE_THRESHOLDS.meaningfulDeclinePercent) return "needs_refresh";
  if (previous < PERFORMANCE_THRESHOLDS.minimumComparisonEvents) return "insufficient_data";
  return "working";
}

function recommendationForSignal(key, status, current, previous, changePercent) {
  const config = SIGNAL_CONFIG[key];
  if (current === 0) {
    return {
      decision: "continue",
      title: config.setupAction.label,
      rationale: config.emptyExplanation,
      primaryAction: config.setupAction,
    };
  }
  if (status === "needs_refresh") {
    return {
      decision: "refresh",
      title: `Refresh the ${config.label.toLowerCase()} prompt`,
      rationale: `Activity declined ${Math.abs(changePercent)}% from the previous comparable period. Keep the strongest placement and make the resident benefit more specific.`,
      primaryAction: config.setupAction,
    };
  }
  if (current >= PERFORMANCE_THRESHOLDS.strongSignalMinimum && previous >= PERFORMANCE_THRESHOLDS.minimumTrendEvents && changePercent >= PERFORMANCE_THRESHOLDS.meaningfulGrowthPercent) {
    return {
      decision: "expand",
      title: `Expand what is driving ${config.label.toLowerCase()}`,
      rationale: "Activity is strong across comparable periods, so an additional placement or audience is justified.",
      primaryAction: { label: "Open campaigns", href: "/partner-workspace/campaigns" },
    };
  }
  return {
    decision: "continue",
    title: `Continue the current ${config.label.toLowerCase()} setup`,
    rationale: previous >= PERFORMANCE_THRESHOLDS.minimumComparisonEvents
      ? "Activity is stable enough to keep collecting before making a larger change."
      : "Keep the current setup live until there is enough activity for a reliable comparison.",
    primaryAction: config.setupAction,
  };
}

export function buildWorkspacePerformanceReport({ workspace, analytics }) {
  const currentScorecard = analytics?.scorecard || [];
  const previousScorecard = analytics?.previousScorecard || [];
  const values = {
    qr_activity: scorecardValue(currentScorecard, "qr_activity"),
    discovery: scorecardValue(currentScorecard, "opens") + scorecardValue(currentScorecard, "views"),
    saves: scorecardValue(currentScorecard, "saves"),
    redemptions: scorecardValue(currentScorecard, "redemptions"),
  };
  const previousValues = {
    qr_activity: scorecardValue(previousScorecard, "qr_activity"),
    discovery: scorecardValue(previousScorecard, "opens") + scorecardValue(previousScorecard, "views"),
    saves: scorecardValue(previousScorecard, "saves"),
    redemptions: scorecardValue(previousScorecard, "redemptions"),
  };

  const metrics = Object.keys(SIGNAL_CONFIG).map((key) => {
    const currentValue = values[key];
    const previousValue = previousValues[key];
    const changePercent = percentChange(currentValue, previousValue);
    const status = interpretStatus(currentValue, previousValue, changePercent, key);
    return {
      key,
      label: SIGNAL_CONFIG[key].label,
      currentValue,
      previousValue,
      changePercent,
      status,
      statusLabel: STATUS_LABELS[status],
      explanation: currentValue ? SIGNAL_CONFIG[key].liveExplanation : SIGNAL_CONFIG[key].emptyExplanation,
      recommendation: recommendationForSignal(key, status, currentValue, previousValue, changePercent),
    };
  });

  const totalActivity = Object.values(values).reduce((sum, value) => sum + value, 0);
  const sourceActionTotal = (analytics?.sources || []).reduce((sum, source) => sum + Number(source.actions || 0), 0);
  const primaryRecommendation = totalActivity === 0
    ? {
        decision: "continue",
        title: `Share ${workspace.name} through one trackable resident prompt.`,
        rationale: "There is no reportable activity yet, so a workspace QR code or partner link is the fastest way to establish a useful baseline.",
        primaryAction: { label: "Get the QR code", href: "/partner-workspace/sources" },
        secondaryAction: { label: "Preview resident view", href: "/map?mode=resident&tab=map&filter=All" },
      }
    : metrics.slice().sort((a, b) => decisionPriority(b.recommendation.decision) - decisionPriority(a.recommendation.decision))[0].recommendation;

  return {
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    workspaceTier: workspace.plan,
    period: analytics?.period,
    metrics,
    sources: analytics?.sources || [],
    items: [
      ...(analytics?.campaigns || []).map((item) => ({ ...item, type: "Campaign" })),
      ...(analytics?.offers || []).map((item) => ({ ...item, type: "Offer" })),
      ...(analytics?.partnerEvents || []).map((item) => ({ ...item, type: "Event" })),
    ].map((item) => ({ ...item, label: item.label || item.name || item.title || null })).filter((item) => item.label),
    primaryRecommendation,
    interpretation: interpretPerformance(metrics),
    launchReadiness: { ready: totalActivity > 0, totalActivity, sourceActionTotal },
    partialData: analytics?.remoteStatus === "unavailable",
    generatedAt: new Date().toISOString(),
  };
}

function decisionPriority(decision) {
  return { pause: 4, refresh: 3, expand: 2, continue: 1 }[decision] || 0;
}

export function interpretPerformance(metrics) {
  const byKey = Object.fromEntries(metrics.map((metric) => [metric.key, metric]));
  if (metrics.every((metric) => metric.currentValue === 0)) return ["There is not enough activity yet to compare behavior reliably."];
  const insights = [];
  if (byKey.discovery.currentValue >= PERFORMANCE_THRESHOLDS.earlySignalMinimum && byKey.saves.currentValue < PERFORMANCE_THRESHOLDS.earlySignalMinimum) insights.push("Discovery is beginning, but saves remain low. Give people one clear reason to return later.");
  if (byKey.saves.currentValue >= PERFORMANCE_THRESHOLDS.earlySignalMinimum && byKey.redemptions.currentValue === 0) insights.push("People are saving this, but confirmed perk use has not started. Check that one live offer has a clear validation path.");
  if (byKey.qr_activity.currentValue > 0 && byKey.discovery.currentValue === 0) insights.push("QR activity is not yet producing recorded map or profile discovery. Review the QR destination and resident prompt.");
  if (!insights.length) insights.push("Activity is still developing. Keep the current setup live and use the next comparable period to confirm the pattern.");
  return insights;
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function downloadPerformanceCsv(report) {
  const rows = [
    ["Workspace", report.workspaceName],
    ["Period from", report.period?.from || ""],
    ["Period to", report.period?.to || ""],
    [],
    ["Signal", "Current value", "Previous value", "Change percent", "Status", "Decision", "Recommended action"],
    ...report.metrics.map((metric) => [metric.label, metric.currentValue, metric.previousValue, metric.changePercent ?? "", metric.statusLabel, metric.recommendation.decision, metric.recommendation.title]),
    [],
    ["Interpretation"],
    ...report.interpretation.map((insight) => [insight]),
    [],
    ["Source", "Discovery", "Actions"],
    ...report.sources.filter((source) => source.actions > 0).map((source) => [source.label, source.entries, source.actions]),
    ...(report.items.length ? [[], ["Activity driver", "Type", "Actions"], ...report.items.map((item) => [item.label, item.type, item.actions])] : []),
  ];
  const blob = new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, performanceFilename(report, "csv"));
}

export async function downloadPerformancePdf(report) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${report.workspaceName} performance`, 48, 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${dateOnly(report.period?.from)} to ${dateOnly(report.period?.to)} · Generated ${dateOnly(report.generatedAt)}`, 48, 76);
  let y = 112;
  const ensureSpace = (height = 64) => {
    if (y + height <= 712) return;
    doc.addPage();
    y = 54;
  };
  const writeSection = (title, body) => {
    ensureSpace(58);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 48, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(body, 510);
    doc.text(lines, 48, y + 15);
    y += 30 + Math.max(0, lines.length - 1) * 10;
  };
  report.metrics.forEach((metric) => {
    ensureSpace(70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${metric.label}: ${metric.currentValue.toLocaleString()} · ${metric.statusLabel}`, 48, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(`${metric.explanation} Next action: ${metric.recommendation.title}.`, 510);
    doc.text(lines, 48, y + 15);
    y += 38 + Math.max(0, lines.length - 1) * 10;
  });
  writeSection("What people did, and what to try next", report.interpretation.join(" "));
  writeSection("Recommended next step", `${report.primaryRecommendation.title} ${report.primaryRecommendation.rationale}`);
  const activeSources = report.sources.filter((source) => source.actions > 0);
  if (activeSources.length) writeSection("Activity sources", activeSources.map((source) => `${source.label}: ${source.actions} actions`).join(" · "));
  if (report.items.length) writeSection("What is driving activity", report.items.map((item) => `${item.label}: ${item.actions} actions`).join(" · "));
  doc.setFontSize(8);
  doc.text("Downtown Perks", 48, 744);
  doc.save(performanceFilename(report, "pdf"));
}

export async function copyPerformanceSummary(report) {
  const metrics = report.metrics.map((metric) => `${metric.label}: ${metric.currentValue.toLocaleString()} (${metric.statusLabel})`).join("\n");
  await navigator.clipboard.writeText(`${report.workspaceName} performance\n${dateOnly(report.period?.from)} to ${dateOnly(report.period?.to)}\n\n${metrics}\n\nRecommended next step: ${report.primaryRecommendation.title}\n${report.primaryRecommendation.rationale}`);
}

function performanceFilename(report, extension) {
  return `downtown-perks-${report.workspaceSlug}-performance-${dateOnly(report.period?.from)}-${dateOnly(report.period?.to)}.${extension}`;
}
function dateOnly(value) { return String(value || "").slice(0, 10); }
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
