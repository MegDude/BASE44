import type { MapAgentTool, MapToolId, ToolExecutionResult, ToolPermissionContext } from "./mapCapabilities";

type ToolStubInput = Record<string, unknown>;
type ToolStubOutput = { deferred: true; toolId: MapToolId };

const PUBLIC_TOOLS: MapToolId[] = [
  "search_entities",
  "get_entity_detail",
  "get_nearby_entities",
  "get_active_perks",
  "get_active_events",
  "get_collection",
  "get_route",
  "open_directions",
];

const RESIDENT_TOOLS: MapToolId[] = [
  ...PUBLIC_TOOLS,
  "start_route",
  "save_entity",
  "show_resident_card",
  "get_perk_eligibility",
];

const PARTNER_TOOLS: MapToolId[] = [
  ...PUBLIC_TOOLS,
  "create_draft_perk",
  "create_draft_event",
  "get_partner_analytics",
];

const ADMIN_TOOLS: MapToolId[] = [
  ...RESIDENT_TOOLS,
  ...PARTNER_TOOLS,
];

function allowedToolsForRole(role: ToolPermissionContext["role"]) {
  if (role === "admin") return new Set(ADMIN_TOOLS);
  if (role === "partner") return new Set(PARTNER_TOOLS);
  if (role === "resident") return new Set(RESIDENT_TOOLS);
  return new Set(PUBLIC_TOOLS);
}

function validateRecord(input: unknown): ToolStubInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return input as ToolStubInput;
}

function makeDeferredTool(id: MapToolId, description: string, options: { requiresConfirmation?: boolean } = {}): MapAgentTool<ToolStubInput, ToolStubOutput> {
  return {
    id,
    description,
    timeoutMs: 3000,
    requiresConfirmation: options.requiresConfirmation,
    rateLimitKey: `map-tool:${id}`,
    validateInput: validateRecord,
    authorize(context) {
      return allowedToolsForRole(context.role).has(id);
    },
    async execute(_input, context): Promise<ToolExecutionResult<ToolStubOutput>> {
      if (!allowedToolsForRole(context.role).has(id)) {
        return { ok: false, error: "Action is not available for this role.", auditEvent: `map.tool.denied.${id}` };
      }
      return { ok: true, output: { deferred: true, toolId: id }, auditEvent: `map.tool.deferred.${id}` };
    },
  };
}

export const MAP_TOOL_REGISTRY: Record<MapToolId, MapAgentTool<ToolStubInput, ToolStubOutput>> = {
  search_entities: makeDeferredTool("search_entities", "Search published Downtown Perks map entities."),
  get_entity_detail: makeDeferredTool("get_entity_detail", "Retrieve one published entity detail payload."),
  get_nearby_entities: makeDeferredTool("get_nearby_entities", "Retrieve nearby entities scoped to viewport, district, route, or collection."),
  get_active_perks: makeDeferredTool("get_active_perks", "Retrieve active perks for the current context."),
  get_active_events: makeDeferredTool("get_active_events", "Retrieve active events for the current context."),
  get_collection: makeDeferredTool("get_collection", "Retrieve a published Downtown Perks collection."),
  get_route: makeDeferredTool("get_route", "Retrieve a published Downtown Perks route."),
  start_route: makeDeferredTool("start_route", "Start or continue a route draft in the current session.", { requiresConfirmation: true }),
  save_entity: makeDeferredTool("save_entity", "Save a visible place, perk, event, route, or collection.", { requiresConfirmation: true }),
  open_directions: makeDeferredTool("open_directions", "Open directions for the selected place or active route stop."),
  show_resident_card: makeDeferredTool("show_resident_card", "Show the current resident card after resident authorization.", { requiresConfirmation: true }),
  get_perk_eligibility: makeDeferredTool("get_perk_eligibility", "Check whether the current resident can use a perk."),
  create_draft_perk: makeDeferredTool("create_draft_perk", "Create a partner draft perk that still requires human review.", { requiresConfirmation: true }),
  create_draft_event: makeDeferredTool("create_draft_event", "Create a partner draft event that still requires human review.", { requiresConfirmation: true }),
  get_partner_analytics: makeDeferredTool("get_partner_analytics", "Retrieve partner-scoped analytics for the current organization."),
};

export function getAuthorizedMapTools(context: ToolPermissionContext): MapToolId[] {
  return Object.values(MAP_TOOL_REGISTRY)
    .filter((tool) => tool.authorize(context, {}))
    .map((tool) => tool.id);
}
