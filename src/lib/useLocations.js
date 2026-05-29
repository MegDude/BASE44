import { useEffect, useState } from "react";
import data from "../data/locations.json";
import { legendsListingPlaces } from "../data/legendsListings";
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
    summary: "Downtown real estate inventory connected to resident demand, building interest, and appointment-ready listing requests.",
    source: "Downtown Perks brand partner layer",
  },
];

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
  void happyHoursVersion;

  return [...data, ...eventPlaces, ...brandPartnerPlaces, ...legendsListingPlaces, ...happyHourPlaces]
    .filter((item) => isDowntownAustin78701Entity(item))
    .map((item, i) => {
      const isVia313 = String(item.name || "").toLowerCase().includes("via 313");
      const normalizedItem = {
        ...item,
        id: item.id ?? item.name ?? `place-${i}`,
        ...(isVia313
          ? {
              category: "Pizza / Dining",
              category_key: "pizza_dining",
              summary: "Detroit-style pizza spot in downtown Austin.",
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
