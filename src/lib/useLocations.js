import { useEffect, useState } from "react";
import data from "../data/locations.json";
import { luxuryPresenceBuildingPlaces } from "../data/luxuryPresenceInventory";
import { supplementalMapEntities } from "../data/supplementalMapEntities";
import { downtownPerksGoogleListImport } from "../data/downtownPerksGoogleListImport";
import { getRepublicAustinMapPlaces } from "../data/imports/republicAustinPins";
import { downtownParkingItems } from "../data/parkingBookings";
import { waterlooParkInventory } from "../data/waterlooParkInventory";
import { waterlooParkCampaignPins } from "../data/waterlooParkCampaignPins";
import { daaTourStops } from "../data/daaArtParksTour";
import { legendsListingPlaces } from "../data/legendsListings";
import { getHappyHourPlaces } from "./happyHours";
import { isDowntownAustin78701Entity } from "./map/downtownAustinScope";
import { normalizeEntity } from "./map/normalizeEntity";

function eventPlace({
  id,
  name,
  category,
  categoryKey,
  latitude,
  longitude,
  district,
  address,
  summary,
  rsvpCount,
  time,
  date,
  image,
  tags = [],
  partnerInsight = "",
}) {
  return {
    id: `event-${id}`,
    name,
    type: "event",
    category: `Event / ${category}`,
    category_key: ["event", categoryKey || category, district, ...tags].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude,
    longitude,
    district,
    address,
    summary,
    description: summary,
    rsvp_count: rsvpCount,
    time,
    date,
    image,
    tags,
    partnerInsight,
    source: "Downtown Perks event layer",
  };
}

function parkingBookingPlace(item) {
  return {
    id: item.id,
    name: item.title,
    type: "parking",
    kind: "parking",
    partnerType: "properties",
    markerType: "parking",
    detailDrawerType: "parking",
    pinKey: "mobility",
    category: "Parking / Resident Perk",
    category_key: [
      "parking",
      "resident perk",
      "reservable parking",
      item.buildingName,
      item.neighborhood,
      ...(item.spotTypes || []),
    ]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_"),
    latitude: item.lat,
    longitude: item.lng,
    district: item.neighborhood,
    address: item.address,
    summary: "Reserve nearby parking before you head out.",
    description: "Park close. Walk less. Do more downtown.",
    neighborhood_narrative: "Parking becomes part of the resident perk layer, helping people plan around downtown nights, events, and nearby restaurants without turning parking into a separate product.",
    alignment_to_downtown_perks: "Turn unused parking inventory into a resident perk and make it visible when people nearby are deciding where to go.",
    deals_offers: item.perkLabel || item.pricingLabel,
    specials: item.pricingLabel,
    image: item.imageUrl,
    isParkingBooking: true,
    hasPerk: true,
    perk: {
      title: item.perkLabel || "Resident parking rate",
      value: item.pricingLabel || "Resident rate available",
      description: "Reserve nearby parking before you head out.",
      isActive: true,
    },
    parkingBooking: item,
    source: "Downtown Perks parking booking layer",
  };
}

const eventPlaces = [
  eventPlace({
    id: "hotel-van-zandt-first-thursday",
    name: "Hotel Van Zandt First Thursday",
    category: "Happy Hour",
    categoryKey: "happy_hour hotel_van_zandt first_thursday",
    latitude: 30.2588,
    longitude: -97.7392,
    district: "Rainey",
    address: "605 Davis St, Austin, TX 78701",
    time: "Thu 13 · 5:00 PM",
    date: "2026-06-13T17:00:00-05:00",
    image: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
    rsvpCount: 68,
    tags: ["Hotel Van Zandt", "Geraldine's", "First Thursday", "Rainey", "Happy Hour", "Live Music"],
    summary: "A featured Rainey hotel moment connecting guests, residents, Geraldine's, happy hour, and nearby live music.",
    partnerInsight: "Useful for seeing how hotel guests and residents respond to First Thursday timing, Geraldine's traffic, saves, and nearby follow-on plans.",
  }),
  eventPlace({
    id: "geraldines-happy-hour-live-music",
    name: "Geraldine's Happy Hour + Live Music",
    category: "Live Music",
    categoryKey: "live_music happy_hour hotel_van_zandt",
    latitude: 30.2587,
    longitude: -97.7392,
    district: "Rainey",
    address: "605 Davis St, Austin, TX 78701",
    time: "Mon 10 · 6:00 PM",
    date: "2026-06-10T18:00:00-05:00",
    image: "/images/imported/perks/geraldine-s.jpg",
    rsvpCount: 74,
    tags: ["Hotel Van Zandt", "Geraldine's", "Live Music", "Rainey", "Happy Hour"],
    summary: "Dinner, drinks, and live music inside Hotel Van Zandt for residents and hotel guests already near Rainey.",
    partnerInsight: "Shows which audiences save music-led hotel programming and whether happy hour creates dinner, directions, and nearby venue interest.",
  }),
  eventPlace({
    id: "parker-jazz-club",
    name: "Parker Jazz Club",
    category: "Music",
    categoryKey: "music jazz downtown_calendar",
    latitude: 30.26832,
    longitude: -97.7404,
    district: "Downtown",
    address: "Parker Jazz Club, Downtown Austin, TX 78701",
    time: "Tue 11 · 8:30 PM",
    date: "2026-06-11T20:30:00-05:00",
    image: "/images/map-entities/rainey-bars/stay-put-jazz.jpeg",
    rsvpCount: 43,
    tags: ["Jazz", "Music", "Downtown calendar", "Date night", "Evening"],
    summary: "An intimate downtown jazz set with table service, low lights, and a room built for actually listening.",
    partnerInsight: "Shows late-evening save behavior, direction taps, and nearby dinner or drink interest before and after a music event.",
  }),
  eventPlace({
    id: "lobby-hour",
    name: "Lobby Hour",
    category: "Happy Hour",
    categoryKey: "happy_hour resident_meetup",
    latitude: 30.26698,
    longitude: -97.74562,
    district: "2nd Street",
    address: "The Paseo Lobby, Austin, TX 78701",
    time: "Mon 10 · 6:30 PM",
    date: "2026-06-10T18:30:00-05:00",
    image: "/images/buildings/lobby-to-street-arrival.png",
    rsvpCount: 34,
    tags: ["Resident meetup", "Lobby", "Happy Hour", "2nd Street"],
    summary: "A casual meet-up a couple blocks away. Drop in, meet a few neighbors, grab a drink, and let the night figure itself out.",
    partnerInsight: "Shows building-to-neighborhood movement, lobby QR interest, saves, and nearby places residents choose after the meetup.",
  }),
  eventPlace({
    id: "seaholm-happy-hour",
    name: "Seaholm Happy Hour",
    category: "Happy Hour",
    categoryKey: "happy_hour seaholm after_work",
    latitude: 30.26897,
    longitude: -97.75032,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    time: "Mon 10 · 5:00 PM",
    date: "2026-06-10T17:00:00-05:00",
    image: "/images/venues/downtown-dining-patio.png",
    rsvpCount: 41,
    tags: ["Seaholm", "After work", "Happy Hour"],
    summary: "A simple after-work stop near Seaholm for a quick drink, an easy dinner plan, or meeting someone before the night gets crowded.",
    partnerInsight: "Shows after-work timing, resident saves, and nearby dining interest around Seaholm.",
  }),
  eventPlace({
    id: "rainey-patio-night",
    name: "Rainey Patio Night",
    category: "Things to do",
    categoryKey: "things_to_do patio rainey",
    latitude: 30.25855,
    longitude: -97.73835,
    district: "Rainey",
    address: "Rainey Street, Austin, TX 78701",
    time: "Wed 12 · 7:00 PM",
    date: "2026-06-12T19:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 52,
    tags: ["Rainey", "Patio", "Night out", "Residents"],
    summary: "An easy night out for residents looking for music, drinks, and enough nearby spots to keep things interesting without overplanning.",
  }),
  eventPlace({
    id: "run-club",
    name: "Run Club",
    category: "Fitness",
    categoryKey: "fitness run_club",
    latitude: 30.27166,
    longitude: -97.75029,
    district: "Seaholm",
    address: "Shoal Creek Trailhead, Austin, TX 78701",
    time: "Fri 14 · 7:15 AM",
    date: "2026-06-14T07:15:00-05:00",
    image: "/images/residents/downtown-rooftop-evening.png",
    rsvpCount: 28,
    tags: ["Fitness", "Run club", "Coffee after", "Seaholm"],
    summary: "Start nearby, finish with coffee after. Built for residents who want movement without another app or group thread.",
  }),
  eventPlace({
    id: "coffee-walk",
    name: "Coffee Walk",
    category: "Things to do",
    categoryKey: "coffee_walk morning",
    latitude: 30.26472,
    longitude: -97.74604,
    district: "2nd Street",
    address: "2nd Street District, Austin, TX 78701",
    time: "Fri 14 · 9:00 AM",
    date: "2026-06-14T09:00:00-05:00",
    image: "/images/buildings/lobby-to-street-arrival.png",
    rsvpCount: 22,
    tags: ["Coffee", "Morning", "2nd Street", "Residents"],
    summary: "Meet downstairs, walk a few blocks, and grab coffee nearby. Easy, useful, and over before the day gets away from you.",
  }),
  eventPlace({
    id: "rooftop-social",
    name: "Rooftop Social",
    category: "Access",
    categoryKey: "access rooftop_social",
    latitude: 30.26491,
    longitude: -97.74375,
    district: "Congress",
    address: "Downtown Rooftop, Austin, TX 78701",
    time: "Sat 15 · 7:00 PM",
    date: "2026-06-15T19:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 46,
    tags: ["Rooftop", "Access", "Congress", "Residents"],
    summary: "Curated access for downtown residents. See who's going, RSVP, and use your card when you arrive.",
  }),
  eventPlace({
    id: "waterline-preview",
    name: "Waterline Preview Walk",
    category: "Local",
    categoryKey: "local preview_walk residential",
    latitude: 30.26072,
    longitude: -97.7392,
    district: "Rainey",
    address: "Waterline District, Austin, TX 78701",
    time: "Sat 15 · 4:30 PM",
    date: "2026-06-15T16:30:00-05:00",
    image: "/images/imported/perks/w-austin-lavaca-listing.jpg",
    rsvpCount: 31,
    tags: ["Waterline", "Preview", "Residential", "Rainey"],
    summary: "See what is opening nearby, what is walkable, and which places are worth keeping on your radar if you live downtown.",
  }),
  eventPlace({
    id: "sunday-brunch-card",
    name: "Sunday Brunch Card Perk",
    category: "Perk",
    categoryKey: "perk brunch card",
    latitude: 30.26458,
    longitude: -97.74412,
    district: "Congress",
    address: "Downtown Dining Partners, Austin, TX 78701",
    time: "Sun 16 · 11:30 AM",
    date: "2026-06-16T11:30:00-05:00",
    image: "/images/venues/downtown-dining-patio.png",
    rsvpCount: 38,
    tags: ["Brunch", "Perks Card", "Dining", "Residents"],
    summary: "Use your card at participating brunch spots and keep the plan simple: pick what is close, show the card, and sit down.",
  }),
  eventPlace({
    id: "morning-yoga-waterloo",
    name: "Morning Yoga at Waterloo Park",
    category: "Fitness",
    categoryKey: "fitness wellness waterloo",
    latitude: 30.27439,
    longitude: -97.73533,
    district: "Red River",
    address: "Waterloo Park, Austin, TX 78701",
    time: "Tue 18 · 7:30 AM",
    date: "2026-06-18T07:30:00-05:00",
    image: "/images/residents/downtown-rooftop-evening.png",
    rsvpCount: 28,
    tags: ["Waterloo Park", "Yoga", "Fitness", "Wellness"],
    summary: "Start your morning with a free community yoga session in Waterloo Park. All levels welcome. Bring a mat, water, and a neighbor.",
  }),
  eventPlace({
    id: "red-river-live-list",
    name: "Red River Live List",
    category: "Live Music",
    categoryKey: "live_music red_river",
    latitude: 30.26995,
    longitude: -97.7369,
    district: "Red River",
    address: "Red River Cultural District, Austin, TX 78701",
    time: "Tue 18 · 8:00 PM",
    date: "2026-06-18T20:00:00-05:00",
    image: "/images/partners/hospitality-rooftop-social.png",
    rsvpCount: 57,
    tags: ["Red River", "Live Music", "Tonight"],
    summary: "A quick look at what is actually worth catching tonight, grouped around places close enough to make the decision easy.",
  }),
  eventPlace({
    id: "monday-meetups-stay-put",
    name: "Monday Meetups at Stay Put",
    category: "Social",
    categoryKey: "social stay_put",
    latitude: 30.2589,
    longitude: -97.73805,
    district: "Rainey",
    address: "The Stay Put, Austin, TX 78701",
    time: "Thu 20 · 6:00 PM",
    date: "2026-06-20T18:00:00-05:00",
    image: "/images/imported/perks/stayput.png",
    rsvpCount: 64,
    tags: ["Stay Put", "Social", "Rainey", "Residents"],
    summary: "Start the week with something low-key, local, and easy to say yes to.",
  }),
];

const brandPartnerPlaces = [
  {
    id: "rivian-downtown-austin-activation",
    name: "Rivian Downtown Activation",
    type: "brand",
    partnerType: "brand",
    brand: "Rivian",
    category: "Brand / Activation",
    category_key: "brand_activation",
    latitude: 30.26972,
    longitude: -97.75382,
    district: "Seaholm",
    address: "Seaholm District, Austin, TX 78701",
    summary: "A downtown brand moment tied to resident movement, test-drive interest, and nearby lifestyle stops.",
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "yeti-congress-district-activation",
    name: "YETI Congress Activation",
    type: "brand",
    partnerType: "brand",
    brand: "YETI",
    category: "Brand / Activation",
    category_key: "brand_activation",
    latitude: 30.26724,
    longitude: -97.74276,
    district: "Congress",
    address: "Congress Avenue, Austin, TX 78701",
    summary: "A useful brand placement for downtown residents moving between work, events, and weekend plans.",
    source: "Downtown Perks brand partner layer",
  },
  {
    id: "legends-real-estate-downtown-austin",
    name: "Legends Real Estate",
    type: "brand",
    partnerType: "brand",
    brand: "Legends Real Estate",
    pinKey: "legends",
    category: "Brand / Real Estate",
    category_key: "brand_real_estate",
    latitude: 30.2655,
    longitude: -97.74618,
    district: "2nd Street",
    address: "2nd Street District, Austin, TX 78701",
    summary: "Want to live here? Browse downtown listings, see what is nearby, and ask Legends Real Estate for showing options when an address feels like a fit.",
    source: "Downtown Perks brand partner layer",
  },
];

const CORE_LOCATION_CATEGORY_KEYS = new Set([
  "bar_nightlife",
  "coffee_cafe",
  "hotel_hospitality",
  "other_relevant",
  "residential_property",
  "restaurant_food",
  "retail_business",
  "wellness_recreation",
]);

const EXCLUDED_MAP_LOCATION_OSM_IDS = new Set([
  134807223, // Lakeside Apartmments - removed from Downtown Perks map inventory.
]);

const WATERLOO_COORDS = {
  "waterloo-park": [30.27391, -97.73543],
  "moody-amphitheater": [30.27378, -97.73555],
  "great-lawn": [30.27334, -97.73515],
  "waller-creek-trail": [30.27412, -97.73475],
  "hill-country-garden": [30.27378, -97.73496],
  "family-pavilion": [30.27436, -97.73512],
  "waterloo-event-zones": [30.27356, -97.73568],
};

function waterlooInventoryPlace(pin) {
  const coords = WATERLOO_COORDS[pin.id] || [pin.lat, pin.lng];
  return {
    id: pin.id,
    name: pin.name,
    type: pin.kind === "destination" || pin.kind === "experience" ? "venue" : "event",
    partnerType: pin.kind === "partner-placement" ? "brands" : "venues",
    category: `${pin.category} / Waterloo Park`,
    category_key: ["waterloo park", pin.kind, pin.category, ...(pin.subCategories || []), ...(pin.tags || [])].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: pin.kind === "event" ? "event" : pin.category === "Parks" ? "standard" : "event",
    detailDrawerType: pin.kind,
    pinKey: pin.category === "Parks" ? "park" : pin.category === "Live Music" ? "event" : undefined,
    latitude: coords?.[0],
    longitude: coords?.[1],
    district: pin.district,
    address: pin.address || "Waterloo Park, Austin, TX 78701",
    summary: pin.description,
    description: pin.description,
    drawerCopy: pin.drawerCopy,
    tags: pin.tags,
    image: `/images/waterloo/${pin.imageAssets.thumbnail || pin.imageAssets.heroImage || "waterloo-hero-aerial.jpg"}`,
    waterlooPin: pin,
    isWaterlooPark: true,
    source: "Downtown Perks Waterloo Park inventory",
  };
}

function waterlooCampaignPlace(pin, index) {
  const latOffset = (index % 5) * 0.00011;
  const lngOffset = (index % 4) * 0.00012;
  return {
    id: pin.id,
    name: pin.name,
    type: pin.kind === "event" ? "event" : "brand",
    partnerType: pin.kind === "event" ? "venues" : "brands",
    category: `${pin.category} / Waterloo Park`,
    category_key: ["waterloo park", pin.kind, pin.category, "campaign event partner placement"].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: pin.kind === "event" ? "event" : "brand",
    detailDrawerType: pin.kind,
    latitude: 30.2737 + latOffset,
    longitude: -97.7353 - lngOffset,
    district: pin.district,
    address: "Waterloo Park, Austin, TX 78701",
    summary: pin.description,
    description: pin.description,
    drawerCopy: pin.campaignCardCopy,
    tags: [pin.category, "Waterloo Park", "Events", "Partner Placement"],
    image: `/images/waterloo/${pin.imageRequirement}`,
    waterlooCampaignPin: pin,
    isWaterlooPark: true,
    rsvp_count: pin.kind === "event" ? 42 + index : undefined,
    source: "Downtown Perks Waterloo Park campaign inventory",
  };
}

function daaTourStopPlace(stop) {
  return {
    id: stop.id,
    name: stop.name,
    type: "civic",
    partnerType: "civic",
    category: `${stop.category} / DAA Art & Parks Tour`,
    category_key: ["civic", "daa", "art", "parks", "tour", stop.category, stop.district].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    markerType: "standard",
    detailDrawerType: "daa-art-parks-tour",
    pinKey: "civic",
    latitude: stop.coordinates.lat,
    longitude: stop.coordinates.lng,
    district: stop.district,
    address: stop.address,
    summary: stop.popupCopy,
    description: stop.description,
    drawerCopy: stop.daaIntro,
    image: stop.imageUrl,
    daaTourStop: stop,
    isDaaArtParksTour: true,
    source: "Downtown Austin Alliance Art & Parks Tour",
  };
}

function slugPart(value, fallback = "place") {
  const cleaned = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function stableRawLocationId(item, index) {
  if (item.id) return item.id;
  const name = slugPart(item.name, `place-${index}`);
  if (item.osm_id) return `${name}-${item.osm_type || "osm"}-${item.osm_id}`;
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `${name}-${latitude.toFixed(5)}-${longitude.toFixed(5)}`;
  }
  return `${name}-${index}`;
}

function isCoreMapLocation(item) {
  const source = String(item.source || "").toLowerCase();

  if (!source.includes("openstreetmap")) return true;
  return CORE_LOCATION_CATEGORY_KEYS.has(String(item.category_key || "").toLowerCase());
}

function isExcludedMapLocation(item) {
  const osmId = Number(item.osm_id);
  if (Number.isFinite(osmId) && EXCLUDED_MAP_LOCATION_OSM_IDS.has(osmId)) return true;
  return String(item.name || "").trim().toLowerCase() === "lakeside apartmments";
}

function normalizedLocationKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coordinatesAreClose(a, b) {
  if (!a || !b) return false;
  const latDelta = Math.abs(Number(a.latitude) - Number(b.latitude));
  const lngDelta = Math.abs(Number(a.longitude) - Number(b.longitude));
  return latDelta <= 0.0014 && lngDelta <= 0.0014;
}

function dedupeNormalizedLocations(entities) {
  const accepted = [];
  const exactKeys = new Set();

  entities.forEach((entity) => {
    const nameKey = normalizedLocationKey(entity.name);
    const isDaaArtParksStop = String(entity.id || "").startsWith("daa-stop-") || Boolean(entity.isDaaArtParksTour || entity.daaTourStop);
    const exactKey = [
      nameKey,
      Number(entity.latitude).toFixed(5),
      Number(entity.longitude).toFixed(5),
      isDaaArtParksStop ? entity.id : "",
    ].join("|");
    const isRepublicImport = entity.raw?.source === "Republic Austin" || entity.source === "Republic Austin";

    if (exactKeys.has(exactKey)) return;

    if (
      isRepublicImport &&
      accepted.some((existing) => normalizedLocationKey(existing.name) === nameKey && coordinatesAreClose(existing, entity))
    ) {
      return;
    }

    exactKeys.add(exactKey);
    accepted.push(entity);
  });

  return accepted;
}

export function useLocations() {
  const [happyHoursVersion, setHappyHoursVersion] = useState(0);

  useEffect(() => {
    function updateHappyHours() {
      setHappyHoursVersion((version) => version + 1);
    }

    window.addEventListener("storage", updateHappyHours);
    window.addEventListener("downtown-perks:happy-hours-updated", updateHappyHours);
    return () => {
      window.removeEventListener("storage", updateHappyHours);
      window.removeEventListener("downtown-perks:happy-hours-updated", updateHappyHours);
    };
  }, []);

  const happyHourPlaces = getHappyHourPlaces();
  const waterlooPlaces = [
    ...waterlooParkInventory.map(waterlooInventoryPlace),
    ...waterlooParkCampaignPins.map(waterlooCampaignPlace),
  ];
  const daaPlaces = daaTourStops.map(daaTourStopPlace);
  const republicAustinPlaces = getRepublicAustinMapPlaces();
  const parkingPlaces = downtownParkingItems.filter((item) => item.active).map(parkingBookingPlace);
  void happyHoursVersion;

  const coreOpenMapLocations = data.filter((item) => isCoreMapLocation(item) && !isExcludedMapLocation(item));

  const normalizedLocations = [...coreOpenMapLocations, ...eventPlaces, ...brandPartnerPlaces, ...luxuryPresenceBuildingPlaces, ...legendsListingPlaces, ...supplementalMapEntities, ...downtownPerksGoogleListImport, ...republicAustinPlaces, ...parkingPlaces, ...happyHourPlaces, ...waterlooPlaces, ...daaPlaces]
    .filter((item) => isDowntownAustin78701Entity(item))
    .map((item, i) => {
      const isVia313 = String(item.name || "").toLowerCase().includes("via 313");
      const isRoyalBlue = String(item.name || "").toLowerCase().includes("royal blue grocery");
      const isStandardProof = String(item.name || "").toLowerCase().includes("standard proof whiskey");
      const normalizedItem = {
        ...item,
        id: stableRawLocationId(item, i),
        ...(isVia313
          ? {
              category: "Pizza / Dining",
              category_key: "pizza_dining",
              summary: "Detroit-style pizza spot in downtown Austin.",
            }
          : {}),
        ...(isRoyalBlue
          ? {
              category: "Local Grocery",
              category_key: "local_grocery retail_business",
              summary: "Local downtown grocery stop for coffee, snacks, pantry basics, wine, and quick errands.",
              alignment_to_downtown_perks: "Resident grocery discounts and neighborhood shopping value for everyday downtown errands.",
              deals_offers: "Resident grocery discount when shopping in-store",
              specials: "Show your Downtown Perks Card at checkout for resident shopping value.",
            }
          : {}),
        ...(isStandardProof
          ? {
              name: "Standard Proof Whiskey Co.",
              category: "Bar & Nightlife",
              category_key: "bar_nightlife whiskey_flights craft_cocktails rainey_legacy",
              type: "venue",
              partnerType: "venues",
              district: "Rainey",
              address: "51 Rainey Street, Austin, TX 78701",
              summary: "Whiskey, cocktails, and a slower pace at the edge of Rainey Street.",
              description: "A whiskey tasting room and cocktail lounge designed for people who appreciate good drinks, good conversation, and a slightly slower pace than the rest of Rainey Street.",
              neighborhood_narrative: "At the southern end of Rainey Street, Standard Proof sat between downtown's high-rise residential district and Lady Bird Lake. Residents could stop in for a cocktail before dinner, meet friends before a concert, or start a night out without the crowds often associated with the center of Rainey Street.",
              alignment_to_downtown_perks: "A quieter side of Rainey for date nights, after-work drinks, small group gatherings, and discovering something new before heading out downtown.",
              deals_offers: "Complimentary Whiskey Flight Upgrade",
              specials: "Purchase any whiskey flight and receive a premium flight upgrade or featured seasonal pour.",
              terms: "Subject to availability and partner participation.",
              perk: {
                title: "Complimentary Whiskey Flight Upgrade",
                value: "Premium flight upgrade or featured seasonal pour",
                description: "Purchase any whiskey flight and receive a premium flight upgrade or featured seasonal pour.",
                isActive: true,
              },
              knownFor: [
                "Whiskey flights",
                "Signature infused rye whiskies",
                "Craft cocktails",
                "Small group gatherings",
                "Pre-event drinks",
                "Date nights",
                "Resident meetups",
              ],
              nearby: ["Lady Bird Lake", "Hotel Van Zandt", "Rainey Street", "Convention Center", "Downtown Trail Network"],
              inventory_status: "Legacy Venue / Previously Featured Partner",
              inventory_status_note: "Standard Proof's Rainey Street tasting room is marked as a legacy venue because the company shifted focus to broader brand growth after the downtown location closed.",
              website: "https://www.standardproofwhiskey.com/rainey-street",
            }
          : {}),
      };
      const entity = normalizeEntity(normalizedItem, i);

      if (!entity) return null;

      return {
        ...entity,
        category_key: normalizedItem.category_key,
      };
    })
    .filter(Boolean);

  return dedupeNormalizedLocations(normalizedLocations);
}
