import type { AgentContext, AgentIntent, AgentMode } from "./types";

const RESIDENT_RULES = [
  { id: "coffee", label: "Coffee", categories: ["Coffee"], tokens: ["coffee", "cafe", "espresso", "morning"] },
  { id: "dining", label: "Dining", categories: ["Dining", "Food"], tokens: ["dining", "dinner", "lunch", "restaurant", "food", "eat"] },
  { id: "drinks", label: "Drinks", categories: ["Drinks", "Nightlife"], tokens: ["drinks", "bar", "cocktail", "nightlife"] },
  { id: "events", label: "Events", categories: ["Events"], tokens: ["event", "events", "tonight", "music", "rsvp"] },
  { id: "perks", label: "Perks", categories: ["Perks"], tokens: ["perk", "offer", "deal", "discount", "card"] },
  { id: "nearby", label: "Nearby", categories: ["Nearby"], tokens: ["nearby", "walk", "walkable", "close"] },
];

const PARTNER_RULES = [
  { id: "campaign_opportunity", label: "Campaign Opportunity", categories: ["Campaigns"], tokens: ["campaign", "launch", "promote", "activation"] },
  { id: "coverage_gap", label: "Coverage Gap", categories: ["Coverage"], tokens: ["coverage", "gap", "missing", "white space"] },
  { id: "audience", label: "Audience", categories: ["Audience"], tokens: ["audience", "residents", "guests", "workers", "visitors"] },
  { id: "performance", label: "Performance", categories: ["Reports"], tokens: ["performance", "scans", "saves", "opens", "report"] },
  { id: "partner_intelligence", label: "Partner Intelligence", categories: ["Activity"], tokens: ["what", "why", "next", "opportunity"] },
];

function normalize(text: string) {
  return String(text || "").toLowerCase();
}

export function detectAgentIntent(input: AgentContext): AgentIntent {
  const mode: AgentMode = input.mode === "partner" ? "partner" : "resident";
  const query = normalize(input.query);
  const rules = mode === "partner" ? PARTNER_RULES : RESIDENT_RULES;
  const configured = Array.isArray(input.intentCategories) ? input.intentCategories.filter(Boolean).map(String) : [];
  const match = rules.find((rule) => rule.tokens.some((token) => query.includes(token)));
  const fallback = mode === "partner" ? PARTNER_RULES[PARTNER_RULES.length - 1] : RESIDENT_RULES[RESIDENT_RULES.length - 1];
  const rule = match || fallback;

  return {
    id: rule.id,
    label: rule.label,
    categories: configured.length ? Array.from(new Set([...configured, ...rule.categories])) : rule.categories,
    confidence: match ? 0.78 : query ? 0.52 : 0.38,
    mode,
  };
}
