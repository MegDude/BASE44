export type ContentRole = "headline" | "support" | "card" | "drawer" | "empty" | "tooltip" | "notification" | "button" | "section";

export type GovernedContentItem = {
  id: string;
  viewId: string;
  sectionId?: string;
  role: ContentRole;
  text: string;
  audience?: "resident" | "partner" | "admin" | "shared";
  primary?: boolean;
};

export type ContentIssue = {
  itemId: string;
  rule: string;
  message: string;
};

export const CONTENT_WORD_LIMITS: Record<ContentRole, number> = Object.freeze({
  headline: 18,
  support: 24,
  card: 18,
  drawer: 32,
  empty: 18,
  tooltip: 12,
  notification: 12,
  button: 3,
  section: 2,
});

export const CONTENT_BANNED_PHRASES = Object.freeze([
  "analytics snapshot",
  "performance snapshot",
  "campaign opportunity",
  "visibility settings",
  "asset positioning",
  "engagement strategy",
  "enterprise grade",
  "best in class",
  "luxury lifestyle",
  "premium experience",
  "elevated living",
  "unmatched convenience",
  "exceptional destination",
  "exclusive access",
  "sophisticated urban experience",
  "curated luxury",
  "resident value opportunity",
  "competitive differentiator",
  "activation ideas",
]);

export const CONTENT_GENERIC_ACTIONS = Object.freeze([
  "learn more",
  "continue",
  "discover",
  "get started",
  "explore",
  "click here",
]);

const RESIDENT_INTERNAL_TERMS = /\b(workflow|activation|asset positioning|engagement strategy|campaign objective|audience segment|conversion funnel)\b/i;

function normalize(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function wordCount(value = "") {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function reviewGovernedContent(items: GovernedContentItem[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const headingsByView = new Map<string, Map<string, string>>();
  const sectionStats = new Map<string, { support: number; primaryActions: number; messages: Set<string> }>();

  for (const item of items) {
    const text = String(item.text || "").trim();
    if (!text) continue;
    const normalized = normalize(text);
    const limit = CONTENT_WORD_LIMITS[item.role];
    if (wordCount(text) > limit) {
      issues.push({ itemId: item.id, rule: "length", message: `${item.role} copy exceeds ${limit} words.` });
    }
    if (CONTENT_BANNED_PHRASES.some((phrase) => normalized.includes(phrase))) {
      issues.push({ itemId: item.id, rule: "voice", message: "Copy uses banned software or generic luxury language." });
    }
    if (item.role === "button" && CONTENT_GENERIC_ACTIONS.includes(normalized)) {
      issues.push({ itemId: item.id, rule: "action", message: "CTA must name the action with a concrete verb." });
    }
    if (item.audience === "resident" && RESIDENT_INTERNAL_TERMS.test(text)) {
      issues.push({ itemId: item.id, rule: "audience", message: "Resident copy exposes internal partner terminology." });
    }

    if (item.role === "headline" || item.role === "section") {
      const viewHeadings = headingsByView.get(item.viewId) || new Map<string, string>();
      if (viewHeadings.has(normalized)) {
        issues.push({ itemId: item.id, rule: "duplicate-heading", message: `Heading repeats ${viewHeadings.get(normalized)}.` });
      } else {
        viewHeadings.set(normalized, item.id);
      }
      headingsByView.set(item.viewId, viewHeadings);
    }

    const sectionKey = `${item.viewId}:${item.sectionId || item.id}`;
    const stats = sectionStats.get(sectionKey) || { support: 0, primaryActions: 0, messages: new Set<string>() };
    if (item.role === "support") stats.support += 1;
    if (item.role === "button" && item.primary) stats.primaryActions += 1;
    if (["headline", "support", "card", "drawer", "empty"].includes(item.role)) {
      if (stats.messages.has(normalized)) issues.push({ itemId: item.id, rule: "repeated-concept", message: "Message repeats within the same section." });
      stats.messages.add(normalized);
    }
    sectionStats.set(sectionKey, stats);
  }

  for (const [sectionKey, stats] of sectionStats) {
    if (stats.support > 1) issues.push({ itemId: sectionKey, rule: "support-count", message: "Section has more than one supporting sentence." });
    if (stats.primaryActions > 1) issues.push({ itemId: sectionKey, rule: "primary-action-count", message: "Section has more than one primary CTA." });
  }
  return issues;
}
