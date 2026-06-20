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
    venue: ["Best time to visit?", "What is nearby?", "What makes this unique?", "Similar places?"],
    hotel: ["What should guests do nearby?", "What is walkable?", "Best evening plan?", "Similar stays?"],
    property: ["What amenities are nearby?", "What lifestyle fits here?", "Similar buildings?", "What is walkable?"],
    event: ["What should I do before?", "What should I do after?", "Who is this for?", "What else is nearby?"],
    perk: ["How do I use this?", "What else is nearby?", "What should I pair this with?", "Worth using tonight?"],
    brand: ["Who is nearby?", "What should I launch?", "Where does this fit?", "Similar partners?"],
    civic: ["Why does this matter?", "What is nearby?", "What should I attend?", "How can I join?"],
    place: ["What is nearby?", "Worth going tonight?", "Similar spots?", "Best time to visit?"],
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
