export interface ParsedIntent {
  category: string | null;
  timeContext: "morning" | "afternoon" | "night" | null;
  area: string | null;
  openNow: boolean;
  radius: number;
  weights: { proximity: number; relevance: number; popularity: number };
}

export interface UserContext {
  intent: "breakfast" | "lunch" | "dinner" | "drinks" | null;
  category: string | null;
  openNow: boolean;
  weights: { proximity: number; relevance: number; popularity: number };
}

export function parseIntent(query: string): ParsedIntent | null {
  if (!query?.trim()) return null;
  const q = query.toLowerCase();

  let category: string | null = null;
  if (
    q.includes("dinner") ||
    q.includes("eat") ||
    q.includes("food") ||
    q.includes("restaurant")
  ) {
    category = "food";
  } else if (
    q.includes("coffee") ||
    q.includes("cafe") ||
    q.includes("latte") ||
    q.includes("espresso")
  ) {
    category = "coffee";
  } else if (
    q.includes("drinks") ||
    q.includes("bar") ||
    q.includes("nightlife") ||
    q.includes("cocktail")
  ) {
    category = "nightlife";
  } else if (q.includes("hotel") || q.includes("stay") || q.includes("room")) {
    category = "hotel";
  } else if (
    q.includes("work") ||
    q.includes("cowork") ||
    q.includes("office")
  ) {
    category = "coworking";
  }

  const openNow =
    q.includes("now") || q.includes("open") || q.includes("tonight");

  let timeContext: ParsedIntent["timeContext"] = null;
  if (q.includes("morning") || q.includes("breakfast"))
    timeContext = "morning";
  else if (
    q.includes("tonight") ||
    q.includes("night") ||
    q.includes("evening")
  )
    timeContext = "night";
  else if (q.includes("lunch") || q.includes("afternoon"))
    timeContext = "afternoon";

  let area: string | null = null;
  if (q.includes("rainey")) area = "rainey";
  else if (q.includes("downtown") || q.includes("congress")) area = "downtown";

  return {
    category,
    timeContext,
    area,
    openNow,
    radius: 10,
    weights: { proximity: 0.4, relevance: 0.4, popularity: 0.2 },
  };
}

// Auto-infer intent from time of day when there is no user query
export function getUserContext(): UserContext | null {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    return {
      intent: "breakfast",
      category: "coffee",
      openNow: true,
      weights: { proximity: 0.5, relevance: 0.3, popularity: 0.2 },
    };
  }
  if (hour >= 11 && hour < 14) {
    return {
      intent: "lunch",
      category: "food",
      openNow: true,
      weights: { proximity: 0.4, relevance: 0.4, popularity: 0.2 },
    };
  }
  if (hour >= 17 && hour <= 21) {
    return {
      intent: "dinner",
      category: "food",
      openNow: true,
      weights: { proximity: 0.3, relevance: 0.5, popularity: 0.2 },
    };
  }
  if (hour >= 22 || hour <= 2) {
    return {
      intent: "drinks",
      category: "nightlife",
      openNow: true,
      weights: { proximity: 0.3, relevance: 0.5, popularity: 0.2 },
    };
  }

  return null;
}
