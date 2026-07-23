import type { SearchIntent } from "./searchIntentTypes";

const INTENT_KEYWORDS: Record<SearchIntent, string[]> = {
  all: ["all", "everything"],
  coffee: ["coffee", "espresso", "cafe"],
  dining: ["dining", "restaurant", "eat", "food"],
  breakfast: ["breakfast", "morning"],
  lunch: ["lunch"],
  dinner: ["dinner"],
  drinks: ["drinks", "cocktails", "bar"],
  happy_hour: ["happy hour", "happy-hour", "deals", "specials", "drink specials"],
  events: ["events", "tonight", "weekend"],
  hotels: ["hotel", "stay", "guest"],
  properties: ["apartment", "building", "resident", "property"],
  wellness: ["wellness", "spa", "salon", "massage", "self care"],
  fitness: ["fitness", "pilates", "gym", "workout", "yoga"],
  shopping: ["shopping", "store"],
  retail: ["retail", "shop", "boutique"],
  civic: ["civic", "park", "museum", "library"],
  arts: ["arts", "gallery", "museum"],
  live_music: ["live music", "music", "show"],
  trending: ["trending", "popular"],
  saved: ["saved"],
  this_week: ["this week", "weekly"],
  legends: ["legends", "real estate", "listing"],
  inkind: ["inkind", "in kind"],
  services: ["services", "errands"],
  utilities: ["utility", "utilities", "transportation", "visitor services"],
  parking: ["parking", "garage", "valet", "park"],
  printing: ["print", "printing", "fedex", "copies"],
  cleaning: ["cleaner", "cleaning", "laundry", "dry clean"],
  pharmacy: ["pharmacy", "medicine", "cvs", "walgreens"],
  ev_charging: ["ev", "charging", "tesla", "chargepoint"],
  bike_share: ["bike", "metrobike"],
  visitor_info: ["visitor", "information", "tourist"],
  shipping: ["shipping", "mail", "package"],
  near_me: ["near me", "nearby", "closest"],
  perks: ["perk", "discount", "validation", "offer"],
};

export function parseSearchIntent(input: string): SearchIntent {
  const query = input.toLowerCase().trim();

  // Exact partner-program language must win before generic category words.
  // Without this guard, "inKind restaurants" is captured by Dining first.
  if (/\binkind\b|\bin\s+kind\b/.test(query)) {
    return "inkind";
  }

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((keyword) => query.includes(keyword))) {
      return intent as SearchIntent;
    }
  }

  return "all";
}

export function searchIntentToFilter(intent: SearchIntent): string {
  const map: Partial<Record<SearchIntent, string>> = {
    all: "All",
    coffee: "Coffee",
    dining: "Dining",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    drinks: "Drinks",
    happy_hour: "Happy Hour",
    events: "Events",
    hotels: "Hotels",
    properties: "Properties",
    wellness: "Wellness",
    fitness: "Fitness",
    shopping: "Retail",
    retail: "Retail",
    civic: "Civic",
    arts: "Arts & Culture",
    live_music: "Live Music",
    trending: "Trending",
    saved: "Saved",
    this_week: "This Week",
    legends: "Legends",
    inkind: "inKind",
    services: "Services",
    utilities: "Services",
    parking: "Parking",
    printing: "Printing",
    cleaning: "Cleaners",
    pharmacy: "Pharmacy",
    ev_charging: "EV Charging",
    bike_share: "Bike Share",
    visitor_info: "Visitor Info",
    shipping: "Shipping",
    near_me: "Nearby",
    perks: "Perks",
  };

  return map[intent] || "All";
}
