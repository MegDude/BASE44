import { getEntityKind, type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

function names(items: NearbyRecommendation[]) {
  return items.slice(0, 3).map((item) => item.entity?.name || item.entity?.title).filter(Boolean);
}

function matches(item: NearbyRecommendation, pattern: RegExp) {
  return pattern.test([
    item.entity?.name,
    item.entity?.title,
    item.entity?.category,
    item.entity?.kind,
    item.entity?.type,
    item.entity?.summary,
  ].filter(Boolean).join(" ").toLowerCase());
}

export function getNearbyPartnerOpportunities({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const opportunities: any[] = [];
  const add = (title: string, group: NearbyRecommendation[], recommendedAction: string, confidenceLevel = "Medium") => {
    if (!group.length) return;
    const nearbyNames = names(group);
    opportunities.push({
      title,
      reason: `${nearbyNames.join(", ")} ${group.length === 1 ? "is" : "are"} active nearby.`,
      supportingEntities: nearbyNames,
      distanceContext: group[0]?.distanceLabel ? `Closest: ${group[0].distanceLabel}` : "Nearby context",
      recommendedAction,
      confidenceLevel,
    });
  };
  const residential = nearby.filter((item) => getEntityKind(item.entity).includes("property") || matches(item, /\b(residence|residential|building|apartment|condo|waterline|shore|independent)\b/));
  const hotels = nearby.filter((item) => getEntityKind(item.entity).includes("hotel") || matches(item, /\bhotel|guest|hospitality\b/));
  const events = nearby.filter((item) => getEntityKind(item.entity).includes("event") || matches(item, /\bevent|concert|show|music|festival|tonight\b/));
  const perks = nearby.filter((item) => matches(item, /\b(perk|offer|inkind|discount|resident)\b/));
  const nightlife = nearby.filter((item) => matches(item, /\b(bar|cocktail|nightlife|music|happy hour|drinks)\b/));

  add("Residential Nearby", residential, "Resident perk opportunity.", residential.length >= 2 ? "High" : "Medium");
  add("Hotel Guests Nearby", hotels, "Guest-friendly offer opportunity.", hotels.length >= 2 ? "High" : "Medium");
  add("Events Nearby", events, "Before-and-after event window.", events.length >= 2 ? "High" : "Medium");
  add("Perks Nearby", perks, "Compare active offers first.", perks.length >= 2 ? "Medium" : "Low");
  add("Dining Cluster Nearby", nightlife, "Dinner, drinks, or late-plan opportunity.", nightlife.length >= 2 ? "High" : "Medium");

  if (!opportunities.length) {
    opportunities.push({
      title: "Map Context Nearby",
      reason: "Nearby places can anchor one focused local test.",
      supportingEntities: names(nearby),
      distanceContext: nearby[0]?.distanceLabel || "Nearby context",
      recommendedAction: "Start with a small offer.",
      confidenceLevel: "Low",
    });
  }

  return opportunities.slice(0, 4);
}
