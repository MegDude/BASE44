type EntityLike = Record<string, any> | null | undefined;

export type AgentAction = {
  label: string;
  type?: "primary" | "secondary" | "tertiary";
  href?: string;
  prompt?: string;
};

export type AgentContext = {
  page?: string;
  entity?: EntityLike;
  campaigns?: unknown[];
  audience?: unknown[];
  reports?: unknown[];
  activity?: unknown[];
  recommendations?: unknown[];
};

export type AgentOutput = {
  summary: string;
  observations: string[];
  insights: string[];
  recommendations: string[];
  actions: AgentAction[];
};

function textFor(entity: EntityLike) {
  return [
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.type,
    entity?.kind,
    entity?.entityType,
    entity?.partnerType,
    entity?.category,
    entity?.category_key,
    entity?.district,
    entity?.summary,
    entity?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getAgentEntityType(entity: EntityLike) {
  const text = textFor(entity);
  if (/\b(event|rsvp|concert|show|festival)\b/.test(text)) return "event";
  if (/\b(perk|benefit|offer|inkind)\b/.test(text)) return "perk";
  if (/\b(hotel|hospitality|guest|stay)\b/.test(text)) return "hotel";
  if (/\b(property|residential|condo|listing|mls|building|apartment|legends)\b/.test(text)) return "property";
  if (/\b(brand|retail activation|campaign)\b/.test(text)) return "brand";
  if (/\b(civic|park|public|museum|greenway|alliance)\b/.test(text)) return "civic";
  if (/\b(restaurant|dining|bar|nightlife|coffee|venue|music)\b/.test(text)) return "venue";
  return "place";
}

export function getEntityAgentQuestions(entity: EntityLike) {
  const type = getAgentEntityType(entity);
  const questions: Record<string, string[]> = {
    venue: ["Who is nearby?", "What offer fits here?", "What should we pair nearby?", "What should we promote?"],
    hotel: ["What should guests see nearby?", "What is easy to walk to?", "What offer fits arrivals?", "What helps the concierge?"],
    property: ["What helps residents nearby?", "What should leasing show?", "What services fit here?", "What is walkable?"],
    event: ["What should we promote before?", "What should we promote after?", "Who is nearby?", "What else supports this?"],
    perk: ["Who will use this?", "What should it pair with?", "Where should it appear?", "What makes it easy to use?"],
    brand: ["Who is nearby?", "What should we launch?", "Where does this fit?", "What should we pair nearby?"],
    civic: ["Who uses this stop?", "What route fits nearby?", "What should hotels mention?", "What can residents discover?"],
    place: ["Who is nearby?", "What should we pair nearby?", "What makes this useful?", "What should we promote?"],
  };
  return questions[type] || questions.place;
}

export function getInsights(context: AgentContext = {}): string[] {
  const district = context.entity?.district || "downtown";
  const type = getAgentEntityType(context.entity);
  if (type === "property") return [`Nearby places shape everyday routines around ${district}.`];
  if (type === "hotel") return [`Guest decisions around ${district} are strongest when walkable options are clear.`];
  if (type === "event") return [`Before-and-after plans matter most for this event context.`];
  if (type === "perk") return [`The benefit is strongest when paired with a nearby plan.`];
  return [`Nearby context helps people decide faster around ${district}.`];
}

export function getRecommendations(context: AgentContext = {}): string[] {
  const type = getAgentEntityType(context.entity);
  if (type === "property") return ["Show walkable coffee, dining, fitness, and lake access first."];
  if (type === "hotel") return ["Lead with nearby dining, drinks, events, and guest-friendly experiences."];
  if (type === "event") return ["Pair the event with nearby food, drinks, and post-event plans."];
  if (type === "perk") return ["Make the value clear, then show what to do nearby."];
  return ["Use nearby activity to choose the next best action."];
}

export function getNextActions(context: AgentContext = {}): AgentAction[] {
  const type = getAgentEntityType(context.entity);
  if (type === "brand") {
    return [
      { label: "Create Campaign", type: "primary" },
      { label: "View Nearby Activity", type: "secondary" },
      { label: "Ask AI", type: "tertiary", prompt: "What should I launch?" },
    ];
  }
  return [
    { label: "Save", type: "secondary" },
    { label: "Directions", type: "secondary" },
    { label: "Ask AI", type: "tertiary", prompt: "What is nearby?" },
  ];
}

export function getSimilarEntities(_context: AgentContext = {}) {
  return [];
}

export function getCampaignSuggestions(context: AgentContext = {}) {
  return getRecommendations(context);
}

export function runAgent(context: AgentContext = {}): AgentOutput {
  const entityName = context.entity?.name || context.entity?.title || "this place";
  const insights = getInsights(context);
  const recommendations = getRecommendations(context);
  return {
    summary: `Downtown Perks AI uses nearby context to make ${entityName} easier to act on.`,
    observations: insights.slice(0, 2),
    insights,
    recommendations,
    actions: getNextActions(context),
  };
}
