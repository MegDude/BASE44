export type MapIntent =
  | "explore_nearby"
  | "find_perk"
  | "find_event"
  | "plan_evening"
  | "plan_date"
  | "find_food"
  | "find_drinks"
  | "find_hotel"
  | "tour_property"
  | "find_workspace"
  | "use_resident_benefit"
  | "start_route"
  | "continue_route"
  | "show_saved"
  | "show_resident_card";

export type MapToolId =
  | "search_entities"
  | "get_entity_detail"
  | "get_nearby_entities"
  | "get_active_perks"
  | "get_active_events"
  | "get_collection"
  | "get_route"
  | "start_route"
  | "save_entity"
  | "open_directions"
  | "show_resident_card"
  | "get_perk_eligibility"
  | "create_draft_perk"
  | "create_draft_event"
  | "get_partner_analytics";

export type MapAudience = "resident" | "visitor" | "partner";

export type InterpretedMapRequest = {
  intent: MapIntent;
  confidence: number;
  district?: string;
  categories?: string[];
  timeWindow?: {
    startsAt?: string;
    endsAt?: string;
  };
  audience?: MapAudience;
  routeId?: string;
  collectionId?: string;
  selectedEntityId?: string;
  radiusMiles?: number;
  requiredActions?: MapToolId[];
};

export type ToolPermissionContext = {
  role: "public" | "resident" | "partner" | "admin";
  residentId?: string;
  partnerId?: string;
  organizationId?: string;
};

export type ToolExecutionResult<Output> = {
  ok: true;
  output: Output;
  auditEvent: string;
} | {
  ok: false;
  error: string;
  auditEvent: string;
};

export interface MapAgentTool<Input, Output> {
  id: MapToolId;
  description: string;
  timeoutMs: number;
  requiresConfirmation?: boolean;
  rateLimitKey?: string;
  validateInput(input: unknown): Input;
  authorize(context: ToolPermissionContext, input: Input): boolean;
  execute(input: Input, context: ToolPermissionContext): Promise<ToolExecutionResult<Output>>;
}

export type MapAssistantInput = {
  query: string;
  role: ToolPermissionContext["role"];
  visibleContext?: VisibleMapContext;
  district?: string;
  selectedEntityId?: string;
};

export type PartnerDraftInput = {
  partnerId: string;
  organizationId: string;
  source: "text" | "image" | "flyer" | "menu" | "venue_photo";
  text?: string;
  imageAssetId?: string;
};

export type PartnerDraftOutput = {
  draftType: "perk" | "event";
  title?: string;
  description?: string;
  dateText?: string;
  terms?: string;
  confidence: number;
  fieldsRequiringConfirmation: string[];
};

export type EntitySummary = {
  title: string;
  summary: string;
  recommendedAction?: string;
};

export interface DowntownPerksModel {
  id: string;
  capabilities: {
    text: boolean;
    image: boolean;
    structuredOutput: boolean;
    toolCalling: boolean;
    onDevice: boolean;
  };
  interpretMapRequest(input: MapAssistantInput): Promise<InterpretedMapRequest>;
  generatePartnerDraft?(input: PartnerDraftInput): Promise<PartnerDraftOutput>;
}

export type VisibleMapContext = {
  screen: "map" | "entity_detail" | "route" | "collection" | "saved" | "resident_card";
  activeEntityId?: string;
  activeRouteId?: string;
  activeCollectionId?: string;
  visibleEntityIds: string[];
  activeFilter?: string;
  district?: string;
  allowedActions: MapToolId[];
};

export type SearchableMapEntity = {
  id: string;
  canonicalUrl: string;
  title: string;
  type: "venue" | "event" | "perk" | "property" | "hotel" | "brand" | "civic" | "service";
  district?: string;
  summary: string;
  searchableKeywords: string[];
  activeFrom?: string;
  activeUntil?: string;
  latitude?: number;
  longitude?: number;
};

export type DowntownPerksDataClass = "public" | "account_scoped" | "sensitive_operational" | "prohibited_model_input";

export const PIN_LOADING_LIMITS = {
  initial: 18,
  standard: 24,
  maxUnclustered: 40,
} as const;

export const MAP_QUERY_DEBOUNCE_MS = 350;
