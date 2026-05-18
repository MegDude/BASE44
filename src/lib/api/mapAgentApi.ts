type AskMapIntent = {
  category?: string;
  intentMode?: "now" | "plan" | "perks";
  categories?: string[];
  types?: string[];
  ranking?: "distance" | "popularity" | "live";
  explanation?: string;
  suggestions?: string[];
};

type AskMapResponse = {
  intent?: AskMapIntent;
  source?: "api" | "fallback";
  places?: Array<{ name?: string; reason?: string; mapQuery?: string }>;
};

const CATEGORY_RULES = [
  { match: ["coffee", "cafe", "espresso", "latte"], category: "coffee", categories: ["coffee"], types: ["venue"], suggestions: ["Coffee within 5 minutes", "Open coffee nearby"] },
  { match: ["dinner", "food", "restaurant", "eat", "lunch", "brunch"], category: "dining", categories: ["restaurant"], types: ["venue"], suggestions: ["Dinner nearby", "Open restaurants now"] },
  { match: ["bar", "drink", "cocktail", "happy hour", "nightlife"], category: "nightlife", categories: ["bar"], types: ["venue"], suggestions: ["Happy hour nearby", "Open bars now"] },
  { match: ["event", "events", "tonight", "rsvp", "music", "live"], category: "event", categories: [], types: ["event"], suggestions: ["Events tonight", "Live nearby"] },
  { match: ["perk", "perks", "deal", "discount", "offer", "card"], category: "perks", categories: [], types: ["perk", "venue", "hotel", "property"], suggestions: ["Perks nearby", "Best value nearby"] },
  { match: ["apartment", "building", "condo", "rent", "lease", "property", "home", "homes"], category: "residential", categories: [], types: ["building", "property", "hotel"], suggestions: ["Properties nearby", "Walkable buildings"] },
  { match: ["hotel", "guest", "stay", "lobby"], category: "hotel", categories: [], types: ["hotel"], suggestions: ["Hotels nearby", "Walkable guest options"] },
  { match: ["fitness", "gym", "wellness", "workout", "yoga"], category: "wellness", categories: ["fitness", "wellness"], types: ["venue"], suggestions: ["Wellness nearby", "Open fitness now"] },
];

function normalizeQuery(value: string) {
  return String(value || "").trim().toLowerCase();
}

function parseFallbackIntent(query: string): AskMapResponse {
  const normalized = normalizeQuery(query);
  const matchedRule = CATEGORY_RULES.find((rule) => rule.match.some((term) => normalized.includes(term)));
  const isPlan = ["tomorrow", "weekend", "this week", "later", "plan", "rsvp"].some((term) => normalized.includes(term));
  const isPerks = ["perk", "perks", "deal", "discount", "offer", "card"].some((term) => normalized.includes(term));
  const wantsDistance = ["near", "nearby", "closest", "walk", "5 min", "five min", "10 min", "ten min"].some((term) => normalized.includes(term));

  const intentMode: AskMapIntent["intentMode"] = isPerks ? "perks" : isPlan ? "plan" : "now";
  const ranking: AskMapIntent["ranking"] = wantsDistance ? "distance" : intentMode === "perks" ? "popularity" : "live";
  const category = matchedRule?.category || "nearby";
  const types = matchedRule?.types || ["venue", "event", "perk", "building", "property", "hotel"];
  const categories = matchedRule?.categories || [];
  const suggestions = matchedRule?.suggestions || ["Coffee nearby", "Happy hour now", "Events tonight", "Perks within 5 minutes"];

  return {
    source: "fallback",
    intent: {
      category,
      intentMode,
      categories,
      types,
      ranking,
      explanation: `Showing ${category === "nearby" ? "nearby downtown options" : category} results ranked by ${ranking}.`,
      suggestions,
    },
    places: [],
  };
}

export const mapAgentApi = {
  async askMap(query: string, context: Record<string, unknown> = {}): Promise<AskMapResponse | null> {
    const trimmed = String(query || "").trim();
    if (!trimmed) return null;

    try {
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmed,
          context,
        }),
      });

      if (!response.ok) {
        return parseFallbackIntent(trimmed);
      }

      const payload = await response.json();
      if (!payload?.intent) {
        return parseFallbackIntent(trimmed);
      }

      return {
        ...payload,
        source: payload.source || "api",
      };
    } catch (error) {
      console.error("mapAgentApi.askMap error:", error);
      return parseFallbackIntent(trimmed);
    }
  },

  async logSearch(query: string, metadata: Record<string, unknown> = {}) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return;

    try {
      await fetch("/api/search-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmed,
          metadata,
        }),
      });
    } catch (error) {
      console.error("mapAgentApi.logSearch error:", error);
    }
  },
};
