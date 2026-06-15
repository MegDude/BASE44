import { createAskMapAction, ASK_MAP_ACTIONS } from "./AskMapActions";
import { getAskMapPrompts } from "./AskMapPrompts";

const INTENT_RULES = [
  { intent: "coffee", categories: ["Coffee"], tokens: ["coffee", "cafe", "espresso"], ranking: "proximity" },
  { intent: "dining", categories: ["Food", "Dining"], tokens: ["dinner", "lunch", "restaurant", "eat"], timeContext: "tonight", ranking: "availability" },
  { intent: "nightlife", categories: ["Drinks", "Nightlife"], tokens: ["drinks", "bar", "cocktail", "rooftop"], groupActivity: true, ranking: "atmosphere" },
  { intent: "events", categories: ["Events"], tokens: ["event", "events", "music", "happening", "tonight"], ranking: "timing" },
  { intent: "perks", categories: ["Perks"], tokens: ["perk", "offer", "discount", "use now"], ranking: "value" },
  { intent: "partner_opportunity", categories: ["Campaigns", "Reports"], tokens: ["promote", "campaign", "demand", "saving", "activity"], ranking: "opportunity" },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function detectIntent(query, mode) {
  const text = normalize(query);
  const match = INTENT_RULES.find((rule) => rule.tokens.some((token) => text.includes(token)));
  if (match) return match;
  if (mode === "partner") return INTENT_RULES.find((rule) => rule.intent === "partner_opportunity");
  return { intent: "nearby", categories: ["Nearby"], ranking: "relevance" };
}

function detectDistrict(query) {
  const text = normalize(query);
  if (text.includes("seaholm")) return "Seaholm";
  if (text.includes("rainey")) return "Rainey";
  if (text.includes("congress")) return "Congress";
  if (text.includes("waterloo")) return "Waterloo";
  if (text.includes("west 6th")) return "West 6th";
  return "";
}

function recommendationFromEntity(entity, intent) {
  const title = entity?.name || entity?.title || "Recommended nearby";
  const district = entity?.district || entity?.neighborhood || "Downtown";
  return {
    title,
    why: entity?.summary || entity?.description || `A strong ${intent.intent.replace(/_/g, " ")} fit around ${district}.`,
    walkTime: entity?.walkTime || "5 min walk",
    bestTime: intent.timeContext === "tonight" ? "Tonight" : entity?.bestTime || "Now",
    currentSignal: entity?.signal || "",
    availablePerk: entity?.perk?.offer || entity?.recommended_perk || "",
    entityId: entity?.id || "",
  };
}

export function runAskMapEngine({
  query = "",
  mode = "resident",
  entities = [],
  selectedDistrict = "",
} = {}) {
  const intent = detectIntent(query, mode);
  const district = selectedDistrict || detectDistrict(query);
  const candidates = entities
    .filter((entity) => {
      const text = normalize([entity?.name, entity?.title, entity?.category, entity?.type, entity?.district, entity?.summary].filter(Boolean).join(" "));
      const matchesCategory = intent.categories.some((category) => text.includes(normalize(category)));
      const matchesDistrict = district ? text.includes(normalize(district)) : true;
      return matchesDistrict && (matchesCategory || !query);
    })
    .slice(0, 5);

  const recommendations = (candidates.length ? candidates : entities.slice(0, 5)).map((entity) => recommendationFromEntity(entity, intent));

  return {
    intent: intent.intent,
    categories: intent.categories,
    district,
    timeContext: intent.timeContext || "",
    ranking: intent.ranking,
    confidence: query ? 0.72 : 0.45,
    recommendations,
    promptChips: getAskMapPrompts(mode),
    actions: [
      createAskMapAction("Open nearby", ASK_MAP_ACTIONS.applyFilter, { filter: intent.categories[0] || "Nearby" }),
      createAskMapAction(mode === "partner" ? "Open campaigns" : "Save place", mode === "partner" ? ASK_MAP_ACTIONS.openCampaigns : ASK_MAP_ACTIONS.savePlace),
    ],
  };
}
