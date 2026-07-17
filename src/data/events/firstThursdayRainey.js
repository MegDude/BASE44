const BASE_EVENT_ID = "hotel-van-zandt-first-thursday";
const MAP_EVENT_ID = `event-${BASE_EVENT_ID}`;
const NEXT_OCCURRENCE_ISO = "2026-08-06T18:00:00-05:00";

const eventCore = {
  baseId: BASE_EVENT_ID,
  mapEntityId: MAP_EVENT_ID,
  title: "First Thursday Moves to Rainey Street",
  venueName: "Hotel Van Zandt + Modern Bar",
  hostPartnerId: "partner-hotel-van-zandt",
  district: "Rainey",
  address: "605 Davis St, Austin, TX 78701",
  latitude: 30.2588,
  longitude: -97.7392,
  nextOccurrence: NEXT_OCCURRENCE_ISO,
  scheduleLabel: "Every first Thursday · 6-10 PM",
  afterpartyLabel: "Modern Bar afterparty at 10 PM",
  category: "Live Music",
  source: {
    publisher: "Explore ATX",
    author: "Nick Hayden",
    publishedAt: "2026-05-28",
  },
};

const residentSummary = "First Thursday now anchors on Rainey Street with music at Hotel Van Zandt, an afterparty at Modern Bar, and nearby parties up and down the block.";

const residentDescription = "The monthly First Thursday party moved from South Congress Hotel to Rainey Street after South Congress Hotel closed on May 31, 2026. Start at Hotel Van Zandt for two floors of local music, then continue next door to Modern Bar or walk to nearby Rainey parties at Bungalow, Augustine, Lucille's, and Victory Lap.";

const partnerInsight = "Best for measuring Rainey event demand, RSVP interest, free GA versus VIP intent, afterparty movement to Modern Bar, and nearby bar-hopping from Hotel Van Zandt to Bungalow, Augustine, Lucille's, and Victory Lap.";

export const firstThursdayRaineyEvent = Object.freeze({
  ...eventCore,
  summary: residentSummary,
  description: residentDescription,
  partnerInsight,
});

export function getFirstThursdayRaineyMapEvent() {
  return {
    id: eventCore.baseId,
    canonicalMapEntityId: eventCore.mapEntityId,
    map_entity_id: eventCore.mapEntityId,
    partnerId: eventCore.hostPartnerId,
    partner_id: eventCore.hostPartnerId,
    parentId: eventCore.hostPartnerId,
    name: eventCore.title,
    category: eventCore.category,
    categoryKey: "first_thursday rainey hotel_van_zandt modern_bar live_music nightlife rsvp vip",
    latitude: eventCore.latitude,
    longitude: eventCore.longitude,
    district: eventCore.district,
    address: eventCore.address,
    time: eventCore.scheduleLabel,
    date: eventCore.nextOccurrence,
    eventDuration: "6-10 PM · afterparty at 10 PM",
    eventRoom: eventCore.venueName,
    image: "/images/map-entities/hotels-nearby/hotel-van-zandt-lounge.webp",
    rsvpCount: 126,
    tags: [
      "First Thursday",
      "Hotel Van Zandt",
      "Modern Bar",
      "Rainey Street",
      "Live Music",
      "Nightlife",
      "RSVP",
      "VIP",
      "Explore ATX",
    ],
    summary: residentSummary,
    description: residentDescription,
    offer: "GA free on arrival, subject to capacity. VIP includes skip-the-line entry, lounge bites, dedicated bar, and afterparty access.",
    price: "GA free · VIP available",
    addOn: eventCore.afterpartyLabel,
    checkIn: "Arrive early. GA entry is capacity-based.",
    reservation: "RSVP recommended. VIP access is separate.",
    primaryAction: "RSVP",
    secondaryAction: "Save",
    related: [
      eventCore.hostPartnerId,
      "partner-geraldines",
      "partner-modern-bar",
      "featured-bangers",
      "district-rainey-st-historic",
    ],
    goodFor: ["Rainey night out", "Live music", "After-work plans", "Hotel guests", "Downtown residents"],
    included: [
      "Two floors of local music",
      "King Louie and local DJs",
      "Modern Bar afterparty",
      "Nearby Rainey parties",
      "Free GA entry while capacity allows",
      "VIP skip-the-line option",
    ],
    schedule: [
      { isoDate: eventCore.nextOccurrence, label: "First Thursday", duration: "6-10 PM", room: "Hotel Van Zandt", className: "Live music across two floors" },
      { isoDate: "2026-08-06T22:00:00-05:00", label: "Afterparty", duration: "10 PM-late", room: "Modern Bar", className: "Afterparty next door" },
      { isoDate: "2026-08-06T18:00:00-05:00", label: "Rainey takeover", duration: "Evening", room: "Bungalow, Augustine, Lucille's, Victory Lap", className: "Nearby parties within a short walk" },
    ],
    panelHeadline: eventCore.title,
    panelBody: residentSummary,
    quickFacts: [
      "Rainey Street",
      "Every first Thursday",
      "6-10 PM",
      "Modern Bar afterparty",
      "GA free while capacity allows",
      "VIP available",
    ],
    partnerInsight,
    source: "Explore ATX / Downtown Perks event layer",
    sourceAttribution: eventCore.source,
    conversionActions: ["RSVP", "Directions", "Save", "VIP interest", "Afterparty click"],
  };
}
