import type { MapLocation } from "@/app/data/mapData";
import type { ParsedIntent, UserContext } from "./intent-parser";
import type { BehaviorProfile } from "./behavior";

export type RankedLocation = MapLocation & { score: number };

type IntentLike = ParsedIntent | UserContext | null;

// Maps display categories (from mapData) to intent categories (from parseIntent)
const CATEGORY_MAP: Record<string, string> = {
  cafe: "coffee",
  coffee: "coffee",
  dining: "food",
  food: "food",
  restaurant: "food",
  nightlife: "nightlife",
  bar: "nightlife",
  hotel: "hotel",
  coworking: "coworking",
  work: "coworking",
};

function normalizeCategory(cat: string): string {
  return CATEGORY_MAP[cat.toLowerCase()] ?? cat.toLowerCase();
}

function parseDistance(raw: string): number {
  const n = parseFloat(raw);
  return isNaN(n) ? 5 : n; // miles; default 5 if unparseable
}

export function applyBoost(item: MapLocation): number {
  if (!item.boost?.active) return 0;
  if (item.boost.expiresAt && Date.now() > item.boost.expiresAt) return 0;
  return Math.min(item.boost.weight ?? 1, 3);
}

export function rankItems(
  items: MapLocation[],
  intent: IntentLike,
  profile: BehaviorProfile,
): RankedLocation[] {
  const w = (intent as ParsedIntent)?.weights ?? {
    proximity: 0.4,
    relevance: 0.4,
    popularity: 0.2,
  };
  const intentCat = intent?.category?.toLowerCase() ?? null;

  return items
    .map((item): RankedLocation => {
      const distMiles = parseDistance(item.distance);
      const normalCat = normalizeCategory(item.category);
      let score = 0;

      // Proximity: closer = higher. Max effective radius 2 mi → 0–5 pts.
      score += Math.max(0, (2 - distMiles) * 5) * w.proximity;

      // Relevance: exact category match
      if (intentCat && normalCat === intentCat) {
        score += 10 * w.relevance;
      }

      // Popularity: 0–10 scale
      score += (item.popularity ?? 5) * w.popularity;

      // Behavior: personal signals from localStorage
      score += (profile.category[normalCat] ?? 0) * 0.5;
      score += (profile.venue[item.id] ?? 0) * 1.0;

      // Partner boost
      score += applyBoost(item) * 0.2;

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
}
