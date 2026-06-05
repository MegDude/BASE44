export type HappyHourVenue = {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  district: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  website?: string;
  description?: string;
  happyHours: {
    days: string;
    startTime: string;
    endTime: string;
    specials: string;
    notes?: string;
    isLateNight?: boolean;
  }[];
  parking?: string;
  images: {
    imageUrl?: string;
    featuredImage?: string;
    heroImage?: string;
    galleryImages?: string[];
    logo?: string;
    categoryImage?: string;
    imageStatus: "verified" | "fallback" | "needsVenueImage";
  };
  tags: string[];
  downtownPerksUse: {
    mapPin: boolean;
    venueDrawer: boolean;
    happyHourCard: boolean;
    residentPerkCandidate: boolean;
    partnerLeadCandidate: boolean;
    campaignCandidate: boolean;
  };
  sources: {
    name: "ATX FYI Happy Hour Guide" | "Happy Hour Austin";
    url?: string;
    lastVerified: string;
  }[];
  rating?: number | null;
  featured?: boolean;
  isLiveToday?: boolean;
  needsReview?: boolean;
  verificationNotes?: string[];
};

const atxSource = { name: "ATX FYI Happy Hour Guide" as const, lastVerified: "2026-05-27" };
const hhaSource = { name: "Happy Hour Austin" as const, url: "https://happyhouraustin.buzz/", lastVerified: "2026-06-04" };
const useAll = {
  mapPin: true,
  venueDrawer: true,
  happyHourCard: true,
  residentPerkCandidate: true,
  partnerLeadCandidate: true,
  campaignCandidate: true,
};

const coordsByName: Record<string, [number, number]> = {
  "24 Diner": [30.27283, -97.75316],
  Aris: [30.27221, -97.75924],
  "ATX Cocina": [30.26572, -97.74953],
  "Banger's Sausage House & Beer Garden": [30.2588, -97.7386],
  "Bar Peached": [30.27319, -97.75973],
  "Barchi Sushi": [30.26608, -97.74522],
  "Better Half Coffee & Cocktails": [30.27534, -97.76111],
  "Bill's Oyster": [30.26582, -97.74631],
  "Dean's Italian Steakhouse": [30.26435, -97.74244],
  "Dumont's Down Low": [30.26668, -97.74551],
  "Fixe Southern House": [30.26779, -97.74812],
  "Geraldine's": [30.2587, -97.7392],
  Halcyon: [30.26677, -97.74597],
  "La Condesa": [30.26522, -97.74765],
  "Las Perlas": [30.26736, -97.73922],
  "Lambert's": [30.26518, -97.74741],
  "Maiko Sushi Lounge": [30.26837, -97.74537],
  "North Italia": [30.26591, -97.74901],
  "Numero 28": [30.26547, -97.74834],
  P6: [30.26388, -97.74112],
  "Péché": [30.26671, -97.74568],
  "Perry's Steakhouse": [30.27003, -97.74268],
  "Roosevelt Room": [30.26755, -97.74564],
  "Truluck's": [30.26609, -97.74523],
  Verbena: [30.27083, -97.75097],
  "Wu Chow": [30.26779, -97.74812],
  Zanzibar: [30.2644, -97.74102],
  "Barley Swine": [30.25578, -97.76275],
  "Clark's Oyster Bar": [30.27268, -97.76353],
  "Aba Austin": [30.24862, -97.75086],
  "Güero's Taco Bar": [30.24992, -97.74928],
  "Lucky Robot": [30.24946, -97.74994],
  "Two Hands": [30.25177, -97.74871],
  "Half Step": [30.25855, -97.73808],
  "Stagger Lee": [30.2587, -97.73822],
  Tenten: [30.26943, -97.7463],
  "Star Bar": [30.2708, -97.7504],
  Speakeasy: [30.26677, -97.7433],
  "Cheer Up Charlie's": [30.2692, -97.7364],
  "Pelon's": [30.26855, -97.73755],
  "Scholz Garten": [30.27732, -97.73637],
  "Devil May Care": [30.26716, -97.74527],
};

const tagLibrary = {
  burgers: ["burger", "cheeseburger"],
  pizza: ["pizza", "flatbread"],
  bbq: ["bbq", "barbecue"],
  sushi: ["sushi", "nigiri", "sake"],
  seafood: ["seafood"],
  oysters: ["oyster"],
  italian: ["italian", "aperol", "sangria"],
  mexican: ["mexican", "taco", "tacos", "margarita", "guac", "tamal", "mezcal", "paloma"],
  southern: ["southern", "biscuit"],
  chinese: ["chinese"],
  cocktails: ["cocktail", "cocktails", "martini", "mocktail", "margarita"],
  wine: ["wine", "wines", "bottles"],
  beer: ["beer", "beers", "draft", "high life", "kolsch"],
  martinis: ["martini", "martinis"],
  mezcal: ["mezcal"],
  tequila: ["tequila", "margarita"],
  whiskey: ["whiskey"],
  sake: ["sake"],
  rooftop: ["rooftop"],
  patio: ["patio"],
  "late-night": ["late night", "close", "12am", "all night"],
  "date-night": ["steakhouse", "cocktail lounge", "rooftop", "wine"],
  "group-friendly": ["beer garden", "pub", "garden", "bar"],
  casual: ["diner", "beer", "snacks", "burger", "bar"],
  upscale: ["steakhouse", "oyster", "rooftop", "wine", "chef"],
  "live-music": ["live music", "music"],
  weekday: ["mon-fri", "mon-thu", "tue-fri", "weekday"],
  weekend: ["fri-sat", "sat", "sun"],
  "all-day": ["all day", "all night"],
  "after-work": ["3pm", "4pm", "5pm", "6pm"],
};

function slug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function normalizeVenueName(value: string): string {
  return slug(value.replace(/&/g, "and").replace(/’/g, "'"));
}

export function normalizeAddress(value?: string): string {
  return slug(value || "");
}

function imageStatus(image?: string): HappyHourVenue["images"]["imageStatus"] {
  if (!image) return "needsVenueImage";
  return image.toLowerCase().includes("fallback") ? "fallback" : "verified";
}

function inferTags(input: {
  name: string;
  category: string;
  district: string;
  days: string;
  startTime: string;
  endTime: string;
  specials: string;
  tags?: string[];
}) {
  const text = [input.name, input.category, input.district, input.days, input.startTime, input.endTime, input.specials, ...(input.tags || [])]
    .join(" ")
    .toLowerCase();
  const inferred = Object.entries(tagLibrary)
    .filter(([, needles]) => needles.some((needle) => text.includes(needle)))
    .map(([tag]) => tag);
  return Array.from(new Set([
    "happy-hour",
    "downtown",
    ...inferred,
    ...(input.tags || []).map((tag) => tag.toLowerCase().replace(/\s+/g, "-")),
    input.category.toLowerCase().replace(/\s*\+\s*/g, "-").replace(/\s+/g, "-"),
    input.district.toLowerCase().replace(/\s+/g, "-"),
  ]));
}

function venue(input: {
  name: string;
  category: string;
  district: string;
  address?: string;
  website?: string;
  days: string;
  startTime: string;
  endTime: string;
  specials: string;
  parking?: string;
  tags?: string[];
  source?: "atx" | "hha";
  image?: string;
  rating?: number;
  featured?: boolean;
  notes?: string;
  needsReview?: boolean;
}): HappyHourVenue {
  const coords = coordsByName[input.name];
  return {
    id: `happy-hour-${slug(input.name)}`,
    name: input.name,
    category: input.category,
    district: input.district,
    address: input.address,
    lat: coords?.[0] ?? null,
    lng: coords?.[1] ?? null,
    website: input.website,
    description: `${input.name} has a happy hour worth knowing about, with food and drink specials that are easy to use when you're already nearby.`,
    happyHours: [{ days: input.days, startTime: input.startTime, endTime: input.endTime, specials: input.specials, notes: input.notes, isLateNight: /10PM|Close|12AM/i.test(`${input.startTime} ${input.endTime}`) }],
    parking: input.parking,
    images: { imageUrl: input.image, featuredImage: input.image, heroImage: input.image, imageStatus: imageStatus(input.image) },
    tags: inferTags(input),
    downtownPerksUse: useAll,
    sources: [input.source === "hha" ? hhaSource : atxSource],
    rating: input.rating ?? null,
    featured: input.featured,
    isLiveToday: input.source === "hha",
    needsReview: input.needsReview,
    verificationNotes: input.needsReview ? ["Schedule or source detail needs a quick partner/source review."] : undefined,
  };
}

const atxFyiVenues: HappyHourVenue[] = [
  venue({ name: "24 Diner", category: "Restaurant", district: "West End", address: "600 N Lamar Blvd", website: "https://www.24diner.com", days: "Mon-Fri", startTime: "3PM", endTime: "6PM", specials: "$4 local canned beer, $5 wine, $8 seasonal frozen, $5 snacks", parking: "Small free lot", tags: ["Breakfast", "Burgers", "Comfort Food"] }),
  venue({ name: "Aris", category: "Steakhouse", district: "West 6th", address: "1111 W 6th St", website: "https://arisrestaurant.us", days: "Daily", startTime: "5PM", endTime: "6:30PM", specials: "50% off cocktails, $10 wines, oysters, burger, skewers", parking: "Valet", notes: "Monday special: Wagyu Mondays 50% off" }),
  venue({ name: "ATX Cocina", category: "Mexican", district: "Second Street", address: "110 San Antonio St #170", website: "https://www.atxcocina.com", days: "Mon-Thu", startTime: "5PM", endTime: "6PM", specials: "$10 cocktails, $9 guac, tacos, tamal", parking: "Silicon Labs Garage" }),
  venue({ name: "Banger's Sausage House & Beer Garden", category: "Beer Garden", district: "Rainey", address: "79 Rainey St", website: "https://www.bangersaustin.com", days: "Mon-Fri", startTime: "5PM", endTime: "6PM", specials: "$3 snacks, $5 sausages, $4 beer", parking: "Nearby garages" }),
  venue({ name: "Half Step", category: "Cocktail Bar", district: "Rainey", address: "75 1/2 Rainey St", website: "https://www.halfstepbar.com", days: "Tue-Fri", startTime: "5PM", endTime: "7PM", specials: "Cocktail and beer specials", tags: ["cocktails", "patio", "casual"], needsReview: true }),
  venue({ name: "Stagger Lee", category: "Bar", district: "Rainey", address: "87 Rainey St", days: "Mon-Fri", startTime: "4PM", endTime: "7PM", specials: "After-work drink specials", tags: ["beer", "cocktails", "patio"], needsReview: true }),
  venue({ name: "Bar Peached", category: "Asian Fusion", district: "West 6th", address: "1315 W 6th St", website: "https://barpeached.com", days: "Daily", startTime: "5PM", endTime: "6:30PM", specials: "$5 beer, $7 cocktails, tacos, burger", notes: "Tuesday: Bulgogi Steak & Frites. Wednesday: Malaysian Fried Chicken." }),
  venue({ name: "Barchi Sushi", category: "Sushi", district: "Downtown Core", address: "206 Colorado St", website: "https://www.barchisushi.com", days: "Mon-Sat", startTime: "3PM", endTime: "7PM", specials: "Sushi, nigiri, sake, martinis", notes: "Late night Fri-Sat 10PM-12AM" }),
  venue({ name: "Better Half Coffee & Cocktails", category: "Coffee + Cocktails", district: "West Austin", address: "406 Walsh St", website: "https://www.betterhalfbar.com", days: "Tue-Fri", startTime: "3PM", endTime: "6PM", specials: "$6 cheeseburger, $6 sangria" }),
  venue({ name: "Bill's Oyster", category: "Oyster Bar", district: "Second Street", address: "205 W 3rd St", website: "https://www.billsoyster.com", days: "Daily", startTime: "3PM", endTime: "5:30PM", specials: "$3 oysters, $10 burger, 50% wine" }),
  venue({ name: "Dean's Italian Steakhouse", category: "Steakhouse", district: "Downtown Core", address: "110 E 2nd St", website: "https://www.deanssteakhouseaustin.com", days: "Daily", startTime: "5PM", endTime: "6:30PM", specials: "$8 wines, $9 cocktails, $10 plates" }),
  venue({ name: "Dumont's Down Low", category: "Whiskey Bar", district: "Warehouse District", address: "214 W 4th St", website: "https://dumontsaustin.com", days: "Mon-Fri", startTime: "5PM", endTime: "7PM", specials: "$5 cocktails, $3 beers" }),
  venue({ name: "Fixe Southern House", category: "Southern", district: "Downtown Core", address: "500 W 5th St", website: "https://fixesouthernhouse.com", days: "Daily", startTime: "3PM", endTime: "6PM", specials: "$5-10 snacks, $10 sandwiches" }),
  venue({ name: "Geraldine's", category: "Rooftop Dining", district: "Rainey", address: "605 Davis St", website: "https://www.geraldinesaustin.com", days: "Mon-Fri", startTime: "5PM", endTime: "6PM", specials: "$7 cocktails" }),
  venue({ name: "Halcyon", category: "Coffee Bar", district: "Warehouse District", address: "218 W 4th St", website: "http://halcyoncoffeebar.com", days: "Daily variants", startTime: "", endTime: "", specials: "Coffee cocktails, beer, wine", needsReview: true }),
  venue({ name: "La Condesa", category: "Mexican", district: "Second Street", address: "400 W 2nd St", website: "https://lacondesa.com", days: "Mon-Fri", startTime: "5PM", endTime: "7PM", specials: "Half-off alcohol, $3 tacos" }),
  venue({ name: "Las Perlas", category: "Mezcal Bar", district: "Red River", address: "405 E 7th St", website: "https://www.instagram.com/lasperlasaustin", days: "Daily", startTime: "4PM", endTime: "8PM", specials: "Draft margaritas, palomas" }),
  venue({ name: "Lambert's", category: "BBQ", district: "Second Street", address: "401 W 2nd St", website: "https://lambertsaustin.com", days: "Mon All Day / Tue-Fri", startTime: "3PM", endTime: "5PM", specials: "Half-off bar menu" }),
  venue({ name: "Maiko Sushi Lounge", category: "Sushi", district: "West 6th", address: "311 W 6th St", website: "https://maikoaustin.com", days: "Daily", startTime: "5PM", endTime: "Close", specials: "Discounted sushi and sake", needsReview: true }),
  venue({ name: "Tenten", category: "Sushi", district: "West 6th", address: "501 W 6th St", website: "https://tentenatx.com", days: "Mon-Fri", startTime: "4PM", endTime: "6PM", specials: "Sushi, sake, cocktail, and wine specials", tags: ["sushi", "sake", "cocktails"], needsReview: true }),
  venue({ name: "Star Bar", category: "Sports Bar", district: "West 6th", address: "600 W 6th St", website: "https://www.starbaraustin.com", days: "Mon-Fri", startTime: "4PM", endTime: "7PM", specials: "Beer, wells, and casual after-work specials", tags: ["beer", "cocktails", "casual"], needsReview: true }),
  venue({ name: "North Italia", category: "Italian", district: "Second Street", address: "500 W 2nd St", website: "https://www.northitalia.com", days: "Mon All Day / Tue-Thu", startTime: "3PM", endTime: "6PM", specials: "Half-off bottles, snacks" }),
  venue({ name: "Numero 28", category: "Italian", district: "Second Street", address: "452 W 2nd St", website: "https://www.numero28austin.com", days: "Mon-Fri", startTime: "4:30PM", endTime: "6:30PM", specials: "Aperol Spritz, Sangria, Flatbreads" }),
  venue({ name: "P6", category: "Rooftop", district: "Lady Bird Lake", address: "111 E Cesar Chavez", website: "https://www.thelinehotels.com/austin/restaurants-bars/p6/", days: "Mon-Thu", startTime: "4PM", endTime: "5PM", specials: "Cocktails, wine, snacks" }),
  venue({ name: "Péché", category: "Cocktail Lounge", district: "Warehouse District", address: "208 W 4th St", website: "https://www.pecheaustin.com", days: "Sun-Mon", startTime: "All Night", endTime: "Close", specials: "50% off food, $6 cocktails", needsReview: true }),
  venue({ name: "Perry's Steakhouse", category: "Steakhouse", district: "Downtown Core", address: "114 W 7th St", website: "https://perryssteakhouse.com", days: "Mon-Fri", startTime: "4PM", endTime: "6:30PM", specials: "50% off bites and drinks" }),
  venue({ name: "Roosevelt Room", category: "Cocktail Bar", district: "Warehouse District", address: "307 W 5th St", website: "https://www.therooseveltroomatx.com", days: "Daily", startTime: "3PM", endTime: "6PM", specials: "Wine, food, beer discounts" }),
  venue({ name: "Speakeasy", category: "Cocktail Bar", district: "Warehouse District", address: "412 Congress Ave", website: "https://speakeasyaustin.com", days: "Mon-Fri", startTime: "4PM", endTime: "7PM", specials: "Cocktail and beer specials", tags: ["cocktails", "beer", "live-music"], needsReview: true }),
  venue({ name: "Truluck's", category: "Seafood", district: "Downtown Core", address: "400 Colorado St", website: "https://trulucks.com", days: "Daily", startTime: "4:30PM", endTime: "6PM", specials: "50% off liquor and select wines" }),
  venue({ name: "Verbena", category: "American", district: "West 6th", address: "612 W 6th St", website: "https://verbenaatx.com", days: "Mon-Fri", startTime: "3PM", endTime: "6PM", specials: "$2 oysters, $5 martinis" }),
  venue({ name: "Wu Chow", category: "Chinese", district: "Downtown Core", address: "500 W 5th St", website: "https://www.wuchowaustin.com", days: "Mon-Fri", startTime: "5PM", endTime: "6PM", specials: "Extensive food menu + $8 cocktails" }),
  venue({ name: "Cheer Up Charlie's", category: "Bar", district: "Red River", address: "900 Red River St", website: "https://cheerupcharlies.com", days: "Mon-Fri", startTime: "4PM", endTime: "7PM", specials: "Casual drink specials before shows", tags: ["beer", "cocktails", "patio", "live-music"], needsReview: true }),
  venue({ name: "Pelon's", category: "Mexican", district: "Red River", address: "802 Red River St", website: "https://pelonsaustin.com", days: "Mon-Fri", startTime: "3PM", endTime: "6PM", specials: "Margaritas, beer, and Mexican food specials", tags: ["mexican", "tequila", "patio"], needsReview: true }),
  venue({ name: "Scholz Garten", category: "Beer Garden", district: "Red River", address: "1607 San Jacinto Blvd", website: "https://www.scholzgarten.com", days: "Mon-Fri", startTime: "3PM", endTime: "6PM", specials: "Beer garden happy hour specials", tags: ["beer", "patio", "group-friendly"], needsReview: true }),
  venue({ name: "Devil May Care", category: "Cocktail Lounge", district: "Warehouse District", address: "500 W 6th St", website: "https://devilmaycareatx.com", days: "Tue-Fri", startTime: "5PM", endTime: "7PM", specials: "Cocktails, oysters, and lounge specials", tags: ["oysters", "cocktails", "date-night", "upscale"], needsReview: true }),
];

const happyHourAustinVenues: HappyHourVenue[] = [
  venue({ name: "77 Degrees Rooftop", category: "Rooftop", district: "The Domain", days: "Today", startTime: "3:00PM", endTime: "7:00PM", specials: "$5 wells, $4 Mexican beers", source: "hha", image: "77degrees.png" }),
  venue({ name: "Aba Austin", category: "Mediterranean", district: "South Congress", days: "Today", startTime: "4:00PM", endTime: "6:00PM", specials: "$7-8 wines, $7 draft cocktails, $5 beers", source: "hha", image: "bar-fallback-09.webp" }),
  venue({ name: "Güero's Taco Bar", category: "Mexican", district: "South Congress", days: "Today", startTime: "3:00PM", endTime: "6:00PM", specials: "$5.75 classic margaritas, $2.25 signature margarita specials", source: "hha", image: "bar-fallback-35.webp" }),
  venue({ name: "CRÚ Food & Wine Bar - The Domain", category: "Wine Bar", district: "The Domain", days: "Today", startTime: "3:00PM", endTime: "5:30PM", specials: "$9 white wine pours, $9 red wine pours", source: "hha", image: "Cru.jpg" }),
  venue({ name: "Barley Swine", category: "Restaurant", district: "Downtown", days: "Today", startTime: "5:00PM", endTime: "6:30PM", specials: "$7 draft cocktails, $3 off draft beers, 25% off bar items", source: "hha", image: "bar-fallback-07.webp" }),
  venue({ name: "Culinary Dropout", category: "Restaurant", district: "The Domain", days: "Today", startTime: "2:00PM", endTime: "5:00PM", specials: "$5 wine, $8 classics, cocktail specials", source: "hha", image: "cul-drop.jpeg" }),
  venue({ name: "La Condesa", category: "Mexican", district: "Downtown", days: "Featured", startTime: "5PM", endTime: "7PM", specials: "50% off drinks", source: "hha", image: "LaCond_68WGaRk.jpg", rating: 4.9, featured: true }),
  venue({ name: "Clark's Oyster Bar", category: "Oyster Bar", district: "West 6th", days: "Featured", startTime: "", endTime: "", specials: "Half-off martinis, $5 oyster shooters", source: "hha", image: "Clarks.jpg", rating: 5.0, featured: true, needsReview: true }),
  venue({ name: "Better Half Coffee & Cocktails", category: "Coffee + Cocktails", district: "Campus", days: "Featured", startTime: "3PM", endTime: "6PM", specials: "$3.50 High Life, $6 sangria, $4 Carl Kolsch, $6 cheeseburgers", source: "hha", image: "Better_half.jpeg", rating: 5.0, featured: true }),
  venue({ name: "Zanzibar", category: "Rooftop", district: "Downtown", days: "Featured", startTime: "", endTime: "", specials: "$10 specialty cocktails, $8 mocktails, $7 draft beers", source: "hha", image: "Zanzibar.jpg", rating: 5.0, featured: true, needsReview: true }),
  venue({ name: "Two Hands", category: "Restaurant", district: "South Congress", days: "Featured", startTime: "", endTime: "", specials: "$3 off signature cocktails, $2 off beer and wine, 50% off bottles of wine Wednesday", source: "hha", image: "9D3A5235-6693-4B75-BEA9-AAB2DE142B39-min.webp", featured: true, needsReview: true }),
  venue({ name: "Lucky Robot", category: "Sushi", district: "South Congress", days: "Featured", startTime: "", endTime: "", specials: "$9 cocktails", source: "hha", image: "Luckrob-1.jpg", featured: true, needsReview: true }),
];

export function mergeVenueSources(primary: HappyHourVenue, secondary: HappyHourVenue): HappyHourVenue {
  const notes = [...(primary.verificationNotes || []), ...(secondary.verificationNotes || [])];
  const conflict = primary.address && secondary.address && normalizeAddress(primary.address) !== normalizeAddress(secondary.address);
  if (conflict) notes.push(`Address conflict: ${primary.address} / ${secondary.address}`);
  const latestSecondary = secondary.sources.some((item) => item.name === "Happy Hour Austin");
  return {
    ...primary,
    district: primary.district || secondary.district,
    category: primary.category || secondary.category,
    website: primary.website || secondary.website,
    happyHours: latestSecondary ? secondary.happyHours : primary.happyHours,
    images: {
      ...primary.images,
      ...Object.fromEntries(Object.entries(secondary.images).filter(([, value]) => value)),
      imageStatus: secondary.images.imageStatus !== "needsVenueImage" ? secondary.images.imageStatus : primary.images.imageStatus,
    },
    tags: Array.from(new Set([...primary.tags, ...secondary.tags])),
    sources: [...primary.sources, ...secondary.sources].filter((source, index, list) => list.findIndex((item) => item.name === source.name) === index),
    rating: secondary.rating ?? primary.rating,
    featured: primary.featured || secondary.featured,
    isLiveToday: primary.isLiveToday || secondary.isLiveToday,
    needsReview: primary.needsReview || secondary.needsReview || conflict,
    verificationNotes: notes.length ? notes : undefined,
  };
}

export function dedupeHappyHourVenues(venues: HappyHourVenue[]): HappyHourVenue[] {
  const byKey = new Map<string, HappyHourVenue>();
  for (const item of venues) {
    const addressKey = normalizeAddress(item.address);
    const key = addressKey ? `${normalizeVenueName(item.name)}:${addressKey}` : `${normalizeVenueName(item.name)}:${normalizeVenueName(item.district)}`;
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeVenueSources(existing, item) : item);
  }
  return Array.from(byKey.values());
}

export const happyHourInventory = dedupeHappyHourVenues([...atxFyiVenues, ...happyHourAustinVenues]);

export type HappyHourCollection = {
  id: string;
  title: string;
  venueIds: string[];
  queryTags: string[];
};

function collection(id: string, title: string, venues: HappyHourVenue[], queryTags: string[]): HappyHourCollection {
  return {
    id,
    title,
    venueIds: venues.map((venue) => venue.id),
    queryTags,
  };
}

const byName = (names: string[]) => happyHourInventory.filter((venue) => names.includes(venue.name));
const byDistrict = (district: string) => happyHourInventory.filter((venue) => venue.district === district);
const byTag = (tag: string) => happyHourInventory.filter((venue) => venue.tags.includes(tag));
const byUnderTen = () => happyHourInventory.filter((venue) => /\$(?:[0-9]|10)\b|50%|half-off|half off/i.test(venue.happyHours.map((item) => item.specials).join(" ")));

export const happyHourCollections: HappyHourCollection[] = [
  collection("best-oyster-happy-hours", "Best Oyster Happy Hours", byName(["Bill's Oyster", "Verbena", "Truluck's", "Aris", "Devil May Care"]), ["oysters", "seafood", "martinis"]),
  collection("rooftop-happy-hours", "Rooftop Happy Hours", byName(["P6", "Geraldine's", "Zanzibar", "77 Degrees Rooftop"]), ["rooftop", "cocktails", "after-work"]),
  collection("under-10", "Under $10", byUnderTen(), ["under-10", "cheap-drinks", "after-work"]),
  collection("rainey-street-happy-hours", "Rainey Street Happy Hours", byDistrict("Rainey"), ["rainey", "patio", "beer", "cocktails"]),
  collection("west-6th-happy-hours", "West 6th Happy Hours", byDistrict("West 6th"), ["west-6th", "cocktails", "after-work"]),
  collection("second-street-happy-hours", "Second Street Happy Hours", byDistrict("Second Street"), ["second-street", "dining", "cocktails"]),
  collection("martini-happy-hours", "Martini Happy Hours", byTag("martinis"), ["martinis", "cocktails"]),
  collection("wine-happy-hours", "Wine Happy Hours", byTag("wine"), ["wine", "date-night"]),
  collection("beer-happy-hours", "Beer Happy Hours", byTag("beer"), ["beer", "casual"]),
];

export type DowntownPerksHappyHourVenue = {
  id: string;
  name: string;
  category: string;
  district: string;
  address: string;
  neighborhood: string;
  website: string;
  description: string;
  imageUrl: string;
  logoUrl: string;
  coordinates: { lat: number; lng: number };
  happyHour: {
    active: boolean;
    days: string[];
    startTime: string;
    endTime: string;
    specials: string[];
    featuredItems: string[];
  };
  parking: string;
  tags: string[];
  source: "ATX FYI";
  lastVerified: string;
};

export const downtownPerksHappyHourVenues: DowntownPerksHappyHourVenue[] = happyHourInventory
  .filter((venue) => venue.sources.some((source) => source.name === "ATX FYI Happy Hour Guide"))
  .map((venue) => {
    const first = venue.happyHours[0] || { days: "", startTime: "", endTime: "", specials: "" };
    const atxSourceRecord = venue.sources.find((source) => source.name === "ATX FYI Happy Hour Guide");
    return {
      id: venue.id,
      name: venue.name,
      category: venue.category,
      district: venue.district,
      address: venue.address || "",
      neighborhood: venue.district,
      website: venue.website || "",
      description: venue.description || "",
      imageUrl: venue.images.heroImage || venue.images.featuredImage || venue.images.imageUrl || "",
      logoUrl: venue.images.logo || "",
      coordinates: { lat: venue.lat || 0, lng: venue.lng || 0 },
      happyHour: {
        active: true,
        days: first.days.split(/\s*\/\s*|\s*,\s*/).filter(Boolean),
        startTime: first.startTime,
        endTime: first.endTime,
        specials: first.specials.split(/\s*,\s*/).filter(Boolean),
        featuredItems: venue.tags.filter((tag) => ["oysters", "martinis", "rooftop", "patio", "wine", "beer", "cocktails", "sushi", "burgers"].includes(tag)),
      },
      parking: venue.parking || "",
      tags: venue.tags,
      source: "ATX FYI",
      lastVerified: atxSourceRecord?.lastVerified || "2026-05-27",
    };
  });
