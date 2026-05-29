export const HAPPY_HOUR_STORAGE_KEY = "downtown-perks-happy-hours";

export const defaultHappyHours = [
  {
    id: "happy-hour-reina-rooftop",
    venueId: "reina-rooftop",
    name: "Reina Rooftop Happy Hour",
    venueName: "Reina Rooftop",
    type: "happy_hour",
    category: "Happy Hour",
    category_key: "happy_hour",
    markerType: "happy_hour",
    detailDrawerType: "happy_hour",
    pinKey: "happy-hour",
    latitude: 30.263998,
    longitude: -97.740641,
    district: "Downtown Austin",
    address: "206 Trinity Street, Austin, TX 78701",
    summary: "Rooftop drinks downtown, easy to save before dinner or a show.",
    happyHour: {
      days: "Mon-Fri",
      time: "4-6 PM",
      offer: "$2 off select cocktails and spritzes",
      details: "Best for after-work drinks, date-night starts, and a quick rooftop stop before dinner.",
      redemption: "Show your Downtown Perks Card before ordering.",
    },
    source: "Downtown Perks happy hour layer",
  },
  {
    id: "happy-hour-half-step",
    venueId: "half-step",
    name: "Half Step Happy Hour",
    venueName: "Half Step",
    type: "happy_hour",
    category: "Happy Hour",
    category_key: "happy_hour",
    markerType: "happy_hour",
    detailDrawerType: "happy_hour",
    pinKey: "happy-hour",
    latitude: 30.25806,
    longitude: -97.73805,
    district: "Rainey",
    address: "75 1/2 Rainey Street, Austin, TX 78701",
    summary: "A Rainey Street cocktail stop for residents looking for an easy first round.",
    happyHour: {
      days: "Tue-Fri",
      time: "5-7 PM",
      offer: "$1 off draft pours and select cocktails",
      details: "Good for small groups, pre-dinner plans, and meeting someone without overplanning the night.",
      redemption: "Show your Downtown Perks Card when you arrive.",
    },
    source: "Downtown Perks happy hour layer",
  },
  {
    id: "happy-hour-antones-nightclub",
    venueId: "antone-s-nightclub",
    name: "Antone's Pre-Show Happy Hour",
    venueName: "Antone's Nightclub",
    type: "happy_hour",
    category: "Happy Hour",
    category_key: "happy_hour",
    markerType: "happy_hour",
    detailDrawerType: "happy_hour",
    pinKey: "happy-hour",
    latitude: 30.26706,
    longitude: -97.73673,
    district: "East Downtown",
    address: "305 E 5th Street, Austin, TX 78701",
    summary: "A pre-show stop for residents heading toward live music downtown.",
    happyHour: {
      days: "Show nights",
      time: "5-7 PM",
      offer: "Resident pre-show drink special",
      details: "Use it before the room fills up, then keep the night close to Red River and East 6th.",
      redemption: "Show your card at the bar before the show.",
    },
    source: "Downtown Perks happy hour layer",
  },
  {
    id: "happy-hour-garage",
    venueId: "garage",
    name: "Garage Cocktail Hour",
    venueName: "Garage",
    type: "happy_hour",
    category: "Happy Hour",
    category_key: "happy_hour",
    markerType: "happy_hour",
    detailDrawerType: "happy_hour",
    pinKey: "happy-hour",
    latitude: 30.26733,
    longitude: -97.74407,
    district: "2nd Street",
    address: "503 Colorado Street, Austin, TX 78701",
    summary: "A compact cocktail stop near 2nd Street and Congress.",
    happyHour: {
      days: "Wed-Fri",
      time: "4:30-6:30 PM",
      offer: "Resident cocktail feature",
      details: "Good for a quieter drink before dinner, a show, or a walk toward the lake.",
      redemption: "Show your Downtown Perks Card before ordering.",
    },
    source: "Downtown Perks happy hour layer",
  },
];

export function getStoredHappyHours() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(HAPPY_HOUR_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    const seen = new Set();
    return stored.filter((item) => {
      const key = String(item.venueName || item.name || item.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

export function getHappyHourPlaces() {
  const stored = getStoredHappyHours();
  const storedByVenue = new Map(stored.map((item) => [String(item.venueName || item.name || "").toLowerCase(), item]));
  const mergedDefaults = defaultHappyHours.map((item) => {
    const key = String(item.venueName || item.name || "").toLowerCase();
    const override = storedByVenue.get(key);
    if (!override) return item;
    storedByVenue.delete(key);
    return { ...item, ...override, id: item.id };
  });
  return [...mergedDefaults, ...Array.from(storedByVenue.values())];
}

export function saveHappyHour(happyHour) {
  if (typeof window === "undefined") return happyHour;

  const stored = getStoredHappyHours();
  const id =
    happyHour.id ||
    `happy-hour-${String(happyHour.venueName || happyHour.name || "venue")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;
  const next = {
    ...happyHour,
    id,
    name: happyHour.name || `${happyHour.venueName} Happy Hour`,
    type: "happy_hour",
    category: "Happy Hour",
    category_key: "happy_hour",
    markerType: "happy_hour",
    detailDrawerType: "happy_hour",
    pinKey: "happy-hour",
    source: "Partner happy hour dashboard",
  };
  const nextVenueKey = String(next.venueName || next.name || id).toLowerCase();
  const merged = [
    next,
    ...stored.filter((item) => item.id !== id && String(item.venueName || item.name || item.id).toLowerCase() !== nextVenueKey),
  ];
  window.localStorage.setItem(HAPPY_HOUR_STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent("downtown-perks:happy-hours-updated", { detail: next }));
  return next;
}
