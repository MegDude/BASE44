export type AgentMode = "resident" | "partner";

export type AgentEntity = Record<string, any>;

export type AgentContext = {
  query: string;
  mode: AgentMode;
  district?: string;
  filter?: string;
  parsedIntent?: Record<string, any>;
  intentCategories?: string[];
  context?: AgentEntity[];
  selectedEntity?: AgentEntity | null;
  userLocation?: { lat: number; lng: number };
  mapBounds?: Record<string, unknown>;
  timeFilter?: string;
};

export type AgentIntent = {
  id: string;
  label: string;
  categories: string[];
  confidence: number;
  mode: AgentMode;
};

export type AgentRecommendation = {
  id: string;
  title: string;
  type: string;
  reason: string;
  entity?: AgentEntity;
  distanceLabel?: string;
  actionLabel?: string;
};

export type AgentAction = {
  id: string;
  label: string;
  type: string;
  payload?: Record<string, any>;
};

export type AgentResponse = {
  mode: AgentMode;
  intent: AgentIntent;
  title: string;
  answer: string;
  summary: string;
  explanation: string;
  recommendations: AgentRecommendation[];
  places: AgentEntity[];
  actions: string[];
  structuredActions: AgentAction[];
  followUps: string[];
  collections: string[];
  campaigns: string[];
  events: string[];
  source: "local-agent" | "openai" | "fallback";
  model: string;
  memory?: Record<string, any>;
};
