import { getEntityKind, type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

function nearbyHas(nearby: NearbyRecommendation[], pattern: RegExp) {
  return nearby.some((item) => pattern.test([
    item.entity?.name,
    item.entity?.category,
    item.entity?.type,
    item.entity?.kind,
    item.entity?.summary,
  ].filter(Boolean).join(" ").toLowerCase()));
}

function selectedText(entity: MapEntity = {}) {
  return [
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.category_key,
    entity?.type,
    entity?.kind,
    entity?.summary,
    entity?.description,
    entity?.raw?.id,
    entity?.raw?.name,
    entity?.raw?.category,
    entity?.raw?.category_key,
    entity?.raw?.summary,
    entity?.raw?.description,
  ].filter(Boolean).join(" ").toLowerCase();
}

export function recommendCampaigns({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const kind = getEntityKind(selectedEntity);
  const text = selectedText(selectedEntity);
  const isDining = /\b(dining|restaurant|bar|coffee|cocktail|pizza|burger|cafe)\b/.test(text) || ["dining", "coffee", "nightlife"].some((item) => kind.includes(item));
  const isMobility = /\b(rivian|mobility|test drive|ride request|vehicle|ev|trail coffee)\b/.test(text);
  const isPublicArt = /\b(public art|mosaic|walking route|art and culture|public art trail)\b/.test(text);
  const hasHotels = nearbyHas(nearby, /\bhotel|guest|hospitality\b/);
  const hasResidential = nearbyHas(nearby, /\bresidence|residential|building|apartment|condo|waterline|shore|independent\b/);
  const hasEvents = nearbyHas(nearby, /\bevent|concert|show|music|festival|tonight\b/);
  const recommendations: any[] = [];

  if (isMobility) {
    recommendations.push({
      actionTitle: "Downtown test-drive window",
      whyNow: "People are already planning errands, workouts, coffee, and dinner nearby. The vehicle works best when it fits into that existing route.",
      bestAudience: "Residents, hotel guests, wellness groups, and weekend visitors.",
      suggestedTiming: "Weekend mornings and late afternoon",
      expectedOutcome: "More drive requests, route saves, and qualified follow-up.",
      setupPath: "Request",
    });
    recommendations.push({
      actionTitle: "Event ride request",
      whyNow: hasEvents ? "Nearby events create a clear arrival and departure moment." : "Rides make the activation useful when people are choosing what to do next.",
      bestAudience: "Eventgoers, rooftop guests, hotel visitors, and dinner groups.",
      suggestedTiming: "Before and after active event windows",
      expectedOutcome: "More ride requests and stronger event attribution.",
      setupPath: "Route",
    });
    return recommendations;
  }

  if (isPublicArt) {
    recommendations.push({
      actionTitle: "Civic discovery route",
      whyNow: "This stop works best when it helps residents connect public art, parks, trails, food, and nearby events into one easy downtown plan.",
      bestAudience: "Residents in nearby buildings, culture partners, hotel guests, and people already exploring downtown.",
      suggestedTiming: "Weekend afternoons, building welcome moments, and civic event days",
      expectedOutcome: "More saved stops, directions, and nearby places opened after the route.",
      setupPath: "Add to route",
    });
    return recommendations;
  }

  if (isDining) {
    recommendations.push({
      actionTitle: "After-work dining offer",
      whyNow: hasResidential || hasHotels ? "Residents and hotel guests are close enough for short-window plans." : "Simple dining offers convert fast nearby intent.",
      bestAudience: [hasResidential ? "Residents" : "", hasHotels ? "Hotel guests" : "", "Nearby diners"].filter(Boolean).join(", "),
      suggestedTiming: "Weekday 4-7 PM",
      expectedOutcome: "More saves and directions.",
      setupPath: "Launch",
    });
  }
  if (hasEvents) {
    recommendations.push({
      actionTitle: "Event-window boost",
      whyNow: "Nearby events create before-and-after plan demand.",
      bestAudience: "Event guests and groups.",
      suggestedTiming: "Two hours before and after event windows",
      expectedOutcome: "More directions during event traffic.",
      setupPath: "Boost",
    });
  }
  if (hasResidential) {
    recommendations.push({
      actionTitle: "Resident perk",
      whyNow: "Nearby buildings create a repeat local audience.",
      bestAudience: "Residents and leasing teams.",
      suggestedTiming: "Always-on or weekday evening",
      expectedOutcome: "More saves and repeat visits.",
      setupPath: "Create",
    });
  }
  if (hasHotels) {
    recommendations.push({
      actionTitle: "Hotel guest offer",
      whyNow: "Hotel guests nearby make quick local decisions.",
      bestAudience: "Guests and concierges.",
      suggestedTiming: "Thursday-Sunday",
      expectedOutcome: "More guest discovery.",
      setupPath: "Feature",
    });
  }

  if (!recommendations.length) {
    const entityName = selectedEntity?.name || selectedEntity?.title || "this pin";
    const district = selectedEntity?.district || selectedEntity?.neighborhood || "nearby downtown blocks";
    recommendations.push({
      actionTitle: `Test ${entityName} with one focused placement`,
      whyNow: `${entityName} needs a clear nearby reason tied to ${district}, not a generic campaign.`,
      bestAudience: selectedEntity?.category || selectedEntity?.type || "Nearby residents and visitors",
      suggestedTiming: selectedEntity?.status === "open" || selectedEntity?.openNow ? "When the pin is active nearby" : "Use the next active window",
      expectedOutcome: "Clearer saves, directions, and follow-up reporting for this specific entity.",
      setupPath: "Plan",
    });
  }

  return recommendations.slice(0, 4);
}
