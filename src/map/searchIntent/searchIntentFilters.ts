import type { MapEntity } from "@/data/map/mapEntitySchema";
import type { MapVisibilityMode, SearchIntent } from "./searchIntentTypes";

const UTILITY_ONLY_INTENTS: SearchIntent[] = [
  "services",
  "utilities",
  "printing",
  "cleaning",
  "pharmacy",
  "bike_share",
  "visitor_info",
  "shipping",
];

function entityText(entity: MapEntity): string {
  return [
    entity.title,
    entity.kind,
    entity.category,
    entity.neighborhood,
    entity.address,
    entity.visibilityMode,
    entity.utilityType,
    entity.offerType,
    ...(entity.tags || []),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function isSearchOnlyUtility(entity: MapEntity): boolean {
  return (
    entity.utilityType === "parking" ||
    entity.utilityType === "printing" ||
    entity.utilityType === "cleaning" ||
    entity.utilityType === "pharmacy" ||
    entity.utilityType === "charging" ||
    entity.utilityType === "bike_share" ||
    entity.utilityType === "visitor_info" ||
    entity.utilityType === "shipping" ||
    entity.utilityType === "coworking" ||
    entity.utilityType === "repair" ||
    entity.visibilityMode === "utility" ||
    entity.visibilityMode === "parking"
  );
}

export function isDefaultVisibleEntity(entity: MapEntity): boolean {
  if (!entity.active) return false;

  return (
    entity.visibilityMode === "default" ||
    entity.visibilityMode === "partners" ||
    entity.perkStatus === "active" ||
    entity.kind === "wellness" ||
    entity.tags.includes("wellness") ||
    entity.tags.includes("fitness") ||
    entity.tags.includes("happy-hour") ||
    entity.tags.includes("happy_hour") ||
    entity.offerType === "happy_hour"
  );
}

export function getVisibilityModeForIntent(intent: SearchIntent): MapVisibilityMode {
  if (intent === "parking" || intent === "ev_charging") return "parking";
  if (UTILITY_ONLY_INTENTS.includes(intent)) return "utility";
  if (intent === "perks") return "perks";
  return "default";
}

export function filterEntitiesByIntent(
  entities: MapEntity[],
  intent: SearchIntent,
): MapEntity[] {
  const mode = getVisibilityModeForIntent(intent);

  return entities.filter((entity) => {
    if (!entity.active) return false;
    const text = entityText(entity);

    if (mode === "default") {
      if (intent === "all") return isDefaultVisibleEntity(entity) && !isSearchOnlyUtility(entity);
      if (intent === "wellness") {
        return entity.kind === "wellness" || entity.utilityType === "wellness" || entity.tags.includes("wellness") || /\b(spa|salon|massage|self care|beauty|recovery|wellness)\b/.test(text);
      }
      if (intent === "fitness") {
        return entity.tags.includes("fitness") || /\b(fitness|pilates|gym|workout|yoga|running)\b/.test(text);
      }
      if (intent === "happy_hour") {
        return entity.tags.includes("happy-hour") || entity.tags.includes("happy_hour") || entity.offerType === "happy_hour" || text.includes("happy hour");
      }
      return isDefaultVisibleEntity(entity) && text.includes(intent.replace(/_/g, " "));
    }

    if (mode === "parking") {
      return (
        entity.visibilityMode === "parking" ||
        entity.utilityType === "parking" ||
        entity.utilityType === "charging" ||
        (intent === "ev_charging" && /\b(ev|charging|chargepoint|tesla)\b/.test(text))
      );
    }

    if (mode === "utility") {
      if (intent === "utilities") return isSearchOnlyUtility(entity);
      return entity.visibilityMode === "utility" || entity.utilityType === intent || text.includes(intent.replace(/_/g, " "));
    }

    if (mode === "perks") {
      return Boolean(entity.perkEligible || entity.perkStatus === "active" || entity.perkStatus === "candidate");
    }

    if (mode === "admin") return true;

    return false;
  });
}
