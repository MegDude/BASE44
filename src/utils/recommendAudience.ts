import { getEntityKind, type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

function hasText(entity: MapEntity, pattern: RegExp) {
  return pattern.test([
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.type,
    entity?.kind,
    entity?.summary,
    entity?.district,
  ].filter(Boolean).join(" ").toLowerCase());
}

export function recommendAudience({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const evidence = nearby.map((item) => item.entity);
  const add = (items: any[], segment: string, reason: string, matches: MapEntity[], action: string) => {
    if (!matches.length) return;
    items.push({
      segment,
      reason,
      nearbyEvidence: matches.slice(0, 3).map((item) => item.name || item.title).filter(Boolean),
      recommendedAction: action,
    });
  };
  const audiences: any[] = [];
  const properties = evidence.filter((entity) => getEntityKind(entity).includes("property") || hasText(entity, /\b(residence|residential|building|apartment|condo|waterline|shore|independent)\b/));
  const hotels = evidence.filter((entity) => getEntityKind(entity).includes("hotel") || hasText(entity, /\bhotel|suites|guest|hospitality\b/));
  const events = evidence.filter((entity) => getEntityKind(entity).includes("event") || hasText(entity, /\bevent|concert|show|music|festival|tonight\b/));
  const dining = evidence.filter((entity) => hasText(entity, /\b(dining|restaurant|coffee|bar|cocktail|happy hour|pizza|burger|cafe)\b/));
  const civic = evidence.filter((entity) => hasText(entity, /\b(civic|park|trail|museum|library|waterloo|public)\b/));
  const selectedText = `${selectedEntity?.category || ""} ${selectedEntity?.type || ""} ${selectedEntity?.name || ""}`.toLowerCase();

  add(audiences, "Residents", "Nearby buildings support repeat local behavior.", properties, "Create a resident offer.");
  add(audiences, "Hotel Guests", "Nearby hotels shape quick dining and experience decisions.", hotels, "Create a guest-friendly offer.");
  add(audiences, "Event Guests", "Nearby events create pre- and post-plan demand.", events, "Time the offer around events.");
  add(audiences, "Dining Audience", "Food and drink nearby create an active comparison set.", dining, "Give them one clear reason.");
  add(audiences, "Civic Audience", "Public spaces nearby create walkable discovery moments.", civic, "Pair this pin with a route.");

  if (!audiences.length) {
    audiences.push({
      segment: selectedText.includes("hotel") ? "Hotel Guests" : "Nearby Visitors",
      reason: "Immediate map context is the clearest signal.",
      nearbyEvidence: evidence.slice(0, 3).map((item) => item.name || item.title).filter(Boolean),
      recommendedAction: "Start with one simple offer.",
    });
  }

  return audiences.slice(0, 4);
}
