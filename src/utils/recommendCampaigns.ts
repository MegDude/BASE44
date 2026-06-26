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

export function recommendCampaigns({
  selectedEntity,
  nearby = [],
}: {
  selectedEntity: MapEntity;
  nearby: NearbyRecommendation[];
}) {
  const kind = getEntityKind(selectedEntity);
  const text = `${selectedEntity?.name || ""} ${selectedEntity?.category || ""} ${selectedEntity?.type || ""}`.toLowerCase();
  const isDining = /\b(dining|restaurant|bar|coffee|cocktail|pizza|burger|cafe)\b/.test(text) || ["dining", "coffee", "nightlife"].some((item) => kind.includes(item));
  const hasHotels = nearbyHas(nearby, /\bhotel|guest|hospitality\b/);
  const hasResidential = nearbyHas(nearby, /\bresidence|residential|building|apartment|condo|waterline|shore|independent\b/);
  const hasEvents = nearbyHas(nearby, /\bevent|concert|show|music|festival|tonight\b/);
  const recommendations: any[] = [];

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
