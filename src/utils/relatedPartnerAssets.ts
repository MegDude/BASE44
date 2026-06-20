import { getEntityKind, type NearbyRecommendation } from "./nearbyRecommendations";

function labelFor(entity: Record<string, any>) {
  const kind = getEntityKind(entity);
  if (kind.includes("event")) return "Event";
  if (kind.includes("hotel")) return "Hotel";
  if (kind.includes("property")) return "Residential";
  if (kind.includes("perk") || /perk|offer|inkind/i.test(`${entity?.summary || ""} ${entity?.category || ""}`)) return "Perk";
  if (kind.includes("brand")) return "Brand";
  if (kind.includes("civic")) return "Civic";
  const text = `${entity?.category || ""} ${entity?.type || ""} ${entity?.kind || ""}`.toLowerCase();
  if (/\b(drink|drinks|bar|cocktail|nightlife|beer|happy hour)\b/.test(text)) return "Drinks";
  if (/\b(dining|restaurant|food|coffee|cafe|pizza|burger)\b/.test(text)) return "Dining";
  if (/\b(wellness|fitness|spa|recovery|yoga)\b/.test(text)) return "Wellness";
  if (/\b(retail|shop|store)\b/.test(text)) return "Retail";
  if (/\b(culture|art|music|museum|gallery)\b/.test(text)) return "Culture";
  return "Places";
}

function groupLabelFor(type: string) {
  if (type === "Hotel") return "Hotels";
  if (type === "Residential") return "Residential";
  if (type === "Perk") return "Perks";
  if (type === "Event") return "Events";
  if (type === "Dining") return "Dining";
  if (type === "Drinks") return "Drinks";
  if (type === "Wellness") return "Wellness";
  if (type === "Retail") return "Retail";
  if (type === "Culture") return "Culture";
  return "Places";
}

function headlineFor(group: string) {
  const headlines: Record<string, string> = {
    Dining: "Where people eat nearby",
    Drinks: "Where plans continue nearby",
    Hotels: "Places guests discover nearby",
    Residential: "Buildings shaping local routines",
    Events: "Moments pulling people nearby",
    Perks: "Offers people can use nearby",
    Wellness: "Wellness stops close by",
    Retail: "Useful shops nearby",
    Culture: "Culture and civic stops nearby",
    Places: "Useful places around this pin",
  };
  return headlines[group] || "Useful places around this pin";
}

export function getRelatedPartnerAssets({ nearby = [] }: { nearby: NearbyRecommendation[] }) {
  const groups = new Map<string, any[]>();
  const groupOrder = ["Dining", "Drinks", "Hotels", "Residential", "Events", "Perks", "Wellness", "Retail", "Culture", "Places"];
  nearby.forEach((item) => {
    const type = labelFor(item.entity);
    const groupLabel = groupLabelFor(type);
    const current = groups.get(groupLabel) || [];
    current.push({
      entity: item.entity,
      title: item.entity?.name || item.entity?.title,
      type: type === "Residential" ? "Residential" : type,
      district: item.entity?.district || "Downtown Austin",
      distance: item.distanceLabel,
      status: /perk|offer|inkind/i.test(`${item.entity?.summary || ""} ${item.entity?.category || ""}`) ? "Offer nearby" : "",
      actionLabel: "Open",
    });
    groups.set(groupLabel, current);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
    .map(([title, items]) => ({ title, label: title, headline: headlineFor(title), items: items.slice(0, 8) }))
    .filter((section) => section.items.length);
}
