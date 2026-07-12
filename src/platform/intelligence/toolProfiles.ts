import type { MapIntent, MapToolId, ToolPermissionContext, VisibleMapContext } from "./mapCapabilities";

export type DynamicMapProfileId =
  | "resident_discovery"
  | "resident_account"
  | "partner_workspace"
  | "route_planning"
  | "image_understanding";

export type DynamicMapProfile = {
  id: DynamicMapProfileId;
  label: string;
  intents: MapIntent[];
  tools: MapToolId[];
  prohibitedTools: MapToolId[];
};

export const DYNAMIC_MAP_PROFILES: Record<DynamicMapProfileId, DynamicMapProfile> = {
  resident_discovery: {
    id: "resident_discovery",
    label: "Resident discovery",
    intents: ["explore_nearby", "find_perk", "find_event", "plan_evening", "plan_date", "find_food", "find_drinks", "find_hotel", "start_route"],
    tools: ["search_entities", "get_nearby_entities", "get_entity_detail", "get_active_perks", "get_active_events", "get_collection", "get_route", "start_route", "save_entity", "open_directions"],
    prohibitedTools: ["create_draft_perk", "create_draft_event", "get_partner_analytics"],
  },
  resident_account: {
    id: "resident_account",
    label: "Resident account",
    intents: ["show_saved", "show_resident_card", "use_resident_benefit"],
    tools: ["show_resident_card", "get_perk_eligibility", "save_entity", "get_active_perks"],
    prohibitedTools: ["create_draft_perk", "create_draft_event", "get_partner_analytics"],
  },
  partner_workspace: {
    id: "partner_workspace",
    label: "Partner workspace",
    intents: ["explore_nearby", "find_event", "find_perk"],
    tools: ["get_entity_detail", "get_active_perks", "get_active_events", "create_draft_perk", "create_draft_event", "get_partner_analytics"],
    prohibitedTools: ["show_resident_card", "get_perk_eligibility"],
  },
  route_planning: {
    id: "route_planning",
    label: "Route planning",
    intents: ["plan_evening", "plan_date", "start_route", "continue_route"],
    tools: ["search_entities", "get_nearby_entities", "get_active_perks", "get_active_events", "get_route", "get_collection", "start_route", "open_directions"],
    prohibitedTools: ["create_draft_perk", "create_draft_event", "get_partner_analytics", "show_resident_card"],
  },
  image_understanding: {
    id: "image_understanding",
    label: "Image understanding",
    intents: ["find_event", "find_perk"],
    tools: ["create_draft_perk", "create_draft_event"],
    prohibitedTools: ["save_entity", "open_directions", "show_resident_card", "get_partner_analytics"],
  },
};

export function getProfileForVisibleContext(context: VisibleMapContext, permission: ToolPermissionContext): DynamicMapProfile {
  if (permission.role === "partner") return DYNAMIC_MAP_PROFILES.partner_workspace;
  if (context.screen === "resident_card" || context.screen === "saved") return DYNAMIC_MAP_PROFILES.resident_account;
  if (context.screen === "route") return DYNAMIC_MAP_PROFILES.route_planning;
  return DYNAMIC_MAP_PROFILES.resident_discovery;
}

export function getAllowedProfileTools(context: VisibleMapContext, permission: ToolPermissionContext): MapToolId[] {
  const profile = getProfileForVisibleContext(context, permission);
  const visibleAllowed = new Set(context.allowedActions);
  return profile.tools.filter((tool) => visibleAllowed.has(tool) && !profile.prohibitedTools.includes(tool));
}

export function sanitizeVisibleMapContext(context: VisibleMapContext): VisibleMapContext {
  return {
    screen: context.screen,
    activeEntityId: context.activeEntityId,
    activeRouteId: context.activeRouteId,
    activeCollectionId: context.activeCollectionId,
    visibleEntityIds: context.visibleEntityIds.slice(0, 40),
    activeFilter: context.activeFilter,
    district: context.district,
    allowedActions: context.allowedActions,
  };
}
