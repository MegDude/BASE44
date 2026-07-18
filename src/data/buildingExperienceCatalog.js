export const BUILDING_AMENITY_GROUPS = [
  { id: "wellness", label: "Wellness", terms: ["fitness", "gym", "yoga", "pool", "sauna", "steam", "spa", "recovery", "wellness"] },
  { id: "work", label: "Work", terms: ["cowork", "co-work", "meeting", "business", "office", "booth", "wifi", "conference"] },
  { id: "social", label: "Social", terms: ["lounge", "rooftop", "roof deck", "bbq", "grill", "game", "cinema", "theater", "club", "entertaining"] },
  { id: "convenience", label: "Convenience", terms: ["package", "locker", "bike", "ev charging", "concierge", "parking", "pet wash", "storage", "valet", "delivery"] },
];

export const BUILDING_COLLECTION_RULES = [
  { id: "everyday", title: "Everyday", terms: ["coffee", "breakfast", "lunch", "grocery", "market", "pharmacy", "cleaner", "printing"], intent: "Everyday nearby" },
  { id: "evening", title: "Evening", terms: ["happy hour", "wine", "cocktail", "dinner", "bar", "live music", "nightlife"], intent: "Evening nearby" },
  { id: "wellness", title: "Wellness", terms: ["wellness", "fitness", "gym", "pilates", "spa", "recovery", "running", "yoga"], intent: "Wellness nearby" },
  { id: "culture", title: "Culture", terms: ["museum", "art", "market", "theatre", "theater", "public art", "gallery", "civic"], intent: "Culture nearby" },
  { id: "entertainment", title: "Entertainment", terms: ["comedy", "sports", "cinema", "event", "family", "music"], intent: "Events nearby" },
  { id: "pet-friendly", title: "Pet friendly", terms: ["dog", "pet", "vet", "patio", "trail", "park"], intent: "Pet friendly nearby" },
  { id: "work-nearby", title: "Work nearby", terms: ["coffee", "cowork", "printing", "business lunch", "meeting", "office"], intent: "Work nearby" },
];

export const BUILDING_IDENTITY_RULES = [
  { label: "Waterfront", terms: ["lake", "river", "waterfront", "trail"] },
  { label: "Wellness", terms: ["wellness", "fitness", "yoga", "spa", "pool", "sauna"] },
  { label: "Social", terms: ["social", "rooftop", "lounge", "entertaining", "nightlife"] },
  { label: "Work-friendly", terms: ["cowork", "meeting", "business", "wifi", "office"] },
  { label: "Pet-friendly", terms: ["pet", "dog", "pet wash"] },
  { label: "Walkable", terms: ["walk", "walkable", "downtown", "rainey"] },
  { label: "Arts and culture", terms: ["art", "culture", "museum", "gallery", "theatre", "theater"] },
  { label: "Quiet retreat", terms: ["quiet", "private", "retreat", "calm", "garden"] },
];

export const BUILDING_CAMPAIGN_RULES = [
  { id: "welcome-home", family: "Welcome home", title: "Meet your neighborhood", terms: ["walk", "nearby", "neighborhood", "downtown"], audience: "New residents", time: "First 30 days", radiusMeters: 1200 },
  { id: "wellness-routine", family: "Lifestyle", title: "Healthy month", terms: ["wellness", "fitness", "pool", "yoga", "spa", "trail"], audience: "Residents interested in wellness", time: "Four weeks", radiusMeters: 1600 },
  { id: "coffee-passport", family: "Lifestyle", title: "Coffee passport", terms: ["coffee", "cowork", "work", "morning"], audience: "Morning and workday residents", time: "Weekday mornings", radiusMeters: 1200 },
  { id: "evening-plan", family: "Resident exclusive", title: "Date night", terms: ["dining", "dinner", "cocktail", "wine", "nightlife", "social"], audience: "Residents planning an evening out", time: "Thursday–Saturday", radiusMeters: 1800 },
  { id: "dog-friendly-weekend", family: "Lifestyle", title: "Dog-friendly weekend", terms: ["pet", "dog", "park", "trail", "patio"], audience: "Residents with pets", time: "Weekend", radiusMeters: 1600 },
  { id: "neighborhood-walk", family: "Community", title: "Neighborhood walk", terms: ["walk", "trail", "art", "culture", "park", "waterfront"], audience: "Building residents", time: "Weekend mornings", radiusMeters: 2200 },
];
