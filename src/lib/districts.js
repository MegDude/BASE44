export const DISTRICTS = {
  rainey: {
    label: "Rainey District",
    x: 72,
    y: 78,
    center: { lat: 30.2587, lng: -97.7386 },
    keywords: ["rainey", "bar", "nightlife", "rooftop", "music"]
  },
  west6: {
    label: "West 6th",
    x: 45,
    y: 58,
    center: { lat: 30.2694, lng: -97.7499 },
    keywords: ["west 6th", "drinks", "happy hour", "nightlife"]
  },
  redriver: {
    label: "Red River",
    x: 68,
    y: 52,
    center: { lat: 30.2682, lng: -97.7363 },
    keywords: ["red river", "music", "live", "venue", "show"]
  },
  seaholm: {
    label: "Seaholm",
    x: 38,
    y: 66,
    center: { lat: 30.2661, lng: -97.7524 },
    keywords: ["seaholm", "coffee", "fitness", "shopping", "market"]
  },
  cbd: {
    label: "Central Business District",
    x: 56,
    y: 56,
    center: { lat: 30.2672, lng: -97.7431 },
    keywords: ["downtown", "office", "lunch", "business", "hotel"]
  },
  east: {
    label: "East Austin Edge",
    x: 84,
    y: 62,
    center: { lat: 30.2645, lng: -97.7315 },
    keywords: ["east", "food", "music", "bar", "arts"]
  }
};

export function inferDistrictFromQuery(query = "") {
  const q = query.toLowerCase();
  const match = Object.entries(DISTRICTS).find(([, district]) =>
    district.keywords.some((keyword) => q.includes(keyword))
  );

  return match ? match[0] : "cbd";
}
