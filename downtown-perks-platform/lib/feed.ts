import type { RankedLocation } from "./map-ranking";
import type { UserContext } from "./intent-parser";

export interface FeedCard {
  type: "best" | "trending" | "boosted" | "context";
  title: string;
  subtitle: string;
  item?: RankedLocation;
}

export function generateFeed(
  items: RankedLocation[],
  context: UserContext | null,
): FeedCard[] {
  const feed: FeedCard[] = [];
  const bestId = items[0]?.id;

  if (items[0]) {
    feed.push({
      type: "best",
      title: `${items[0].name} is your best move`,
      subtitle: `${items[0].distance} · ${items[0].perk}`,
      item: items[0],
    });
  }

  // Trending: high popularity, not already surfaced as best
  items
    .filter((i) => (i.popularity ?? 0) > 7 && i.id !== bestId)
    .slice(0, 2)
    .forEach((item) => {
      feed.push({
        type: "trending",
        title: `${item.name} is picking up`,
        subtitle: "Popular right now",
        item,
      });
    });

  // Boosted partner placements
  items
    .filter((i) => i.boost?.active && i.id !== bestId)
    .forEach((item) => {
      feed.push({
        type: "boosted",
        title: `${item.name} · Partner offer`,
        subtitle: item.perk,
        item,
      });
    });

  // Contextual card based on time-of-day inference
  if (context?.intent === "dinner") {
    feed.push({
      type: "context",
      title: "Top dinner spots nearby",
      subtitle: "Open and walkable",
    });
  } else if (context?.intent === "drinks") {
    feed.push({
      type: "context",
      title: "Nightlife picks nearby",
      subtitle: "Open now",
    });
  } else if (
    context?.intent === "breakfast" ||
    context?.intent === "lunch"
  ) {
    feed.push({
      type: "context",
      title: "Coffee & café stops nearby",
      subtitle: "Ready for you",
    });
  }

  return feed.slice(0, 5);
}
