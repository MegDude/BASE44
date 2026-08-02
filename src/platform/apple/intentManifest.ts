import type { MapIntent, MapToolId } from "../intelligence/mapCapabilities";

export type AppleReadyIntentDefinition = {
  id: string;
  mapIntent: MapIntent;
  phrases: string[];
  requiredTools: MapToolId[];
  requiresAuthentication?: boolean;
  requiresInAppConfirmation?: boolean;
  canonicalRoute: string;
};

export const appleReadyIntentManifest: AppleReadyIntentDefinition[] = [
  {
    id: "find-downtown-perks",
    mapIntent: "find_perk",
    phrases: ["Find a resident perk near me.", "What can I do downtown after work?"],
    requiredTools: ["search_entities", "get_active_perks"],
    canonicalRoute: "/map?mode=resident&filter=Perks",
  },
  {
    id: "open-saved-place",
    mapIntent: "show_saved",
    phrases: ["Open my saved Downtown Perks places.", "Show the restaurant I saved."],
    requiredTools: ["save_entity"],
    requiresAuthentication: true,
    canonicalRoute: "/map?mode=resident&tab=saved&filter=Featured&collection=downtown-perks-featured",
  },
  {
    id: "start-route",
    mapIntent: "start_route",
    phrases: ["Start my Rainey evening route.", "Continue my Downtown Perks route."],
    requiredTools: ["get_route", "start_route", "open_directions"],
    canonicalRoute: "/map?mode=resident&tab=routes",
  },
  {
    id: "show-resident-card",
    mapIntent: "show_resident_card",
    phrases: ["Open my Downtown Perks card.", "Show my resident QR."],
    requiredTools: ["show_resident_card"],
    requiresAuthentication: true,
    requiresInAppConfirmation: true,
    canonicalRoute: "/map?mode=resident&tab=pass&filter=Featured&collection=downtown-perks-featured",
  },
  {
    id: "use-perk",
    mapIntent: "use_resident_benefit",
    phrases: ["Show my perk at this venue."],
    requiredTools: ["get_perk_eligibility", "show_resident_card"],
    requiresAuthentication: true,
    requiresInAppConfirmation: true,
    canonicalRoute: "/map?mode=resident&filter=Perks",
  },
  {
    id: "open-directions",
    mapIntent: "continue_route",
    phrases: ["Take me to the next stop."],
    requiredTools: ["get_route", "open_directions"],
    canonicalRoute: "/map?mode=resident",
  },
];
