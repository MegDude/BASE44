import { useEffect, useState } from "react";
import data from "../data/locations.json";
import { luxuryPresenceBuildingPlaces } from "../data/luxuryPresenceInventory";
import { supplementalMapEntities } from "../data/supplementalMapEntities";
import { waterlooParkInventory } from "../data/waterlooParkInventory";
import { waterlooParkCampaignPins } from "../data/waterlooParkCampaignPins";
import { daaTourStops } from "../data/daaArtParksTour";
import { getHappyHourPlaces } from "./happyHours";
import { isDowntownAustin78701Entity } from "./map/downtownAustinScope";
import { normalizeEntity } from "./map/normalizeEntity";

const eventPlaces = [
  {
    id: "event-lobby-hour",
    name: "Lobby Hour",
    type: "event",
    category: "Event / Happy Hour",
    category_key: "event_happy_hour",
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude: 30.26698,
    longitude: -97.74562,
    district: "2nd Street",
    address: "The Paseo Lobby, Austin, TX 78701",
    summary: "A casual meet-up a couple blocks away. Drop in, meet a few neighbors, grab a drink, and let the night figure itself out.",
    rsvp_count: 34,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-run-club",
    name: "Run Club",
    type: "event",
    category: "Event / Fitness",
    category_key: "event_fitness",
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude: 30.27166,
    longitude: -97.75029,
    district: "Seaholm",
    address: "Shoal Creek Trailhead, Austin, TX 78701",
    summary: "Start nearby, finish with coffee after. Built for residents who want movement without another app or group thread.",
    rsvp_count: 28,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-rooftop-social",
    name: "Rooftop Social",
    type: "event",
    category: "Event / Access",
    category_key: "event_access",
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude: 30.26491,
    longitude: -97.74375,
    district: "Congress",
    address: "Downtown Rooftop, Austin, TX 78701",
    summary: "Resident rooftop access with enough nearby places to keep the night easy.",
    rsvp_count: 46,
    source: "Downtown Perks event layer",
  },
  {
    id: "event-morning-yoga-waterloo",
    name: "Morning Yoga at Waterloo Park",
    type: "event",
    category: "Event / Wellness",
    category_key: "event_wellness",
    markerType: "event",
    detailDrawerType: "event",
    isEvent: true,
    latitude: 30.27439,
    longitude: -97.73533,
    district: "Red River",
    address: "Waterloo Park, Austin, TX 78701",
    summary: "Start your morning with a community yoga session in Waterloo Park. Bring a mat, water, and a neighbor.",
    rsvp_count: 28,
    source: "Downtown Perks event layer",
  },
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
  void happyHoursVersion;

  const coreOpenMapLocations = data.filter((item) => isCoreMapLocation(item) && !isExcludedMapLocation(item));

  return [...coreOpenMapLocations, ...eventPlaces, ...brandPartnerPlaces, ...luxuryPresenceBuildingPlaces, ...supplementalMapEntities, ...happyHourPlaces, ...waterlooPlaces, ...daaPlaces]
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
}
