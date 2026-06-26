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

function entityText(entity: MapEntity = {}) {
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
    entity?.district,
    entity?.raw?.id,
    entity?.raw?.name,
    entity?.raw?.category,
    entity?.raw?.category_key,
    entity?.raw?.summary,
    entity?.raw?.description,
  ].filter(Boolean).join(" ").toLowerCase();
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
  const selectedText = entityText(selectedEntity);
  const isMobility = /\b(rivian|mobility|test drive|ride request|vehicle|ev|trail coffee)\b/.test(selectedText);
  const isPublicArt = /\b(public art|mosaic|walking route|civic|art and culture)\b/.test(selectedText);

  if (isMobility) {
    add(audiences, "Residents", "Residents can fold the vehicle into errands, workouts, coffee stops, and weekend plans.", properties, "Route to test-drive requests or resident access windows.");
    add(audiences, "Hotel Guests", "Hotel guests need simple ways to move from the lobby to events, dinner, rooftops, and the trail.", hotels, "Use ride requests and curated downtown routes.");
    add(audiences, "Event Guests", "Nearby events create a natural reason to request a ride or book a short drive.", events, "Time the Rivian presence around arrivals and departures.");
    add(audiences, "Trail + Coffee Crowd", "Coffee, trail, and wellness stops make the activation feel like part of the day.", [...dining, ...civic], "Connect the drive to a walkable morning route.");
    return audiences.slice(0, 4);
  }

  if (isPublicArt) {
    add(audiences, "Walkers", "Nearby civic anchors make this useful for self-guided downtown routes.", civic, "Connect the stop to a public art trail.");
    add(audiences, "Visitors", "Hotels and landmark stops nearby can turn this into an easy discovery moment.", hotels, "Position it as a free cultural stop.");
    add(audiences, "Residents", "Residents nearby can use it as a short walk, photo stop, or family-friendly pause.", properties, "Add it to resident walking guides.");
    return audiences.slice(0, 4);
  }

  add(audiences, "Residents", "Nearby residents can turn this pin into a saved place, short walk, or repeat routine.", properties, "Connect it to the most relevant resident action.");
  add(audiences, "Hotel Guests", "Nearby hotels shape quick dining, event, and experience decisions.", hotels, "Make the next step easy for guests already nearby.");
  add(audiences, "Event Guests", "Nearby events create pre- and post-plan demand.", events, "Time the offer around events.");
  add(audiences, "Dining Audience", "Nearby food and drink options show what people are already comparing in this part of downtown.", dining, "Position the offer around the specific place and time people are choosing.");
  add(audiences, "Civic Audience", "Nearby civic and public-space anchors show where residents are already moving, meeting, or spending time.", civic, "Connect the pin to the most relevant public-space, event, or neighborhood context.");

  if (!audiences.length) {
    audiences.push({
      segment: selectedText.includes("hotel") ? "Hotel Guests" : "Nearby Visitors",
      reason: "The nearby map context gives you a clear place to start.",
      nearbyEvidence: evidence.slice(0, 3).map((item) => item.name || item.title).filter(Boolean),
      recommendedAction: "Choose one specific action people can take from this pin.",
    });
  }

  return audiences.slice(0, 4);
}
